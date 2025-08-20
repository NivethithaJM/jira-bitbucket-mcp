import { jiraClient } from '../utils/clients.js';
export const searchIssuesToolDefinition = {
    name: 'search_issues',
    description: 'Search for Jira issues using JQL (Jira Query Language)',
    inputSchema: {
        type: 'object',
        properties: {
            jql: {
                type: 'string',
                description: 'JQL query string to search for issues',
            },
            maxResults: {
                type: 'number',
                description: 'Maximum number of results to return (default: 50)',
                default: 50,
            },
            startAt: {
                type: 'number',
                description: 'Starting index for pagination (default: 0)',
                default: 0,
            },
        },
        required: ['jql'],
    },
};
export async function searchIssues(jql, maxResults = 50, startAt = 0) {
    try {
        const response = await jiraClient.get('/rest/api/3/search', {
            params: {
                jql,
                maxResults,
                startAt,
                fields: 'summary,description,status,priority,assignee,reporter,created,updated',
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error(`Failed to search issues: ${error}`);
    }
}
//# sourceMappingURL=jira-search.js.map