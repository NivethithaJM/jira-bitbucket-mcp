# Jira MCP Server

A Model Context Protocol (MCP) server that provides tools for interacting with Jira Cloud REST API and Bitbucket repositories.

> **✨ Recently Updated**: Simplified tool architecture by prioritizing `get_pull_requests_for_issue` as the primary tool for PR queries and removing redundant Bitbucket API-based tools to improve reliability and reduce authentication issues.

## Features

- Search Jira issues using JQL (Jira Query Language)
- Get detailed information about specific issues
- **🚀 Enhanced Unified Issue Updates** with comprehensive field type support
- Add comments to issues (with automatic markdown-to-HTML conversion)
- Add comments to Bitbucket pull requests (with markdown support)
- **⭐ Get pull requests for Jira issues** (Primary tool: `get_pull_requests_for_issue`)
- List Bitbucket repositories with caching
- Comprehensive Jira ticket summarization
- Cache management for performance optimization

## Prerequisites

- Node.js 18+ 
- A Jira Cloud instance
- Jira API token

## Setup

### 🚀 One-Click Installation

**For macOS/Linux:**
```bash
git clone https://github.com/NivethithaJM/jira-bitbucket-mcp.git
cd jira-bitbucket-mcp
chmod +x install.sh
./install.sh
```

**For Windows:**
```cmd
git clone https://github.com/NivethithaJM/jira-bitbucket-mcp.git
cd jira-bitbucket-mcp
install.bat
```

**Note**: The installation scripts will generate the MCP configuration and display it in the console. You'll need to copy and paste this configuration into your `mcp.json` file at your desired location.

### 🔄 Updating the MCP Server

To update the MCP server to the latest version:

```bash
./update_and_restart.sh
```

This script will:
- Pull the latest changes from git
- Install any new dependencies
- Rebuild the project
- Stop any running MCP servers
- Ask you to restart your IDE (MCP server will start automatically)

### 📋 Manual Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NivethithaJM/jira-bitbucket-mcp.git
   cd jira-bitbucket-mcp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate API Tokens:**
   - Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
   - **For Jira**: Click "Create API token"
     - Name: "Jira MCP Server"
     - Expires: 1 year
     - App: Jira
     - Scopes: All scopes except delete actions
     - Generate and copy the token as `JIRA_API_TOKEN`
   - **For Bitbucket**: Click "Create API token" again
     - Name: "Bitbucket MCP Server"
     - Expires: 1 year  
     - App: Bitbucket
     - Scopes: All scopes except delete actions
     - Generate and copy the token as `BITBUCKET_API_TOKEN`

4. **Build the project:**
   ```bash
   npm run build
   ```

## 🔄 Updating the MCP Server

To update to the latest version and restart the server:

```bash
./update_and_restart.sh
```

This script will automatically:
- ✅ Pull the latest changes from git
- ✅ Install any new dependencies  
- ✅ Rebuild the project
- ✅ Stop any running MCP servers
- ✅ Display update information
- ✅ Prompt you to restart your IDE (MCP server will start automatically)

**Note**: The script will handle uncommitted changes by offering to stash them before updating.

## MCP Server Configuration

### What is MCP?

The Model Context Protocol (MCP) is a standard for connecting AI assistants to external data sources and tools. This Jira MCP server allows AI assistants to interact with your Jira instance through a standardized interface.

### Configuration Files

#### 1. Environment Variables

Environment variables are configured directly in the MCP configuration within Cursor IDE. No separate `.env` file is needed.

**Required Environment Variables:**
- `JIRA_BASE_URL` - Your Jira Cloud instance URL
- `JIRA_EMAIL` - Your Jira Cloud email address  
- `JIRA_API_TOKEN` - Your Jira Cloud API token
- `BITBUCKET_WORKSPACE` - Your Bitbucket workspace name
- `BITBUCKET_API_TOKEN` - Your Bitbucket API token

#### 2. MCP Configuration File

