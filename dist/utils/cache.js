import { jiraClient, bitbucketClient, BITBUCKET_WORKSPACE } from './clients.js';
// Cache for issue key to remote ID mapping
const issueCache = new Map();
// Cache for Bitbucket repositories
const repositoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const REPO_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for repositories
// Function to get issue remote ID with caching
export async function getIssueRemoteId(issueKey) {
    const now = Date.now();
    // Check cache first
    const cached = issueCache.get(issueKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
        console.log(`Cache hit for issue ${issueKey}: ${cached.remoteId}`);
        return {
            remoteId: cached.remoteId,
            summary: cached.summary,
            cached: true
        };
    }
    // Cache miss or expired - fetch from API
    console.log(`Cache miss for issue ${issueKey}, fetching from API`);
    try {
        const issueResponse = await jiraClient.get(`/rest/api/3/issue/${issueKey}`);
        const issue = issueResponse.data;
        const cacheEntry = {
            remoteId: issue.id,
            summary: issue.fields?.summary || '',
            timestamp: now
        };
        // Store in cache
        issueCache.set(issueKey, cacheEntry);
        console.log(`Cached issue ${issueKey} with remote ID: ${issue.id}`);
        return {
            remoteId: issue.id,
            summary: issue.fields?.summary || '',
            cached: false
        };
    }
    catch (error) {
        throw new Error(`Failed to get issue details for ${issueKey}: ${error}`);
    }
}
// Function to clear cache (optional utility)
export function clearIssueCache(issueKey) {
    if (issueKey) {
        issueCache.delete(issueKey);
        console.log(`Cleared cache for issue ${issueKey}`);
    }
    else {
        issueCache.clear();
        console.log('Cleared entire issue cache');
    }
}
// Function to get Bitbucket repositories with caching
export async function getBitbucketRepositoriesCached(maxResults = 50) {
    const now = Date.now();
    const cacheKey = `repos_${BITBUCKET_WORKSPACE}_${maxResults}`;
    // Check cache first
    const cached = repositoryCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < REPO_CACHE_TTL) {
        console.log(`Repository cache hit for workspace ${BITBUCKET_WORKSPACE}: ${cached.repositories.length} repositories`);
        return {
            repositories: cached.repositories,
            cached: true
        };
    }
    // Cache miss or expired - fetch from API
    console.log(`Repository cache miss for workspace ${BITBUCKET_WORKSPACE}, fetching from API`);
    if (!bitbucketClient) {
        throw new Error('Bitbucket is not configured. Please set BITBUCKET_WORKSPACE and BITBUCKET_API_KEY.');
    }
    try {
        const response = await bitbucketClient.get(`/repositories/${BITBUCKET_WORKSPACE}`, {
            params: {
                pagelen: maxResults,
                fields: 'values.name,values.slug,values.full_name,values.links.html.href'
            }
        });
        const repositories = response.data.values || [];
        const cacheEntry = {
            repositories: repositories.map((repo) => ({
                name: repo.name,
                slug: repo.slug,
                full_name: repo.full_name,
                links: repo.links
            })),
            timestamp: now
        };
        // Store in cache
        repositoryCache.set(cacheKey, cacheEntry);
        console.log(`Cached ${repositories.length} repositories for workspace ${BITBUCKET_WORKSPACE}`);
        return {
            repositories: cacheEntry.repositories,
            cached: false
        };
    }
    catch (error) {
        throw new Error(`Failed to get Bitbucket repositories for workspace ${BITBUCKET_WORKSPACE}: ${error}`);
    }
}
// Function to clear repository cache
export function clearRepositoryCache(workspace) {
    if (workspace) {
        // Clear cache for specific workspace
        const keysToDelete = Array.from(repositoryCache.keys()).filter(key => key.includes(workspace));
        keysToDelete.forEach(key => repositoryCache.delete(key));
        console.log(`Cleared repository cache for workspace ${workspace}`);
    }
    else {
        repositoryCache.clear();
        console.log('Cleared entire repository cache');
    }
}
// Function to get cache stats
export function getCacheStats() {
    const now = Date.now();
    const issueEntries = Array.from(issueCache.entries());
    const validIssueEntries = issueEntries.filter(([_, cache]) => (now - cache.timestamp) < CACHE_TTL);
    const repoEntries = Array.from(repositoryCache.entries());
    const validRepoEntries = repoEntries.filter(([_, cache]) => (now - cache.timestamp) < REPO_CACHE_TTL);
    return {
        totalEntries: issueCache.size,
        validEntries: validIssueEntries.length,
        expiredEntries: issueCache.size - validIssueEntries.length,
        cacheTTL: CACHE_TTL,
        repoCacheEntries: repositoryCache.size,
        repoCacheValidEntries: validRepoEntries.length,
        entries: issueEntries.map(([key, cache]) => ({
            issueKey: key,
            remoteId: cache.remoteId,
            summary: cache.summary,
            age: now - cache.timestamp,
            expired: (now - cache.timestamp) >= CACHE_TTL
        }))
    };
}
//# sourceMappingURL=cache.js.map