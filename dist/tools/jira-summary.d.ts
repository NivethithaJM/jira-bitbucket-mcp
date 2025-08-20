import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const summarizeJiraTicketToolDefinition: Tool;
interface CustomField {
    id: string;
    name: string;
    value: any;
}
export declare function summarizeJiraTicket(issueKey: string): Promise<{
    issueKey: string;
    basicInfo: {
        summary: any;
        status: any;
        priority: any;
        assignee: any;
        reporter: any;
        created: any;
        updated: any;
        resolution: any;
        issueType: any;
        project: any;
    };
    versions: {
        fixVersions: any;
        affectedVersions: any;
    };
    description: string;
    stepsToReproduce: string;
    rootCause: string;
    solution: string;
    discussionSummary: string;
    attachments: {
        filename: string;
        size: number;
        mimeType: string;
        created: string;
    }[];
    customFields: CustomField[];
    comments: {
        author: string;
        body: string;
        created: string;
        updated: string;
    }[];
    metadata: {
        totalComments: number;
        totalAttachments: number;
        totalCustomFields: number;
        lastUpdated: any;
    };
}>;
export {};
//# sourceMappingURL=jira-summary.d.ts.map