import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
// Import all tools and their implementations
import { tools, searchIssues, getIssue, summarizeJiraTicket, updateIssue, addComment, updateIssueFields, getBitbucketRepositories, getPullRequestsForIssue, getPrDiff, addBitbucketComment, resetMcpServerCache } from './tools/index.js';
// Create MCP server
const server = new Server({
    name: 'jira-mcp-server',
    version: '1.0.0',
});
// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools,
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!args) {
        throw new Error('Arguments are required');
    }
    try {
        switch (name) {
            case 'search_issues':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await searchIssues(args.jql, args.maxResults, args.startAt), null, 2),
                        },
                    ],
                };
            case 'get_issue':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await getIssue(args.issueKey), null, 2),
                        },
                    ],
                };
            case 'summarize_jira_ticket':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await summarizeJiraTicket(args.issueKey), null, 2),
                        },
                    ],
                };
            case 'update_issue':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await updateIssue(args.issueKey, args.fields), null, 2),
                        },
                    ],
                };
            case 'add_comment':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await addComment(args.issueKey, args.comment), null, 2),
                        },
                    ],
                };
            case 'update_issue_fields':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await updateIssueFields(args.issueKey, args.summary, args.description, args.priority, args.assignee, args.status, args.labels, args.components, args.fixVersions, args.customFields), null, 2),
                        },
                    ],
                };
            case 'get_bitbucket_repositories':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await getBitbucketRepositories(args.maxResults), null, 2),
                        },
                    ],
                };
            case 'get_pull_requests_for_issue':
                const prData = await getPullRequestsForIssue(args.issueKey);
                return {
                    content: [
                        {
                            type: 'table',
                            table: prData.table,
                        },
                    ],
                };
            case 'get_pr_diff':
                const diffData = await getPrDiff(args.prUrl);
                return {
                    content: [
                        {
                            type: 'table',
                            table: diffData.table,
                        },
                    ],
                };
            case 'add_bitbucket_comment':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await addBitbucketComment(args.prUrl, args.comment), null, 2),
                        },
                    ],
                };
            case 'reset_mcp_server_cache':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await resetMcpServerCache({
                                clearAll: args.clearAll,
                                clearIssueCache: args.clearIssueCache,
                                clearRepositoryCache: args.clearRepositoryCache,
                                issueKey: args.issueKey,
                                workspace: args.workspace
                            }), null, 2),
                        },
                    ],
                };
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        throw new Error(`Tool execution failed: ${error}`);
    }
});
// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Jira MCP server started');
//# sourceMappingURL=index.js.map