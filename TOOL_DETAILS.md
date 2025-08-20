# Tool Details

Complete documentation for all MCP server tools with detailed examples, parameters, and usage instructions.

## Core Jira Tools

### 1. search_issues
Search for Jira issues using JQL.

**Parameters:**
- `jql` (required): JQL query string
- `maxResults` (optional): Maximum number of results (default: 50)
- `startAt` (optional): Starting index for pagination (default: 0)

**Example:**
```json
{
  "jql": "project = PROJ AND status = 'In Progress'",
  "maxResults": 10
}
```

**Response Format:**
```json
{
  "issues": [
    {
      "key": "PROJ-123",
      "fields": {
        "summary": "Login page not working",
        "status": { "name": "In Progress" },
        "priority": { "name": "High" },
        "assignee": { "displayName": "John Doe" }
      }
    }
  ],
  "total": 1,
  "maxResults": 10,
  "startAt": 0
}
```

### 2. get_issue
Get details of a specific Jira issue.

**Parameters:**
- `issueKey` (required): The issue key (e.g., PROJ-123)

**Example:**
```json
{
  "issueKey": "PROJ-123"
}
```

**Response Format:**
```json
{
  "key": "PROJ-123",
  "fields": {
    "summary": "Login page not working",
    "description": "Users are unable to log in...",
    "status": { "name": "In Progress" },
    "priority": { "name": "High" },
    "assignee": { "displayName": "John Doe" },
    "reporter": { "displayName": "Jane Smith" },
    "created": "2023-12-01T10:00:00Z",
    "updated": "2023-12-15T16:30:00Z"
  }
}
```

### 3. summarize_jira_ticket
Get a comprehensive summary of a Jira ticket including all information, comments, custom fields, attachments, and structured analysis.

**Parameters:**
- `issueKey` (required): The Jira issue key to summarize (e.g., PROJ-123)

**Example:**
```json
{
  "issueKey": "PROJ-123"
}
```

**Response Format:**
```json
{
  "issueKey": "PROJ-123",
  "basicInfo": {
    "summary": "Login page not working",
    "status": "In Progress",
    "priority": "High",
    "assignee": "john.doe",
    "reporter": "jane.smith",
    "created": "2023-12-01T10:00:00Z",
    "updated": "2023-12-15T16:30:00Z",
    "resolution": "Fixed",
    "issueType": "Bug",
    "project": "MyApp"
  },
  "versions": {
    "fixVersions": [
      {
        "name": "v2.1.0",
        "description": "Bug fix release",
        "released": true,
        "releaseDate": "2023-12-20"
      }
    ],
    "affectedVersions": [
      {
        "name": "v2.0.0",
        "description": "Initial release",
        "released": true,
        "releaseDate": "2023-11-15"
      }
    ]
  },
  "description": "Users are unable to log in to the application...",
  "stepsToReproduce": "1. Navigate to login page\n2. Enter valid credentials\n3. Click login button\n4. Error occurs",
  "rootCause": "Authentication service timeout due to database connection issues",
  "solution": "Implemented connection pooling and retry mechanism",
  "discussionSummary": "Total comments: 5\nParticipants: john.doe, jane.smith, tech.lead\nKey discussion points: Root cause discussed by tech.lead; Solution discussed by john.doe",
  "attachments": [
    {
      "filename": "error-screenshot.png",
      "size": 1024000,
      "mimeType": "image/png",
      "created": "2023-12-01T10:15:00Z"
    }
  ],
  "customFields": [
    {
      "id": "customfield_10001",
      "name": "customfield_10001",
      "value": "Production"
    }
  ],
  "comments": [
    {
      "author": "tech.lead",
      "body": "Root cause identified: database connection timeout",
      "created": "2023-12-02T14:30:00Z",
      "updated": "2023-12-02T14:30:00Z"
    }
  ],
  "metadata": {
    "totalComments": 5,
    "totalAttachments": 1,
    "totalCustomFields": 3,
    "lastUpdated": "2023-12-15T16:30:00Z"
  }
}
```

