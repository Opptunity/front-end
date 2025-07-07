import { type NextRequest, NextResponse } from "next/server"
import { extractTextFromPdf } from "@/lib/pdf-parser"
import { generateId, generateUuid } from "@/lib/utils"
import { assessmentStorage } from "@/lib/storage"
import { supabase } from "@/lib/supabase"

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
    const email = formData.get("email") as string || ""
    const assessmentId = formData.get("assessment_id") as string || ""

    console.log("Email received in upload API:", email ? `"${email}"` : "No email provided")
    console.log("Assessment ID received:", assessmentId ? `"${assessmentId}"` : "No ID provided")

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
        console.log("Extracted text (first 200 chars):", text.substring(0, 200));
        // Check if the extracted text looks like raw PDF data
        const isProbablyRawPdf = (
          text.startsWith('%PDF-') ||
          (
            text.length < 500 && // suspiciously short
            /[\\x00-\\x08\\x0E-\\x1F]/.test(text) // contains lots of control chars
          )
        );

        if (isProbablyRawPdf) {
          console.error("PDF extraction failed: Output contains raw PDF data");
          text = "PDF parsing failed. The extracted content appears to contain raw PDF data rather than readable text.";
        }
      } catch (pdfError) {
        console.error("PDF extraction failed, using placeholder text:", pdfError);
        if (pdfError instanceof Error && pdfError.stack) {
          console.error("PDF extraction error stack:", pdfError.stack);
        }
        // Provide a placeholder text to continue the flow
        text = "PDF parsing failed. This is placeholder text to allow processing to continue.";
      }

      // If text extraction completely failed or returned an error message
      if (!text || text.includes("We encountered an issue parsing your PDF")) {
        console.log("Warning: PDF text extraction produced limited results");
      }

      // Generate or use provided ID for this assessment
      const uuid = assessmentId || generateUuid(); // Always use UUID for DB
      const id = uuid; // Use the same UUID for local storage and DB
      console.log("Assessment ID:", id)
      console.log("UUID for Supabase:", uuid)

      // Store the extracted text in the local storage for backward compatibility
      assessmentStorage.set(id, { text, assessment: null })
      console.log("Stored text in assessment store")
      
      // Store data in Supabase
      try {
        // Make sure email is properly formatted
        const sanitizedEmail = email ? email.trim() : ""
        console.log("Storing in Supabase with email:", sanitizedEmail || "No email")
        
        // Check if record with this ID already exists (update if it does)
        const { data: existingData, error: existingError } = await supabase
          .from('cv_data')
          .select('id, email')
          .eq('id', uuid)
          .single()
        
        if (existingError && existingError.code !== 'PGRST116') { // Not found is ok
          console.error("Error checking for existing record:", existingError)
        }
        
        // If record exists, update it
        if (existingData) {
          console.log("Record exists, updating with new CV data")
          const existingEmail = existingData.email as string || ''
          const { error: updateError } = await supabase
            .from('cv_data')
            .update({
              email: sanitizedEmail || existingEmail, // Keep existing email if new one not provided
              original_text: text,
              file_name: file.name,
              file_type: file.type,
              updatedAt: new Date().toISOString()
            })
            .eq('id', uuid)
          
          if (updateError) {
            console.error("Supabase update error:", updateError)
          } else {
            console.log("Successfully updated record in Supabase")
          }
        } else {
          // Insert new record
          const { data, error } = await supabase
            .from('cv_data')
            .insert({
              id: uuid,
              email: sanitizedEmail,
              local_id: id,  // Store local id directly on insert (now always UUID)
              original_text: text,
              file_name: file.name,
              file_type: file.type,
              parsed_data: null,
              assessment_results: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
          
          if (error) {
            console.error("Supabase storage error:", error)
          } else {
            console.log("Successfully stored data in Supabase:", data)
            
            // Create a mapping between the local ID and Supabase UUID
            // This allows us to reference the Supabase record later
            try {
              const idMapKey = `supabase_id_${id}`
              // Don't use localStorage in server-side code
              // localStorage.setItem(idMapKey, uuid)
              console.log(`Created ID mapping: ${id} -> ${uuid}`)
              
              // Store the mapping directly in the cv_data table
              const { error: mappingError } = await supabase
                .from('cv_data')
                .update({ local_id: id })
                .eq('id', uuid)
                
              if (mappingError) {
                console.warn("Could not store ID mapping in database:", mappingError)
              }
            } catch (e) {
              console.warn("Could not store ID mapping:", e)
            }
          }
        }
      } catch (storageError) {
        console.error("Error storing in Supabase:", storageError)
        // Continue with existing flow even if Supabase storage fails
      }

      return NextResponse.json({
        id,
        supabase_id: uuid,
        success: true,
        message: "File uploaded successfully",
        text: text,
        textLength: text.length,
        textQuality: text.includes("We encountered an issue") ? "low" : "good"
      })
    } catch (error) {
      console.error("Error processing file:", error)
      return NextResponse.json(
        {
          error: "Failed to process file",
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
