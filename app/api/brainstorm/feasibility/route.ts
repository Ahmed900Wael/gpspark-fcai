import { NextResponse } from "next/server";
import { QwenService } from "@/lib/qwen-service";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        score: 20,
        breakdown: {
          technicalDepth: 5,
          marketAnalysis: 5,
          implementationPlan: 5,
          innovation: 5,
          resourceFeasibility: 5,
        },
        feedback: "Start discussing your project idea to get a feasibility assessment.",
      });
    }

    const qwen = new QwenService({
      systemPrompt: `You are an expert academic project evaluator for FCAI-CU graduation projects. Analyze the following conversation between a student and AI tutor to determine project feasibility.

Evaluate based on these criteria (each worth 20 points):
1. **Technical Depth**: Are specific technologies, frameworks, and architectures discussed?
2. **Market Analysis**: Is there discussion of target audience, competitors, or market gaps?
3. **Implementation Plan**: Are there concrete steps, milestones, or timeline mentioned?
4. **Innovation**: Does the project offer novel solutions or unique value propositions?
5. **Resource Feasibility**: Is the scope realistic for a graduation project timeline and student resources?

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
  "feedback": "<brief 1-2 sentence assessment>"
}

Be strict but fair. A score below 40 means the project needs significant refinement. 40-69 means moderate feasibility with room for improvement. 70+ means high feasibility.`,
    });

    const conversationText = messages
      .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
      .join("\n\n");

    const response = await qwen.chat([
      { role: "user", content: `Analyze this conversation:\n\n${conversationText}` },
    ]);

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          score: Math.min(100, Math.max(0, parsed.score || 20)),
          breakdown: parsed.breakdown || {
            technicalDepth: 5,
            marketAnalysis: 5,
            implementationPlan: 5,
            innovation: 5,
            resourceFeasibility: 5,
          },
          feedback: parsed.feedback || "Continue refining your project idea.",
        });
      }
    } catch {
      // Fall through to defaults
    }

    return NextResponse.json({
      score: 20,
      breakdown: {
        technicalDepth: 5,
        marketAnalysis: 5,
        implementationPlan: 5,
        innovation: 5,
        resourceFeasibility: 5,
      },
      feedback: "Unable to analyze feasibility. Try providing more project details.",
    });
  } catch (error) {
    console.error("[FEASIBILITY_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze feasibility" },
      { status: 500 }
    );
  }
}
