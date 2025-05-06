import { type NextRequest, NextResponse } from "next/server"
import { assessmentStorage } from "@/lib/storage"
import { assessSkills } from "@/lib/skills-assessment"
import { updateAssessmentResults, getSupabaseId, supabase, getCVDataById } from "@/lib/supabase"

// Track currently processing assessments
const processingAssessments = new Set();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = (await params).id
    console.log("Assessment requested for ID:", id)
    console.log("Store status:", assessmentStorage.debug())

    const storedData = assessmentStorage.get(id)

    if (!storedData) {
      console.log("Assessment not found in memory for ID:", id)
      console.log("Checking Supabase for data...")
      
      // Try to retrieve from Supabase
      try {
        // First, try with the provided ID directly
        let supabaseData = await getCVDataById(id)
        
        // If not found, try to get the Supabase ID for this local ID
        if (!supabaseData) {
          const supabaseId = await getSupabaseId(id)
          if (supabaseId) {
            supabaseData = await getCVDataById(supabaseId)
          }
        }
        
        if (supabaseData) {
          console.log("Found data in Supabase for ID:", id)
          
          // If we have assessment results, restore to memory and return
          if (supabaseData.assessment_results) {
            console.log("Restoring assessment from Supabase to memory cache")
            
            // Restore assessment to memory
            assessmentStorage.set(id, {
              text: supabaseData.original_text || "",
              assessment: supabaseData.assessment_results
            })
            
            return NextResponse.json({
              success: true,
              assessment: supabaseData.assessment_results,
            })
          } 
          
          // If we only have CV text but no assessment, restore to memory
          // and continue with assessment process
          if (supabaseData.original_text) {
            console.log("Found CV text in Supabase, restoring to memory and generating assessment")
            
            // Restore text to memory
            assessmentStorage.set(id, {
              text: supabaseData.original_text,
              assessment: null
            })
            
            // Get the updated data from memory
            const restoredData = assessmentStorage.get(id)
            
            // Continue with assessment process below using restoredData
            if (restoredData) {
              // Re-initialize processingAssessments logic for this ID
              if (processingAssessments.has(id)) {
                console.log("Assessment already in progress for ID:", id);
                return NextResponse.json({
                  success: false,
                  error: "Assessment is being processed, please try again in a moment",
                  processing: true
                }, { status: 202 });
              }
              
              // Mark this assessment as being processed
              processingAssessments.add(id);
              
              try {
                console.log("Performing new assessment for restored CV text, length:", restoredData.text.length)
                const assessment = await assessSkills(restoredData.text)
                
                // Add the CV text to the assessment object for use by other APIs
                const assessmentWithCVText = {
                  ...assessment,
                  cvText: restoredData.text,
                };
                
                // Store the assessment result
                assessmentStorage.set(id, { ...restoredData, assessment: assessmentWithCVText })
                
                // Store the results in Supabase as well
                try {
                  // Use the original ID if it was a Supabase ID, or get the mapped ID
                  const supabaseId = supabaseData.id || await getSupabaseId(id)
                  if (supabaseId) {
                    await updateAssessmentResults(supabaseId, assessmentWithCVText)
                  }
                } catch (dbError) {
                  console.error("Error updating assessment results:", dbError)
                }
                
                // Remove from processing set
                processingAssessments.delete(id);
                
                return NextResponse.json({
                  success: true,
                  assessment: assessmentWithCVText,
                })
              } catch (assessmentError) {
                // Remove from processing set even if there's an error
                processingAssessments.delete(id);
                
                console.error("Assessment error:", assessmentError)
                return NextResponse.json(
                  {
                    error: "Failed to assess skills",
                    details: assessmentError instanceof Error ? assessmentError.message : "Unknown error",
                    success: false,
                  },
                  { status: 500 },
                )
              }
            }
          }
        }
      } catch (supabaseError) {
        console.error("Error retrieving from Supabase:", supabaseError)
      }
      
      console.log("Assessment not found in memory or Supabase for ID:", id)
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

    // Check if this assessment is already being processed
    if (processingAssessments.has(id)) {
      console.log("Assessment already in progress for ID:", id);
      return NextResponse.json({
        success: false,
        error: "Assessment is being processed, please try again in a moment",
        processing: true
      }, { status: 202 }); // 202 Accepted - request received but not completed yet
    }

    // Mark this assessment as being processed
    processingAssessments.add(id);

    console.log("Performing new assessment for ID:", id)
    console.log("CV text length:", storedData.text.length)

    // Otherwise, perform the assessment
    try {
      const assessment = await assessSkills(storedData.text)
      
      // Add the CV text to the assessment object for use by other APIs
      const assessmentWithCVText = {
        ...assessment,
        cvText: storedData.text,  // Include the original CV text
      };

      // Store the assessment result
      assessmentStorage.set(id, { ...storedData, assessment: assessmentWithCVText })

      // Store the results in Supabase as well
      try {
        // Try to get Supabase UUID if we're using a local ID
        const supabaseId = await getSupabaseId(id)
        if (supabaseId) {
          await updateAssessmentResults(supabaseId, assessmentWithCVText)
        } else {
          console.log("No valid Supabase ID found for local ID:", id)
        }
      } catch (dbError) {
        console.error("Error updating assessment results:", dbError)
      }

      console.log("Assessment completed successfully for ID:", id)
      console.log("Store update:", assessmentStorage.debug())

      // Remove from processing set
      processingAssessments.delete(id);

      return NextResponse.json({
        success: true,
        assessment: assessmentWithCVText,
      })
    } catch (assessmentError) {
      console.error("Assessment error:", assessmentError)

      // Remove from processing set even if there's an error
      processingAssessments.delete(id);

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
    
    // Make sure to remove from processing set if there's an error
    if (params && params.id) {
      processingAssessments.delete(params.id);
    }
    
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
