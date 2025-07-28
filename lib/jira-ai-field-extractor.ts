// AI-powered field extraction for JIRA tickets
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

// Simple input - only JIRA description
export interface JiraDescriptionInput {
  description: string
  summary?: string // Optional fallback
}

// Database ticket fields that AI should extract
export interface DatabaseTicketFields {
  // Client Information
  client_name: string // Required - must always be provided
  client_company: string // Required - must always be provided
  client_email: string // Required - must always be provided (fallback if not found)
  client_phone?: string | null
  
  // Position Details (position_title is required)
  position_title: string
  department?: string | null
  seniority?: string | null
  contract_type?: string | null
  duration?: string | null
  work_location?: string | null
  work_arrangement?: string | null
  
  // Requirements
  required_skills?: string[] | null
  preferred_skills?: string[] | null
  experience?: string | null
  education?: string | null
  certifications?: string | null
  
  // Project Details
  project_description?: string | null
  responsibilities?: string | null
  
  // Budget & Terms
  budget_min?: number | null
  budget_max?: number | null
  currency?: string | null
  rate_type?: string | null
  
  // Additional Information
  urgency?: string | null
  special_requirements?: string | null
  notes?: string | null
}

/**
 * Extract structured ticket fields from JIRA description using AI
 * @param input - Only the JIRA description text
 * @returns Structured database fields
 */
