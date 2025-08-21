import { IssueCache, IssueRemoteIdResponse, CacheStats, RepositoryCache, RepositoryListResponse, CustomFieldCache, CustomFieldResponse, CustomFieldMapping, DropdownFieldOption } from '../types/index.js';
import { jiraClient, bitbucketClient, BITBUCKET_WORKSPACE } from './clients.js';

// Cache for issue key to remote ID mapping
const issueCache = new Map<string, IssueCache>();

// Cache for Bitbucket repositories
const repositoryCache = new Map<string, RepositoryCache>();

// Cache for custom field mappings
const customFieldCache = new Map<string, CustomFieldCache>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const REPO_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for repositories
const CUSTOM_FIELD_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for custom fields (they don't change often)

// Function to get issue remote ID with caching
export async function getIssueRemoteId(issueKey: string): Promise<IssueRemoteIdResponse> {
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
    
    const cacheEntry: IssueCache = {
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
  } catch (error) {
    throw new Error(`Failed to get issue details for ${issueKey}: ${error}`);
  }
}

// Helper function to check if a field is a dropdown type
function isDropdownField(field: any): boolean {
  const dropdownTypes = [
    'com.atlassian.jira.plugin.system.customfieldtypes:select',
    'com.atlassian.jira.plugin.system.customfieldtypes:multiselect',
    'com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons',
    'com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes'
  ];
  
  return dropdownTypes.includes(field.schema?.custom) || 
         dropdownTypes.includes(field.type);
}

// Helper function to determine if field allows multiple values
function allowsMultipleValues(field: any): boolean {
  const multiValueTypes = [
    'com.atlassian.jira.plugin.system.customfieldtypes:multiselect',
    'com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes'
  ];
  
  return multiValueTypes.includes(field.schema?.custom) || 
         multiValueTypes.includes(field.type);
}

// Helper function to fetch dropdown options for a field
async function fetchDropdownOptions(fieldId: string): Promise<DropdownFieldOption[]> {
  try {
    // Method 1: Try to get field contexts first
    try {
      const contextsResponse = await jiraClient.get(`/rest/api/3/field/${fieldId}/context`);
      const contexts = contextsResponse.data?.values || [];
      
      if (contexts.length > 0) {
        // Use the first context to get options
        const contextId = contexts[0].id;
        const optionsResponse = await jiraClient.get(`/rest/api/3/field/${fieldId}/context/${contextId}/option`);
        const options = optionsResponse.data?.values || [];
        
        return options.map((option: any) => ({
          id: option.id,
          value: option.value,
          self: option.self,
          disabled: option.disabled || false
        }));
      }
    } catch (contextError) {
      // If context approach fails, try alternative method
      console.log(`Context approach failed for ${fieldId}, trying alternative method`);
    }
    
    // Method 2: Try to get options from create meta (for a sample project)
    try {
      const projectsResponse = await jiraClient.get('/rest/api/3/project');
      const projects = projectsResponse.data || [];
      
      if (projects.length > 0) {
        const projectKey = projects[0].key;
        const createMetaResponse = await jiraClient.get(
          `/rest/api/3/issue/createmeta?projectKeys=${projectKey}&expand=projects.issuetypes.fields`
        );
        
        const project = createMetaResponse.data?.projects?.[0];
        if (project?.issuetypes?.length > 0) {
          const issueType = project.issuetypes[0];
          const field = issueType.fields?.[fieldId];
          
          if (field?.allowedValues?.length > 0) {
            return field.allowedValues.map((option: any) => ({
              id: option.id || option.value,
              value: option.value || option.name,
              self: option.self,
              disabled: false
            }));
          }
        }
      }
    } catch (metaError) {
      console.log(`Create meta approach failed for ${fieldId}`);
    }
    
    // If all methods fail, return empty array
    return [];
  } catch (error) {
    console.log(`Could not fetch dropdown options for ${fieldId}: ${error}`);
    return [];
  }
}

// Function to get custom field mappings with caching
export async function getCustomFieldMappingsCached(): Promise<CustomFieldResponse> {
  const now = Date.now();
  const cacheKey = 'custom_fields';
  
  // Check cache first
  const cached = customFieldCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CUSTOM_FIELD_CACHE_TTL) {
    console.log(`Custom field cache hit: ${Object.keys(cached.fields).length} fields`);
    return {
      fields: cached.fields,
      cached: true
    };
  }

  // Cache miss or expired - fetch from API
  console.log('Custom field cache miss, fetching from API');

  try {
    const response = await jiraClient.get('/rest/api/3/field');
    const fields = response.data || [];
    
    // Create mapping from field ID to field info
    const fieldMapping: CustomFieldMapping = {};
    
    // Process all fields and fetch dropdown options for dropdown fields
    const dropdownFieldPromises: Promise<void>[] = [];
    
    fields.forEach((field: any) => {
      if (field.id.startsWith('customfield_')) {
        const isDropdown = isDropdownField(field);
        const allowMultiple = allowsMultipleValues(field);
        
        fieldMapping[field.id] = {
          id: field.id,
          name: field.name,
          type: field.type,
          searchable: field.searchable,
          navigable: field.navigable,
          orderable: field.orderable,
          clauseNames: field.clauseNames || [],
          schema: field.schema,
          isDropdown,
          allowMultiple,
          dropdownOptions: [],
          lastOptionsUpdate: now
        };
        
        // If it's a dropdown field, fetch its options
        if (isDropdown) {
          const optionsPromise = fetchDropdownOptions(field.id).then(options => {
            fieldMapping[field.id].dropdownOptions = options;
          });
          dropdownFieldPromises.push(optionsPromise);
        }
      }
    });
    
    // Wait for all dropdown options to be fetched
    await Promise.all(dropdownFieldPromises);
    
    const cacheEntry: CustomFieldCache = {
      fields: fieldMapping,
      timestamp: now
    };
    
    // Store in cache
    customFieldCache.set(cacheKey, cacheEntry);
    
    const dropdownCount = Object.values(fieldMapping).filter(f => f.isDropdown).length;
    console.log(`Cached ${Object.keys(fieldMapping).length} custom fields (${dropdownCount} dropdown fields)`);
    
    return {
      fields: fieldMapping,
      cached: false
    };
  } catch (error) {
    throw new Error(`Failed to get custom field mappings: ${error}`);
  }
}

