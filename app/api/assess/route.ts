import { type NextRequest, NextResponse } from "next/server"
import { assessSkills } from "@/lib/skills-assessment"

export async function POST(request: NextRequest) {
  try {
    const { cvText } = await request.json()

    if (!cvText) {
      return NextResponse.json({ error: "No CV text provided" }, { status: 400 })
    }

    // Perform skills assessment
    const assessment = await assessSkills(cvText)

    return NextResponse.json({
      success: true,
      assessment,
    })
  } catch (error) {
    console.error("Assessment error:", error)
    return NextResponse.json({ error: "Failed to assess skills" }, { status: 500 })
  }
}