Run the installation script to generate the configuration, or manually create an `mcp.json` file in your project root or user directory:

```json
{
  "mcpServers": {
    "jira-bitbucket-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/your/mcp/dist/index.js"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-jira-api-token",
        "BITBUCKET_WORKSPACE": "your-workspace-name",
        "BITBUCKET_API_TOKEN": "your-bitbucket-api-token"
      }
    }
  }
}
```

**File Locations:**
- **Project-specific:** Place `mcp.json` in your project root directory
- **Global:** Place `mcp.json` in your home directory (`~/.mcp.json` on Unix systems)

### Configuration Steps

1. **Build the MCP Server:**
   ```bash
   npm run build
   ```

2. **Get the Absolute Path:**
   ```bash
   # On macOS/Linux
   pwd
   # Copy the full path to your project directory
   ```

3. **Create MCP Configuration:**
   - Create `mcp.json` file in your project root or home directory
   - Replace `/absolute/path/to/your/mcp` with your actual project path
   - Add your Jira credentials in the `env` section

4. **Restart Cursor IDE:**
   - Close Cursor IDE completely
   - Reopen Cursor IDE
   - The Jira MCP server will be available in your AI assistant

5. **Test the Connection:**
   - Open a chat with your AI assistant in Cursor
   - Try asking: "Search for Jira issues in project PROJ"
   - The assistant should be able to use the Jira and Bitbucket tools

### Security Considerations

- **API Token Security:** Never commit your Jira API token to version control
- **Environment Variables:** Environment variables are securely stored in the `mcp.json` configuration file
- **Configuration Security:** Keep your `mcp.json` file secure and don't commit it to version control
- **Network Security:** Use HTTPS for Jira API communication (already configured)





## Available Tools

### ⭐ Tool Prioritization

**For Pull Request Queries:**
- **Primary Tool**: `get_pull_requests_for_issue` - Use this for all PR-related queries
- **Why**: Uses Jira's integrated dev-status API, more reliable, better error handling

**For Issue Updates:**
- **Primary Tool**: `enhanced_jira_update` - Use this for all issue updates
- **Why**: Comprehensive field type support, intelligent formatting, smart field detection

**For Issue Management:**
- **Primary Tool**: `get_issue` - Get basic issue details
- **Advanced**: `summarize_jira_ticket` - Get comprehensive analysis with comments, custom fields, etc.

### 📋 Complete Tool List

**Core Jira Tools:**
1. `search_issues` - Search issues using JQL
2. `get_issue` - Get detailed issue information
3. `summarize_jira_ticket` - Comprehensive ticket analysis
4. `add_comment` - Add comments to issues (with markdown support)

**Enhanced Update Function:**
5. `enhanced_jira_update` - ⭐ **PRIMARY: Comprehensive update function with field type support**

**Pull Request Tools:**
6. `get_bitbucket_repositories` - List Bitbucket repositories (with caching)
7. `get_pull_requests_for_issue` - ⭐ **PRIMARY: Get PRs for Jira issues**
8. `get_pr_diff` - Get PR diff information from Bitbucket URL
9. `add_bitbucket_comment` - Add comments to Bitbucket pull requests

**Cache Management:**
10. `reset_mcp_server_cache` - Reset MCP server cache (clear all caches and get statistics)

**Custom Field Management:**
11. `get_custom_field_mappings` - Get all custom field mappings with caching
12. `get_custom_field_by_name` - Find a custom field by name (case-insensitive search)
13. `get_custom_field_by_id` - Get custom field information by its ID
14. `list_custom_fields` - List all custom fields with their names and types
15. `clear_custom_field_cache` - Clear the custom field mapping cache

**Connection Testing:**
16. `test_bitbucket_connection` - Test Bitbucket API connection and list repositories

**Total Tools: 16**

## Enhanced Jira Update Function

The `enhanced_jira_update` function provides comprehensive field type support for updating Jira issues with intelligent formatting and validation.

