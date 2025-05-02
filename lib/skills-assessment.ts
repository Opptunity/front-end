import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"

// Helper function to extract JSON from a string that might contain markdown code blocks
function extractJsonFromText(text: string): string {
  console.log("Raw AI response:", text.substring(0, 200) + "...") // Log the beginning of the response

  // Check if the response contains a JSON code block
  const jsonBlockRegex = /```(?:json)?\s*\n([\s\S]*?)```/
  const match = text.match(jsonBlockRegex)

  if (match && match[1]) {
    console.log("Extracted JSON from code block")
    return match[1].trim()
  }

  // If no code block, try to find JSON object directly
  const jsonObjectRegex = /\{[\s\S]*\}/
  const objectMatch = text.match(jsonObjectRegex)

  if (objectMatch) {
    console.log("Extracted JSON object directly")
    return objectMatch[0]
  }

  // If we can't extract JSON, return the original text
  console.log("Could not extract JSON, returning original text")
  return text
}

export async function assessSkills(cvText: string) {
  try {
    // Check if the text looks like raw PDF data
    if (cvText.startsWith('%PDF-') || cvText.includes('endobj') || cvText.includes('stream')) {
      console.log("Input appears to be raw PDF data rather than extracted text")
      return createFallbackAssessment("The input appears to be raw PDF data rather than extracted text. Please ensure proper text extraction before assessment.")
    }
    
    console.log("Starting skills assessment:", cvText.substring(0, 100) + "...")

    // Use OpenAI if available, otherwise fall back to Grok
    const model = process.env.OPENAI_API_KEY ? openai("gpt-4o") : xai("grok-2")

    console.log("Using model:", model.constructor.name)

    const { text } = await generateText({
      model,
      prompt: `
        You are a professional skills assessor with expertise in evaluating CVs/resumes according to industry standards. 
        Analyze the following CV text and provide a detailed assessment.
        
        CV Text:
        ${cvText}
        
        Provide a comprehensive assessment including:
        
        1. A concise summary of the candidate's background and experience
        
        2. A detailed list of technical skills with proficiency levels (Beginner, Intermediate, Advanced, Expert)
           - Base these strictly on industry standards and expectations
           - For each skill, provide a brief justification for the assigned level based on:
              * Years of experience with the skill
              * Complexity of projects mentioned
              * Depth of knowledge indicated
              * Industry certifications
              * Relative positioning compared to industry benchmarks
           - Be critical and realistic in your assessment
        
        3. Soft skills identified from the CV
        
        4. Key strengths based on experience and achievements
        
        5. Areas for potential improvement or skill gaps
        
        6. Recommended next steps for career development
        
        7. Industry analysis - identify the candidate's industry and provide insights on how their skills align with industry demands
        
        8. Career trajectory - analyze where they are in their career path and potential next roles
        
        9. Skill gap analysis - identify critical skills missing for their career progression

        10. Course recommendations - based on the candidate's skills and industry, recommend an extensive library of courses that would be most relevant to their career development
        
        Format your response as a valid JSON object with the following structure:
        {
          "summary": "...",
          "technicalSkills": [
            {
              "skill": "...", 
              "level": "...",
              "justification": "Brief explanation of why this level was assigned based on industry standards"
            }
          ],
          "softSkills": ["..."],
          "strengths": ["..."],
          "improvementAreas": ["..."],
          "recommendations": ["..."],
          "industryAnalysis": {
            "industry": "...",
            "alignment": "...",
            "trends": ["..."],
            "keyInsights": ["..."]
          },
          "careerTrajectory": {
            "currentLevel": "...",
            "potentialRoles": ["..."],
            "timeToNextLevel": "...",
            "developmentAreas": ["..."]
          },
          "skillGapAnalysis": {
            "criticalGaps": ["..."],
            "importantGaps": ["..."],
            "learningResources": ["..."]
          },
          "recommendedCourses": [
            {
              "title": "...",
              "provider": "...",
              "level": "...",
              "url": "...",
              "relevance": "Why this course is recommended based on the CV"
            }
          ]
        }
        
        IMPORTANT: Return ONLY the JSON object without any markdown formatting, explanation, or code blocks.
      `,
    })

    console.log("Received response from AI")

    // Extract JSON from the response
    const jsonText = extractJsonFromText(text)

    // Parse the JSON response
    try {
      const result = JSON.parse(jsonText)
      console.log("Successfully parsed JSON response")

      // Validate the structure of the parsed JSON
      if (!result.summary || !Array.isArray(result.technicalSkills)) {
        console.error("Invalid JSON structure:", result)
        throw new Error("AI returned invalid JSON structure")
      }

      return result
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError)
      console.error("JSON text that failed to parse:", jsonText)

      // Create a fallback response
      return createFallbackAssessment(cvText)
    }
  } catch (error) {
    console.error("Error assessing skills:", error)
    return createFallbackAssessment(cvText)
  }
}

// Create a fallback assessment when AI or parsing fails
function createFallbackAssessment(cvText: string) {
  console.log("Creating fallback assessment")

  // Extract some basic information from the CV text
  const words = cvText.split(/\s+/)
  const wordCount = words.length

  // Create a simple summary based on word count
  let summary = "We were unable to generate a detailed assessment from your CV."
  if (wordCount < 100) {
    summary += " The provided CV text appears to be very short. Please provide more details for a better assessment."
  } else {
    summary += " Please try again or provide more structured information about your skills and experience."
  }

  // Return a basic assessment
  return {
    summary,
    technicalSkills: [
      {
        skill: "Not detected",
        level: "Unknown",
        justification: "Unable to determine skill level from the provided information.",
      },
    ],
    softSkills: ["Not detected from provided CV"],
    strengths: ["Unable to determine from provided CV"],
    improvementAreas: ["Consider providing a more detailed CV for better assessment"],
    recommendations: [
      "Ensure your CV includes detailed work experience",
      "List specific technical skills and proficiency levels",
      "Include projects and achievements",
      "Highlight soft skills and personal strengths",
    ],
    industryAnalysis: {
      industry: "Unknown",
      alignment: "Unable to determine",
      trends: ["Unable to determine from provided CV"],
      keyInsights: ["Please provide more information for industry analysis"],
    },
    careerTrajectory: {
      currentLevel: "Unknown",
      potentialRoles: ["Unable to determine from provided CV"],
      timeToNextLevel: "Unknown",
      developmentAreas: ["Please provide more detailed experience information"],
    },
    skillGapAnalysis: {
      criticalGaps: ["Unable to determine from provided CV"],
      importantGaps: ["Unable to determine from provided CV"],
      learningResources: ["Please provide more information about your skills and experience"],
    },
    recommendedCourses: [
      {
        title: "Not detected",
        provider: "Unknown",
        level: "Unknown",
        url: "Unknown",
        relevance: "Unable to determine relevance based on the provided CV",
      },
    ],
  }
}