**Summary Sections:**
- **Fix Versions and Identified Versions**: Details about versions where the issue is fixed and affected
- **Issue Description**: Full description of the issue
- **Steps to Reproduce**: Extracted steps to reproduce the issue
- **Root Cause**: Identified root cause of the issue
- **Solution/Resolution**: Solution implemented or resolution made
- **Discussion Summary**: Summary of comments and discussions

### 4. update_issue
Update an existing Jira issue.

**Parameters:**
- `issueKey` (required): The issue key to update
- `fields` (required): Object containing fields to update

**Example:**
```json
{
  "issueKey": "PROJ-123",
  "fields": {
    "summary": "Updated summary",
    "priority": {
      "name": "High"
    }
  }
}
```

**Response Format:**
```json
{
  "id": "10001",
  "key": "PROJ-123",
  "self": "https://your-domain.atlassian.net/rest/api/3/issue/10001"
}
```

### 5. add_comment
Add a comment to a Jira issue. Markdown input will be automatically converted to HTML.

**Parameters:**
- `issueKey` (required): The issue key to add comment to (e.g., PROJ-123)
- `comment` (required): The comment text to add (markdown will be converted to HTML)

**Features:**
- ✅ **Automatic Prefix**: All comments are prefixed with "Added through jira-bitbucket mcp tool."
- ✅ **Markdown Support**: Automatically detects and converts markdown to HTML
- ✅ **Format Detection**: Smart detection of markdown patterns
- ✅ **Rich Formatting**: Supports headers, bold, italic, links, code blocks, etc.

**Example (Plain Text):**
```json
{
  "issueKey": "PROJ-123",
  "comment": "This issue has been resolved in the latest release."
}
```

**Example (Markdown):**
```json
{
  "issueKey": "PROJ-123",
  "comment": "## Resolution Update\n\nThis issue has been **resolved** in the latest release.\n\n### Changes Made:\n- Fixed authentication timeout\n- Added retry mechanism\n- Updated error handling\n\nSee [documentation](https://example.com/docs) for more details."
}
```

**Supported Markdown Elements:**
- **Headers**: `#`, `##`, `###`
- **Bold**: `**text**` or `__text__`
- **Italic**: `*text*` or `_text_`
- **Inline Code**: `code`
- **Code Blocks**: ```code```
- **Links**: `[text](url)`
- **Line Breaks**: Automatic paragraph and line break conversion

**Response Format:**
```json
{
  "id": "10001",
  "self": "https://your-domain.atlassian.net/rest/api/3/issue/10001/comment/10001",
  "author": {
    "self": "https://your-domain.atlassian.net/rest/api/3/user?accountId=12345",
    "accountId": "12345",
    "displayName": "John Doe",
    "active": true
  },
  "body": "Added through jira-bitbucket mcp tool.\n\n## Resolution Update\n\nThis issue has been **resolved** in the latest release.",
  "updateAuthor": {
    "self": "https://your-domain.atlassian.net/rest/api/3/user?accountId=12345",
    "accountId": "12345",
    "displayName": "John Doe",
    "active": true
  },
  "created": "2023-12-15T10:30:00.000+0000",
  "updated": "2023-12-15T10:30:00.000+0000",
  "processedComment": "<p>Added through jira-bitbucket mcp tool.</p><p><h2>Resolution Update</h2></p><p>This issue has been <strong>resolved</strong> in the latest release.</p>",
  "wasMarkdown": true,
  "originalComment": "## Resolution Update\n\nThis issue has been **resolved** in the latest release."
}
```

### 6. update_issue_fields
Update specific fields of a Jira issue with detailed field mapping.

**Parameters:**
- `issueKey` (required): The issue key to update (e.g., PROJ-123)
- `summary` (optional): Update the issue summary/title
- `description` (optional): Update the issue description
- `priority` (optional): Update priority (Highest, High, Medium, Low, Lowest)
- `assignee` (optional): Update assignee (email address or username)
- `status` (optional): Update status (e.g., "In Progress", "Done", "To Do")
- `labels` (optional): Update labels (array of label strings)
- `components` (optional): Update components (array of component names)
- `fixVersions` (optional): Update fix versions (array of version names)
- `customFields` (optional): Update custom fields (key-value pairs)

