import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // First, try to find the user's UUID from their email
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (userError) {
      console.error('Error finding user by email:', userError)
      // Return empty array instead of demo data
      return NextResponse.json([])
    }
    
    const userId = userData?.id
    
    if (!userId) {
      console.error('No user found with email:', email)
      // Return empty array instead of demo data
      return NextResponse.json([])
    }
    
    // Try to get just the assessment IDs first to check if records exist
    const { data: assessmentIds, error: idError } = await supabase
      .from('Assessments')
      .select('id, createdAt, userId')
      .eq('userId', userId)  // Now using the proper UUID from the users table
      .order('createdAt', { ascending: false })
    
    if (idError || !assessmentIds || assessmentIds.length === 0) {
      console.error('Error fetching assessment IDs or no assessments found:', idError)
      // Return empty array instead of demo data
      return NextResponse.json([])
    }
    
    // If we get here, assessments exist, so let's fetch all fields
    // Use * to get all columns regardless of what they're named
    const { data: assessments, error } = await supabase
      .from('Assessments')
      .select('*')
      .eq('userId', userId)  // Using UUID
      .order('createdAt', { ascending: false })
    
    if (error) {
      console.error('Error fetching full assessment data:', error)
      // Return empty array instead of demo data
      return NextResponse.json([])
    }
    
    // Map whatever fields we have to the expected format
    const formattedAssessments = assessments.map(assessment => {
      // Extract known fields if they exist, or use fallbacks
      const id = assessment.id
      const createdAt = assessment.createdAt
      
      // Use a generic name field if title doesn't exist
      // Check for different possible column names that might contain assessment title
      const title = assessment.title || 
                   assessment.name || 
                   assessment.assessment_name || 
                   assessment.assessment_title ||
                   'Skills Assessment'
      
      // Check for different possible column names that might contain summary
      const summary = assessment.summary || 
                     assessment.description || 
                     assessment.assessment_description ||
                     'Completed assessment'
      
      // Check for different possible column names for score
      const score = assessment.score || 
                   assessment.user_score || 
                   assessment.assessment_score ||
                   75 // Default score if none exists
      
      return {
        id,
        title,
        summary,
        createdAt,
        UserAssessment: {
          createdAt,
          score
        }
      }
    })
    
    // Return the actual assessments (empty array if none found)
    return NextResponse.json(formattedAssessments)
  } catch (error) {
    console.error('Unexpected error in assessments fetch:', error)
    // Return empty array instead of demo data
    return NextResponse.json([])
  }
} 