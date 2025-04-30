import { NextRequest, NextResponse } from "next/server"
import { assessmentStorage } from "@/lib/storage"
import { assessSkills } from "@/lib/skills-assessment"

export async function POST(request: NextRequest) {
  try {
    const { skillPerformance, id, includeLatestTest, cvText: providedCvText } = await request.json()

    // Retrieve the original CV text using the id
    const storedData = assessmentStorage.get(id)
    if (!storedData || !storedData.text) {
      return NextResponse.json({ success: false, error: "CV not found for this user" }, { status: 404 })
    }
    const cvText = providedCvText || storedData.text

    // Compose a prompt for the AI
    let prompt = `
      Candidate's CV:
      ${cvText}
    `

    if (skillPerformance) {
      prompt += `
      Candidate's skill performance from personalized test:
      ${JSON.stringify(skillPerformance, null, 2)}
      `
    }

    if (includeLatestTest && storedData.latestTestResults) {
      prompt += `
      Candidate's latest test results:
      ${JSON.stringify(storedData.latestTestResults, null, 2)}
      `
    }

    prompt += `
      Based on the above, generate a detailed, optimized assessment report that highlights the candidate's strengths and weaknesses, focusing on the skills demonstrated in the test and the information in the CV.
    `

    // Call your AI function
    const assessment = await assessSkills(prompt)

    // Store the new assessment for this id
    assessmentStorage.set(id, { 
      ...storedData, 
      assessment, 
      text: cvText,
      latestTestResults: skillPerformance || storedData.latestTestResults
    })

    return NextResponse.json({
      success: true,
      assessment,
    })
  } catch (error) {
    console.error("Assessment report error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate assessment report" },
      { status: 500 }
    )
  }
}