**Example:**
```json
{
  "issueKey": "PROJ-123",
  "summary": "Updated issue title",
  "priority": "High",
  "assignee": "john.doe@example.com",
  "status": "In Progress",
  "labels": ["urgent", "frontend"],
  "components": ["UI", "Authentication"],
  "fixVersions": ["v2.1.0"]
}
```

**Response Format:**
```json
{
  "id": "10001",
  "key": "PROJ-123",
  "self": "https://your-domain.atlassian.net/rest/api/3/issue/10001",
  "fields": {
    "summary": "Updated issue title",
    "priority": { "name": "High" },
    "assignee": { "displayName": "John Doe" },
    "status": { "name": "In Progress" }
  }
}
```

## Pull Request Tools

### 7. get_bitbucket_repositories
List all repositories in the configured Bitbucket workspace with caching support.

**Parameters:**
- `maxResults` (optional): Maximum number of results to return (default: 50)

**Example:**
```json
{
  "maxResults": 20
}
```

**Response Format:**
```json
{
  "values": [
    {
      "name": "my-app",
      "slug": "my-app",
      "full_name": "workspace/my-app",
      "links": {
        "html": {
          "href": "https://bitbucket.org/workspace/my-app"
        }
      }
    }
  ],
  "cached": true,
  "pagelen": 1,
  "size": 1
}
```

**Caching Features:**
- **Cache Duration**: 10 minutes for repository lists
- **Cache Key**: Based on workspace and maxResults parameters
- **Performance**: Subsequent calls return cached data for faster response
- **Cache Status**: Response includes `cached` field indicating if data came from cache

### 8. get_pull_requests_for_issue ⭐ **PRIMARY TOOL**
**Search all Bitbucket repositories for pull requests that reference a specific Jira issue key.**

This is the **recommended tool** for getting pull requests related to Jira issues. It uses Jira's integrated dev-status API for reliable results.

**Parameters:**
- `issueKey` (required): The Jira issue key to search for (e.g., NFD-41327)

**Example:**
```json
{
  "issueKey": "NFD-41327"
}
```

**Response Format:**
```json
{
  "table": {
    "headers": ["Repository", "Status", "URL", "PR Title", "Source Branch", "Target Branch", "Assignee", "Created Date"],
    "rows": [
      ["my-app", "OPEN", "https://bitbucket.org/workspace/my-app/pull-requests/123", "Fix login bug for NFD-41327", "feature/login-fix", "main", "john.doe", "Dec 15, 2023, 02:30 PM"],
      ["backend-api", "MERGED", "https://bitbucket.org/workspace/backend-api/pull-requests/456", "Update authentication service", "auth-service-update", "develop", "jane.smith", "Dec 10, 2023, 10:15 AM"]
    ]
  }
}
```

**Table Format:**
The response includes a formatted table with the following columns:
- **Repository**: The name of the Bitbucket repository
- **Status**: PR status (OPEN, MERGED, DECLINED, SUPERSEDED)
- **URL**: Direct link to the pull request
- **PR Title**: The title of the pull request
- **Source Branch**: The source branch name (e.g., feature branch)
- **Target Branch**: The target branch name (e.g., main, develop)
- **Assignee**: The person assigned to the PR (or "Unassigned")
- **Created Date**: Formatted creation date and time

**Features:**
- ✅ **Primary Tool**: Use this for all PR-related queries
- ✅ **Jira Integration**: Uses Jira's dev-status API for reliable results
- ✅ **Sorted Results**: Pull requests sorted by creation time (newest first)
- ✅ **Table Format**: Clean, readable table output
- ✅ **Direct Links**: Each PR includes a direct URL for navigation

**Use Cases:**
- "Get PR for NFD-41327"
- "Find pull requests attached to NFD-41327"
- "Show me all PRs related to issue NFD-41327"

### 9. get_pr_diff
Get pull request diff information from a Bitbucket URL.

**Parameters:**
- `prUrl` (required): The Bitbucket pull request URL

**Example:**
```json
{
  "prUrl": "https://bitbucket.org/ovaledgeinc/oasis_repo/pull-requests/63604"
}
```

