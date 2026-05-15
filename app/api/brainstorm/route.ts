import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const OPENCODE_API_KEY = process.env.OPENCODE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

const API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const MODEL = "opencode-go/deepseek-v4-flash";

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

    if (!OPENCODE_API_KEY) {
      return NextResponse.json(
        { error: "OpenCode AI API key not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(userProfile, projectFocus);

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
          ...messages,
        ],
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    console.log("[BRAINSTEM_API] Response received, length:", content.length);

    // Save to database
    if (supabaseAdmin && userId && content) {
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
          content: content,
        });
      }
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("[BRAINSTEM_API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    );
  }
}
