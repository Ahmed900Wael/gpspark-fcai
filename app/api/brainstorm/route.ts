import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SYSTEM_PROMPT = `You are GPSpark AI, an expert academic tutor specializing in graduation projects for FCAI-CU students. Your role is to:

1. Help students brainstorm and refine their project ideas
2. Analyze project feasibility and identify market gaps
3. Suggest technical architectures and implementation strategies
4. Identify potential challenges and mitigation strategies
5. Guide students toward innovative, impactful solutions

Always be encouraging, academic-focused, and provide structured, actionable advice. Use markdown formatting for clarity. When discussing technical topics, be specific about tools, frameworks, and best practices.

Keep responses concise but thorough. Use bullet points and numbered lists when appropriate.`;

export async function POST(request: Request) {
  try {
    const { messages, projectFocus, sessionId, userId } = await request.json();

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const systemMessage = projectFocus
      ? `${SYSTEM_PROMPT}\n\nCurrent project focus: ${projectFocus}`
      : SYSTEM_PROMPT;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "GPSpark",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          { role: "system", content: systemMessage },
          ...messages.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("[BRAINSTEM_API] OpenRouter error:", errorData);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: response.status }
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: "No response stream" },
        { status: 500 }
      );
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let currentSessionId = sessionId;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ") && line !== "data: [DONE]") {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    fullContent += content;
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Skip malformed JSON
                }
              }
            }
          }

          // Save to database after stream completes
          if (userId && fullContent) {
            if (!currentSessionId) {
              // Create new session
              const { data: sessionData, error: sessionError } = await supabaseAdmin
                .from("brainstorm_sessions")
                .insert({
                  user_id: userId,
                  project_focus: projectFocus || "General Brainstorming",
                })
                .select()
                .single();

              if (sessionError) {
                console.error("[BRAINSTEM_API] Error creating session:", sessionError);
              } else {
                currentSessionId = sessionData.id;
              }
            }

            if (currentSessionId) {
              // Save user messages
              for (const msg of messages) {
                if (msg.role === "user") {
                  await supabaseAdmin
                    .from("chat_messages")
                    .insert({
                      session_id: currentSessionId,
                      role: msg.role,
                      content: msg.content,
                    });
                }
              }

              // Save assistant response
              await supabaseAdmin
                .from("chat_messages")
                .insert({
                  session_id: currentSessionId,
                  role: "assistant",
                  content: fullContent,
                });
            }
          }
        } catch (error) {
          console.error("[BRAINSTEM_API] Stream error:", error);
          controller.error(error);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[BRAINSTEM_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
