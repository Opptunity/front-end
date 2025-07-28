import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"
import { getApiUrl } from "@/utils/api-client"

// Add a request cache to prevent duplicate API calls
const assessmentCache = new Map();

// Cache cleanup - limit cache size to prevent memory issues
const MAX_CACHE_SIZE = 100;

function cleanupCache() {
  if (assessmentCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entries (first 20% of cache)
    const entriesToRemove = Math.floor(MAX_CACHE_SIZE * 0.2);
    const keysToRemove = Array.from(assessmentCache.keys()).slice(0, entriesToRemove);
    keysToRemove.forEach(key => assessmentCache.delete(key));
    console.log(`Cache cleanup: removed ${entriesToRemove} entries`);
  }
}

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

export async function assessSkills(cvText: string, userId?: string) {
  try {
    // Generate a more unique cache key using a hash of the entire CV text plus userId
    const crypto = require('crypto');
    const fullContentHash = crypto.createHash('md5').update(cvText + (userId || '')).digest('hex');
    const cacheKey = fullContentHash;
    
    // Check if we already have a cached result for this text
    if (assessmentCache.has(cacheKey)) {
      console.log("Using cached assessment result for key:", cacheKey.substring(0, 8));
      return assessmentCache.get(cacheKey);
    }
    
    // Check if the text looks like raw PDF data
    const isProbablyRawPdf = (
      cvText.startsWith('%PDF-') ||
      (
        cvText.length < 500 && // suspiciously short
        /[\x00-\x08\x0E-\x1F]/.test(cvText) // contains lots of control chars
      )
    );

    if (isProbablyRawPdf) {
      console.log("Input appears to be raw PDF data rather than extracted text. First 200 chars:", cvText.substring(0, 200));
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

        10. Contact information extraction - extract the candidate's residence address if mentioned in the CV
           - Look for patterns like "City, Country" (e.g., "Tunis, Tunisia", "Paris, France")
           - Look for address labels like "Address:", "Location:", "Based in:", "Residence:"
           - Extract full address including city, country, state/region if mentioned
           - Pay special attention to international formats and non-English location names
        
        Format your response as a valid JSON object with the following structure:
        {
          "name": "Extract the candidate's full name from the CV",
          "email": "Extract email address if present",
          "phone": "Extract phone number if present", 
          "location": "Extract current location/city if mentioned",
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
          "yearsOfExperience": "Extract or estimate total years of professional experience as a number",
          "experienceLevel": "Classify as 'junior', 'mid', 'senior', or 'lead' based on experience",
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
          "contactInfo": {
            "residenceAddress": "Extract full residence address if mentioned in CV - include city, country, and any other location details. For example: 'Tunis, Tunisia' or 'Paris, France'. Return null if not found."
          }
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
      
      // Cache the result and cleanup if needed
      assessmentCache.set(cacheKey, result);
      cleanupCache();
      console.log("Cached new assessment result for key:", cacheKey.substring(0, 8), "Total cache size:", assessmentCache.size);
      
      // Track the backend ID
      let backendAssessmentId = null;
      
      // Save the assessment to the database if we have a userId
      if (userId) {
        try {
          console.log("Saving assessment to database with userId:", userId);
          
          const payload = {
            userId, // Use the userId passed as parameter
            cvText, // Add CV text to be stored in the database
            summary: result.summary,
            technicalSkills: result.technicalSkills,
            softSkills: result.softSkills,
            strengths: result.strengths,
            improvementAreas: result.improvementAreas,
            recommendations: result.recommendations,
            industryAnalysis: result.industryAnalysis,
            careerTrajectory: result.careerTrajectory,
            skillGapAnalysis: result.skillGapAnalysis
          };
          
          console.log("API Payload:", JSON.stringify(payload, null, 2));
          
          // Use the utility function to get the appropriate URL
          const apiUrl = getApiUrl('/api/assessments/user-assessments');
          console.log("Using API URL:", apiUrl);
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to save assessment:", errorData);
            if (response.status === 401) {
              console.error("Authentication error: User not authenticated");
            }
          } else {
            console.log("Assessment saved successfully");
            // Get the backend-generated ID
            const responseData = await response.json();
            if (responseData.assessmentId) {
              backendAssessmentId = responseData.assessmentId;
              console.log("Received backend assessment ID:", backendAssessmentId);
            }
          }
        } catch (saveError) {
          console.error("Error saving assessment to database:", saveError);
          // Continue with returning the result even if saving fails
        }
      }
      
      // Return result with backend ID if available
      return {
        ...result,
        backendAssessmentId // Include the backend ID
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError)
      console.error("JSON text that failed to parse:", jsonText)

      // Create a fallback response
      const fallback = createFallbackAssessment(cvText);
      assessmentCache.set(cacheKey, fallback);
      return fallback;
    }
  } catch (error) {
    console.error("Error assessing skills:", error)
    const fallback = createFallbackAssessment(cvText);
    return fallback;
  }
}

// Create a fallback assessment when AI or parsing fails
// Export function to clear cache if needed (useful for debugging)
export function clearAssessmentCache() {
  assessmentCache.clear();
  console.log("Assessment cache cleared");
}

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
