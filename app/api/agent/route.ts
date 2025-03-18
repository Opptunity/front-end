import { NextResponse } from "next/server";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
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

    // Forward the request to the Python backend
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent`, {
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