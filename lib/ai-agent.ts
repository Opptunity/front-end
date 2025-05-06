import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"
import { generateId } from "@/lib/utils"
import type { Industry } from "@/lib/industry-detection"

// Define the structure of the user profile
export type UserProfile = {
  summary: string
  technicalSkills: Array<{ skill: string; level: string }>
  softSkills: string[]
  strengths: string[]
  improvementAreas: string[]
  industry: Industry
  experience: string // e.g., "5+ years in marketing with focus on digital campaigns"
  careerLevel: string // e.g., "Senior", "Mid-level", "Entry-level"
  specialization: string // e.g., "Frontend Development", "Content Marketing", "Financial Analysis"
  cvText: string
}

// Define the structure of a personalized question
export type PersonalizedQuestion = {
  id: string
  text: string
  options: string[]
  correctAnswer: string
  skill: string
  difficulty: string
  explanation: string
  source: string
  context?: string // Specific context related to the user's background
  category: string // Added to categorize questions (e.g., "technical", "methodology", "best practices")
  specificTopic: string // Added to identify the specific topic within a skill
}

/**
 * Generate a comprehensive user profile from assessment data
 */
export function buildUserProfile(assessment: any, industry: Industry): UserProfile {
  // Validate the industry parameter
  const validIndustries = [
    'technology', 'marketing', 'finance', 'healthcare', 'design', 
    'hr', 'sales', 'education', 'legal', 'manufacturing', 'other'
  ];
  
  // Ensure industry is valid or default to 'other'
  const validatedIndustry = (!industry || !validIndustries.includes(industry)) 
    ? 'other' as Industry 
    : industry;
  
  if (industry !== validatedIndustry) {
    console.warn(`Invalid industry "${industry}" provided, defaulting to "other"`);
  }

  // Extract career level from summary or skills
  const careerLevel = extractCareerLevel(assessment.summary, assessment.technicalSkills)

  // Extract specialization from skills and summary
  const specialization = extractSpecialization(assessment.technicalSkills, assessment.summary, validatedIndustry)

  // Extract years of experience
  const experience = extractExperience(assessment.summary)

  return {
    summary: assessment.summary,
    technicalSkills: assessment.technicalSkills,
    softSkills: assessment.softSkills,
    strengths: assessment.strengths,
    improvementAreas: assessment.improvementAreas,
    industry: validatedIndustry,
    experience,
    careerLevel,
    specialization,
    cvText: assessment.cvText,
  }
}

/**
 * Extract career level from assessment data
 */
function extractCareerLevel(summary: string, skills: Array<{ skill: string; level: string }>): string {
  // Check for explicit mentions in the summary
  const summaryLower = summary.toLowerCase()

  if (
    summaryLower.includes("senior") ||
    summaryLower.includes("lead") ||
    summaryLower.includes("head") ||
    summaryLower.includes("director") ||
    summaryLower.includes("manager") ||
    summaryLower.includes("principal")
  ) {
    return "Senior"
  }

  if (
    summaryLower.includes("junior") ||
    summaryLower.includes("entry") ||
    summaryLower.includes("intern") ||
    summaryLower.includes("graduate") ||
    summaryLower.includes("trainee")
  ) {
    return "Entry-level"
  }

  // Check skill levels
  const advancedSkillsCount = skills.filter((s) => s.level === "Advanced" || s.level === "Expert").length

  const beginnerSkillsCount = skills.filter((s) => s.level === "Beginner" || s.level === "Intermediate").length

  if (advancedSkillsCount > beginnerSkillsCount) {
    return "Senior"
  } else if (advancedSkillsCount < beginnerSkillsCount) {
    return "Entry-level"
  }

  return "Mid-level" // Default
}

/**
 * Extract specialization from skills and summary
 */
