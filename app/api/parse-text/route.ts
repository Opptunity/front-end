import { type NextRequest, NextResponse } from "next/server"
import { generateId } from "@/lib/utils"
import { assessmentStore } from "../upload/route"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided or invalid format" }, { status: 400 })
    }

    // Generate a unique ID for this assessment
    const id = generateId()

    // Store the text
    assessmentStore.set(id, { text, assessment: null })

    return NextResponse.json({
      id,
      success: true,
      message: "Text received successfully",
      textLength: text.length,
    })
  } catch (error) {
    console.error("Text parsing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process text",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
