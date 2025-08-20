import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const getPullRequestsForIssueToolDefinition: Tool;
export declare function getPullRequestsForIssue(issueKey: string): Promise<{
    table: {
        headers: string[];
        rows: any[][];
    };
}>;
//# sourceMappingURL=pull-requests-search.d.ts.map