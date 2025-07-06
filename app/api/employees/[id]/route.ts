import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id

    console.log('Fetching employee profile for ID:', employeeId)

    // First, try to get employee data from the engineers table
    let employeeData = null
    let userAssessment = null

    // Try to fetch by engineer ID first (handle both integer and string IDs)
    let engineerData = null
    let engineerError = null

    // First try as integer
    if (!isNaN(Number(employeeId))) {
      const result = await supabase
        .from('ingenieurs')
        .select('*')
        .eq('ingenieur_id', parseInt(employeeId))
        .single()
      engineerData = result.data
      engineerError = result.error
    }

    // If not found and not a number, or if error, try as string
    if (!engineerData && (isNaN(Number(employeeId)) || engineerError)) {
      const result = await supabase
        .from('ingenieurs')
        .select('*')
        .eq('ingenieur_id', employeeId)
        .single()
      engineerData = result.data
      engineerError = result.error
    }

    if (engineerData) {
      employeeData = {
        id: engineerData.ingenieur_id,
        name: (engineerData.prenom || '') + ' ' + (engineerData.nom || ''),
        email: engineerData.email,
        position: engineerData.job_title || engineerData.position,
        department: engineerData.department,
        startDate: engineerData.hire_date || engineerData.date_embauche,
        phone: engineerData.phone,
        location: engineerData.location,
        avatar: engineerData.avatar_url,
        assessment: null as any
      }
    } else {
      // Try to fetch by email if ID doesn't work
      const { data: engineerByEmail, error: emailError } = await supabase
        .from('ingenieurs')
        .select('*')
        .eq('email', employeeId)
        .single()

      if (engineerByEmail) {
        employeeData = {
          id: engineerByEmail.ingenieur_id,
          name: (engineerByEmail.prenom || '') + ' ' + (engineerByEmail.nom || ''),
          email: engineerByEmail.email,
          position: engineerByEmail.job_title || engineerByEmail.position,
          department: engineerByEmail.department,
          startDate: engineerByEmail.hire_date || engineerByEmail.date_embauche,
          phone: engineerByEmail.phone,
          location: engineerByEmail.location,
          avatar: engineerByEmail.avatar_url,
          assessment: null as any
        }
      }
    }

    // If no engineer found, create a basic profile
    if (!employeeData) {
      employeeData = {
        id: employeeId,
        name: employeeId.includes('@') ? employeeId.split('@')[0] : employeeId,
        email: employeeId.includes('@') ? employeeId : null,
        position: 'Employee',
        department: null,
        startDate: null,
        phone: null,
        location: null,
        avatar: null,
        assessment: null as any
      }
    }

    // Fetch the latest assessment for this employee
    // Check both user_assessments and cv assessments
    const userEmail = employeeData.email || employeeId

    console.log('Fetching assessment for user email:', userEmail)

    // Try to get from user_assessments table first
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('user_assessments')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (assessmentData && !assessmentError) {
      console.log('Found assessment data:', assessmentData)
      
      // Parse the assessment data
      const assessment = {
        summary: assessmentData.summary || 'No summary available',
        technicalSkills: assessmentData.technical_skills || [],
        softSkills: assessmentData.soft_skills || [],
        strengths: assessmentData.strengths || [],
        improvementAreas: assessmentData.improvement_areas || [],
        recommendations: assessmentData.recommendations || [],
        industryAnalysis: assessmentData.industry_analysis || {
          industry: 'Unknown',
          alignment: 'Not assessed',
          trends: [],
          keyInsights: []
        },
        careerTrajectory: assessmentData.career_trajectory || {
          currentLevel: 'Not assessed',
          potentialRoles: [],
          timeToNextLevel: 'Unknown',
          developmentAreas: []
        },
        skillGapAnalysis: assessmentData.skill_gap_analysis || {
          criticalGaps: [],
          importantGaps: [],
          learningResources: []
        }
      }

      employeeData.assessment = assessment
    } else {
      console.log('No assessment found for user:', userEmail)
      // No assessment found
      employeeData.assessment = null
    }

    return NextResponse.json(employeeData)

  } catch (error) {
    console.error('Error fetching employee profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee profile', details: (error as Error).message },
      { status: 500 }
    )
  }
} 