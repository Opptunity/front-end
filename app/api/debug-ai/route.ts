import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function GET(request: NextRequest) {
  try {
    console.log('=== AI DEBUG CHECK ===')
    
    // Check environment variables
    const openaiKey = process.env.OPENAI_API_KEY
    
    console.log('OpenAI API Key:', openaiKey ? `${openaiKey.substring(0, 10)}...` : 'MISSING')
    
    if (!openaiKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured',
        details: {
          openai_configured: !!openaiKey,
          message: 'Configure OPENAI_API_KEY in your .env.local file'
        }
      }, { status: 400 })
    }
    
    // Use OpenAI
    const model = openai("gpt-4o-mini")
    const modelType = 'OpenAI'
    
    console.log(`Using ${modelType} for AI test`)
    
    // Test AI with simple prompt
    const { text } = await generateText({
      model,
      prompt: 'Say "AI is working correctly" if you can understand this message.',
      maxTokens: 50
    })
    
    console.log('AI Response:', text)
    
    return NextResponse.json({
      success: true,
      message: 'AI is configured and working correctly',
      details: {
        model_used: modelType,
        openai_configured: !!openaiKey,
        ai_response: text
      }
    })
    
  } catch (error) {
    console.error('AI Debug Error:', error)
    return NextResponse.json({
      success: false,
      error: 'AI test failed',
      details: {
        error_message: error.message,
        error_type: error.constructor.name
      }
    }, { status: 500 })
  }
} 