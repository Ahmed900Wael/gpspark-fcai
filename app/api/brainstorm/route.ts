import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const OPENCODE_API_KEY = process.env.OPENCODE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

const API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const MODEL = "kimi-k2.6";

function buildSystemPrompt(userProfile: any, projectFocus?: string) {
  let prompt = `You are GPSpark AI, an expert academic tutor specializing in graduation projects for FCAI-CU students. Your role is to:

1. Help students brainstorm and refine their project ideas
2. Analyze project feasibility and identify market gaps
3. Suggest technical architectures and implementation strategies
4. Identify potential challenges and mitigation strategies
5. Guide students toward innovative, impactful solutions

Always be encouraging, academic-focused, and provide structured, actionable advice. Use markdown formatting for clarity. When discussing technical topics, be specific about tools, frameworks, and best practices.

Keep responses concise but thorough. Use bullet points and numbered lists when appropriate.`;

  if (userProfile) {
    const { fullName, academicYear, interests, careerGoals, gpa } = userProfile;
    prompt += `\n\nHere is the student's profile to personalize your guidance:`;
    if (fullName) prompt += `\n- Name: ${fullName}`;
    if (academicYear) prompt += `\n- Academic Year: ${academicYear}`;
    if (interests && interests.length > 0) prompt += `\n- Interests: ${interests.join(", ")}`;
    if (careerGoals) prompt += `\n- Career Goals: ${careerGoals}`;
    if (gpa) prompt += `\n- GPA: ${gpa}`;
    prompt += `\n\nTailor your suggestions to match their interests, academic level, and goals.`;
  }

  if (projectFocus) {
    prompt += `\n\nCurrent project focus: ${projectFocus}`;
  }

  return prompt;
}

function formatMessages(messages: any[], systemPrompt: string) {
  return messages.map((msg: any) => {
    if (typeof msg.content === "string") {
      return { role: msg.role, content: msg.content };
    }

    if (Array.isArray(msg.content)) {
      return { role: msg.role, content: msg.content };
    }

    return { role: msg.role, content: String(msg.content || "") };
  });
}

export async function POST(request: Request) {
  try {
    const { messages, projectFocus, sessionId, userId, userProfile } = await request.json();

    if (!OPENCODE_API_KEY) {
      return NextResponse.json(
        { error: "OpenCode AI API key not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(userProfile, projectFocus);
    const formattedMessages = formatMessages(messages, systemPrompt);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENCODE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...formattedMessages,
        ],
        stream: true,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

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
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullContent += content;
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch (e) {
                  // Skip malformed JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();

          // Save to database after stream completes
          if (supabaseAdmin && userId && fullContent) {
            let currentSessionId = sessionId;
            if (!currentSessionId) {
              const { data: sessionData } = await supabaseAdmin
                .from("brainstorm_sessions")
                .insert({
                  user_id: userId,
                  project_focus: projectFocus || "General Brainstorming",
                })
                .select()
                .single();

              if (sessionData) currentSessionId = sessionData.id;
            }

            if (currentSessionId) {
              const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
              if (lastUserMessage) {
                await supabaseAdmin.from("chat_messages").insert({
                  session_id: currentSessionId,
                  role: lastUserMessage.role,
                  content: lastUserMessage.content,
                });
              }

              await supabaseAdmin.from("chat_messages").insert({
                session_id: currentSessionId,
                role: "assistant",
                content: fullContent,
              });
            }
          }
        }
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
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    );
  }
}
