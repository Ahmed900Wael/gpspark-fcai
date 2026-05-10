import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

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

export async function POST(request: Request) {
  try {
    const { messages, projectFocus, sessionId, userId, userProfile } = await request.json();

    console.log("[BRAINSTEM_API] Request received. OpenRouter key configured:", !!OPENROUTER_API_KEY);
    console.log("[BRAINSTEM_API] Supabase admin configured:", !!supabaseAdmin);

    if (!OPENROUTER_API_KEY) {
      console.error("[BRAINSTEM_API] OPENROUTER_API_KEY is missing");
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const systemMessage = buildSystemPrompt(userProfile, projectFocus);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "GPSpark",
      },
      body: JSON.stringify({
        model: "ring-2.6-1t:free",
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
      const errorText = await response.text();
      console.error("[BRAINSTEM_API] OpenRouter error status:", response.status);
      console.error("[BRAINSTEM_API] OpenRouter error body:", errorText);
      return NextResponse.json(
        { error: `OpenRouter API error (${response.status}): ${errorText.slice(0, 200)}` },
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
          if (supabaseAdmin && userId && fullContent) {
            if (!currentSessionId) {
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
              // Only save the LAST user message (the one just sent)
              const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
              if (lastUserMessage) {
                await supabaseAdmin
                  .from("chat_messages")
                  .insert({
                    session_id: currentSessionId,
                    role: lastUserMessage.role,
                    content: lastUserMessage.content,
                  });
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
