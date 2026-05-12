import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

const MODELS = [
  "z-ai/glm-4.5-air:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
];

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

async function fetchWithRetry(messages: any[], systemPrompt: string, modelIndex: number = 0): Promise<Response> {
  const model = MODELS[modelIndex];
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://gpspark.vercel.app",
      "X-Title": "GPspark",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok && modelIndex < MODELS.length - 1) {
    console.warn(`[BRAINSTEM_API] Model ${model} failed, trying next...`);
    return fetchWithRetry(messages, systemPrompt, modelIndex + 1);
  }

  return response;
}

export async function POST(request: Request) {
  try {
    const { messages, projectFocus, sessionId, userId, userProfile } = await request.json();

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(userProfile, projectFocus);

    const response = await fetchWithRetry(messages, systemPrompt);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to get AI response" },
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
