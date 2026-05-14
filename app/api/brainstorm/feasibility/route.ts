import { NextResponse } from "next/server";

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

    // Dummy data for prototype
    return NextResponse.json({
      score: 68,
      breakdown: {
        technicalDepth: 14,
        marketAnalysis: 12,
        implementationPlan: 15,
        innovation: 16,
        resourceFeasibility: 11,
      },
      feedback: "Moderate to high feasibility. The project has strong innovation potential but needs more detailed technical architecture and resource planning.",
    });
  } catch (error) {
    console.error("[FEASIBILITY_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze feasibility" },
      { status: 500 }
    );
  }
}
