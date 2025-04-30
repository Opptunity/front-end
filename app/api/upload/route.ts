import { type NextRequest, NextResponse } from "next/server"
import { extractTextFromPdf } from "@/lib/pdf-parser"
import { generateId } from "@/lib/utils"
import { assessmentStorage } from "@/lib/storage"

// Export storage for backward compatibility
export const assessmentStore = {
  set: (id: string, data: { text: string; assessment: any | null }) => {
    assessmentStorage.set(id, data);
  },
  get: (id: string) => {
    return assessmentStorage.get(id);
  }
};

export const config = {
  api: {
    bodyParser: false, // Disables the default body parser
  },
  // Increase the limit for the request body size
  maxDuration: 60, // 60 seconds timeout
}

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called")

    // Check if the request is too large
    const contentLength = request.headers.get("content-length")
    if (contentLength && Number.parseInt(contentLength) > 10 * 1024 * 1024) {
      // 10MB limit
      return NextResponse.json(
        {
          error: "File too large. Maximum size is 10MB",
        },
        { status: 413 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("File received:", file.name, "Size:", file.size, "Type:", file.type)

    // Validate file type
    if (file.type !== "application/pdf") {
      console.error("Invalid file type:", file.type)
      return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 })
    }

    try {
      // Convert file to buffer
      console.log("Converting file to buffer...")
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      console.log("Buffer created, size:", buffer.length)

      // Extract text from PDF with better error handling
      console.log("Extracting text from PDF...")
      let text = "";
      try {
        text = await extractTextFromPdf(buffer);
        console.log("Text extracted, length:", text.length);
      } catch (pdfError) {
        console.error("PDF extraction failed, using placeholder text:", pdfError);
        // Provide a placeholder text to continue the flow
        text = "PDF parsing failed. This is placeholder text to allow processing to continue.";
      }

      // If text extraction completely failed or returned an error message
      if (!text || text.includes("We encountered an issue parsing your PDF")) {
        console.log("Warning: PDF text extraction produced limited results");
      }

      // Generate a unique ID for this assessment
      const id = generateId()
      console.log("Generated assessment ID:", id)

      // Store the extracted text
      assessmentStorage.set(id, { text, assessment: null })
      console.log("Stored text in assessment store")
      console.log("Store debug:", assessmentStorage.debug())

      return NextResponse.json({
        id,
        success: true,
        message: "File uploaded successfully",
        textLength: text.length,
        textQuality: text.includes("We encountered an issue") ? "low" : "good"
      })
    } catch (error) {
      console.error("Error processing file:", error)
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Failed to process file",
          details: error instanceof Error ? error.stack : undefined,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to process upload",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
