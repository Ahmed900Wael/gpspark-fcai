import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const ANALYSIS_PROMPT = `You are an expert academic project evaluator for FCAI-CU graduation projects. Analyze the following conversation between a student and AI tutor to identify:

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

Be specific and actionable. Base your analysis ONLY on the conversation context provided. If the conversation lacks sufficient detail, return fewer items with appropriate caveats.`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        marketGaps: [],
        technicalChallenges: [],
      });
    }

    const conversationText = messages
      .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
      .join("\n\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "GPSpark",
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-7b-instruct:free",
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          { role: "user", content: `Analyze this conversation:\n\n${conversationText}` },
        ],
        max_tokens: 600,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenRouter API error (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json({
        marketGaps: parsed.marketGaps || [],
        technicalChallenges: parsed.technicalChallenges || [],
      });
    } catch (parseError) {
      return NextResponse.json({
        marketGaps: [],
        technicalChallenges: [],
      });
    }
  } catch (error) {
    console.error("[ANALYSIS_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze conversation" },
      { status: 500 }
    );
  }
}
