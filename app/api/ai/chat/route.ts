import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { QwenService, ChatMessage, ToolDefinition, ToolCall } from "@/lib/qwen-service";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

const GPSpark_SYSTEM_PROMPT = `You are GPSpark AI, an expert academic tutor specializing in graduation projects for FCAI-CU students.

Your role is to:
1. Help students brainstorm and refine their project ideas
2. Analyze project feasibility and identify market gaps
3. Suggest technical architectures and implementation strategies
4. Identify potential challenges and mitigation strategies
5. Guide students toward innovative, impactful solutions

Always be encouraging, academic-focused, and provide structured, actionable advice. Use markdown formatting for clarity. Keep responses concise but thorough.`;

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
];

function handleToolCall(toolCall: ToolCall): Promise<string> {
  const args = JSON.parse(toolCall.arguments);

  switch (toolCall.name) {
    case "search_library":
      return Promise.resolve(
        JSON.stringify({
          message: `Found 3 similar projects in the ${args.domain} domain.`,
          projects: [
            { title: `Project A in ${args.domain}`, uniqueness: 8.5 },
            { title: `Project B in ${args.domain}`, uniqueness: 7.2 },
            { title: `Project C in ${args.domain}`, uniqueness: 9.1 },
          ],
        })
      );

    case "analyze_feasibility":
      return Promise.resolve(
        JSON.stringify({
          score: 72,
          breakdown: {
            technicalDepth: 15,
            marketAnalysis: 14,
            implementationPlan: 13,
            innovation: 16,
            resourceFeasibility: 14,
          },
          feedback: `Strong feasibility for "${args.project_title}". Consider refining the implementation timeline.`,
        })
      );

    case "suggest_tech_stack":
      return Promise.resolve(
        JSON.stringify({
          frontend: ["React", "Next.js", "Tailwind CSS"],
          backend: ["Node.js", "Express", "PostgreSQL"],
          additional: args.project_type === "ML" ? ["Python", "TensorFlow", "FastAPI"] : [],
          reasoning: `Recommended stack optimized for ${args.project_type} projects with FCAI-CU infrastructure support.`,
        })
      );

    case "generate_milestones":
      const weeks = args.duration_weeks || 16;
      return Promise.resolve(
        JSON.stringify({
          milestones: [
            { phase: 1, name: "Research & Planning", weeks: `1-${Math.ceil(weeks * 0.2)}` },
            { phase: 2, name: "Design & Architecture", weeks: `${Math.ceil(weeks * 0.2) + 1}-${Math.ceil(weeks * 0.4)}` },
            { phase: 3, name: "Core Development", weeks: `${Math.ceil(weeks * 0.4) + 1}-${Math.ceil(weeks * 0.7)}` },
            { phase: 4, name: "Testing & Refinement", weeks: `${Math.ceil(weeks * 0.7) + 1}-${Math.ceil(weeks * 0.85)}` },
            { phase: 5, name: "Documentation & Presentation", weeks: `${Math.ceil(weeks * 0.85) + 1}-${weeks}` },
          ],
        })
      );

    default:
      return Promise.resolve(JSON.stringify({ error: `Unknown tool: ${toolCall.name}` }));
  }
}

