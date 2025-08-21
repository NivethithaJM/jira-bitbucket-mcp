import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { 
  getCustomFieldMappingsCached, 
  getCustomFieldByName as getCustomFieldByNameFromCache, 
  getCustomFieldById as getCustomFieldByIdFromCache, 
  listCustomFields as listCustomFieldsFromCache,
  clearCustomFieldCache as clearCustomFieldCacheFromCache 
} from '../utils/cache.js';

export const getCustomFieldMappingsToolDefinition: Tool = {
  name: 'get_custom_field_mappings',
  description: 'Get all custom field mappings with caching (field ID to name mapping)',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const getCustomFieldByNameToolDefinition: Tool = {
  name: 'get_custom_field_by_name',
  description: 'Find a custom field by name (case-insensitive search)',
  inputSchema: {
    type: 'object',
    properties: {
      fieldName: {
        type: 'string',
        description: 'The name of the custom field to search for (partial match supported)',
      },
    },
    required: ['fieldName'],
  },
};

export const getCustomFieldByIdToolDefinition: Tool = {
  name: 'get_custom_field_by_id',
  description: 'Get custom field information by its ID (e.g., customfield_10199)',
  inputSchema: {
    type: 'object',
    properties: {
      fieldId: {
        type: 'string',
        description: 'The ID of the custom field (e.g., customfield_10199)',
      },
    },
    required: ['fieldId'],
  },
};

export const listCustomFieldsToolDefinition: Tool = {
  name: 'list_custom_fields',
  description: 'List all custom fields with their names and types',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const clearCustomFieldCacheToolDefinition: Tool = {
  name: 'clear_custom_field_cache',
  description: 'Clear the custom field mapping cache to force refresh from Jira API',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

// Implementation functions
export async function getCustomFieldMappings() {
  try {
    const result = await getCustomFieldMappingsCached();
    return {
      ...result,
      fieldCount: Object.keys(result.fields).length,
      fields: result.fields
    };
  } catch (error) {
    throw new Error(`Failed to get custom field mappings: ${error}`);
  }
}

export async function getCustomFieldByName(fieldName: string) {
  try {
    const field = await getCustomFieldByNameFromCache(fieldName);
    if (!field) {
      return {
        found: false,
        message: `No custom field found matching "${fieldName}"`
      };
    }
    
    return {
      found: true,
      field: field
    };
  } catch (error) {
    throw new Error(`Failed to find custom field by name "${fieldName}": ${error}`);
  }
}

export async function getCustomFieldById(fieldId: string) {
  try {
    const field = await getCustomFieldByIdFromCache(fieldId);
    if (!field) {
      return {
        found: false,
        message: `No custom field found with ID "${fieldId}"`
      };
    }
    
    return {
      found: true,
      field: field
    };
  } catch (error) {
    throw new Error(`Failed to get custom field by ID "${fieldId}": ${error}`);
  }
}

export async function listCustomFields() {
  try {
    const fields = await listCustomFieldsFromCache();
    return {
      fieldCount: fields.length,
      fields: fields
    };
  } catch (error) {
    throw new Error(`Failed to list custom fields: ${error}`);
  }
}

export async function clearCustomFieldCache() {
  try {
    clearCustomFieldCacheFromCache();
    return {
      success: true,
      message: 'Custom field cache cleared successfully'
    };
  } catch (error) {
    throw new Error(`Failed to clear custom field cache: ${error}`);
  }
}
