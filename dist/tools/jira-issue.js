import { jiraClient } from '../utils/clients.js';
export const getIssueToolDefinition = {
    name: 'get_issue',
    description: 'Get details of a specific Jira issue by key',
    inputSchema: {
        type: 'object',
        properties: {
            issueKey: {
                type: 'string',
                description: 'The issue key (e.g., PROJ-123)',
            },
        },
        required: ['issueKey'],
    },
};
export async function getIssue(issueKey) {
    try {
        const response = await jiraClient.get(`/rest/api/3/issue/${issueKey}`);
        return response.data;
    }
    catch (error) {
        throw new Error(`Failed to get issue ${issueKey}: ${error}`);
    }
}
//# sourceMappingURL=jira-issue.js.map