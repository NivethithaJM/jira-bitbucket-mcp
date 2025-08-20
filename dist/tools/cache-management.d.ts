import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCacheStats, clearIssueCache, clearRepositoryCache } from '../utils/cache.js';
export declare const resetMcpServerCacheToolDefinition: Tool;
export declare function resetMcpServerCache(params: {
    clearAll?: boolean;
    clearIssueCache?: boolean;
    clearRepositoryCache?: boolean;
    issueKey?: string;
    workspace?: string;
}): Promise<{
    message: string;
    results: {
        timestamp: string;
        actions: string[];
        beforeStats: import("../types/index.js").CacheStats;
        afterStats: any;
        cleared: {
            issueCache: boolean;
            repositoryCache: boolean;
        };
    };
}>;
export { getCacheStats, clearIssueCache, clearRepositoryCache };
//# sourceMappingURL=cache-management.d.ts.map