function extractSpecialization(
  skills: Array<{ skill: string; level: string }>,
  summary: string,
  industry: Industry,
): string {
  // Group skills by domain within the industry
  const domains: Record<string, number> = {}

  // Industry-specific domains
  const industryDomains: Record<Industry, string[]> = {
    technology: ["frontend", "backend", "fullstack", "devops", "data science", "mobile", "security", "cloud"],
    marketing: ["content", "digital", "seo", "social media", "email", "brand", "analytics", "growth"],
    finance: ["accounting", "investment", "banking", "financial analysis", "risk", "trading", "compliance"],
    healthcare: ["clinical", "research", "administration", "patient care", "public health", "medical records"],
    design: ["ui", "ux", "graphic", "product", "web", "industrial", "motion", "brand"],
    hr: ["recruitment", "training", "compensation", "employee relations", "hr operations", "talent management"],
    sales: ["account management", "business development", "inside sales", "outside sales", "sales operations"],
    education: ["teaching", "curriculum", "administration", "e-learning", "assessment", "student services"],
    legal: ["corporate", "litigation", "intellectual property", "compliance", "contracts", "regulatory"],
    manufacturing: ["production", "quality", "supply chain", "operations", "maintenance", "process improvement"],
    other: ["general", "administration", "management", "consulting", "research", "operations"],
  }

  // Validate industry to avoid errors
  if (!industry || !industryDomains[industry]) {
    console.warn(`Invalid industry: ${industry}, defaulting to "other"`);
    industry = "other" as Industry;
  }

  // Check each skill against domains for this industry
  for (const { skill } of skills) {
    const skillLower = skill.toLowerCase()

    for (const domain of industryDomains[industry]) {
      if (skillLower.includes(domain) || domain.includes(skillLower)) {
        domains[domain] = (domains[domain] || 0) + 1
      }
    }
  }

  // Find the most common domain
  let topDomain = ""
  let topCount = 0

  for (const [domain, count] of Object.entries(domains)) {
    if (count > topCount) {
      topCount = count
      topDomain = domain
    }
  }

  // If no clear domain found, extract from summary
  if (!topDomain) {
    const summaryLower = summary.toLowerCase()
    for (const domain of industryDomains[industry]) {
      if (summaryLower.includes(domain)) {
        topDomain = domain
        break
      }
    }
  }

  // Format the specialization
  if (topDomain) {
    // Capitalize first letter of each word
    const formattedDomain = topDomain
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    return `${formattedDomain} ${industry.charAt(0).toUpperCase() + industry.slice(1)}`
  }

  return `${industry.charAt(0).toUpperCase() + industry.slice(1)} Professional` // Default
}

/**
 * Extract years of experience from summary
 */
function extractExperience(summary: string): string {
  const summaryLower = summary.toLowerCase()

  // Look for patterns like "X years of experience"
  const yearPatterns = [
    /(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*years? of experience/i,
    /experience of\s*(\d+)\+?\s*years?/i,
    /over\s*(\d+)\s*years?/i,
    /more than\s*(\d+)\s*years?/i,
  ]

  for (const pattern of yearPatterns) {
    const match = summaryLower.match(pattern)
    if (match && match[1]) {
      const years = Number.parseInt(match[1])
      if (years > 0) {
        return `${years}+ years of experience`
      }
    }
  }

  // If no specific years mentioned, make an educated guess
  if (
    summaryLower.includes("senior") ||
    summaryLower.includes("lead") ||
    summaryLower.includes("extensive") ||
    summaryLower.includes("seasoned")
  ) {
    return "Extensive experience"
  }

  if (
    summaryLower.includes("junior") ||
    summaryLower.includes("entry") ||
    summaryLower.includes("recent graduate") ||
    summaryLower.includes("new to")
  ) {
    return "Early career"
  }

  return "Professional experience" // Default
}

/**
 * Generate personalized questions using AI based on user profile
 */
export async function generatePersonalizedQuestions(
  userProfile: UserProfile,
  count = 15, // Increased from 5 to 15
): Promise<PersonalizedQuestion[]> {
  try {
    console.log("Generating personalized questions for user profile:", userProfile)

    // Use Grok if available, otherwise fall back to OpenAI
    const model = process.env.OPENAI_API_KEY ? openai("gpt-4o") : xai("grok-2")

    const { text } = await generateText({
      model,
      prompt: `
        You are an expert skills assessor with deep knowledge of the ${userProfile.industry} industry.
        
        Create ${count} highly personalized multiple-choice questions that precisely match this candidate's background.
        The questions must be specific, detailed, and test real-world knowledge rather than general concepts.
        
        CANDIDATE PROFILE:
        - Industry: ${userProfile.industry}
        - Career Level: ${userProfile.careerLevel}
        - Specialization: ${userProfile.specialization}
        - Experience: ${userProfile.experience}
        - Summary: ${userProfile.summary}
        
        SKILLS TO TEST:
        ${userProfile.technicalSkills.map((s) => `- ${s.skill} (Level: ${s.level})`).join("\n")}
        
        STRENGTHS:
        ${userProfile.strengths.join("\n")}
        
        IMPROVEMENT AREAS:
        ${userProfile.improvementAreas.join("\n")}
        
        IMPORTANT GUIDELINES:
        1. Create questions that would be asked in a REAL ${userProfile.industry} job interview for someone at the ${userProfile.careerLevel} level
        2. Questions should test PRACTICAL application of skills, not just theoretical knowledge
        3. Include scenario-based questions that reflect real-world situations in ${userProfile.specialization}
        4. Tailor difficulty to match the candidate's experience level
        5. Reference specific tools, methodologies, or frameworks mentioned in their skills
        6. Include questions that address both strengths and improvement areas
        7. For each question, provide a detailed explanation that cites industry best practices
        8. Make sure the questions feel like they were SPECIFICALLY CREATED for this candidate's unique background
        9. AVOID REDUNDANCY - ensure each question tests a different aspect of a skill or different skills entirely
        10. Categorize each question (technical, methodology, best practices, etc.)
        11. Identify a specific topic within the skill for each question
        12. Ensure questions are highly specific rather than general
        
        Format your response as a valid JSON array with the following structure:
        [
          {
            "id": "unique-id-1",
            "text": "Specific, detailed question text that references a real-world scenario relevant to the candidate's background",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option that is correct",
            "skill": "The specific skill being tested",
            "difficulty": "Difficulty level matching their skill level",
            "explanation": "Detailed explanation with industry best practices",
            "source": "Industry standard or expert consensus",
            "context": "How this question relates to the candidate's specific background",
            "category": "Category of question (technical, methodology, best practices, etc.)",
            "specificTopic": "The specific topic within the skill being tested"
          },
          ...
        ]
        
        IMPORTANT: Return ONLY the JSON array without any markdown formatting, explanation, or code blocks.
      `,
    })

    console.log("Received AI response for personalized questions")

    // Extract and parse JSON from the response
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      const jsonText = jsonMatch ? jsonMatch[0] : text

      const questions = JSON.parse(jsonText)

      if (!Array.isArray(questions)) {
        throw new Error("Invalid questions format returned")
      }

      console.log(`Successfully generated ${questions.length} personalized questions`)

      // Ensure each question has a unique ID
      const questionsWithIds = questions.map((q) => ({
        ...q,
        id: q.id || `pq-${generateId()}`,
      }))

      // Remove any redundant questions by checking for similar text or topics
      const uniqueQuestions = removeDuplicateQuestions(questionsWithIds)

      console.log(`After removing duplicates, ${uniqueQuestions.length} questions remain`)

      return uniqueQuestions
    } catch (parseError) {
      console.error("Error parsing personalized questions JSON:", parseError)
      throw new Error("Failed to parse AI-generated questions")
    }
  } catch (error) {
    console.error("Error generating personalized questions:", error)
    throw error
  }
}

