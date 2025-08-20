import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const getPrDiffToolDefinition: Tool;
export declare function getPrDiff(prUrl: string): Promise<{
    table: {
        headers: string[];
        rows: string[][];
    };
    summary?: undefined;
} | {
    table: {
        headers: string[];
        rows: any[][];
    };
    summary: {
        prUrl: string;
        workspace: string;
        repository: string;
        prId: string;
        totalFiles: number;
        totalAdditions: any;
        totalDeletions: any;
        totalChanges: any;
    };
}>;
//# sourceMappingURL=pr-diff.d.ts.map