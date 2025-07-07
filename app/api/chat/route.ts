import { NextResponse } from "next/server"
import { handleTrendQuery, compareTechnologies } from "@/lib/it-trends-ai-agent"

// URL for the external Python API - simple FastAPI server
const PYTHON_API_URL = process.env.PYTHON_API_URL || "https://ai-agent-script.vercel.app/api/chat"

// Define the type expected by the FastAPI backend
interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
}

// Keywords that trigger trend-specific responses
const TREND_KEYWORDS = [
  'trend', 'trending', 'technology trends', 'it trends', 'tech trends',
  'emerging technologies', 'new technologies', 'latest tech', 'future tech',
  'compare technologies', 'vs', 'better than', 'which technology',
  'ai trends', 'ml trends', 'frontend trends', 'backend trends',
  'market demand', 'salary', 'job market', 'career prospects'
]

// Function to detect if a message is trend-related
function isTrendQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return TREND_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

export async function POST(request: Request) {
  try {
    // Extract the messages from the request
    const body = await request.json();
    const messages = body.messages || [];

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    const isUserMessage = latestMessage?.role === 'user';
    const userContent = latestMessage?.content || '';

    // Check if the query is trend-related and handle it locally
    if (isUserMessage && isTrendQuery(userContent)) {
      try {
        // Fetch current trends for context
        let availableTrends = []
        try {
          const trendsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/it-trends`)
          const trendsData = await trendsResponse.json()
          availableTrends = trendsData.trends || []
        } catch (trendsError) {
          console.log('Could not fetch trends for context:', trendsError)
        }

        // Handle comparison queries specially
        const comparisonPattern = /compare\s+(.+?)\s+(?:and|vs|with)\s+(.+?)(?:\s|$)/i
        const comparisonMatch = userContent.match(comparisonPattern)
        
        if (comparisonMatch) {
          const [, tech1, tech2] = comparisonMatch
          const response = await compareTechnologies([tech1.trim(), tech2.trim()])
          
          return NextResponse.json({
            content: response + "\n\n💡 *Want to explore more trending technologies? Check out our [IT Trends Explorer](/it-trends) for comprehensive insights and personalized recommendations.*"
          });
        }

        // Handle general trend queries
        const context = {
          userSkills: [], // Could be enhanced to get from user profile
          userIndustry: 'technology',
          availableTrends
        }

        const response = await handleTrendQuery(userContent, context)
        
        return NextResponse.json({
          content: response + "\n\n🚀 *Explore more trends and get personalized recommendations in our [IT Trends Explorer](/it-trends).*"
        });
      } catch (trendError) {
        console.error('Error handling trend query:', trendError)
        // Fall through to regular chat if trend handling fails
      }
    }

    // Forward the request to the Python backend for non-trend queries
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map((m: Message) => ({
            role: m.role,
            content: m.content
          })),
          model: "gpt-4o-mini", // Use the same model as in your Python API
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error calling backend API:', error);
      return NextResponse.json(
        { error: "Failed to communicate with backend API", content: "I'm having trouble connecting to my backend services. Please try again in a moment." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { error: "Internal server error", content: "Sorry, I encountered an unexpected error. Please try again." },
      { status: 500 }
    );
  }
}