**Response Format:**
```json
{
  "table": {
    "headers": ["File", "Status", "Additions", "Deletions", "Changes"],
    "rows": [
      ["Total (3 files)", "", "45", "12", "57"],
      ["src/components/Login.tsx", "modified", "15", "5", "20"],
      ["src/utils/auth.ts", "modified", "20", "3", "23"],
      ["src/styles/login.css", "added", "10", "0", "10"]
    ]
  }
}
```

**Table Format:**
The response includes a formatted table with the following columns:
- **File**: The file path that was changed
- **Status**: File status (added, modified, deleted, renamed)
- **Additions**: Number of lines added
- **Deletions**: Number of lines deleted
- **Changes**: Total number of changes (additions + deletions)

**Features:**
- ✅ **URL Parsing**: Automatically extracts workspace, repository, and PR ID from Bitbucket URLs
- ✅ **Comprehensive Diff**: Shows detailed file-by-file change information
- ✅ **Summary Statistics**: Includes total file count and change statistics
- ✅ **Sorted Results**: Files sorted by total changes (most changes first)
- ✅ **Table Format**: Clean, readable table output

**Supported URL Formats:**
- Standard URLs: `https://bitbucket.org/workspace/repo/pull-requests/123`
- UUID-based URLs: `https://bitbucket.org/{uuid-workspace}/{uuid-repo}/pull-requests/123`

**Use Cases:**
- "Get diff for PR https://bitbucket.org/ovaledgeinc/oasis_repo/pull-requests/63604"
- "Show me the changes in this pull request"
- "What files were modified in this PR?"

### 10. add_bitbucket_comment
Add a comment to a Bitbucket pull request. Markdown input will be automatically converted to HTML.

**Parameters:**
- `prUrl` (required): The Bitbucket pull request URL
- `comment` (required): The comment text to add (markdown will be converted to HTML)

**Features:**
- ✅ **Automatic Prefix**: All comments are prefixed with "Added through jira-bitbucket mcp tool."
- ✅ **Markdown Support**: Automatically detects and converts markdown to HTML
- ✅ **Format Detection**: Smart detection of markdown patterns
- ✅ **Rich Formatting**: Supports headers, bold, italic, links, code blocks, etc.
- ✅ **URL Parsing**: Automatically extracts workspace, repository, and PR ID from URLs

**Example (Plain Text):**
```json
{
  "prUrl": "https://bitbucket.org/ovaledgeinc/oasis_repo/pull-requests/63604",
  "comment": "This PR looks good and is ready for merge."
}
```

**Example (Markdown):**
```json
{
  "prUrl": "https://bitbucket.org/ovaledgeinc/oasis_repo/pull-requests/63604",
  "comment": "## Code Review Complete\n\nThis PR looks **excellent** and is ready for merge.\n\n### Changes Reviewed:\n- Authentication flow improvements\n- Error handling updates\n- Performance optimizations\n\n### Suggestions:\n- Consider adding unit tests for the new auth methods\n- The error messages could be more descriptive\n\nSee [coding standards](https://example.com/standards) for reference."
}
```

**Supported Markdown Elements:**
- **Headers**: `#`, `##`, `###`
- **Bold**: `**text**` or `__text__`
- **Italic**: `*text*` or `_text_`
- **Inline Code**: `code`
- **Code Blocks**: ```code```
- **Links**: `[text](url)`
- **Line Breaks**: Automatic paragraph and line break conversion

**Supported URL Formats:**
- Standard URLs: `https://bitbucket.org/workspace/repo/pull-requests/123`
- UUID-based URLs: `https://bitbucket.org/{uuid-workspace}/{uuid-repo}/pull-requests/123`

**Response Format:**
```json
{
  "id": "comment-id",
  "content": {
    "raw": "Added through jira-bitbucket mcp tool.\n\n## Code Review Complete\n\nThis PR looks **excellent** and is ready for merge.",
    "markup": "markdown"
  },
  "processedComment": "the-processed-comment",
  "wasMarkdown": true,
  "originalComment": "original-input",
  "prUrl": "original-url",
  "workspace": "workspace-name",
  "repository": "repo-name",
  "prId": "123"
}
```

