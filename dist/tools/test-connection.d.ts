import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const testBitbucketConnectionToolDefinition: Tool;
export declare function testBitbucketConnection(maxResults?: number): Promise<{
    status: string;
    workspace: string | undefined;
    repositoriesFound: number;
    repositories: {
        name: string;
        slug: string;
        full_name: string;
        links?: {
            html?: {
                href: string;
            };
        };
    }[];
    configuration: {
        workspace: string | undefined;
        apiKeyConfigured: boolean;
        apiKeyLength: number;
    };
    error?: undefined;
} | {
    status: string;
    workspace: string | undefined;
    error: string;
    configuration: {
        workspace: string | undefined;
        apiKeyConfigured: boolean;
        apiKeyLength: number;
    };
    repositoriesFound?: undefined;
    repositories?: undefined;
}>;
//# sourceMappingURL=test-connection.d.ts.map