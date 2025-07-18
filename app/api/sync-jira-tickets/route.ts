import { NextRequest, NextResponse } from 'next/server';
import { fetchJiraTickets } from '@/lib/jira-client';
import { createTicket, getTicketsFromStorage } from '@/lib/tickets-local';

// Map Jira priorities to local priorities
const mapJiraPriority = (priority?: string): 'Critical' | 'High' | 'Medium' | 'Low' => {
  switch ((priority || '').toLowerCase()) {
    case 'highest':
    case 'critical':
      return 'Critical';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
    case 'lowest':
      return 'Low';
    default:
      return 'Medium';
  }
};

async function summarizeWithGroqCloud(text: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer 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`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant specialized in job spec analysis.\nGiven a long-form job ticket or description, extract the following fields and return them as a single valid JSON object:\n- position_title\n- client_name (look for names in 'Client Information', 'Contact', or anywhere in the text)\n- client_company (look for company names in 'Client Information', 'Contract Details', or anywhere in the text)\n- client_email (look for emails in 'Client Information', 'Contact', or anywhere in the text)\n- client_phone (look for phone numbers in 'Client Information', 'Contact', or anywhere in the text)\n- seniority\n- required_skills (include both 'Required Skills' and 'Nice-to-Have Skills')\n- contract_type\n- duration\n- start_date\n- budget_min\n- budget_max\n- currency\n- rate_type\n- work_arrangement\n- work_location\n- responsibilities (array of strings)\n- preferred_qualifications (array of strings, include 'Nice-to-Have Skills')\n- benefits (array of strings)\n- application_process (string)\n- red_flags (array of strings)\n- summary_sentence (string, a one-sentence summary of the opportunity)\n\nIf any value is missing, use a safe default such as:\n\"Unknown Client\", \"Unknown Company\", \"USD\", 0, or \"Not Specified\".\n\nReturn only the JSON — no explanation or markdown.`
        },
        {
          role: 'user',
          content: text
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Groq API error:', err);
    throw new Error('Groq API request failed');
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  console.log('Groq API response:', result);
  console.log('Groq content:', content);

  try {
    return JSON.parse(content); // assumes Groq returns raw JSON text
  } catch (err) {
    console.error('Failed to parse Groq response as JSON:', content);
    throw err;
  }
}


export async function POST(req: NextRequest) {
  try {
    // Fetch all tickets from Jira
    const jiraTickets = await fetchJiraTickets('LEOP');
    const localTickets = getTicketsFromStorage();
    const localSpecs = new Set(localTickets.map(t => t.specification));

    let createdCount = 0;
    const ticketsToReturn = [];
    for (const jiraTicket of jiraTickets) {
      const specification = jiraTicket.fields.summary;
      let description = '';
      if (jiraTicket.fields.description && jiraTicket.fields.description.content) {
        description = jiraTicket.fields.description.content
          .map((block: any) =>
            block.content
              ? block.content.map((c: any) => c.text).join(' ')
              : ''
          )
          .join('\n');
      }
      if (localSpecs.has(specification)) continue; // Skip if already exists
      const priority = mapJiraPriority(jiraTicket.fields.priority?.name);
      // Summarize with GroqCloud
      let summary = {};
      try {
        summary = await summarizeWithGroqCloud(`${specification}\n${description}`);
      } catch (e) {
        console.error('GroqCloud summarization failed:', e);
      }
      ticketsToReturn.push({
        specification,
        description: JSON.stringify(summary, null, 2), // Save summary as description
        priority,
        jiraKey: jiraTicket.key,
        ...summary
      });
      createdCount++;
    }

    return NextResponse.json({ success: true, created: createdCount, tickets: ticketsToReturn }, { status: 200 });
  } catch (error) {
    console.error('Error syncing Jira tickets:', error);
    return NextResponse.json({ error: 'Failed to sync Jira tickets' }, { status: 500 });
  }
} 