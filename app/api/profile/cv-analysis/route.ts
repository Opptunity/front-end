import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    // Validate the request
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Mock data for demonstration purposes
    // In a real app, you would fetch this data from your database
    const mockCvAnalysis = {
      skills: [
        { name: "JavaScript", level: 85 },
        { name: "React", level: 80 },
        { name: "Node.js", level: 75 },
        { name: "TypeScript", level: 70 },
        { name: "HTML/CSS", level: 90 },
        { name: "SQL", level: 65 },
      ],
      experienceSummary: "5+ years of experience in web development with a focus on front-end technologies. Strong background in building responsive user interfaces and implementing complex business logic.",
      improvementAreas: [
        "Expand knowledge of cloud infrastructure (AWS/Azure)",
        "Strengthen back-end development skills",
        "Gain experience with mobile development frameworks",
        "Improve data analysis and visualization capabilities"
      ],
      jobFit: [
        {
          title: "Senior Front-end Developer",
          matchPercentage: 92,
          description: "Your skills strongly align with this position's requirements for modern JavaScript frameworks and UI/UX expertise."
        },
        {
          title: "Full Stack Developer",
          matchPercentage: 78,
          description: "Good match overall, but would benefit from stronger back-end and database management experience."
        },
        {
          title: "UI/UX Developer",
          matchPercentage: 85,
          description: "Strong match for the front-end aspects, could improve design system knowledge."
        }
      ]
    }

    return NextResponse.json(mockCvAnalysis)
  } catch (error) {
    console.error("Error in CV analysis API:", error)
    return NextResponse.json(
      { error: "Failed to retrieve CV analysis" },
      { status: 500 }
    )
  }
} 