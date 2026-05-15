import { NextResponse } from "next/server";

const OPENCODE_API_KEY = process.env.OPENCODE_API_KEY;
const API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const MODEL = "opencode-go/deepseek-v4-flash";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        marketGaps: [],
        technicalChallenges: [],
      });
    }

    if (!OPENCODE_API_KEY) {
      return NextResponse.json({
        error: "OpenCode AI API key not configured",
      }, { status: 500 });
    }

    const conversationText = messages
      .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
      .join("\n\n");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENCODE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are an expert academic project evaluator for FCAI-CU graduation projects. Analyze the following conversation between a student and AI tutor to identify:

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
          },
          {
            role: "user",
            content: `Analyze this conversation:\n\n${conversationText}`,
          },
        ],
        max_tokens: 2048,
        temperature: 0.4,
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
    const content = data.choices?.[0]?.message?.content || "{}";

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
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
