import { NextResponse } from "next/server";
import { QwenService } from "@/lib/qwen-service";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        marketGaps: [],
        technicalChallenges: [],
      });
    }

    const qwen = new QwenService({
      systemPrompt: `You are an expert academic project evaluator for FCAI-CU graduation projects. Analyze the following conversation between a student and AI tutor to identify:

1. **Market Gaps**: Underserved areas, unmet user needs, or opportunities in the project's domain that the student could capitalize on.
2. **Technical Challenges**: Specific technical hurdles the project will face, with severity levels (high, medium, low).

Return ONLY a JSON object with this exact structure:
{
  "marketGaps": [
    {
      "title": "<short gap name>",
      "description": "<1-2 sentence explanation of the gap and why it matters>"
    }
  ],
  "technicalChallenges": [
    {
      "title": "<short challenge name>",
      "description": "<1-2 sentence explanation of the challenge and potential mitigation>",
      "severity": "high" | "medium" | "low"
    }
  ]
}

Be specific and actionable. Base your analysis ONLY on the conversation context provided. If the conversation lacks sufficient detail, return fewer items with appropriate caveats.`,
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
          marketGaps: parsed.marketGaps || [],
          technicalChallenges: parsed.technicalChallenges || [],
        });
      }
    } catch {
      // Fall through to defaults
    }

    return NextResponse.json({
      marketGaps: [],
      technicalChallenges: [],
    });
  } catch (error) {
    console.error("[ANALYSIS_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze conversation" },
      { status: 500 }
    );
  }
}
