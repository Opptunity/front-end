import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const employeeData = await request.json()
    console.log('Creating employee with data:', employeeData)

    const { 
      name, 
      email, 
      position, 
      department, 
      startDate, 
      phone, 
      location, 
      assessment 
    } = employeeData

    // Parse name into first and last name
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Create engineer record (let database auto-generate the ID)
    const { data: engineerData, error: engineerError } = await supabase
      .from('ingenieurs')
      .upsert({
        email: email,
        prenom: firstName,
        nom: lastName,
        job_title: position,
        department: department,
        hire_date: startDate,
        phone: phone,
        location: location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single()

    if (engineerError) {
      console.error('Error creating engineer:', engineerError)
      throw new Error(`Failed to create engineer: ${engineerError.message}`)
    }

    console.log('Engineer created:', engineerData)

    // Save the assessment if provided
    if (assessment) {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('user_assessments')
        .upsert({
          user_email: email,
          summary: assessment.summary,
          technical_skills: assessment.technicalSkills,
          soft_skills: assessment.softSkills,
          strengths: assessment.strengths,
          improvement_areas: assessment.improvementAreas,
          recommendations: assessment.recommendations,
          industry_analysis: assessment.industryAnalysis,
          career_trajectory: assessment.careerTrajectory,
          skill_gap_analysis: assessment.skillGapAnalysis,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_email'
        })
        .select()
        .single()

      if (assessmentError) {
        console.warn('Error saving assessment:', assessmentError)
        // Don't fail the employee creation if assessment save fails
      } else {
        console.log('Assessment saved:', assessmentData)
      }
    }

    // Return the created employee data
    const createdEmployee = {
      id: engineerData.ingenieur_id || engineerData.id || email,
      name: `${firstName} ${lastName}`.trim(),
      email: email,
      position: position,
      department: department,
      startDate: startDate,
      phone: phone,
      location: location,
      assessment: assessment
    }

    return NextResponse.json({
      success: true,
      employee: createdEmployee
    })

  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create employee', 
        details: error.message 
      },
      { status: 500 }
    )
  }
} 