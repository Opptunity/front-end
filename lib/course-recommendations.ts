import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"
import { generateId } from "@/lib/utils"
import type { Industry } from "@/lib/industry-detection"
import type { UserProfile } from "@/lib/ai-agent"
import type { RecommendedCourse } from "@/lib/types"

/**
 * Generate personalized course recommendations for a user based on their profile
 */
export async function generateCourseRecommendations(
  userProfile: UserProfile,
  count = 5, // Number of courses to recommend
): Promise<RecommendedCourse[]> {
  try {
    console.log("Generating personalized course recommendations for user profile:", userProfile)

    // Use Grok if available, otherwise fall back to OpenAI
    const model = process.env.OPENAI_API_KEY ? openai("gpt-4o") : xai("grok-2")

    const { text } = await generateText({
      model,
      prompt: `
        You are an expert career advisor with deep knowledge of the ${userProfile.industry} industry and learning resources.
        
        Create ${count} highly personalized course recommendations that would help this professional advance their career.
        The recommendations should address their improvement areas and help them build on their strengths.
        
        PROFESSIONAL PROFILE:
        - Industry: ${userProfile.industry}
        - Career Level: ${userProfile.careerLevel}
        - Specialization: ${userProfile.specialization}
        - Experience: ${userProfile.experience}
        - Summary: ${userProfile.summary}
        
        CURRENT SKILLS:
        ${userProfile.technicalSkills.map((s) => `- ${s.skill} (Level: ${s.level})`).join("\n")}
        
        STRENGTHS:
        ${userProfile.strengths.join("\n")}
        
        IMPROVEMENT AREAS:
        ${userProfile.improvementAreas.join("\n")}
        
        IMPORTANT GUIDELINES:
        1. Recommend SPECIFIC courses (not generic subjects) that address their improvement areas
        2. Include a mix of course providers (Coursera, Udemy, LinkedIn Learning, edX, etc.)
        3. Recommend courses appropriate for their current level with paths toward advancement
        4. For each course, explain why it's relevant to their specific career trajectory
        5. Include at least one course that builds on their existing strengths
        6. Include courses that are highly regarded in the ${userProfile.industry} industry
        7. Consider including industry certifications if applicable
        8. Tailor recommendations to their specialization: ${userProfile.specialization}
        
        Format your response as a valid JSON array with the following structure:
        [
          {
            "title": "Specific Course Title",
            "provider": "Course Provider (e.g., Coursera, Udemy)",
            "level": "Beginner/Intermediate/Advanced/All Levels",
            "url": "Course URL if known, otherwise null",
            "relevance": "1-2 sentences explaining why this course is relevant to their background and career goals"
          },
          ...
        ]
        
        IMPORTANT: Return ONLY the JSON array without any markdown formatting, explanation, or code blocks.
      `,
    })

    console.log("Received AI response for course recommendations")

    // Extract and parse JSON from the response
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      const jsonText = jsonMatch ? jsonMatch[0] : text

      const courses = JSON.parse(jsonText)

      if (!Array.isArray(courses)) {
        throw new Error("Invalid course recommendations format returned")
      }

      console.log(`Successfully generated ${courses.length} course recommendations`)

      return courses
    } catch (parseError) {
      console.error("Error parsing course recommendations JSON:", parseError)
      throw new Error("Failed to parse AI-generated course recommendations")
    }
  } catch (error) {
    console.error("Error generating course recommendations:", error)
    throw error
  }
}

/**
 * Generate fallback course recommendations if AI generation fails
 */
export function generateFallbackCourseRecommendations(userProfile: UserProfile): RecommendedCourse[] {
  // Get skills to create courses for
  const skills = userProfile.technicalSkills.slice(0, 3)
  const improvementAreas = userProfile.improvementAreas.slice(0, 2)
  
  const fallbackCourses: RecommendedCourse[] = []
  
  // Add courses for technical skills
  skills.forEach((skill, index) => {
    const providers = ["Coursera", "Udemy", "LinkedIn Learning", "edX", "Pluralsight"]
    const provider = providers[index % providers.length]
    
    fallbackCourses.push({
      title: `Advanced ${skill.skill} for ${userProfile.specialization} Professionals`,
      provider,
      level: getNextLevel(skill.level),
      url: generateGenericCourseUrl(skill.skill, provider),
      relevance: `Enhance your ${skill.skill} skills to advance in your ${userProfile.specialization} career. This course builds on your current ${skill.level} knowledge and teaches advanced techniques used in the ${userProfile.industry} industry.`
    })
  })
  
  // Add courses for improvement areas
  improvementAreas.forEach((area, index) => {
    const providers = ["Udemy", "edX", "Skillshare", "FreeCodeCamp", "Khan Academy"]
    const provider = providers[index % providers.length]
    
    fallbackCourses.push({
      title: `Mastering ${area} for ${userProfile.industry} Professionals`,
      provider,
      level: "All Levels",
      url: generateGenericCourseUrl(area, provider),
      relevance: `Address your improvement area in ${area} with this comprehensive course designed for ${userProfile.careerLevel} professionals in ${userProfile.industry}. This will help you overcome challenges in your current role and prepare for advancement.`
    })
  })
  
  return fallbackCourses
}