// Function to get custom field info by name (case-insensitive search)
export async function getCustomFieldByName(fieldName: string): Promise<any> {
  const fieldMappings = await getCustomFieldMappingsCached();
  
  const fieldNameLower = fieldName.toLowerCase();
  const matchingField = Object.values(fieldMappings.fields).find(field => 
    field.name.toLowerCase().includes(fieldNameLower) ||
    field.clauseNames.some(clause => clause.toLowerCase().includes(fieldNameLower))
  );
  
  return matchingField || null;
}

// Function to get custom field info by ID
export async function getCustomFieldById(fieldId: string): Promise<any> {
  const fieldMappings = await getCustomFieldMappingsCached();
  return fieldMappings.fields[fieldId] || null;
}

// Function to list all custom fields with their names and dropdown info
export async function listCustomFields(): Promise<Array<{id: string, name: string, type: string, isDropdown?: boolean, allowMultiple?: boolean}>> {
  const fieldMappings = await getCustomFieldMappingsCached();
  
  return Object.values(fieldMappings.fields).map(field => ({
    id: field.id,
    name: field.name,
    type: field.type,
    isDropdown: field.isDropdown,
    allowMultiple: field.allowMultiple
  }));
}

// Function to get dropdown options for a field
export async function getDropdownFieldOptions(fieldId: string): Promise<DropdownFieldOption[]> {
  const fieldInfo = await getCustomFieldById(fieldId);
  
  if (!fieldInfo) {
    throw new Error(`Custom field ${fieldId} not found`);
  }
  
  if (!fieldInfo.isDropdown) {
    throw new Error(`Field ${fieldId} (${fieldInfo.name}) is not a dropdown field`);
  }
  
  return fieldInfo.dropdownOptions || [];
}

