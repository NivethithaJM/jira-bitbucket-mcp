// Export all tool definitions
export { searchIssuesToolDefinition, searchIssues } from './jira-search.js';
export { getIssueToolDefinition, getIssue } from './jira-issue.js';
export { summarizeJiraTicketToolDefinition, summarizeJiraTicket } from './jira-summary.js';

export { addCommentToolDefinition, addComment } from './jira-comments.js';
export { getBitbucketRepositoriesToolDefinition, getBitbucketRepositories } from './bitbucket-repositories.js';

export { getPullRequestsForIssueToolDefinition, getPullRequestsForIssue } from './pull-requests-search.js';
export { getPrDiffToolDefinition, getPrDiff } from './pr-diff.js';
export { addBitbucketCommentToolDefinition, addBitbucketComment } from './bitbucket-comments.js';
export { resetMcpServerCacheToolDefinition, resetMcpServerCache } from './cache-management.js';

// Enhanced unified update function (replaces all other update functions)
export { 
  enhancedJiraUpdateToolDefinition, 
  enhancedJiraUpdate, 
  unifiedJiraUpdate 
} from './unified-jira-update.js';

// Custom field management tools
export { 
  getCustomFieldMappingsToolDefinition, 
  getCustomFieldMappings 
} from './custom-field-management.js';
export { 
  getCustomFieldByNameToolDefinition, 
  getCustomFieldByName 
} from './custom-field-management.js';
export { 
  getCustomFieldByIdToolDefinition, 
  getCustomFieldById 
} from './custom-field-management.js';
export { 
  listCustomFieldsToolDefinition, 
  listCustomFields 
} from './custom-field-management.js';
export { 
  clearCustomFieldCacheToolDefinition, 
  clearCustomFieldCache 
} from './custom-field-management.js';





import { Tool } from '@modelcontextprotocol/sdk/types.js';

// Import all tool definitions
import { searchIssuesToolDefinition } from './jira-search.js';
import { getIssueToolDefinition } from './jira-issue.js';
import { summarizeJiraTicketToolDefinition } from './jira-summary.js';

import { addCommentToolDefinition } from './jira-comments.js';
import { getBitbucketRepositoriesToolDefinition } from './bitbucket-repositories.js';

import { getPullRequestsForIssueToolDefinition } from './pull-requests-search.js';
import { getPrDiffToolDefinition } from './pr-diff.js';
import { addBitbucketCommentToolDefinition } from './bitbucket-comments.js';
import { resetMcpServerCacheToolDefinition } from './cache-management.js';
import { enhancedJiraUpdateToolDefinition } from './unified-jira-update.js';

// Import custom field management tool definitions
import { getCustomFieldMappingsToolDefinition } from './custom-field-management.js';
import { getCustomFieldByNameToolDefinition } from './custom-field-management.js';
import { getCustomFieldByIdToolDefinition } from './custom-field-management.js';
import { listCustomFieldsToolDefinition } from './custom-field-management.js';
import { clearCustomFieldCacheToolDefinition } from './custom-field-management.js';





// Export all tool definitions as an array
export const tools: Tool[] = [
  searchIssuesToolDefinition,
  getIssueToolDefinition,
  summarizeJiraTicketToolDefinition,

  addCommentToolDefinition,
  getBitbucketRepositoriesToolDefinition,

  getPullRequestsForIssueToolDefinition,
  getPrDiffToolDefinition,
  addBitbucketCommentToolDefinition,
  resetMcpServerCacheToolDefinition,
  
  // Enhanced unified update function (replaces all other update functions)
  enhancedJiraUpdateToolDefinition,

  // Custom field management tools
  getCustomFieldMappingsToolDefinition,
  getCustomFieldByNameToolDefinition,
  getCustomFieldByIdToolDefinition,
  listCustomFieldsToolDefinition,
  clearCustomFieldCacheToolDefinition,

];
