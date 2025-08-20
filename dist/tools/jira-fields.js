import { jiraClient } from '../utils/clients.js';
export const updateIssueFieldsToolDefinition = {
    name: 'update_issue_fields',
    description: 'Update specific fields of a Jira issue with detailed field mapping',
    inputSchema: {
        type: 'object',
        properties: {
            issueKey: {
                type: 'string',
                description: 'The issue key to update (e.g., PROJ-123)',
            },
            summary: {
                type: 'string',
                description: 'Update the issue summary/title',
            },
            description: {
                type: 'string',
                description: 'Update the issue description',
            },
            priority: {
                type: 'string',
                description: 'Update priority (Highest, High, Medium, Low, Lowest)',
            },
            assignee: {
                type: 'string',
                description: 'Update assignee (email address or username)',
            },
            status: {
                type: 'string',
                description: 'Update status (e.g., "In Progress", "Done", "To Do")',
            },
            labels: {
                type: 'array',
                items: {
                    type: 'string',
                },
                description: 'Update labels (array of label strings)',
            },
            components: {
                type: 'array',
                items: {
                    type: 'string',
                },
                description: 'Update components (array of component names)',
            },
            fixVersions: {
                type: 'array',
                items: {
                    type: 'string',
                },
                description: 'Update fix versions (array of version names)',
            },
            customFields: {
                type: 'object',
                description: 'Update custom fields (key-value pairs)',
            },
        },
        required: ['issueKey'],
    },
};
export async function updateIssueFields(issueKey, summary, description, priority, assignee, status, labels, components, fixVersions, customFields) {
    try {
        const fields = {};
        if (summary)
            fields.summary = summary;
        if (description) {
            fields.description = {
                type: 'doc',
                version: 1,
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: description,
                            },
                        ],
                    },
                ],
            };
        }
        if (priority)
            fields.priority = { name: priority };
        if (assignee)
            fields.assignee = { name: assignee };
        if (status)
            fields.status = { name: status };
        if (labels)
            fields.labels = labels;
        if (components)
            fields.components = components.map(name => ({ name }));
        if (fixVersions)
            fields.fixVersions = fixVersions.map(name => ({ name }));
        if (customFields) {
            Object.assign(fields, customFields);
        }
        const response = await jiraClient.put(`/rest/api/3/issue/${issueKey}`, {
            fields,
        });
        return response.data;
    }
    catch (error) {
        throw new Error(`Failed to update issue fields for ${issueKey}: ${error}`);
    }
}
//# sourceMappingURL=jira-fields.js.map