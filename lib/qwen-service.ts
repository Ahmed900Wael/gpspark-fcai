import { createClient } from "@supabase/supabase-js";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface ChatResponse {
  content: string;
  toolCalls: ToolCall[];
  finishReason: string | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
}

export interface ConversationSession {
  id: string;
  messages: ChatMessage[];
  metadata?: Record<string, unknown>;
}

export interface QwenServiceConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  tools?: ToolDefinition[];
  systemPrompt?: string;
  supabaseAdmin?: any;
}

const DEFAULT_CONFIG: Required<Omit<QwenServiceConfig, "supabaseAdmin" | "tools">> = {
  model: "deepseek-v4-flash",
  maxTokens: 4096,
  temperature: 0.7,
  topP: 0.9,
  systemPrompt: "",
};

const FALLBACK_MODELS = [
  "deepseek-v4-flash",
  "kimi-k2.6",
  process.env.QWEN_MODEL || "qwen3.6-plus",
  "qwen/qwen3.6:free",
];

function getApiConfig(): { apiKey: string; baseUrl: string; provider: "opencode" | "dashscope" | "openrouter" } {
  const opencodeKey = process.env.OPENCODE_API_KEY;
  if (opencodeKey) {
    return {
      apiKey: opencodeKey,
      baseUrl: "https://opencode.ai/zen/go/v1",
      provider: "opencode",
    };
  }

  const directKey = process.env.QWEN_API_KEY;
  if (directKey) {
    return {
      apiKey: directKey,
      baseUrl: process.env.QWEN_API_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
      provider: "dashscope",
    };
  }

  return {
    apiKey: process.env.OPENROUTER_API_KEY || "",
    baseUrl: "https://openrouter.ai/api/v1",
    provider: "openrouter",
  };
}

export class QwenService {
  private apiConfig: { apiKey: string; baseUrl: string; provider: "opencode" | "dashscope" | "openrouter" };
  private config: Required<Omit<QwenServiceConfig, "supabaseAdmin">>;
  private supabaseAdmin: any;

  constructor(config: QwenServiceConfig = {}) {
    this.apiConfig = getApiConfig();
    this.supabaseAdmin = config.supabaseAdmin || null;
    this.config = {
      model: config.model || DEFAULT_CONFIG.model,
      maxTokens: config.maxTokens || DEFAULT_CONFIG.maxTokens,
      temperature: config.temperature || DEFAULT_CONFIG.temperature,
      topP: config.topP || DEFAULT_CONFIG.topP,
      systemPrompt: config.systemPrompt || DEFAULT_CONFIG.systemPrompt,
      tools: config.tools || [],
    };
  }