// Function to validate dropdown value
export async function validateDropdownValue(fieldId: string, value: string): Promise<{valid: boolean, option?: DropdownFieldOption, suggestions?: DropdownFieldOption[]}> {
  const options = await getDropdownFieldOptions(fieldId);
  
  // Exact match by value (case-insensitive)
  const exactMatch = options.find(option => 
    option.value.toLowerCase() === value.toLowerCase()
  );
  
  if (exactMatch) {
    return { valid: true, option: exactMatch };
  }
  
  // Find suggestions (partial matches)
  const suggestions = options.filter(option =>
    option.value.toLowerCase().includes(value.toLowerCase()) ||
    value.toLowerCase().includes(option.value.toLowerCase())
  );
  
  return { 
    valid: false, 
    suggestions: suggestions.slice(0, 5) // Limit to top 5 suggestions
  };
}

// Function to find dropdown option by value or ID
export async function findDropdownOption(fieldId: string, valueOrId: string): Promise<DropdownFieldOption | null> {
  const options = await getDropdownFieldOptions(fieldId);
  
  // Try exact match by ID first
  let option = options.find(opt => opt.id === valueOrId);
  if (option) return option;
  
  // Then try exact match by value (case-insensitive)
  option = options.find(opt => opt.value.toLowerCase() === valueOrId.toLowerCase());
  if (option) return option;
  
  // Finally try partial match by value
  option = options.find(opt => 
    opt.value.toLowerCase().includes(valueOrId.toLowerCase()) ||
    valueOrId.toLowerCase().includes(opt.value.toLowerCase())
  );
  
  return option || null;
}

// Function to clear cache (optional utility)
export function clearIssueCache(issueKey?: string): void {
  if (issueKey) {
    issueCache.delete(issueKey);
    console.log(`Cleared cache for issue ${issueKey}`);
  } else {
    issueCache.clear();
    console.log('Cleared entire issue cache');
  }
}

// Function to clear custom field cache
export function clearCustomFieldCache(): void {
  customFieldCache.clear();
  console.log('Cleared custom field cache');
}

// Function to get Bitbucket repositories with caching
export async function getBitbucketRepositoriesCached(maxResults: number = 50): Promise<RepositoryListResponse> {
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

  try {
    const response = await bitbucketClient.get(`/repositories/${BITBUCKET_WORKSPACE}`, {
      params: {
        pagelen: maxResults,
        fields: 'values.name,values.slug,values.full_name,values.links.html.href'
      }
    });

    const repositories = response.data.values || [];
    
    const cacheEntry: RepositoryCache = {
      repositories: repositories.map((repo: any) => ({
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
  } catch (error) {
    throw new Error(`Failed to get Bitbucket repositories for workspace ${BITBUCKET_WORKSPACE}: ${error}`);
  }
}

// Function to clear repository cache
export function clearRepositoryCache(workspace?: string): void {
  if (workspace) {
    // Clear cache for specific workspace
    const keysToDelete = Array.from(repositoryCache.keys()).filter(key => key.includes(workspace));
    keysToDelete.forEach(key => repositoryCache.delete(key));
    console.log(`Cleared repository cache for workspace ${workspace}`);
  } else {
    repositoryCache.clear();
    console.log('Cleared entire repository cache');
  }
}

// Function to get cache stats
export function getCacheStats(): CacheStats {
  const now = Date.now();
  const issueEntries = Array.from(issueCache.entries());
  const validIssueEntries = issueEntries.filter(([_, cache]) => (now - cache.timestamp) < CACHE_TTL);
  
  const repoEntries = Array.from(repositoryCache.entries());
  const validRepoEntries = repoEntries.filter(([_, cache]) => (now - cache.timestamp) < REPO_CACHE_TTL);
  
  const customFieldEntries = Array.from(customFieldCache.entries());
  const validCustomFieldEntries = customFieldEntries.filter(([_, cache]) => (now - cache.timestamp) < CUSTOM_FIELD_CACHE_TTL);
  
  return {
    totalEntries: issueCache.size,
    validEntries: validIssueEntries.length,
    expiredEntries: issueCache.size - validIssueEntries.length,
    cacheTTL: CACHE_TTL,
    repoCacheEntries: repositoryCache.size,
    repoCacheValidEntries: validRepoEntries.length,
    customFieldCacheEntries: customFieldCache.size,
    entries: issueEntries.map(([key, cache]) => ({
      issueKey: key,
      remoteId: cache.remoteId,
      summary: cache.summary,
      age: now - cache.timestamp,
      expired: (now - cache.timestamp) >= CACHE_TTL
    }))
  };
}