export async function POST(request: Request) {
  try {
    const { messages, projectFocus, sessionId, userId, userProfile, stream = true, useTools = true } = await request.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    let systemPrompt = GPSpark_SYSTEM_PROMPT;

    if (userProfile) {
      const { fullName, academicYear, interests, careerGoals, gpa } = userProfile;
      systemPrompt += `\n\nStudent profile:`;
      if (fullName) systemPrompt += `\n- Name: ${fullName}`;
      if (academicYear) systemPrompt += `\n- Academic Year: ${academicYear}`;
      if (interests?.length) systemPrompt += `\n- Interests: ${interests.join(", ")}`;
      if (careerGoals) systemPrompt += `\n- Career Goals: ${careerGoals}`;
      if (gpa) systemPrompt += `\n- GPA: ${gpa}`;
      systemPrompt += `\n\nTailor your suggestions to match their interests, academic level, and goals.`;
    }

    if (projectFocus) {
      systemPrompt += `\n\nCurrent project focus: ${projectFocus}`;
    }

    let qwen = new QwenService({
      systemPrompt,
      supabaseAdmin: supabaseAdmin || undefined,
    });

    const chatMessages: ChatMessage[] = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
      ...(m.tool_call_id ? { tool_call_id: m.tool_call_id, name: m.name } : {}),
    }));

    if (useTools) {
      qwen = new QwenService({
        systemPrompt,
        tools: AVAILABLE_TOOLS,
        supabaseAdmin: supabaseAdmin || undefined,
      });

      if (stream) {
        const stream = new ReadableStream({
          async start(controller) {
            let fullContent = "";
            let newSessionId = sessionId;

            try {
              const response = await qwen.chatStream(chatMessages, (chunk) => {
                fullContent += chunk;
                controller.enqueue(new TextEncoder().encode(chunk));
              });

              if (response.toolCalls.length > 0) {
                controller.enqueue(
                  new TextEncoder().encode(
                    `\n\n[TOOL_CALLS]${JSON.stringify(response.toolCalls)}[/TOOL_CALLS]\n\n`
                  )
                );

                for (const toolCall of response.toolCalls) {
                  const result = await handleToolCall(toolCall);
                  const toolMsg = `\n\n[TOOL_RESULT]${toolCall.name}: ${result}[/TOOL_RESULT]\n\n`;
                  controller.enqueue(new TextEncoder().encode(toolMsg));
                }
              }

              if (userId) {
                newSessionId = await qwen.saveConversation(
                  userId,
                  sessionId,
                  [...chatMessages, { role: "assistant", content: fullContent }],
                  projectFocus
                );
              }

              if (newSessionId) {
                controller.enqueue(
                  new TextEncoder().encode(`\n\n[SESSION_ID]${newSessionId}[/SESSION_ID]`)
                );
              }
            } finally {
              controller.close();
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
      }

      const response = await qwen.chatWithTools(chatMessages, handleToolCall);

      let newSessionId = sessionId;
      if (userId) {
        newSessionId = await qwen.saveConversation(
          userId,
          sessionId,
          [...chatMessages, { role: "assistant", content: response.content }],
          projectFocus
        );
      }

      return NextResponse.json({
        content: response.content,
        toolCalls: response.toolCalls,
        sessionId: newSessionId,
        usage: response.usage,
      });
    }

    if (stream) {
      const stream = new ReadableStream({
        async start(controller) {
          let fullContent = "";
          let newSessionId = sessionId;

          try {
            await qwen.chatStream(chatMessages, (chunk) => {
              fullContent += chunk;
              controller.enqueue(new TextEncoder().encode(chunk));
            });

            if (userId) {
              newSessionId = await qwen.saveConversation(
                userId,
                sessionId,
                [...chatMessages, { role: "assistant", content: fullContent }],
                projectFocus
              );
            }

            if (newSessionId) {
              controller.enqueue(
                new TextEncoder().encode(`\n\n[SESSION_ID]${newSessionId}[/SESSION_ID]`)
              );
            }
          } finally {
            controller.close();
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
    }

    const response = await qwen.chat(chatMessages);

    let newSessionId = sessionId;
    if (userId) {
      newSessionId = await qwen.saveConversation(
        userId,
        sessionId,
        [...chatMessages, { role: "assistant", content: response.content }],
        projectFocus
      );
    }

    return NextResponse.json({
      content: response.content,
      sessionId: newSessionId,
      usage: response.usage,
    });
  } catch (error) {
    console.error("[AI_CHAT_API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId query parameter required" },
        { status: 400 }
      );
    }

    const qwen = new QwenService({
      supabaseAdmin: supabaseAdmin || undefined,
    });

    const history = await qwen.getConversationHistory(sessionId);

    return NextResponse.json({ messages: history });
  } catch (error) {
    console.error("[AI_CHAT_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation history" },
      { status: 500 }
    );
  }
}
