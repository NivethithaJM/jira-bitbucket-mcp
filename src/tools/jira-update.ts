import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { jiraClient } from '../utils/clients.js';

export const updateIssueToolDefinition: Tool = {
  name: 'update_issue',
  description: 'Update an existing Jira issue',
  inputSchema: {
    type: 'object',
    properties: {
      issueKey: {
        type: 'string',
        description: 'The issue key to update',
      },
      fields: {
        type: 'object',
        description: 'Fields to update (summary, description, priority, etc.)',
      },
    },
    required: ['issueKey', 'fields'],
  },
};

export async function updateIssue(issueKey: string, fields: any) {
  try {
    const response = await jiraClient.put(`/rest/api/3/issue/${issueKey}`, {
      fields,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update issue ${issueKey}: ${error}`);
  }
}
