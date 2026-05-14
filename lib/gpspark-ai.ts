import { QwenService, ChatMessage, ToolDefinition, ToolCall, ChatResponse, ConversationSession } from "./qwen-service";

export { QwenService };
export type { ChatMessage, ToolDefinition, ToolCall, ChatResponse, ConversationSession };

const GPSpark_SYSTEM_PROMPT = `You are GPSpark AI, an expert academic tutor specializing in graduation projects for FCAI-CU students.

Your role is to:
1. Help students brainstorm and refine their project ideas
2. Analyze project feasibility and identify market gaps
3. Suggest technical architectures and implementation strategies
4. Identify potential challenges and mitigation strategies
5. Guide students toward innovative, impactful solutions

Always be encouraging, academic-focused, and provide structured, actionable advice. Use markdown formatting for clarity.`;

const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    name: "search_library",
    description: "Search the GP Library for similar past projects by domain or keywords.",
    parameters: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Project domain (e.g., AI, Fintech, Agritech)" },
        keywords: { type: "array", items: { type: "string" }, description: "Search keywords" },
      },
      required: ["domain"],
    },
  },
  {
    name: "analyze_feasibility",
    description: "Analyze the feasibility of a project idea and return a structured score.",
    parameters: {
      type: "object",
      properties: {
        project_title: { type: "string", description: "The project title or idea" },
        description: { type: "string", description: "Brief project description" },
      },
      required: ["project_title"],
    },
  },
  {
    name: "suggest_tech_stack",
    description: "Suggest an appropriate technology stack for a given project type.",
    parameters: {
      type: "object",
      properties: {
        project_type: { type: "string", description: "Type of project (e.g., web app, mobile, ML, IoT)" },
        requirements: { type: "array", items: { type: "string" }, description: "Specific requirements or constraints" },
      },
      required: ["project_type"],
    },
  },
  {
    name: "generate_milestones",
    description: "Generate a structured milestone plan for a graduation project.",
    parameters: {
      type: "object",
      properties: {
        project_title: { type: "string", description: "The project title" },
        duration_weeks: { type: "number", description: "Expected project duration in weeks" },
      },
      required: ["project_title"],
    },
  },
  {
    name: "brainstorm_ideas",
    description: "Generate structured project ideas based on a domain and constraints.",
    parameters: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Project domain or field" },
        constraints: { type: "array", items: { type: "string" }, description: "Constraints or requirements" },
        count: { type: "number", description: "Number of ideas to generate" },
      },
      required: ["domain"],
    },
  },
];

export class GPsparkAI {
  private qwen: QwenService;
  private sessions: Map<string, ConversationSession>;

  constructor(options?: { systemPrompt?: string; tools?: ToolDefinition[] }) {
    this.sessions = new Map();
    this.qwen = new QwenService({
      systemPrompt: options?.systemPrompt || GPSpark_SYSTEM_PROMPT,
      tools: options?.tools || AVAILABLE_TOOLS,
    });
  }

  createSession(sessionId?: string, metadata?: Record<string, unknown>): string {
    const id = sessionId || crypto.randomUUID();
    this.sessions.set(id, {
      id,
      messages: [],
      metadata,
    });
    return id;
  }

  getSession(sessionId: string): ConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  async sendMessage(
    sessionId: string,
    content: string,
    options?: {
      onChunk?: (chunk: string) => void;
      onToolCall?: (toolCall: ToolCall) => Promise<string>;
    }
  ): Promise<ChatResponse> {
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = { id: sessionId, messages: [] };
      this.sessions.set(sessionId, session);
    }

    session.messages.push({ role: "user", content });

    let response: ChatResponse;

    if (options?.onToolCall) {
      response = await this.qwen.chatWithTools(session.messages, options.onToolCall);
    } else if (options?.onChunk) {
      response = await this.qwen.chatStream(session.messages, options.onChunk);
    } else {
      response = await this.qwen.chat(session.messages);
    }

    session.messages.push({ role: "assistant", content: response.content });

    return response;
  }

  async executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const toolResults: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
      search_library: async (args) => ({
        message: `Searching library for domain: ${args.domain}`,
        results: [],
      }),
      analyze_feasibility: async (args) => {
        const analysisQwen = new QwenService({
          systemPrompt: `Return ONLY a JSON object: {"score": <0-100>, "breakdown": {"technicalDepth": <0-20>, "marketAnalysis": <0-20>, "implementationPlan": <0-20>, "innovation": <0-20>, "resourceFeasibility": <0-20>}, "feedback": "<text>"}`,
        });
        const resp = await analysisQwen.chat([
          { role: "user", content: `Project: ${args.project_title}\n${args.description || ""}` },
        ]);
        try {
          const match = resp.content.match(/\{[\s\S]*\}/);
          return match ? JSON.parse(match[0]) : { score: 50, feedback: "Unable to analyze" };
        } catch {
          return { score: 50, feedback: "Unable to analyze" };
        }
      },
      suggest_tech_stack: async (args) => {
        const stackQwen = new QwenService({
          systemPrompt: `Return ONLY a JSON object: {"frontend": [], "backend": [], "database": [], "reasoning": "<text>"}`,
        });
        const resp = await stackQwen.chat([
          { role: "user", content: `Project type: ${args.project_type}` },
        ]);
        try {
          const match = resp.content.match(/\{[\s\S]*\}/);
          return match ? JSON.parse(match[0]) : { frontend: ["React"], backend: ["Node.js"], database: ["PostgreSQL"] };
        } catch {
          return { frontend: ["React"], backend: ["Node.js"], database: ["PostgreSQL"] };
        }
      },
      generate_milestones: async (args) => {
        const weeks = (args.duration_weeks as number) || 16;
        return {
          milestones: [
            { phase: 1, name: "Research & Planning", weeks: `1-${Math.ceil(weeks * 0.2)}` },
            { phase: 2, name: "Design & Architecture", weeks: `${Math.ceil(weeks * 0.2) + 1}-${Math.ceil(weeks * 0.4)}` },
            { phase: 3, name: "Core Development", weeks: `${Math.ceil(weeks * 0.4) + 1}-${Math.ceil(weeks * 0.7)}` },
            { phase: 4, name: "Testing & Refinement", weeks: `${Math.ceil(weeks * 0.7) + 1}-${Math.ceil(weeks * 0.85)}` },
            { phase: 5, name: "Documentation & Presentation", weeks: `${Math.ceil(weeks * 0.85) + 1}-${weeks}` },
          ],
        };
      },
      brainstorm_ideas: async (args) => {
        const count = (args.count as number) || 5;
        const brainQwen = new QwenService({
          systemPrompt: `Return ONLY a JSON array: [{"title": "<title>", "description": "<desc>", "domain": "<domain>", "techStack": [], "difficulty": "easy|medium|hard", "uniqueness": <1-10>}]`,
        });
        const resp = await brainQwen.chat([
          { role: "user", content: `Domain: ${args.domain}. Generate ${count} ideas.` },
        ]);
        try {
          const match = resp.content.match(/\[[\s\S]*\]/);
          return match ? JSON.parse(match[0]) : [];
        } catch {
          return [];
        }
      },
    };

    const handler = toolResults[toolName];
    if (!handler) {
      return { error: `Unknown tool: ${toolName}` };
    }

    return handler(args);
  }

  getAvailableTools(): ToolDefinition[] {
    return AVAILABLE_TOOLS;
  }
}
