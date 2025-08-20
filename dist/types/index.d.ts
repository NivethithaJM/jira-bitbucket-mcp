export interface IssueCache {
    remoteId: string;
    summary: string;
    timestamp: number;
}
export interface IssueRemoteIdResponse {
    remoteId: string;
    summary: string;
    cached: boolean;
}
export interface RepositoryCache {
    repositories: Array<{
        name: string;
        slug: string;
        full_name: string;
        links?: {
            html?: {
                href: string;
            };
        };
    }>;
    timestamp: number;
}
export interface RepositoryListResponse {
    repositories: Array<{
        name: string;
        slug: string;
        full_name: string;
        links?: {
            html?: {
                href: string;
            };
        };
    }>;
    cached: boolean;
}
export interface CacheStats {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    cacheTTL: number;
    repoCacheEntries: number;
    repoCacheValidEntries: number;
    entries: Array<{
        issueKey: string;
        remoteId: string;
        summary: string;
        age: number;
        expired: boolean;
    }>;
}
//# sourceMappingURL=index.d.ts.map