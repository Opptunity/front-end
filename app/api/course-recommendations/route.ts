import { type NextRequest, NextResponse } from "next/server"
import { generateCourseRecommendations, generateFallbackCourseRecommendations } from "@/lib/course-recommendations"
import { buildUserProfile } from "@/lib/ai-agent"
import type { Industry } from "@/lib/industry-detection"

export async function GET(request: NextRequest) {
  try {
    // Get assessment ID from the URL
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: "Assessment ID is required" }, { status: 400 })
    }
    
    // Get the host from the request
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`
    
    // Fetch assessment data with absolute URL
    const assessmentResponse = await fetch(`${baseUrl}/api/assess/${id}`)
    
    if (!assessmentResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch assessment data" }, { status: 400 })
    }
    
    const assessmentData = await assessmentResponse.json()
    
    if (!assessmentData.success || !assessmentData.assessment) {
      return NextResponse.json({ error: "Invalid assessment data" }, { status: 400 })
    }
    
    const assessment = assessmentData.assessment
    
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