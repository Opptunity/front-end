import { NextRequest, NextResponse } from 'next/server'
import { extractTicketFieldsFromDescription, type JiraDescriptionInput } from '@/lib/jira-ai-field-extractor'

export async function POST(request: NextRequest) {
  try {
    const { description, summary } = await request.json()
    
    // Test the AI field extraction with sample data - only description is required now!
    const testInput: JiraDescriptionInput = {
      description: description || `We are looking for a Senior React Developer to join our team and work on our e-commerce platform.

Requirements:
- 5+ years of React experience
- TypeScript expertise
- Experience with Node.js and MongoDB
- Knowledge of AWS services
- Bachelor's degree in Computer Science

Responsibilities:
- Build modern web applications
- Collaborate with design team
- Optimize application performance
- Mentor junior developers

Compensation: $90,000 - $120,000 annually
Location: San Francisco, CA (Remote friendly)
Start Date: Immediately
Contact: john.smith@techcorp.com

This is a full-time remote position for our senior engineering team.`,
      summary: summary // Optional
    }
    
    console.log('🧪 Testing AI field extraction with simplified input (description only):', {
      description_length: testInput.description.length,
      has_summary: !!testInput.summary
    })
    
    // Extract fields using AI - simplified approach
    const extractedFields = await extractTicketFieldsFromDescription(testInput)
    
    return NextResponse.json({
      success: true,
      message: 'AI field extraction test completed successfully',
      input: testInput,
      extracted_fields: extractedFields
    })
    
  } catch (error) {
    console.error('Error in AI field extraction test:', error)
    return NextResponse.json({ 
      error: 'AI extraction test failed', 
      details: error.message 
    }, { status: 500 })
  }
} 