import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"

interface Ticket {
  id: string;
  ticket_number: string;
  position_title: string;
  client_company: string;
  required_skills: string[];
  preferred_skills: string[];
  seniority: string;
  work_location: string;
  work_arrangement: string;
  contract_type: string;
  start_date: string;
  budget_min: number;
  budget_max: number;
  project_description?: string;
}

interface Profiler {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
  availability_status: string;
  preferred_work_arrangement: string[];
  skills: any[];
  experience_level: string;
  years_of_experience: number;
  hourly_rate: number;
  daily_rate: number;
  currency: string;
  bio: string;
  linkedin_url: string;
  portfolio_url: string;
  contract_types: string[];
  notice_period_days: number;
}

interface MatchResult {
  profiler_id: string;
  match_score: number;
  reasoning: string;
  skills_match: number;
  experience_match: number;
  location_match: number;
  availability_match: number;
  budget_compatibility: number;
  overall_fit: string;
  strengths: string[];
  concerns: string[];
}

export async function calculateAIProfilerMatches(
  ticket: Ticket, 
  profilers: Profiler[]
): Promise<MatchResult[]> {
  try {
    console.log(`Calculating AI matches for ${profilers.length} profilers against ticket ${ticket.ticket_number}`);

    // Use OpenAI if available, otherwise fall back to Grok
    const model = process.env.OPENAI_API_KEY ? openai("gpt-4o") : xai("grok-2");

    const { text } = await generateText({
      model,
      prompt: `
        You are an expert talent matching specialist with deep knowledge of software engineering roles and requirements.
        
        Analyze the following ticket requirements against each profiler's profile and provide detailed matching scores.
        
        TICKET REQUIREMENTS:
        Position: ${ticket.position_title}
        Company: ${ticket.client_company}
        Required Skills: ${JSON.stringify(ticket.required_skills)}
        Preferred Skills: ${JSON.stringify(ticket.preferred_skills)}
        Seniority Level: ${ticket.seniority}
        Location: ${ticket.work_location}
        Work Arrangement: ${ticket.work_arrangement}
        Contract Type: ${ticket.contract_type}
        Budget Range: $${ticket.budget_min} - $${ticket.budget_max}
        Start Date: ${ticket.start_date}
        ${ticket.project_description ? `Project Description: ${ticket.project_description}` : ''}
        
        PROFILERS TO ANALYZE:
        ${profilers.map((profiler, index) => `
        Profiler ${index + 1}:
        - ID: ${profiler.id}
        - Name: ${profiler.first_name} ${profiler.last_name}
        - Location: ${profiler.location}
        - Experience Level: ${profiler.experience_level}
        - Years of Experience: ${profiler.years_of_experience}
        - Skills: ${JSON.stringify(profiler.skills)}
        - Bio: ${profiler.bio}
        - Availability: ${profiler.availability_status}
        - Preferred Work Arrangement: ${JSON.stringify(profiler.preferred_work_arrangement)}
        - Contract Types: ${JSON.stringify(profiler.contract_types)}
        - Hourly Rate: $${profiler.hourly_rate} ${profiler.currency}
        - Daily Rate: $${profiler.daily_rate} ${profiler.currency}
        - Notice Period: ${profiler.notice_period_days} days
        `).join('\n')}
        
        For each profiler, analyze their fit for this specific role and provide:
        
        1. **Skills Match** (0-100): How well their technical skills align with required/preferred skills
        2. **Experience Match** (0-100): How well their experience level and years match the role
        3. **Location Match** (0-100): Geographic compatibility and work arrangement fit
        4. **Availability Match** (0-100): Current availability and timeline compatibility
        5. **Budget Compatibility** (0-100): How well their rates fit within the budget
        6. **Overall Match Score** (0-100): Weighted overall fit for the role
        7. **Reasoning**: Detailed explanation of the match assessment
        8. **Strengths**: Key strengths that make them a good fit
        9. **Concerns**: Potential concerns or gaps
        10. **Overall Fit**: Brief summary (e.g., "Excellent fit", "Good fit with concerns", "Poor fit")
        
        Consider these factors:
        - Exact skill matches are weighted higher than partial matches
        - Required skills are more important than preferred skills
        - Experience level should align with role seniority
        - Budget compatibility is crucial for commercial viability
        - Location and work arrangement preferences matter for long-term success
        - Availability and notice period affect project timeline
        
        Format your response as a valid JSON array with this structure:
        [
          {
            "profiler_id": "profiler-id",
            "match_score": 85,
            "reasoning": "Detailed explanation of why this score was assigned...",
            "skills_match": 90,
            "experience_match": 80,
            "location_match": 85,
            "availability_match": 95,
            "budget_compatibility": 75,
            "overall_fit": "Excellent fit",
            "strengths": ["Strong React/Node.js experience", "Perfect availability", "Budget aligned"],
            "concerns": ["Limited AWS experience", "Remote work preference vs hybrid role"]
          }
        ]
        
        IMPORTANT: Return ONLY the JSON array without any markdown formatting, explanation, or code blocks.
      `,
    });

    console.log("Received AI matching response");

    // Parse the JSON response
    try {
      const matchResults = JSON.parse(text);
      
      if (!Array.isArray(matchResults)) {
        throw new Error("AI response is not an array");
      }

      console.log(`Successfully parsed ${matchResults.length} match results`);
      return matchResults;
      
    } catch (parseError) {
      console.error("Error parsing AI matching response:", parseError);
      console.error("Raw response:", text);
      
      // Return fallback results if parsing fails
      return profilers.map(profiler => ({
        profiler_id: profiler.id,
        match_score: 50, // Default middle score
        reasoning: "AI matching temporarily unavailable - using fallback scoring",
        skills_match: 50,
        experience_match: 50,
        location_match: 50,
        availability_match: profiler.availability_status === 'available' ? 100 : 0,
        budget_compatibility: 50,
        overall_fit: "Requires manual review",
        strengths: ["Profile available for review"],
        concerns: ["AI matching temporarily unavailable"]
      }));
    }

  } catch (error) {
    console.error('Error in AI profiler matching:', error);
    
    // Return fallback results
    return profilers.map(profiler => ({
      profiler_id: profiler.id,
      match_score: 50,
      reasoning: "AI matching service temporarily unavailable",
      skills_match: 50,
      experience_match: 50,
      location_match: 50,
      availability_match: profiler.availability_status === 'available' ? 100 : 0,
      budget_compatibility: 50,
      overall_fit: "Requires manual review",
      strengths: ["Profile available for review"],
      concerns: ["AI matching temporarily unavailable"]
    }));
  }
} 