// Cache interface for issue key to remote ID mapping
export interface IssueCache {
  remoteId: string;
  summary: string;
  timestamp: number;
}

// Response type for issue remote ID
export interface IssueRemoteIdResponse {
  remoteId: string;
  summary: string;
  cached: boolean;
}

// Cache interface for Bitbucket repositories
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

// Response type for repository list
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

// Cache statistics
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