  async chat(
    messages: ChatMessage[],
    overrides?: Partial<QwenServiceConfig>
  ): Promise<ChatResponse> {
    if (!this.apiConfig.apiKey) {
      throw new Error("API key not configured. Set QWEN_API_KEY or OPENROUTER_API_KEY.");
    }

    const config = { ...this.config, ...overrides };
    const fullMessages = this.buildMessages(messages, config.systemPrompt);

    let lastError: Error | null = null;

    for (const model of FALLBACK_MODELS) {
      try {
        const response = await this.makeRequest(fullMessages, { ...config, model });
        return response;
      } catch (error) {
        console.warn(`[QwenService] Model ${model} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError || new Error("All models failed");
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    overrides?: Partial<QwenServiceConfig>
  ): Promise<ChatResponse> {
    if (!this.apiConfig.apiKey) {
      throw new Error("API key not configured. Set QWEN_API_KEY or OPENROUTER_API_KEY.");
    }

    const config = { ...this.config, ...overrides };
    const fullMessages = this.buildMessages(messages, config.systemPrompt);

    let lastError: Error | null = null;

    for (const model of FALLBACK_MODELS) {
      try {
        const response = await this.makeStreamRequest(
          fullMessages,
          onChunk,
          { ...config, model }
        );
        return response;
      } catch (error) {
        console.warn(`[QwenService] Model ${model} stream failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError || new Error("All models failed for streaming");
  }

  async chatWithTools(
    messages: ChatMessage[],
    onToolCall: (toolCall: ToolCall) => Promise<string>,
    overrides?: Partial<QwenServiceConfig>
  ): Promise<ChatResponse> {
    if (!this.config.tools || this.config.tools.length === 0) {
      throw new Error("No tools defined. Set tools in config before calling chatWithTools.");
    }

    let currentMessages = [...messages];
    let finalResponse: ChatResponse | null = null;
    let maxToolRounds = 5;

    while (maxToolRounds > 0) {
      const response = await this.chat(currentMessages, {
        ...overrides,
        tools: this.config.tools,
      });

      if (!response.toolCalls || response.toolCalls.length === 0) {
        finalResponse = response;
        break;
      }

      for (const toolCall of response.toolCalls) {
        const toolResult = await onToolCall(toolCall);
        currentMessages.push({
          role: "assistant",
          content: "",
          toolCalls: [toolCall],
        } as unknown as ChatMessage);
        currentMessages.push({
          role: "tool",
          content: toolResult,
          tool_call_id: toolCall.id,
          name: toolCall.name,
        });
      }

      maxToolRounds--;
    }

    return finalResponse || {
      content: "Maximum tool call rounds reached.",
      toolCalls: [],
      finishReason: "stop",
      usage: null,
    };
  }

  async saveConversation(
    userId: string,
    sessionId: string | null,
    messages: ChatMessage[],
    projectFocus?: string
  ): Promise<string | null> {
    if (!this.supabaseAdmin) {
      console.warn("[QwenService] Supabase admin client not available, skipping save.");
      return sessionId || "";
    }

    let currentSessionId = sessionId;

    if (!currentSessionId) {
      const { data: sessionData, error: sessionError } = await this.supabaseAdmin
        .from("brainstorm_sessions")
        .insert({
          user_id: userId,
          project_focus: projectFocus || "General Conversation",
        })
        .select()
        .single();

      if (sessionError) {
        console.error("[QwenService] Error creating session:", sessionError);
        return "";
      }

      currentSessionId = sessionData.id;
    }

    if (currentSessionId && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const { error: msgError } = await this.supabaseAdmin
        .from("chat_messages")
        .insert({
          session_id: currentSessionId,
          role: lastMsg.role,
          content: lastMsg.content,
        });

      if (msgError) {
        console.error("[QwenService] Error saving message:", msgError);
      }
    }

    return currentSessionId;
  }

  async getConversationHistory(sessionId: string): Promise<ChatMessage[]> {
    if (!this.supabaseAdmin) {
      return [];
    }

    const { data, error } = await this.supabaseAdmin
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[QwenService] Error fetching conversation:", error);
      return [];
    }

    return (data || []).map((msg: any) => ({
      role: msg.role as ChatMessage["role"],
      content: msg.content,
    }));
  }

  private buildMessages(messages: ChatMessage[], systemPrompt: string): ChatMessage[] {
    const fullMessages: ChatMessage[] = [];

    if (systemPrompt) {
      fullMessages.push({ role: "system", content: systemPrompt });
    }

    fullMessages.push(...messages);
    return fullMessages;
  }

  private async makeRequest(
    messages: ChatMessage[],
    config: Required<Omit<QwenServiceConfig, "supabaseAdmin">>
  ): Promise<ChatResponse> {
    const body: Record<string, unknown> = {
      model: config.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.tool_call_id ? { tool_call_id: m.tool_call_id, name: m.name } : {}),
      })),
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      top_p: config.topP,
    };

    if (config.tools && config.tools.length > 0) {
      body.tools = config.tools.map((t) => ({
        type: "function",
        function: t,
      }));
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiConfig.apiKey}`,
      "Content-Type": "application/json",
    };

    if (this.apiConfig.provider === "openrouter") {
      headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      headers["X-Title"] = "GPspark";
    }

    const response = await fetch(`${this.apiConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const message = choice?.message || {};

    const toolCalls: ToolCall[] = (message.tool_calls || []).map((tc: any) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    }));

    return {
      content: message.content || "",
      toolCalls,
      finishReason: choice?.finish_reason || null,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : null,
    };
  }

  private async makeStreamRequest(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    config: Required<Omit<QwenServiceConfig, "supabaseAdmin">>
  ): Promise<ChatResponse> {
    const body: Record<string, unknown> = {
      model: config.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.tool_call_id ? { tool_call_id: m.tool_call_id, name: m.name } : {}),
      })),
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      top_p: config.topP,
      stream: true,
    };

    if (config.tools && config.tools.length > 0) {
      body.tools = config.tools.map((t) => ({
        type: "function",
        function: t,
      }));
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiConfig.apiKey}`,
      "Content-Type": "application/json",
    };

    if (this.apiConfig.provider === "openrouter") {
      headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      headers["X-Title"] = "GPspark";
    }

    const response = await fetch(`${this.apiConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";
    const toolCalls: ToolCall[] = [];
    let finishReason: string | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              if (delta?.content) {
                fullContent += delta.content;
                onChunk(delta.content);
              }
              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  toolCalls.push({
                    id: tc.id || "",
                    name: tc.function?.name || "",
                    arguments: tc.function?.arguments || "",
                  });
                }
              }
              if (parsed.choices?.[0]?.finish_reason) {
                finishReason = parsed.choices[0].finish_reason;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent,
      toolCalls,
      finishReason,
      usage: null,
    };
  }
}
