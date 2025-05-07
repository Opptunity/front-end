import { NextRequest, NextResponse } from "next/server"
import { generateCVImprovements, generateFallbackCVImprovements } from "@/lib/cv-improvement-prompt"
import { buildUserProfile } from "@/lib/ai-agent"
import { assessmentStorage } from "@/lib/storage"
import { cvImprovementsCache } from "@/lib/cv-improvements-cache"

/**
 * GET endpoint to retrieve CV improvement suggestions
 */
export async function GET(request: NextRequest) {
  // Parse URL parameters
  const searchParams = request.nextUrl.searchParams
  const assessmentId = searchParams.get("assessmentId")
  
  try {
    // Validate required parameters
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Missing assessment ID parameter" },
        { status: 400 }
      )
    }
    
    // Check if we have cached improvements for this assessment
    const cachedImprovements = cvImprovementsCache.get(assessmentId)
    if (cachedImprovements) {
      console.log(`Using cached CV improvements for Assessment ID: ${assessmentId}`)
      return NextResponse.json({
        improvements: cachedImprovements,
        fromCache: true
      })
    }
    
    // Fetch the assessment
    const storedData = assessmentStorage.get(assessmentId)
    
    if (!storedData || !storedData.assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      )
    }
    
    const assessment = storedData.assessment
    
    // Get CV text from assessment
    const cvText = assessment.cvText || assessment.text || ""
    
    if (!cvText) {
      // Instead of returning an error, use fallback improvements
      console.log("No CV text found in assessment, using fallback improvements")
      const fallbackImprovements = generateFallbackCVImprovements()
      
      return NextResponse.json({
        improvements: fallbackImprovements,
        isError: true,
        message: "No CV text found, generated fallback improvements"
      }, { status: 200 })
    }
    
    // Build user profile from assessment with error handling
    try {
      // Make sure the industry is valid
      const validIndustry = assessment.industryAnalysis && assessment.industryAnalysis.industry
        ? assessment.industryAnalysis.industry
        : 'other';
      
      const userProfile = buildUserProfile(assessment, validIndustry);
      
      // Generate CV improvement suggestions
      const improvements = await generateCVImprovements(cvText, userProfile);
      
      // Cache the improvements for future use
      cvImprovementsCache.set(assessmentId, improvements);
      
      // Return the generated suggestions
      return NextResponse.json({
        improvements
      });
    } catch (profileError) {
      console.error("Error building user profile:", profileError);
      
      // Use fallback improvements if profile building fails
      const fallbackImprovements = generateFallbackCVImprovements();
      
      return NextResponse.json({
        improvements: fallbackImprovements,
        isError: true,
        message: "Failed to process user profile, generated fallback improvements"
      }, { status: 200 });
    }
  } catch (error) {
    console.error("Error generating CV improvements:", error)
    
    // Return fallback improvements in case of error
    const fallbackImprovements = generateFallbackCVImprovements()
    
    return NextResponse.json({
      improvements: fallbackImprovements,
      isError: true,
      message: "Generated fallback improvements due to an error"
    }, { status: 200 })
  }
}

/**
 * POST endpoint to generate CV improvement suggestions from raw CV text
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { cvText, assessmentId } = body
    
    // Validate required parameters
    if (!cvText) {
      return NextResponse.json(
        { error: "Missing CV text" },
        { status: 400 }
      )
    }
    
    // If assessment ID is provided, check cache and use additional context
    if (assessmentId) {
      // Check if we have cached improvements for this assessment
      const cachedImprovements = cvImprovementsCache.get(assessmentId)
      if (cachedImprovements) {
        console.log(`Using cached CV improvements for Assessment ID: ${assessmentId}`)
        return NextResponse.json({
          improvements: cachedImprovements,
          fromCache: true
        })
      }
      
      const storedData = assessmentStorage.get(assessmentId)
      
      if (storedData && storedData.assessment) {
        try {
          // Make sure the industry is valid
          const validIndustry = storedData.assessment.industryAnalysis && 
            storedData.assessment.industryAnalysis.industry
              ? storedData.assessment.industryAnalysis.industry
              : 'other';
          
          const userProfile = buildUserProfile(
            storedData.assessment, 
            validIndustry
          )
          
          // Generate CV improvement suggestions
          const improvements = await generateCVImprovements(cvText, userProfile)
          
          // Cache the improvements if we have an assessment ID
          cvImprovementsCache.set(assessmentId, improvements);
          
          // Return the generated suggestions
          return NextResponse.json({
            improvements
          })
        } catch (profileError) {
          console.error("Error building user profile:", profileError);
          // Continue without a user profile
        }
      }
    }
    
    // Generate CV improvement suggestions
    const improvements = await generateCVImprovements(cvText)
    
    // Cache the improvements if we have an assessment ID
    if (assessmentId) {
      cvImprovementsCache.set(assessmentId, improvements);
    }
    
    // Return the generated suggestions
    return NextResponse.json({
      improvements
    })
  } catch (error) {
    console.error("Error generating CV improvements:", error)
    
    // Return fallback improvements in case of error
    const fallbackImprovements = generateFallbackCVImprovements()
    
    return NextResponse.json({
      improvements: fallbackImprovements,
      isError: true,
      message: "Generated fallback improvements due to an error"
    }, { status: 200 })
  }
} 