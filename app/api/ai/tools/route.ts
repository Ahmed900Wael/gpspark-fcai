import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { QwenService, ChatMessage, ToolDefinition } from "@/lib/qwen-service";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

const TOOLS: ToolDefinition[] = [
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
  {
    name: "evaluate_project",
    description: "Evaluate a project idea across multiple dimensions and return structured scores.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Project title" },
        description: { type: "string", description: "Project description" },
        tech_stack: { type: "array", items: { type: "string" }, description: "Technologies involved" },
      },
      required: ["title", "description"],
    },
  },
];

async function executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
  switch (toolName) {
    case "search_library": {
      if (!supabaseAdmin) {
        return { error: "Database not configured", projects: [] };
      }

      const { data, error } = await supabaseAdmin
        .from("library_projects")
        .select("id, title, description, domain, uniqueness_score, tech_stack")
        .ilike("domain", `%${args.domain}%`)
        .limit(5);

      if (error) {
        return { error: error.message, projects: [] };
      }

      return { projects: data || [], count: data?.length || 0 };
    }

    case "analyze_feasibility": {
      const qwen = new QwenService({
        systemPrompt: `You are an expert academic project evaluator. Analyze the feasibility of the given project idea.
Return ONLY a JSON object with this exact structure:
{
  "score": <number 0-100>,
  "breakdown": {
    "technicalDepth": <number 0-20>,
    "marketAnalysis": <number 0-20>,
    "implementationPlan": <number 0-20>,
    "innovation": <number 0-20>,
    "resourceFeasibility": <number 0-20>
  },
  "feedback": "<brief 1-2 sentence assessment>",
  "risks": ["<risk 1>", "<risk 2>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}`,
      });

      const response = await qwen.chat([
        {
          role: "user",
          content: `Project: ${args.project_title}\nDescription: ${args.description || "Not provided"}`,
        },
      ]);

      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fall through
      }

      return {
        score: 50,
        breakdown: { technicalDepth: 10, marketAnalysis: 10, implementationPlan: 10, innovation: 10, resourceFeasibility: 10 },
        feedback: "Unable to parse analysis. Please provide more details.",
        risks: [],
        recommendations: [],
      };
    }

    case "suggest_tech_stack": {
      const qwen = new QwenService({
        systemPrompt: `You are a senior software architect. Suggest an optimal tech stack for the given project type.
Return ONLY a JSON object with this exact structure:
{
  "frontend": ["<tech 1>", "<tech 2>"],
  "backend": ["<tech 1>", "<tech 2>"],
  "database": ["<tech 1>", "<tech 2>"],
  "devops": ["<tech 1>", "<tech 2>"],
  "additional": ["<tech 1>", "<tech 2>"],
  "reasoning": "<brief explanation>"
}`,
      });

      const requirements = args.requirements ? `Requirements: ${(args.requirements as string[]).join(", ")}` : "";
      const response = await qwen.chat([
        {
          role: "user",
          content: `Project type: ${args.project_type}\n${requirements}`,
        },
      ]);

      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fall through
      }

      return {
        frontend: ["React", "Next.js"],
        backend: ["Node.js", "Express"],
        database: ["PostgreSQL"],
        devops: ["Docker", "GitHub Actions"],
        additional: [],
        reasoning: "Default recommendation. Provide more details for tailored suggestions.",
      };
    }

    case "generate_milestones": {
      const weeks = (args.duration_weeks as number) || 16;
      return {
        milestones: [
          { phase: 1, name: "Research & Literature Review", startWeek: 1, endWeek: Math.ceil(weeks * 0.15), deliverables: ["Literature review document", "Problem statement"] },
          { phase: 2, name: "Requirements & Design", startWeek: Math.ceil(weeks * 0.15) + 1, endWeek: Math.ceil(weeks * 0.3), deliverables: ["SRS document", "System architecture"] },
          { phase: 3, name: "Core Development", startWeek: Math.ceil(weeks * 0.3) + 1, endWeek: Math.ceil(weeks * 0.65), deliverables: ["MVP", "Core features implemented"] },
          { phase: 4, name: "Testing & Integration", startWeek: Math.ceil(weeks * 0.65) + 1, endWeek: Math.ceil(weeks * 0.8), deliverables: ["Test reports", "Integrated system"] },
          { phase: 5, name: "Documentation & Presentation", startWeek: Math.ceil(weeks * 0.8) + 1, endWeek: weeks, deliverables: ["Final report", "Presentation slides", "Demo"] },
        ],
        totalWeeks: weeks,
      };
    }

    case "brainstorm_ideas": {
      const count = (args.count as number) || 5;
      const qwen = new QwenService({
        systemPrompt: `You are a creative project ideation expert. Generate ${count} innovative graduation project ideas.
Return ONLY a JSON array of objects with this exact structure:
[
  {
    "title": "<project title>",
    "description": "<2-3 sentence description>",
    "domain": "<domain>",
    "techStack": ["<tech 1>", "<tech 2>"],
    "difficulty": "easy" | "medium" | "hard",
    "uniqueness": <number 1-10>
  }
]`,
      });

      const constraints = args.constraints ? `Constraints: ${(args.constraints as string[]).join(", ")}` : "";
      const response = await qwen.chat([
        {
          role: "user",
          content: `Domain: ${args.domain}\n${constraints}\nGenerate exactly ${count} ideas.`,
        },
      ]);

      try {
        const jsonMatch = response.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fall through
      }

      return [];
    }

    case "evaluate_project": {
      const qwen = new QwenService({
        systemPrompt: `You are an expert project evaluator. Evaluate the given project across multiple dimensions.
Return ONLY a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "dimensions": {
    "innovation": { "score": <0-10>, "feedback": "<feedback>" },
    "technicalComplexity": { "score": <0-10>, "feedback": "<feedback>" },
    "marketPotential": { "score": <0-10>, "feedback": "<feedback>" },
    "feasibility": { "score": <0-10>, "feedback": "<feedback>" },
    "socialImpact": { "score": <0-10>, "feedback": "<feedback>" }
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "verdict": "<brief overall verdict>"
}`,
      });

      const techStack = args.tech_stack ? `Tech stack: ${(args.tech_stack as string[]).join(", ")}` : "";
      const response = await qwen.chat([
        {
          role: "user",
          content: `Title: ${args.title}\nDescription: ${args.description}\n${techStack}`,
        },
      ]);

      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fall through
      }

      return {
        overallScore: 50,
        dimensions: {
          innovation: { score: 5, feedback: "Unable to evaluate" },
          technicalComplexity: { score: 5, feedback: "Unable to evaluate" },
          marketPotential: { score: 5, feedback: "Unable to evaluate" },
          feasibility: { score: 5, feedback: "Unable to evaluate" },
          socialImpact: { score: 5, feedback: "Unable to evaluate" },
        },
        strengths: [],
        weaknesses: [],
        verdict: "Unable to evaluate. Provide more details.",
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

export async function POST(request: Request) {
  try {
    const { tool, arguments: toolArgs, messages } = await request.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    if (tool && toolArgs) {
      const result = await executeTool(tool, toolArgs);
      return NextResponse.json({ tool, arguments: toolArgs, result });
    }

    if (messages) {
      const qwen = new QwenService({
        tools: TOOLS,
        systemPrompt: "You are GPSpark AI assistant. Use tools when appropriate to help the user.",
      });

      const chatMessages: ChatMessage[] = messages.map((m: any) => ({
        role: m.role,
        content: m.content,
        ...(m.tool_call_id ? { tool_call_id: m.tool_call_id, name: m.name } : {}),
      }));

      const response = await qwen.chat(chatMessages, { tools: TOOLS });

      if (response.toolCalls.length > 0) {
        const toolResults = [];
        for (const toolCall of response.toolCalls) {
          const args = JSON.parse(toolCall.arguments);
          const result = await executeTool(toolCall.name, args);
          toolResults.push({ tool: toolCall.name, arguments: args, result });
        }

        return NextResponse.json({
          content: response.content,
          toolCalls: response.toolCalls,
          toolResults,
          usage: response.usage,
        });
      }

      return NextResponse.json({
        content: response.content,
        toolCalls: [],
        toolResults: [],
        usage: response.usage,
      });
    }

    return NextResponse.json(
      {
        error: "Provide either 'tool' + 'arguments' for direct execution, or 'messages' for AI-driven tool selection",
        availableTools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[AI_TOOLS_API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    })),
  });
}
