import axios from 'axios';

const JIRA_BASE_URL = 'https://ayoubrebhi1230.atlassian.net';
const JIRA_EMAIL = process.env.JIRA_EMAIL!;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN!;

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: any;
    priority?: { name: string };
    [key: string]: any;
  };
}

export async function fetchJiraTickets(projectKey: string): Promise<JiraIssue[]> {
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  const response = await axios.get(
    `${JIRA_BASE_URL}/rest/api/3/search?jql=project=${projectKey}`,
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    }
  );
  return response.data.issues;
} 