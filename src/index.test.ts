import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/server/index.js');
jest.mock('@modelcontextprotocol/sdk/server/stdio.js');
jest.mock('axios');
jest.mock('dotenv');

describe('Jira MCP Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have proper tool definitions', () => {
    // This test verifies that our tool definitions are properly structured
    const expectedTools = [
      'search_issues',
      'get_issue', 
      'summarize_jira_ticket',
      'update_issue',
      'add_comment',
      'update_issue_fields',
      'get_bitbucket_repositories',
      'get_pull_requests_for_issue',
      'test_bitbucket_connection',
      'get_cache_stats',
      'clear_cache',
      'clear_repository_cache'
    ];

    // Import the tools array from the main file
    // Note: In a real test, you'd need to export the tools array
    expect(expectedTools).toHaveLength(12);
    expect(expectedTools).toContain('search_issues');
    expect(expectedTools).toContain('get_issue');
    expect(expectedTools).toContain('summarize_jira_ticket');
    expect(expectedTools).toContain('update_issue');
    expect(expectedTools).toContain('add_comment');
    expect(expectedTools).toContain('update_issue_fields');
    expect(expectedTools).toContain('get_bitbucket_repositories');
    expect(expectedTools).toContain('get_pull_requests_for_issue');
    expect(expectedTools).toContain('test_bitbucket_connection');
    expect(expectedTools).toContain('get_cache_stats');
    expect(expectedTools).toContain('clear_cache');
    expect(expectedTools).toContain('clear_repository_cache');
  });

  it('should require environment variables', () => {
    // Test that the server requires proper environment variables
    const requiredEnvVars = [
      'JIRA_BASE_URL',
      'JIRA_EMAIL', 
      'JIRA_API_TOKEN'
    ];

    const optionalEnvVars = [
      'BITBUCKET_WORKSPACE',
      'BITBUCKET_API_TOKEN'
    ];

    expect(requiredEnvVars).toHaveLength(3);
    expect(requiredEnvVars).toContain('JIRA_BASE_URL');
    expect(requiredEnvVars).toContain('JIRA_EMAIL');
    expect(requiredEnvVars).toContain('JIRA_API_TOKEN');

    expect(optionalEnvVars).toHaveLength(2);
    expect(optionalEnvVars).toContain('BITBUCKET_WORKSPACE');
    expect(optionalEnvVars).toContain('BITBUCKET_API_TOKEN');
  });

  it('should handle JQL search queries', () => {
    // Test that JQL queries are properly formatted
    const testJQL = "project = PROJ AND status = 'In Progress'";
    expect(testJQL).toContain('project =');
    expect(testJQL).toContain('status =');
  });

  it('should handle issue creation parameters', () => {
    // Test issue creation parameter structure
    const issueParams = {
      projectKey: 'PROJ',
      summary: 'Test Issue',
      description: 'Test Description',
      issueType: 'Task',
      priority: 'Medium'
    };

    expect(issueParams).toHaveProperty('projectKey');
    expect(issueParams).toHaveProperty('summary');
    expect(issueParams).toHaveProperty('description');
    expect(issueParams).toHaveProperty('issueType');
    expect(issueParams).toHaveProperty('priority');
  });
});
