import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract data from request body
    const {
      userId: userIdOrEmail, // This could be either UUID or email
      cvText,
      summary,
      technicalSkills,
      softSkills,
      strengths,
      improvementAreas,
      recommendations,
      industryAnalysis,
      careerTrajectory,
      skillGapAnalysis
    } = body
    
    // Try to determine if the userId is an email or already a UUID
    let userId = userIdOrEmail;
    
    // If it looks like an email, try to find the user's UUID
    if (userIdOrEmail && userIdOrEmail.includes('@')) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userIdOrEmail)
        .single()
      
      if (!userError && userData && userData.id) {
        userId = userData.id;
        console.log(`Found UUID ${userId} for email ${userIdOrEmail}`);
      } else {
        console.warn(`Could not find user with email ${userIdOrEmail}, using email as identifier`);
        // We'll continue using the email as the identifier if we can't find the UUID
      }
    }
    
    // Generate a unique assessment ID
    const assessmentId = uuidv4()
    
    // First, create an entry in the Assessments table
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('Assessments')
      .insert({
        id: assessmentId,
        userId: userId, // Now using the resolved userId (either UUID or email)
        summary,
        name: `Skill Assessment ${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        score: calculateOverallScore(technicalSkills),
        industry: industryAnalysis?.industry || 'Not specified',
        cv_text: cvText || '' // Store the CV text
      })
      .select('id')
    
    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError)
      return NextResponse.json({ 
        error: 'Failed to create assessment', 
        details: assessmentError.message 
      }, { status: 500 })
    }
    
    // Store detailed assessment data in a separate table or JSON field
    const { data: detailsData, error: detailsError } = await supabase
      .from('UserAssessmentDetails')
      .insert({
        assessment_id: assessmentId,
        userId: userId, // Using the resolved UUID or email
        technical_skills: technicalSkills,
        soft_skills: softSkills,
        strengths,
        improvement_areas: improvementAreas,
        recommendations,
        industry_analysis: industryAnalysis,
        career_trajectory: careerTrajectory,
        skill_gap_analysis: skillGapAnalysis,
        createdAt: new Date().toISOString(),
        cv_text: cvText || '' // Also store CV text in the details for redundancy
      })
    
    if (detailsError) {
      console.error('Error creating assessment details:', detailsError)
      // If details insertion fails but main assessment is created, we still return a success
      // but log the error for debugging
    }
    
    // Return success with the new assessment ID
    return NextResponse.json({ 
      success: true, 
      assessmentId: assessmentId 
    })
    
  } catch (error) {
    console.error('Unexpected error in assessment creation:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// Helper function to calculate an overall score based on technical skills
function calculateOverallScore(technicalSkills: any[]): number {
  if (!Array.isArray(technicalSkills) || technicalSkills.length === 0) {
    return 75 // Default score if no skills are provided
  }
  
  // Map skill levels to numerical values
  const levelScores: Record<string, number> = {
    'Beginner': 25,
    'Basic': 40,
    'Intermediate': 60,
    'Advanced': 80,
    'Expert': 95
  }
  
  // Calculate average score from technical skills
  let totalScore = 0
  let countedSkills = 0
  
  technicalSkills.forEach(skill => {
    const level = skill.level
    if (level && levelScores[level]) {
      totalScore += levelScores[level]
      countedSkills++
    }
  })
  
  if (countedSkills === 0) return 75 // Default if no recognized skill levels
  
  return Math.round(totalScore / countedSkills)
} 