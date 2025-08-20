import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import all tools and their implementations
import {
  tools,
  searchIssues,
  getIssue,
  summarizeJiraTicket,
  updateIssue,
  addComment,
  updateIssueFields,
  getBitbucketRepositories,
  getPullRequestsForIssue,
  getPrDiff,
  addBitbucketComment,
  resetMcpServerCache
} from './tools/index.js';

// Create MCP server
const server = new Server(
  {
    name: 'jira-mcp-server',
    version: '1.0.0',
  }
);

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
              text: JSON.stringify(await searchIssues(
                args.jql as string, 
                args.maxResults as number, 
                args.startAt as number
              ), null, 2),
            },
          ],
        };

      case 'get_issue':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getIssue(args.issueKey as string), null, 2),
            },
          ],
        };

      case 'summarize_jira_ticket':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await summarizeJiraTicket(args.issueKey as string), null, 2),
            },
          ],
        };



      case 'update_issue':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await updateIssue(args.issueKey as string, args.fields as any), null, 2),
            },
          ],
        };



      case 'add_comment':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await addComment(args.issueKey as string, args.comment as string), null, 2),
            },
          ],
        };

      case 'update_issue_fields':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await updateIssueFields(
                args.issueKey as string,
                args.summary as string,
                args.description as string,
                args.priority as string,
                args.assignee as string,
                args.status as string,
                args.labels as string[],
                args.components as string[],
                args.fixVersions as string[],
                args.customFields as any
              ), null, 2),
            },
          ],
        };

      case 'get_bitbucket_repositories':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getBitbucketRepositories(args.maxResults as number), null, 2),
            },
          ],
        };





      case 'get_pull_requests_for_issue':
        const prData = await getPullRequestsForIssue(args.issueKey as string);
        return {
          content: [
            {
              type: 'table',
              table: prData.table,
            },
          ],
        };

      case 'get_pr_diff':
        const diffData = await getPrDiff(args.prUrl as string);
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
              text: JSON.stringify(await addBitbucketComment(args.prUrl as string, args.comment as string), null, 2),
            },
          ],
        };

      case 'reset_mcp_server_cache':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await resetMcpServerCache({
                clearAll: args.clearAll as boolean,
                clearIssueCache: args.clearIssueCache as boolean,
                clearRepositoryCache: args.clearRepositoryCache as boolean,
                issueKey: args.issueKey as string,
                workspace: args.workspace as string
              }), null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    throw new Error(`Tool execution failed: ${error}`);
  }
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Jira MCP server started');
