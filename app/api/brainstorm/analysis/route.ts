import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        marketGaps: [],
        technicalChallenges: [],
      });
    }

    // Dummy data for prototype
    return NextResponse.json({
      marketGaps: [
        {
          title: "Real-time Fleet Optimization",
          description: "Few solutions address dynamic route recalculation for urban drone fleets under 500ms latency constraints.",
        },
        {
          title: "Cross-platform Interoperability",
          description: "Lack of standardized protocols between different drone manufacturers creates integration barriers.",
        },
        {
          title: "Regulatory Compliance Automation",
          description: "No existing tools automatically adapt flight plans to changing local aviation regulations.",
        },
      ],
      technicalChallenges: [
        {
          title: "Swarm Communication Latency",
          description: "Maintaining sub-100ms inter-drone communication in dense urban environments with signal interference.",
          severity: "high",
        },
        {
          title: "Battery Life Optimization",
          description: "Balancing computation-heavy routing algorithms with limited onboard processing power and battery capacity.",
          severity: "high",
        },
        {
          title: "GPS-denied Navigation",
          description: "Implementing reliable alternative positioning systems for indoor or signal-blocked areas.",
          severity: "medium",
        },
        {
          title: "Collision Avoidance at Scale",
          description: "Scaling decentralized collision avoidance from 5 to 50+ drones without exponential complexity.",
          severity: "medium",
        },
      ],
    });
  } catch (error) {
    console.error("[ANALYSIS_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze conversation" },
      { status: 500 }
    );
  }
}
