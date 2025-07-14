import { type LearningPathStep, type UserProfile, type PathwayCommonalities } from "@/lib/learning-pathway-types"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"

/**
 * Generate a learning pathway prompt for a selected role
 * 
 * This function creates a prompt for generating a custom learning pathway 
 * for a user based on their profile and a specific career role they've selected.
 */
export function createLearningPathwayPrompt(
  userProfile: UserProfile,
  selectedRole: string,
  stepsCount: number = 3
): string {
  return `
    You are an expert career development advisor with deep knowledge of the ${userProfile.industry} industry.
    
    Create a detailed ${stepsCount}-step learning pathway that would help this professional progress from their current position to become a ${selectedRole}.
    Each step should represent a career milestone with specific courses, skills, and projects to complete.
    
    PROFESSIONAL PROFILE:
    - Industry: ${userProfile.industry}
    - Current Role/Level: ${userProfile.careerLevel} ${userProfile.specialization}
    - Experience: ${userProfile.experience} years
    - Target Role: ${selectedRole}
    
    CURRENT SKILLS:
    ${userProfile.technicalSkills.map((s) => `- ${s.skill} (Level: ${s.level})`).join("\n")}
    
    STRENGTHS:
    ${userProfile.strengths.join("\n")}
    
    IMPROVEMENT AREAS:
    ${userProfile.improvementAreas.join("\n")}
    
    IMPORTANT GUIDELINES:
    1. Structure the learning pathway as a logical progression from current role to target role (${selectedRole})
    2. Each step must have:
       - A clear milestone title and description
       - Realistic timeframe (e.g., "3-6 months")
       - 2-3 specific courses with providers and relevance explanations
       - Key skills to acquire at each stage
       - 1-2 practical projects to demonstrate competency
       - Industry certifications where relevant
    3. Make recommendations highly specific to the ${userProfile.industry} industry
    4. Include both technical and soft skills needed for the ${selectedRole} role
    5. Consider current industry trends and future skill requirements
    6. Highlight any mentorship or networking opportunities that would accelerate progress
    
    Format your response as a valid JSON array with the following structure:
    [
      {
        "title": "Step 1: [Milestone Title]",
        "description": "Detailed description of this career milestone and its importance",
        "timeframe": "Estimated time to complete this step (e.g., '3-6 months')",
        "courses": [
          {
            "title": "Specific Course Title",
            "provider": "Course Provider",
            "level": "Beginner/Intermediate/Advanced/All Levels",
            "url": "Course URL if known, otherwise null",
            "relevance": "Why this course is relevant to this step and the target role"
          }
        ],
        "skillsToAcquire": ["Skill 1", "Skill 2", "Skill 3"],
        "projects": [
          {
            "title": "Project Title",
            "description": "Brief description of what to build/create",
            "learningOutcomes": ["What you'll learn from this project"]
          }
        ],
        "certifications": [
          {
            "name": "Certification Name",
            "provider": "Certification Provider",
            "difficulty": "Beginner/Intermediate/Advanced",
            "relevance": "Why this certification is valuable"
          }
        ],
        "completionCriteria": "How to know when this step is completed and you're ready to move to the next step"
      },
      ...
    ]
    
    IMPORTANT: Return ONLY the JSON array without any markdown formatting, explanation, or code blocks.
  `
}

/**
 * Generate a personalized learning pathway for a specific role
 * 
 * This function takes a user profile and their selected career role to generate
 * a customized step-by-step learning pathway to help them achieve that career goal.
 */
export async function generateRoleSpecificLearningPathway(
  userProfile: UserProfile,
  selectedRole: string,
  stepsCount: number = 3
): Promise<LearningPathStep[]> {
  try {
    console.log(`Generating learning pathway for ${selectedRole} role based on user profile:`, userProfile)

    // Use OpenAI if available, otherwise fall back to Grok
    const model = process.env.OPENAI_API_KEY ? openai("gpt-4o") : xai("grok-2")

    // Generate the text using the prompt
    const { text } = await generateText({
      model,
      prompt: createLearningPathwayPrompt(userProfile, selectedRole, stepsCount),
    })

    console.log("Received learning pathway response from AI")

    // Parse the JSON response
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      const jsonText = jsonMatch ? jsonMatch[0] : text

      const learningPathway = JSON.parse(jsonText)

      if (!Array.isArray(learningPathway)) {
        throw new Error("Invalid learning pathway format returned")
      }

      console.log(`Successfully generated ${learningPathway.length}-step learning pathway for ${selectedRole}`)

      return learningPathway
    } catch (parseError) {
      console.error("Error parsing learning pathway JSON:", parseError)
      throw new Error("Failed to parse AI-generated learning pathway")
    }
  } catch (error) {
    console.error(`Error generating learning pathway for ${selectedRole}:`, error)
    throw error
  }
}

/**
 * Generate learning pathways for multiple potential roles
 * 
 * This function generates learning pathways for each of the potential roles
 * a user might be interested in pursuing.
 */
export async function generateMultiRoleLearningPathways(
  userProfile: UserProfile,
  potentialRoles: string[],
  stepsCount: number = 3
): Promise<Record<string, LearningPathStep[]>> {
  const pathwaysByRole: Record<string, LearningPathStep[]> = {}
  
  // Create a learning pathway for each role
  for (const role of potentialRoles) {
    try {
      const pathway = await generateRoleSpecificLearningPathway(userProfile, role, stepsCount)
      pathwaysByRole[role] = pathway
    } catch (error) {
      console.error(`Error generating pathway for ${role}:`, error)
      // Continue with other roles even if one fails
    }
  }
  
  return pathwaysByRole
}

/**
 * Compare learning pathways across multiple roles
 * 
 * This function identifies common skills, courses, and certifications across different
 * career paths to help users find the most valuable learning investments.
 */
export function comparePathways(
  pathwaysByRole: Record<string, LearningPathStep[]>
): {
  commonSkills: string[],
  commonCourses: string[],
  commonCertifications: string[]
} {
  const allSkills: Set<string> = new Set()
  const skillCounts: Record<string, number> = {}
  
  const allCourses: Set<string> = new Set()
  const courseCounts: Record<string, number> = {}
  
  const allCertifications: Set<string> = new Set()
  const certificationCounts: Record<string, number> = {}
  
  // Count occurrences of skills, courses, and certifications across all pathways
  Object.values(pathwaysByRole).forEach(pathway => {
    pathway.forEach(step => {
      // Count skills
      step.skillsToAcquire?.forEach(skill => {
        allSkills.add(skill)
        skillCounts[skill] = (skillCounts[skill] || 0) + 1
      })
      
      // Count courses
      step.courses?.forEach(course => {
        allCourses.add(course.title)
        courseCounts[course.title] = (courseCounts[course.title] || 0) + 1
      })
      
      // Count certifications
      step.certifications?.forEach(cert => {
        allCertifications.add(cert.name)
        certificationCounts[cert.name] = (certificationCounts[cert.name] || 0) + 1
      })
    })
  })
  
  const roleCount = Object.keys(pathwaysByRole).length
  const commonThreshold = Math.max(2, Math.floor(roleCount * 0.5)) // At least 50% of roles
  
  // Find common elements that appear in multiple pathways
  return {
    commonSkills: Array.from(allSkills).filter(skill => skillCounts[skill] >= commonThreshold),
    commonCourses: Array.from(allCourses).filter(course => courseCounts[course] >= commonThreshold),
    commonCertifications: Array.from(allCertifications).filter(cert => certificationCounts[cert] >= commonThreshold)
  }
} 