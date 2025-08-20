import { getCacheStats, clearIssueCache, clearRepositoryCache } from '../utils/cache.js';
export const resetMcpServerCacheToolDefinition = {
    name: 'reset_mcp_server_cache',
    description: 'Reset MCP server cache - clear all caches and return statistics',
    inputSchema: {
        type: 'object',
        properties: {
            clearAll: {
                type: 'boolean',
                description: 'Clear all caches (default: true)',
                default: true,
            },
            clearIssueCache: {
                type: 'boolean',
                description: 'Clear issue cache (default: true)',
                default: true,
            },
            clearRepositoryCache: {
                type: 'boolean',
                description: 'Clear repository cache (default: true)',
                default: true,
            },
            issueKey: {
                type: 'string',
                description: 'Optional: Specific issue key to clear from cache (only if clearIssueCache is true)',
            },
            workspace: {
                type: 'string',
                description: 'Optional: Specific workspace to clear from cache (only if clearRepositoryCache is true)',
            },
        },
    },
};
export async function resetMcpServerCache(params) {
    const { clearAll = true, clearIssueCache: shouldClearIssueCache = true, clearRepositoryCache: shouldClearRepositoryCache = true, issueKey, workspace } = params;
    const results = {
        timestamp: new Date().toISOString(),
        actions: [],
        beforeStats: getCacheStats(),
        afterStats: null,
        cleared: {
            issueCache: false,
            repositoryCache: false
        }
    };
    // Clear issue cache if requested
    if (clearAll || shouldClearIssueCache) {
        if (issueKey) {
            clearIssueCache(issueKey);
            results.actions.push(`Cleared issue cache for key: ${issueKey}`);
            results.cleared.issueCache = true;
        }
        else {
            clearIssueCache();
            results.actions.push('Cleared entire issue cache');
            results.cleared.issueCache = true;
        }
    }
    // Clear repository cache if requested
    if (clearAll || shouldClearRepositoryCache) {
        if (workspace) {
            clearRepositoryCache(workspace);
            results.actions.push(`Cleared repository cache for workspace: ${workspace}`);
            results.cleared.repositoryCache = true;
        }
        else {
            clearRepositoryCache();
            results.actions.push('Cleared entire repository cache');
            results.cleared.repositoryCache = true;
        }
    }
    // Get stats after clearing
    results.afterStats = getCacheStats();
    return {
        message: 'MCP server cache reset completed successfully',
        results
    };
}
// Keep the old exports for backward compatibility if needed
export { getCacheStats, clearIssueCache, clearRepositoryCache };
//# sourceMappingURL=cache-management.js.map