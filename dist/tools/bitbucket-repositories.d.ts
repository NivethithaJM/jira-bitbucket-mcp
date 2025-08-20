import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const getBitbucketRepositoriesToolDefinition: Tool;
export declare function getBitbucketRepositories(maxResults?: number): Promise<{
    values: {
        name: string;
        slug: string;
        full_name: string;
        links?: {
            html?: {
                href: string;
            };
        };
    }[];
    cached: boolean;
    pagelen: number;
    size: number;
}>;
//# sourceMappingURL=bitbucket-repositories.d.ts.map