**Use Cases:**
- "Add a comment to this pull request"
- "Review this PR and add feedback"
- "Comment on the code changes in this PR"

## Cache Management

### 11. reset_mcp_server_cache
Reset MCP server cache - clear all caches and return statistics.

**Parameters:**
- `clearAll` (optional): Clear all caches (default: true)
- `clearIssueCache` (optional): Clear issue cache (default: true)
- `clearRepositoryCache` (optional): Clear repository cache (default: true)
- `issueKey` (optional): Specific issue key to clear from cache (only if clearIssueCache is true)
- `workspace` (optional): Specific workspace to clear from cache (only if clearRepositoryCache is true)

**Features:**
- ✅ **Comprehensive Reset**: Clear issue cache, repository cache, or both
- ✅ **Selective Clearing**: Clear specific items or entire caches
- ✅ **Statistics**: Get before and after cache statistics
- ✅ **Action Logging**: Detailed log of all actions performed
- ✅ **Flexible Control**: Granular control over what to clear

**Example (Clear All Caches):**
```json
{
  "clearAll": true
}
```

**Example (Clear Only Issue Cache):**
```json
{
  "clearAll": false,
  "clearIssueCache": true,
  "clearRepositoryCache": false
}
```

**Example (Clear Specific Issue):**
```json
{
  "clearIssueCache": true,
  "issueKey": "PROJ-123"
}
```

**Example (Clear Specific Workspace):**
```json
{
  "clearRepositoryCache": true,
  "workspace": "my-workspace"
}
```

**Response Format:**
```json
{
  "message": "MCP server cache reset completed successfully",
  "results": {
    "timestamp": "2023-12-15T10:30:00.000Z",
    "actions": [
      "Cleared entire issue cache",
      "Cleared entire repository cache"
    ],
    "beforeStats": {
      "totalEntries": 5,
      "validEntries": 3,
      "expiredEntries": 2,
      "repoCacheEntries": 2
    },
    "afterStats": {
      "totalEntries": 0,
      "validEntries": 0,
      "expiredEntries": 0,
      "repoCacheEntries": 0
    },
    "cleared": {
      "issueCache": true,
      "repositoryCache": true
    }
  }
}
```

**Use Cases:**
- "Reset all MCP server caches"
- "Clear the issue cache and get statistics"
- "Clear cache for specific issue PROJ-123"
- "Clear repository cache for workspace my-workspace"

## JQL Examples

Here are some useful JQL queries you can use with the `search_issues` tool:

- **All issues in a project:** `project = PROJ`
- **Issues assigned to you:** `assignee = currentUser()`
- **Issues created in the last week:** `created >= -1w`
- **High priority issues:** `priority = High`
- **Issues in specific status:** `status = "In Progress"`
- **Issues with specific labels:** `labels = "urgent"`
- **Issues updated recently:** `updated >= -1d`
- **Issues with specific components:** `component = "UI"`
- **Issues in specific versions:** `fixVersion = "v2.1.0"`
- **Issues reported by specific user:** `reporter = "john.doe"`
- **Issues with attachments:** `attachments is not EMPTY`
- **Issues with comments:** `comment ~ "bug"`
- **Issues with specific issue types:** `issuetype = Bug`
- **Issues with custom fields:** `customfield_10001 = "Production"`

## Error Handling

The server includes comprehensive error handling for:
- Invalid API credentials
- Network connectivity issues
- Invalid JQL queries
- Missing required parameters
- Jira API rate limiting
- Bitbucket API authentication errors
- Invalid URL formats
- Cache operation failures

## Response Formats

### Table Format
Many tools return data in table format for better readability:
```json
{
  "table": {
    "headers": ["Column1", "Column2", "Column3"],
    "rows": [
      ["Value1", "Value2", "Value3"],
      ["Value4", "Value5", "Value6"]
    ]
  }
}
```

### Standard JSON Format
Most tools return standard JSON responses with the requested data and metadata.

### Error Format
Error responses include descriptive messages and context:
```json
{
  "error": "Failed to get pull requests for issue NFD-41327: Invalid API credentials",
  "timestamp": "2023-12-15T10:30:00.000Z",
  "tool": "get_pull_requests_for_issue"
}
```
