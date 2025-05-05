import { type NextRequest, NextResponse } from "next/server"
import { generateCourseRecommendations, generateFallbackCourseRecommendations } from "@/lib/course-recommendations"
import { buildUserProfile } from "@/lib/ai-agent"
import type { Industry } from "@/lib/industry-detection"
import { assessmentStorage } from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    // Get assessment ID from the URL
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: "Assessment ID is required" }, { status: 400 })
    }
    
    // Instead of using fetch, directly access the assessment data from storage
    const storedData = assessmentStorage.get(id)
    
    if (!storedData || !storedData.assessment) {
      console.log("Assessment not found or incomplete for ID:", id)
      return NextResponse.json({ error: "Assessment not found or incomplete" }, { status: 404 })
    }
    
    const assessment = storedData.assessment
    
    try {
      // Validate industry from assessment
      let industry = assessment.industryAnalysis.industry.toLowerCase()
      
      // Map to valid Industry type
      if (!['technology', 'marketing', 'finance', 'healthcare', 'design', 'hr', 'sales', 'education', 'legal', 'manufacturing'].includes(industry)) {
        // Default to "other" if not a recognized industry
        industry = "other"
      }
      
      // Build user profile from assessment data with validated industry
      const userProfile = buildUserProfile(assessment, industry as Industry)
      
      // Generate course recommendations directly
      const recommendations = await generateCourseRecommendations(userProfile)
      
      return NextResponse.json({
        success: true,
        recommendations,
      })
    } catch (error) {
      console.error("Error generating AI recommendations:", error)
      
      try {
        // Fall back to non-AI recommendations
        // Always use "other" as industry to avoid the same error
        const userProfile = buildUserProfile(assessment, "other" as Industry)
        const fallbackRecommendations = generateFallbackCourseRecommendations(userProfile)
        
        return NextResponse.json({
          success: true,
          recommendations: fallbackRecommendations,
          fallback: true
        })
      } catch (fallbackError) {
        console.error("Even fallback recommendations failed:", fallbackError)
        return NextResponse.json({
          error: "Failed to generate any recommendations",
          details: fallbackError instanceof Error ? fallbackError.message : undefined,
        }, { status: 500 })
      }
    }
  } catch (error) {
    console.error("Course recommendations API error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate course recommendations",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 },
    )
  }
} 