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

// Dropdown field option interface
export interface DropdownFieldOption {
  id: string;
  value: string;
  self?: string;
  disabled?: boolean;
}

// Enhanced custom field mapping types
export interface CustomFieldInfo {
  id: string;
  name: string;
  type: string;
  searchable: boolean;
  navigable: boolean;
  orderable: boolean;
  clauseNames: string[];
  schema?: {
    type: string;
    custom?: string;
    customId?: number;
    items?: string;
  };
  // Enhanced fields for dropdown support
  isDropdown?: boolean;
  allowMultiple?: boolean;
  dropdownOptions?: DropdownFieldOption[];
  lastOptionsUpdate?: number;
}

export interface CustomFieldMapping {
  [fieldId: string]: CustomFieldInfo;
}

export interface CustomFieldCache {
  fields: CustomFieldMapping;
  timestamp: number;
}

export interface CustomFieldResponse {
  fields: CustomFieldMapping;
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
  customFieldCacheEntries: number;
  entries: Array<{
    issueKey: string;
    remoteId: string;
    summary: string;
    age: number;
    expired: boolean;
  }>;
}

// Unified update interfaces
export interface FieldUpdateValue {
  value?: any;
  id?: string;
  name?: string;
  self?: string;
}

export interface UnifiedUpdateRequest {
  issueKey: string;
  fields?: {
    summary?: string;
    description?: string;
    priority?: string;
    assignee?: string;
    status?: string;
    labels?: string[];
    components?: string[];
    fixVersions?: string[];
  };
  customFields?: {
    [fieldId: string]: FieldUpdateValue | string | number | boolean;
  };
  customFieldsByName?: {
    [fieldName: string]: FieldUpdateValue | string | number | boolean;
  };
  validateDropdowns?: boolean;
  addComment?: boolean;
}
