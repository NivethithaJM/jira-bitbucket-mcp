// Export all tool definitions
export { searchIssuesToolDefinition, searchIssues } from './jira-search.js';
export { getIssueToolDefinition, getIssue } from './jira-issue.js';
export { summarizeJiraTicketToolDefinition, summarizeJiraTicket } from './jira-summary.js';

export { updateIssueToolDefinition, updateIssue } from './jira-update.js';


export { addCommentToolDefinition, addComment } from './jira-comments.js';
export { updateIssueFieldsToolDefinition, updateIssueFields } from './jira-fields.js';
export { getBitbucketRepositoriesToolDefinition, getBitbucketRepositories } from './bitbucket-repositories.js';

export { getPullRequestsForIssueToolDefinition, getPullRequestsForIssue } from './pull-requests-search.js';
export { getPrDiffToolDefinition, getPrDiff } from './pr-diff.js';
export { addBitbucketCommentToolDefinition, addBitbucketComment } from './bitbucket-comments.js';
export { resetMcpServerCacheToolDefinition, resetMcpServerCache } from './cache-management.js';

import { Tool } from '@modelcontextprotocol/sdk/types.js';

// Import all tool definitions
import { searchIssuesToolDefinition } from './jira-search.js';
import { getIssueToolDefinition } from './jira-issue.js';
import { summarizeJiraTicketToolDefinition } from './jira-summary.js';

import { updateIssueToolDefinition } from './jira-update.js';


import { addCommentToolDefinition } from './jira-comments.js';
import { updateIssueFieldsToolDefinition } from './jira-fields.js';
import { getBitbucketRepositoriesToolDefinition } from './bitbucket-repositories.js';

import { getPullRequestsForIssueToolDefinition } from './pull-requests-search.js';
import { getPrDiffToolDefinition } from './pr-diff.js';
import { addBitbucketCommentToolDefinition } from './bitbucket-comments.js';
import { resetMcpServerCacheToolDefinition } from './cache-management.js';

// Export all tool definitions as an array
export const tools: Tool[] = [
  searchIssuesToolDefinition,
  getIssueToolDefinition,
  summarizeJiraTicketToolDefinition,

  updateIssueToolDefinition,


  addCommentToolDefinition,
  updateIssueFieldsToolDefinition,
  getBitbucketRepositoriesToolDefinition,

  getPullRequestsForIssueToolDefinition,
  getPrDiffToolDefinition,
  addBitbucketCommentToolDefinition,
  resetMcpServerCacheToolDefinition
];