/**
 * Determine the next level for a skill
 */
function getNextLevel(currentLevel: string): string {
  switch (currentLevel) {
    case "Beginner":
      return "Intermediate"
    case "Intermediate":
      return "Advanced"
    case "Advanced":
    case "Expert":
      return "Advanced"
    default:
      return "All Levels"
  }
}

/**
 * Generate a generic course URL
 */
function generateGenericCourseUrl(skill: string, provider: string): string {
  const skillSlug = skill.toLowerCase().replace(/\s+/g, "-")

  switch (provider) {
    case "Coursera":
      return `https://www.coursera.org/courses?query=${skillSlug}`
    case "Udemy":
      return `https://www.udemy.com/courses/search/?src=ukw&q=${skillSlug}`
    case "edX":
      return `https://www.edx.org/search?q=${skillSlug}`
    case "LinkedIn Learning":
      return `https://www.linkedin.com/learning/search?keywords=${skillSlug}`
    case "Pluralsight":
      return `https://www.pluralsight.com/search?q=${skillSlug}`
    case "Codecademy":
      return `https://www.codecademy.com/search?query=${skillSlug}`
    case "Khan Academy":
      return `https://www.khanacademy.org/search?page_search_query=${skillSlug}`
    case "FreeCodeCamp":
      return `https://www.freecodecamp.org/news/search/?query=${skillSlug}`
    case "Udacity":
      return `https://www.udacity.com/courses/all?search=${skillSlug}`
    case "Skillshare":
      return `https://www.skillshare.com/search?query=${skillSlug}`
    default:
      return `https://www.google.com/search?q=${skillSlug}+course+${provider.toLowerCase()}`
  }
}

/**
 * Generate a learning path with sequenced courses for a career trajectory
 */
export async function generateLearningPath(
  userProfile: UserProfile,
  targetRole: string,
  stepsCount = 3
): Promise<LearningPathStep[]> {
  try {
    console.log(`Generating learning path for user profile to reach ${targetRole}:`, userProfile)

    // Use Grok if available, otherwise fall back to OpenAI
    const model = process.env.OPENAI_API_KEY ? openai("gpt-4o") : xai("grok-2")

    const { text } = await generateText({
      model,
      prompt: `
        You are an expert career development advisor with deep knowledge of the ${userProfile.industry} industry.
        
        Create a ${stepsCount}-step learning path that would help this professional progress from their current position to become a ${targetRole}.
        Each step should represent a milestone with specific courses and skills to acquire.
        
        PROFESSIONAL PROFILE:
        - Industry: ${userProfile.industry}
        - Current Role/Level: ${userProfile.careerLevel} ${userProfile.specialization}
        - Experience: ${userProfile.experience}
        - Target Role: ${targetRole}
        
        CURRENT SKILLS:
        ${userProfile.technicalSkills.map((s) => `- ${s.skill} (Level: ${s.level})`).join("\n")}
        
        IMPROVEMENT AREAS:
        ${userProfile.improvementAreas.join("\n")}
        
        IMPORTANT GUIDELINES:
        1. Structure the learning path as a progression from current role to target role
        2. Each step should have a clear milestone title, description, and timeline (e.g., "3 months")
        3. Include 2-3 specific courses for each step (with titles, providers, and relevance)
        4. Identify key skills to acquire at each step
        5. Make the progression logical and achievable
        6. Consider industry certifications if relevant
        7. Make recommendations specific to the ${userProfile.industry} industry
        
        Format your response as a valid JSON array with the following structure:
        [
          {
            "title": "Step 1: [Milestone Title]",
            "description": "Brief description of this career milestone",
            "timeframe": "Estimated time to complete this step (e.g., '3 months')",
            "courses": [
              {
                "title": "Specific Course Title",
                "provider": "Course Provider",
                "level": "Beginner/Intermediate/Advanced/All Levels",
                "url": "Course URL if known, otherwise null",
                "relevance": "Why this course is relevant to this step"
              }
            ],
            "skillsToAcquire": ["Skill 1", "Skill 2", "Skill 3"],
            "completionCriteria": "How to know when this step is completed"
          },
          ...
        ]
        
        IMPORTANT: Return ONLY the JSON array without any markdown formatting, explanation, or code blocks.
      `,
    })

    console.log("Received AI response for learning path")

    // Extract and parse JSON from the response
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      const jsonText = jsonMatch ? jsonMatch[0] : text

      const learningPath = JSON.parse(jsonText)

      if (!Array.isArray(learningPath)) {
        throw new Error("Invalid learning path format returned")
      }

      console.log(`Successfully generated ${learningPath.length}-step learning path`)

      return learningPath
    } catch (parseError) {
      console.error("Error parsing learning path JSON:", parseError)
      throw new Error("Failed to parse AI-generated learning path")
    }
  } catch (error) {
    console.error("Error generating learning path:", error)
    throw error
  }
}

/**
 * Define the structure of a learning path step
 */
export type LearningPathStep = {
  title: string
  description: string
  timeframe: string
  courses: RecommendedCourse[]
  skillsToAcquire: string[]
  completionCriteria: string
} 