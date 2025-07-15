import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { specification } = await request.json();

    if (!specification) {
      return NextResponse.json({ error: 'Specification is required' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY || "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";

    const prompt = `
    Analyze the following job specification and determine the priority level based on these factors:
    
    1. Company size and importance (Fortune 500, enterprise, startup, etc.)
    2. Urgency indicators (immediate, urgent, ASAP, deadline-driven)
    3. Project complexity and scope
    4. Budget indicators (high budget, premium rates, etc.)
    5. Technical requirements and skill level needed
    6. Business impact and strategic importance
    
    Priority levels:
    - Critical: Enterprise clients, immediate deadlines, high budget, strategic importance
    - High: Large companies, urgent needs, complex requirements, good budget
    - Medium: Mid-size companies, standard timelines, moderate complexity
    - Low: Small companies, flexible timelines, simple requirements
    
    Job Specification:
    ${specification}
    
    Respond with only the priority level: Critical, High, Medium, or Low.
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const priority = data.choices[0]?.message?.content?.trim() || 'Medium';

    // Validate the priority level
    const validPriorities = ['Critical', 'High', 'Medium', 'Low'];
    const normalizedPriority = validPriorities.includes(priority) ? priority : 'Medium';

    return NextResponse.json({ 
      priority: normalizedPriority,
      analysis: `Priority determined based on company size, urgency, complexity, and business impact.`
    });

  } catch (error) {
    console.error('Error analyzing priority:', error);
    return NextResponse.json({ 
      priority: 'Medium',
      error: 'Failed to analyze priority, using default level'
    }, { status: 500 });
  }
} 