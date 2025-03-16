import { NextResponse } from "next/server"

// URL for the external Python API - simple FastAPI server
const PYTHON_API_URL = process.env.PYTHON_API_URL || "https://ai-agent-script.vercel.app/api/chat"

// Define the type expected by the FastAPI backend
interface Message {
  role: string;
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing or invalid messages" },
        { status: 400 }
      );
    }

    // Format messages to ensure they only have role and content fields
    const formattedMessages: Message[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    console.log("Sending to Python API:", JSON.stringify(formattedMessages));

    // Send the request to the Python API
    const pythonApiResponse = await fetch(PYTHON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messages: formattedMessages,
        model: "gpt-4o-mini"
      })
    });

    if (!pythonApiResponse.ok) {
      const errorText = await pythonApiResponse.text().catch(() => "Could not read response text");
      console.error("Python API error response:", errorText);
      throw new Error(`Python API returned status ${pythonApiResponse.status}: ${errorText}`);
    }

    // Get the response from the Python API
    const data = await pythonApiResponse.json();
    console.log("Response received from Python API:", data);
    
    // Return exactly what our component expects
    return NextResponse.json({
      role: data.role,
      content: data.content
    });
  } catch (error: any) {
    console.error("Error calling Python API:", error);
    return NextResponse.json(
      { 
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again." 
      },
      { status: 500 }
    );
  }
}