/**
 * Remove duplicate or very similar questions from the array
 */
function removeDuplicateQuestions(questions: PersonalizedQuestion[]): PersonalizedQuestion[] {
  const uniqueQuestions: PersonalizedQuestion[] = []
  const seenTopics = new Set<string>()
  const seenSkills = new Map<string, number>() // Track how many questions we have for each skill

  for (const question of questions) {
    // Create a unique signature for this question based on skill and specific topic
    const signature = `${question.skill.toLowerCase()}-${question.specificTopic.toLowerCase()}`

    // Skip if we've already seen this exact topic
    if (seenTopics.has(signature)) {
      continue
    }

    // Track how many questions we have for this skill
    const skillCount = seenSkills.get(question.skill.toLowerCase()) || 0

    // Limit questions per skill to ensure diversity (adjust the number as needed)
    if (skillCount >= 3) {
      continue
    }

    // Add this question to our unique list
    uniqueQuestions.push(question)
    seenTopics.add(signature)
    seenSkills.set(question.skill.toLowerCase(), skillCount + 1)
  }

  return uniqueQuestions
}

/**
 * Generate fallback personalized questions if AI generation fails
 */
export function generateFallbackPersonalizedQuestions(userProfile: UserProfile, count = 15): PersonalizedQuestion[] {
  const questions: PersonalizedQuestion[] = []

  // Get skills to create questions for
  const skills = userProfile.technicalSkills.slice(0, count)

  // Create a personalized question for each skill
  for (const { skill, level } of skills) {
    questions.push({
      id: `fallback-${generateId()}`,
      text: `In your role as a ${userProfile.careerLevel} ${userProfile.specialization}, how would you apply ${skill} to solve a complex problem?`,
      options: [
        `Apply industry best practices and methodologies specific to ${userProfile.industry}`,
        "Use the newest techniques regardless of established standards",
        "Delegate the task to more specialized team members",
        "Rely on basic approaches that minimize complexity",
      ],
      correctAnswer: `Apply industry best practices and methodologies specific to ${userProfile.industry}`,
      skill,
      difficulty: level,
      explanation: `For a ${userProfile.careerLevel} professional in ${userProfile.specialization}, applying established industry best practices when using ${skill} ensures reliable and effective outcomes while demonstrating expertise expected at your experience level.`,
      source: `${userProfile.industry.charAt(0).toUpperCase() + userProfile.industry.slice(1)} industry standards`,
      context: `This question is tailored to your background in ${userProfile.specialization} and tests your practical application of ${skill} in real-world scenarios you would encounter at the ${userProfile.careerLevel} level.`,
      category: "best practices",
      specificTopic: `${skill} implementation`,
    })
  }

  return questions
}
