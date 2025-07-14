import { NextRequest, NextResponse } from "next/server"
import { createLearningPathwayPrompt, generateRoleSpecificLearningPathway, comparePathways } from "@/lib/learning-pathway-prompt"
import { LearningPathStep, PathwayCommonalities, UserProfile } from "@/lib/learning-pathway-types"
import { buildUserProfile } from "@/lib/ai-agent"
import { assessmentStorage } from "@/lib/storage"
import { learningPathwayCache } from "@/lib/learning-pathway-cache"
import { supabase } from "@/lib/supabase"

/**
 * GET endpoint to retrieve a learning pathway for a specific role
 */
export async function GET(request: NextRequest) {
  // Parse URL parameters
  const searchParams = request.nextUrl.searchParams
  const assessmentId = searchParams.get("assessmentId")
  const selectedRole = searchParams.get("selectedRole")
  const stepsCount = parseInt(searchParams.get("steps") || "3", 10)
  
  try {
    // Validate required parameters
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Missing assessment ID parameter" },
        { status: 400 }
      )
    }
    
    if (!selectedRole) {
      return NextResponse.json(
        { error: "Missing selected role parameter" },
        { status: 400 }
      )
    }
    
    // Check if we have a cached pathway for this assessment, role, and steps count
    const cachedPathway = learningPathwayCache.get(assessmentId, selectedRole, stepsCount)
    if (cachedPathway) {
      console.log(`Using cached ${stepsCount}-step learning pathway for ${selectedRole}`)
      return NextResponse.json({
        role: selectedRole,
        pathway: cachedPathway,
        fromCache: true
      })
    }
    
    // Try to get assessment from memory storage first
    const storedData = assessmentStorage.get(assessmentId)
    let assessment = storedData?.assessment
    
    // If not in memory, try fetching from Supabase
    if (!assessment) {
      console.log("Assessment not found in memory cache, trying Supabase")
      
      // Try direct query first
      const { data, error } = await supabase
        .from('Assessments')
        .select('assessmentData, cvText')
        .eq('id', assessmentId)
        .single()
      
      if (error) {
        console.error("Error fetching from Supabase:", error)
        
        // Try as text search fallback
        const { data: textData, error: textError } = await supabase
          .from('Assessments')
          .select('assessmentData, cvText')
          .filter('id', 'ilike', `%${assessmentId}%`)
          .limit(1)
          .single()
        
        if (textError) {
          console.error("Text search also failed:", textError)
          return NextResponse.json(
            { error: "Assessment not found" },
            { status: 404 }
          )
        }
        
        assessment = textData.assessmentData
      } else {
        assessment = data.assessmentData
      }
    }
    
    // Build user profile from assessment
    const userProfile: UserProfile = {
      industry: assessment.industryAnalysis.industry,
      careerLevel: assessment.careerTrajectory.currentLevel,
      specialization: assessment.summary.split(' ').slice(0, 3).join(' '), // Approximate specialization
      experience: "3+", // Default value if not available
      summary: assessment.summary,
      technicalSkills: assessment.technicalSkills,
      strengths: assessment.strengths,
      improvementAreas: assessment.improvementAreas
    }
    
    // Generate learning pathway for the selected role
    console.log(`Generating ${stepsCount}-step learning pathway for ${selectedRole}`)
    const learningPathway = await generateRoleSpecificLearningPathway(
      userProfile,
      selectedRole,
      stepsCount
    )
    
    // Cache the generated pathway for future use
    learningPathwayCache.set(assessmentId, selectedRole, stepsCount, learningPathway)
    
    // Return the generated pathway
    return NextResponse.json({
      role: selectedRole,
      pathway: learningPathway,
      fromCache: false
    })
  } catch (error) {
    console.error("Error generating learning pathway:", error)
    return NextResponse.json(
      { error: "Failed to generate learning pathway" },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint to generate learning pathways for multiple roles
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { assessmentId, roles, stepsCount = 3 } = body
    
    // Validate required parameters
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Missing assessment ID" },
        { status: 400 }
      )
    }
    
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid roles array" },
        { status: 400 }
      )
    }
    
    // Try to get assessment from memory storage first
    const storedData = assessmentStorage.get(assessmentId)
    let assessment = storedData?.assessment
    
    // If not in memory, try fetching from Supabase
    if (!assessment) {
      console.log("Assessment not found in memory cache, trying Supabase for POST request")
      
      // Try direct query first
      const { data, error } = await supabase
        .from('Assessments')
        .select('assessmentData, cvText')
        .eq('id', assessmentId)
        .single()
      
      if (error) {
        console.error("Error fetching from Supabase:", error)
        
        // Try as text search fallback
        const { data: textData, error: textError } = await supabase
          .from('Assessments')
          .select('assessmentData, cvText')
          .filter('id', 'ilike', `%${assessmentId}%`)
          .limit(1)
          .single()
        
        if (textError) {
          console.error("Text search also failed:", textError)
          return NextResponse.json(
            { error: "Assessment not found" },
            { status: 404 }
          )
        }
        
        assessment = textData.assessmentData
      } else {
        assessment = data.assessmentData
      }
    }
    
    // Build user profile from assessment
    const userProfile: UserProfile = {
      industry: assessment.industryAnalysis.industry,
      careerLevel: assessment.careerTrajectory.currentLevel,
      specialization: assessment.summary.split(' ').slice(0, 3).join(' '), // Approximate specialization
      experience: "3+", // Default value if not available
      summary: assessment.summary,
      technicalSkills: assessment.technicalSkills,
      strengths: assessment.strengths,
      improvementAreas: assessment.improvementAreas
    }
    
    // Generate pathways for each role
    const pathwaysByRole: Record<string, LearningPathStep[]> = {}
    const cacheResults: Record<string, boolean> = {}
    
    for (const role of roles) {
      try {
        // Check if we have a cached pathway for this role
        const cachedPathway = learningPathwayCache.get(assessmentId, role, stepsCount)
        
        if (cachedPathway) {
          console.log(`Using cached ${stepsCount}-step learning pathway for ${role}`)
          pathwaysByRole[role] = cachedPathway
          cacheResults[role] = true
          continue
        }
        
        // Generate new pathway if not in cache
        console.log(`Generating ${stepsCount}-step learning pathway for ${role}`)
        const pathway = await generateRoleSpecificLearningPathway(
          userProfile,
          role,
          stepsCount
        )
        
        // Store in cache for future use
        learningPathwayCache.set(assessmentId, role, stepsCount, pathway)
        
        pathwaysByRole[role] = pathway
        cacheResults[role] = false
      } catch (roleError) {
        console.error(`Error generating pathway for role ${role}:`, roleError)
        // Continue with other roles even if one fails
      }
    }
    
    // If we have multiple pathways, identify common elements
    let commonElements: PathwayCommonalities | null = null
    
    if (Object.keys(pathwaysByRole).length > 1) {
      commonElements = comparePathways(pathwaysByRole)
    }
    
    // Return the generated pathways
    return NextResponse.json({
      pathwaysByRole,
      commonElements,
      cacheResults // Include which pathways came from cache
    })
  } catch (error) {
    console.error("Error generating learning pathways:", error)
    return NextResponse.json(
      { error: "Failed to generate learning pathways" },
      { status: 500 }
    )
  }
} 