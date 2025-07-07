import { type NextRequest, NextResponse } from "next/server"
import { assessmentStorage } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { fetchExpertDataForSkill, generateExpertQuestion } from "@/lib/api-service"
import { generateId } from "@/lib/utils"
import { detectIndustry } from "@/lib/industry-detection"
import {
  buildUserProfile,
  generatePersonalizedQuestions,
  generateFallbackPersonalizedQuestions,
  type PersonalizedQuestion,
} from "@/lib/ai-agent"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = (await params).id
    console.log("Test generation requested for ID:", id)
    console.log("Store status:", assessmentStorage.debug())

    let storedData = assessmentStorage.get(id)
    let assessment = null

    // If not found in memory, check Supabase
    if (!storedData || !storedData.assessment) {
      console.log("Assessment not found in memory, checking Supabase...")
      
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('Assessments')
        .select('id, cvText, assessmentData')
        .eq('id', id)
        .single();

      if (supabaseError) {
        console.log("Supabase error:", supabaseError)
        return NextResponse.json(
          {
            error: "Assessment not found in memory or database",
            success: false,
          },
          { status: 404 },
        )
      }

      if (supabaseData && supabaseData.assessmentData) {
        console.log("Found assessment in Supabase, using that data")
        assessment = supabaseData.assessmentData
        
        // Optionally store in memory for future requests
        assessmentStorage.set(id, {
          text: supabaseData.cvText || '',
          assessment: supabaseData.assessmentData
        })
      } else {
        console.log("Assessment data not found in Supabase")
        return NextResponse.json(
          {
            error: "Assessment not found or incomplete",
            success: false,
          },
          { status: 404 },
        )
      }
    } else {
      assessment = storedData.assessment
    }

    // Extract technical skills from the assessment
    const technicalSkills = assessment.technicalSkills || []

    if (technicalSkills.length === 0) {
      return NextResponse.json(
        {
          error: "No technical skills found in the assessment to generate questions",
          success: false,
        },
        { status: 400 },
      )
    }

    // Detect the user's industry based on their skills
    const skillNames = technicalSkills.map((skill: { skill: string }) => skill.skill)
    const industry = detectIndustry(skillNames)

    console.log(`Detected industry: ${industry}`)

    // Build a comprehensive user profile
    const userProfile = buildUserProfile(assessment, industry)
    console.log("Built user profile:", userProfile)

    // Generate personalized questions using the AI agent
    let personalizedQuestions: PersonalizedQuestion[] = []
    try {
      console.log("Generating AI personalized questions...")
      personalizedQuestions = await generatePersonalizedQuestions(userProfile, 15) // Increased from 5 to 15
      console.log(`Generated ${personalizedQuestions.length} AI personalized questions`)
    } catch (aiError) {
      console.error("Error generating AI personalized questions:", aiError)
      console.log("Falling back to template-based personalized questions")
      personalizedQuestions = generateFallbackPersonalizedQuestions(userProfile, 15) // Increased from 5 to 15
    }

    // As a backup, also fetch expert data and generate some expert-backed questions
    console.log(`Generating expert-backed questions for ${technicalSkills.length} skills`)
    const expertDataPromises = technicalSkills.slice(0, 5).map(async (skill: { skill: string; level: string }) => {
      // Increased from 3 to 5
      return {
        skill: skill.skill,
        level: skill.level,
        expertData: await fetchExpertDataForSkill(skill.skill, industry),
      }
    })

    // Wait for all expert data to be fetched
    const skillsWithExpertData = await Promise.all(expertDataPromises)

    // Generate expert-backed questions for each skill
    const expertQuestions = skillsWithExpertData.map((skillData) => {
      return {
        ...generateExpertQuestion(skillData.skill, skillData.level, skillData.expertData, industry),
        category: "expert",
        specificTopic: skillData.skill
      }
    })

    console.log(`Generated ${expertQuestions.length} expert-backed questions for ${industry} industry`)

    // Combine personalized and expert questions, prioritizing personalized ones
    const allQuestions = [...personalizedQuestions]

    // Add expert questions only if we need more to reach a total of 20
    if (allQuestions.length < 20) {
      allQuestions.push(...expertQuestions.slice(0, 20 - allQuestions.length))
    }

    // Ensure each question has a unique ID
    const questionsWithIds = allQuestions.map((q) => ({
      ...q,
      id: q.id || `q-${generateId()}`,
    }))

    return NextResponse.json({
      success: true,
      questions: questionsWithIds,
      industry: industry,
      userProfile: userProfile,
    })
  } catch (error) {
    console.error("Test generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate test questions",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
