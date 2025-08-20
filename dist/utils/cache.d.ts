import { IssueRemoteIdResponse, CacheStats, RepositoryListResponse } from '../types/index.js';
export declare function getIssueRemoteId(issueKey: string): Promise<IssueRemoteIdResponse>;
export declare function clearIssueCache(issueKey?: string): void;
export declare function getBitbucketRepositoriesCached(maxResults?: number): Promise<RepositoryListResponse>;
export declare function clearRepositoryCache(workspace?: string): void;
export declare function getCacheStats(): CacheStats;
//# sourceMappingURL=cache.d.ts.map