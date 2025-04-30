import { type NextRequest, NextResponse } from "next/server"
import { assessmentStorage } from "@/lib/storage"
import { assessSkills } from "@/lib/skills-assessment"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = (await params).id
    console.log("Assessment requested for ID:", id)
    console.log("Store status:", assessmentStorage.debug())

    const storedData = assessmentStorage.get(id)

    if (!storedData) {
      console.log("Assessment not found for ID:", id)
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // If we already have an assessment, return it
    if (storedData.assessment) {
      console.log("Returning cached assessment for ID:", id)
      return NextResponse.json({
        success: true,
        assessment: storedData.assessment,
      })
    }

    console.log("Performing new assessment for ID:", id)
    console.log("CV text length:", storedData.text.length)

    // Otherwise, perform the assessment
    try {
      const assessment = await assessSkills(storedData.text)

      // Store the assessment result
      assessmentStorage.set(id, { ...storedData, assessment })

      console.log("Assessment completed successfully for ID:", id)
      console.log("Store update:", assessmentStorage.debug())

      return NextResponse.json({
        success: true,
        assessment,
      })
    } catch (assessmentError) {
      console.error("Assessment error:", assessmentError)

      // Return a more helpful error
      return NextResponse.json(
        {
          error: "Failed to assess skills",
          details: assessmentError instanceof Error ? assessmentError.message : "Unknown error",
          success: false,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Assessment route error:", error)
    return NextResponse.json(
      {
        error: "Failed to process assessment request",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
