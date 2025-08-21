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
  addComment,
  getBitbucketRepositories,
  getPullRequestsForIssue,
  getPrDiff,
  addBitbucketComment,
  resetMcpServerCache,
  // Enhanced unified update function (replaces all other update functions)
  enhancedJiraUpdate,
  unifiedJiraUpdate,
  // Custom field management tools
  getCustomFieldMappings,
  getCustomFieldByName,
  getCustomFieldById,
  listCustomFields,
  clearCustomFieldCache,

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



      case 'add_comment':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await addComment(args.issueKey as string, args.comment as string), null, 2),
            },
          ],
        };

      case 'enhanced_jira_update':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await enhancedJiraUpdate(args as any), null, 2),
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
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getPullRequestsForIssue(args.issueKey as string), null, 2),
            },
          ],
        };

      case 'get_pr_diff':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getPrDiff(args.prUrl as string), null, 2),
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

      case 'unified_jira_update':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await unifiedJiraUpdate(args as any), null, 2),
            },
          ],
        };

      // Custom field management tools
      case 'get_custom_field_mappings':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getCustomFieldMappings(), null, 2),
            },
          ],
        };

      case 'get_custom_field_by_name':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getCustomFieldByName(args.fieldName as string), null, 2),
            },
          ],
        };

      case 'get_custom_field_by_id':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getCustomFieldById(args.fieldId as string), null, 2),
            },
          ],
        };

      case 'list_custom_fields':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await listCustomFields(), null, 2),
            },
          ],
        };

      case 'clear_custom_field_cache':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await clearCustomFieldCache(), null, 2),
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
