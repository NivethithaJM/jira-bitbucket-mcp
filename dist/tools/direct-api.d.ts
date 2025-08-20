import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const getIssuePullRequestsDirectToolDefinition: Tool;
export declare function getIssuePullRequestsDirect(issueKey: string): Promise<{
    debug: {
        endpointUsed: string | undefined;
        issueKey: string;
        remoteId: string;
        rawDataStructure: {
            hasDetail: boolean;
            detailLength: any;
            sampleKeys: string[];
        };
    };
    table: {
        headers: string[];
        rows: any;
    };
}>;
//# sourceMappingURL=direct-api.d.ts.map