export async function extractTicketFieldsFromDescription(input: JiraDescriptionInput): Promise<DatabaseTicketFields> {
  // Only use OpenAI
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }
  
  const model = openai("gpt-4o-mini")
  
  // Define Zod schema that directly maps to database columns
  const ticketFieldsSchema = z.object({
    // Client Information
    client_name: z.string(), // Required - must always be provided
    client_company: z.string(), // Required - must always be provided
    client_email: z.string(), // Required - must always be provided (fallback if not found)
    client_phone: z.string().nullable().optional(),
    
    // Position Details (position_title is required)
    position_title: z.string(),
    department: z.string().nullable().optional(),
    seniority: z.string().nullable().optional(),
    contract_type: z.string().nullable().optional(),
    duration: z.string().nullable().optional(),
    work_location: z.string().nullable().optional(),
    work_arrangement: z.string().nullable().optional(),
    
    // Requirements
    required_skills: z.array(z.string()).nullable().optional(),
    preferred_skills: z.array(z.string()).nullable().optional(),
    experience: z.string().nullable().optional(),
    education: z.string().nullable().optional(),
    certifications: z.string().nullable().optional(),
    
    // Project Details
    project_description: z.string().nullable().optional(),
    responsibilities: z.string().nullable().optional(),
    
    // Budget & Terms
    budget_min: z.number().nullable().optional(),
    budget_max: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    rate_type: z.string().nullable().optional(),
    
    // Additional Information
    urgency: z.string().nullable().optional(),
    special_requirements: z.string().nullable().optional(),
    notes: z.string().nullable().optional()
  })
  
  console.log(`📋 AI analyzing description (${input.description?.length || 0} chars):`, input.description ? `"${input.description.substring(0, 150)}..."` : 'No description')
  
  if (!input.description || input.description.trim().length === 0) {
    console.warn('⚠️ Empty JIRA description, using fallback extraction')
    return fallbackExtractionFromDescription(input)
  }
  
  const prompt = `
You are an expert at analyzing JIRA ticket descriptions and extracting structured recruitment/staffing information.

**JIRA DESCRIPTION TO ANALYZE:**
${input.description}

${input.summary ? `**JIRA SUMMARY (for context):** ${input.summary}` : ''}

**YOUR TASK:**
Extract structured information to fill database columns for a staffing/recruitment ticket. Focus ONLY on information explicitly mentioned or clearly implied in the description.

**EXTRACTION RULES:**

**REQUIRED FIELDS (MUST ALWAYS BE PROVIDED):**
1. **position_title** (REQUIRED): Extract the job title/role being requested
2. **client_name** (REQUIRED): Extract the name of the person requesting the position. If no specific name is found, use "Unknown Client" as default
3. **client_company** (REQUIRED): Extract the company name requesting the position. If no specific company is found, use "Unknown Company" as default
4. **client_email** (REQUIRED): Extract the email address of the person requesting the position. If no email is found, use "unknown@client.com" as default

**OPTIONAL FIELDS (extract if mentioned):**
5. **project_description** (OPTIONAL): Store the full JIRA description text as the project description. This should contain the complete description provided.
6. **Client Information**: Look for names, companies, emails, phone numbers of requesters
7. **Skills**: Extract technical skills mentioned as required or preferred
8. **Budget**: Extract salary ranges, rates, or budget amounts (numbers only, no currency symbols)
9. **Seniority**: Look for experience levels (Junior, Mid, Senior, Lead, etc.)
10. **Work Arrangement**: Remote, Hybrid, On-site, etc.
11. **Contract Type**: Full-time, Contract, Part-time, etc.
12. **Duration**: Project duration or contract length
13. **Work Location**: Work location or office location
14. **Experience**: Years of experience required
15. **Education**: Degree requirements
16. **Certifications**: Required certifications

**IMPORTANT:**
- Only extract what's explicitly mentioned or clearly implied
- For numbers (budget_min/max), return pure numbers without currency symbols
- For skills arrays, return array of strings
- Be conservative - if unsure, leave field as null
- Don't make assumptions beyond what's written

**EXAMPLES:**

Description: "Need Senior React Developer for 6-month project. Must have 5+ years React, TypeScript, AWS. Budget: $80k-120k/year. Remote work OK. Contact: john@techcorp.com"

Response:
{
  "position_title": "Senior React Developer",
  "client_name": "John Smith",
  "client_company": "TechCorp",
  "client_email": "john@techcorp.com",
  "project_description": "Need Senior React Developer for 6-month project. Must have 5+ years React, TypeScript, AWS. Budget: $80k-120k/year. Remote work OK. Contact: john@techcorp.com",
  "seniority": "Senior",
  "required_skills": ["React", "TypeScript", "AWS"],
  "contract_type": "Contract",
  "duration": "6 months",
  "experience": "5+ years",
  "budget_min": 80000,
  "budget_max": 120000,
  "currency": "USD",
  "rate_type": "annual",
  "work_arrangement": "Remote",
  "work_location": "Remote"
}

Now analyze the provided JIRA description and return the structured data:
`

  try {
    console.log('🚀 Calling OpenAI API to extract ticket fields from description...')
    
    const result = await generateObject({
      model,
      schema: ticketFieldsSchema,
      prompt
    })

    console.log('✅ AI extracted database fields:', result.object)
    console.log('🔍 AI response validation - client_email present:', !!result.object.client_email)
    console.log('🔍 AI response validation - client_name present:', !!result.object.client_name)
    console.log('🔍 AI response validation - client_company present:', !!result.object.client_company)
    console.log('🔍 AI response validation - work_location present:', !!result.object.work_location)
    
    // Ensure required fields are present and set project_description
    const validatedFields = {
      ...result.object,
      client_email: result.object.client_email || 'unknown@client.com',
      client_name: result.object.client_name || 'Unknown Client',
      client_company: result.object.client_company || 'Unknown Company',
      project_description: result.object.project_description || input.description || 'No description provided'
    }
    
    console.log('✅ Validated AI fields:', validatedFields)
    return validatedFields as DatabaseTicketFields

  } catch (error) {
    console.error('Error in AI field extraction:', error)
    
    // Fallback extraction from description text
    return fallbackExtractionFromDescription(input)
  }
}

/**
 * Fallback extraction when AI fails
 */
function fallbackExtractionFromDescription(input: JiraDescriptionInput): DatabaseTicketFields {
  console.log('Using fallback extraction from description')
  
  const description = input.description || ''
  const summary = input.summary || ''
  
  // Basic extraction from text
  const extractPosition = (): string => {
    if (summary) return summary
    
    // Look for common job title patterns
    const patterns = [
      /need (?:a )?([^.]+?)(?: for| to| -)/i,
      /hiring (?:a )?([^.]+?)(?: for| to| -)/i,
      /looking for (?:a )?([^.]+?)(?: for| to| -)/i,
      /position:?\s*([^.\n]+)/i,
      /role:?\s*([^.\n]+)/i,
      /title:?\s*([^.\n]+)/i
    ]
    
    for (const pattern of patterns) {
      const match = description.match(pattern)
      if (match) return match[1].trim()
    }
    
    return 'Position from JIRA'
  }
  
  return {
    position_title: extractPosition(),
    project_description: description,
    currency: 'USD',
    client_name: 'Unknown Client', // Default fallback value
    client_company: 'Unknown Company', // Default fallback value
    client_email: 'unknown@client.com' // Default fallback value
  }
} 