### Key Features:
- **Universal Field Support**: Handles all Jira field types automatically
- **Intelligent Formatting**: Applies correct API format for each field type
- **Smart Field Detection**: Identifies field types from Jira metadata
- **Dropdown Validation**: Validates dropdown values against available options
- **Non-Custom Field Handling**: Automatically converts non-custom fields to comments
- **Dry Run Support**: Test field formatting without making changes
- **Partial Updates**: Continue with valid fields even if some fail

### Usage Examples:

```json
{
  "issueKey": "NFD-38469",
  "summary": "Updated summary",
  "priority": "High",
  "customFields": {
    "customfield_10405": "N/A"
  },
  "customFieldsByName": {
    "DEV - Has Impact & Change been Unit tested?": "N/A"
  },
  "validateDropdowns": true,
  "addComment": true,
  "dryRun": false
}
```

### Parameters:
- `issueKey` (required): The Jira issue key
- `summary`, `description`, `priority`, `assignee`, `status`, `labels`, `components`, `fixVersions` (optional): Direct standard field parameters
- `fields` (optional): Legacy standard Jira fields object
- `customFields` (optional): Custom fields by field ID
- `customFieldsByName` (optional): Custom fields by field name (automatically resolved to IDs)
- `validateDropdowns` (optional, default: true): Validate dropdown values
- `addComment` (optional, default: true): Add documentation comment
- `dryRun` (optional, default: false): Test formatting without making updates
- `allowPartialUpdates` (optional, default: false): Continue with valid fields if some fail

📖 **For comprehensive implementation details and field type mappings, see [COMPREHENSIVE_FIELD_TYPE_SUPPORT.md](COMPREHENSIVE_FIELD_TYPE_SUPPORT.md)**

## Enhanced Custom Field Cache

The custom field cache now includes comprehensive information:

### Cache Information Includes:
- **Field Name**: Human-readable field name
- **Field ID**: Technical field identifier (e.g., customfield_10405)
- **Field Type**: Technical field type information
- **Dropdown Detection**: Automatically identifies dropdown fields
- **Dropdown Options**: For dropdown fields, stores all available options with IDs and values
- **Multi-value Support**: Identifies fields that support multiple values

### Dropdown Field Support

The server now includes specialized support for dropdown custom fields with:

- **Automatic option discovery** - Gets available dropdown options from Jira
- **Value validation** - Validates values against available options before updating
- **Error handling** - Comprehensive error messages for invalid values
- **Field metadata** - Detailed field information including type and properties

### Quick Example

```javascript
// Get dropdown options
const options = await getDropdownFieldOptions("customfield_10405");

// Validate a value
const validation = await validateDropdownValue("customfield_10405", "N/A");

// Update the field
const result = await updateDropdownField("NFD-38469", "customfield_10405", "N/A");
```

For detailed documentation, see **[Dropdown Field Support](./DROPDOWN_FIELD_SUPPORT.md)**.

## Documentation

For detailed information about tool implementations and usage examples, see:

- **[Tool Details](./TOOL_DETAILS.md)** - Complete tool documentation with examples and parameters
- **[Implementation Guidelines](./IMPLEMENTATION_GUIDELINES.md)** - Development and implementation details

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

#### Common Issues:

1. **"Command not found" error:**
   - Ensure Node.js is installed and in your PATH
   - Verify the path to `dist/index.js` is correct

2. **"Missing environment variables" error:**
   - Check that all required environment variables are set in the `mcp.json` configuration
   - Verify the `mcp.json` file exists and is properly formatted

3. **"Authentication failed" error:**
   - Verify your Jira API token is correct
   - Ensure your email address matches your Jira account
   - Check that your Jira instance URL is correct

4. **"Permission denied" error:**
   - Ensure the `dist/index.js` file has execute permissions
   - Check file ownership and permissions

#### Debug Mode:

To run the MCP server in debug mode:

```bash
DEBUG=* npm run dev
```

This will show detailed logs about the MCP server's operation.
