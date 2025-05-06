import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"
import type { UserProfile } from "@/lib/ai-agent"

/**
 * CV improvement suggestion type definition
 */
export type CVImprovement = {
  category: string
  title: string
  description: string
  suggestedChanges: string[]
  impact: string
  example?: string
}

/**
 * Create a prompt for generating CV improvement suggestions
 */
export function createCVImprovementPrompt(cvText: string, userProfile?: UserProfile): string {
  return `
    You are an expert career coach and CV consultant with deep knowledge of modern resume standards and best practices.
    
    Analyze the following CV/resume and provide detailed, actionable suggestions for improvement. Focus on helping
    the candidate present their qualifications more effectively and stand out to potential employers.
    
    CV/RESUME TEXT:
    ${cvText}
    
    ${userProfile ? `
    ADDITIONAL PROFILE INFORMATION:
    - Industry: ${userProfile.industry}
    - Current Role/Level: ${userProfile.careerLevel} ${userProfile.specialization}
    - Experience: ${userProfile.experience}
    ` : ''}
    
    IMPORTANT GUIDELINES:
    1. Analyze the CV for structural, content, and formatting issues
    2. Provide specific, actionable recommendations organized into categories
    3. For each suggestion, explain WHY it matters and HOW it will improve the CV
    4. Include examples where helpful
    5. Focus on both correcting weaknesses and enhancing strengths
    6. Consider industry-specific best practices and current hiring trends
    7. Identify any missing sections or information that should be added
    8. Suggest improvements for clarity, impact, and keyword optimization
    
    Format your response as a valid JSON array with the following structure:
    [
      {
        "category": "Structure & Organization",
        "title": "Brief title of the improvement",
        "description": "Detailed explanation of the issue or area for improvement",
        "suggestedChanges": [
          "Specific, actionable step to address the issue",
          "Another specific step if applicable"
        ],
        "impact": "How this change will improve the effectiveness of the CV",
        "example": "Before/after example or specific wording suggestion if applicable"
      },
      ...
    ]
    
    CATEGORIES TO CONSIDER:
    - Structure & Organization
    - Content & Achievements
    - Language & Phrasing
    - Skills Presentation
    - Education & Certifications
    - Visual Format & Readability
    - ATS Optimization
    - Professional Branding
    
    IMPORTANT: Return ONLY the JSON array without any markdown formatting, explanation, or code blocks.
  `
}

/**
 * Generate CV improvement suggestions
 */
export async function generateCVImprovements(
  cvText: string,
  userProfile?: UserProfile
): Promise<CVImprovement[]> {
  try {
    console.log("Generating CV improvement suggestions")

    // Use OpenAI if available, otherwise fall back to Grok
    const model = process.env.OPENAI_API_KEY ? openai("gpt-4o") : xai("grok-2")

    // Generate the text using the prompt
    const { text } = await generateText({
      model,
      prompt: createCVImprovementPrompt(cvText, userProfile),
    })

    console.log("Received CV improvement suggestions from AI")

    // Parse the JSON response
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      const jsonText = jsonMatch ? jsonMatch[0] : text

      const improvements = JSON.parse(jsonText)

      if (!Array.isArray(improvements)) {
        throw new Error("Invalid CV improvement format returned")
      }

      console.log(`Successfully generated ${improvements.length} CV improvement suggestions`)

      return improvements
    } catch (parseError) {
      console.error("Error parsing CV improvement JSON:", parseError)
      throw new Error("Failed to parse AI-generated CV improvements")
    }
  } catch (error) {
    console.error("Error generating CV improvements:", error)
    throw error
  }
}

/**
 * Generate fallback CV improvement suggestions
 */
export function generateFallbackCVImprovements(): CVImprovement[] {
  return [
    {
      category: "Structure & Organization",
      title: "Enhance Resume Summary/Profile",
      description: "Your resume summary should quickly capture attention and highlight your most relevant qualifications.",
      suggestedChanges: [
        "Create a concise 2-3 sentence summary that highlights your years of experience, key skills, and unique value proposition",
        "Tailor your summary to specifically address the requirements of your target position/industry"
      ],
      impact: "A strong summary immediately communicates your value to employers and encourages them to read further.",
      example: "Example: 'Results-driven marketing professional with 5+ years of experience in digital campaign management. Proven track record of increasing conversion rates by an average of 25% through data-driven strategies. Skilled in SEO, content creation, and marketing analytics.'"
    },
    {
      category: "Content & Achievements",
      title: "Quantify Your Achievements",
      description: "Your work experience should focus on achievements rather than just responsibilities.",
      suggestedChanges: [
        "Add specific metrics, percentages, and numbers to quantify your impact",
        "Use action verbs at the beginning of each bullet point"
      ],
      impact: "Quantified achievements provide tangible evidence of your capabilities and make your contributions more impactful.",
      example: "Instead of 'Managed social media accounts', try 'Increased social media engagement by 40% in 6 months by implementing a strategic content calendar and targeted ad campaigns, growing follower base from 5,000 to 12,000'"
    },
    {
      category: "Skills Presentation",
      title: "Optimize Skills Section",
      description: "Your skills section should be clearly organized and tailored to your target role.",
      suggestedChanges: [
        "Group skills by category (technical, soft, industry-specific)",
        "Ensure the most relevant skills for your target role appear first"
      ],
      impact: "A well-organized skills section helps recruiters quickly identify your qualifications and improves ATS matching.",
      example: "Consider using a format like: Technical: HTML/CSS, JavaScript, Python | Software: Adobe Creative Suite, Microsoft Office | Soft Skills: Team Leadership, Project Management, Communication"
    }
  ]
} 