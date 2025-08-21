import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { jiraClient } from '../utils/clients.js';
import { 
  getCustomFieldById, 
  getCustomFieldByName, 
  validateDropdownValue, 
  findDropdownOption 
} from '../utils/cache.js';
import { addComment } from './jira-comments.js';
import { UnifiedUpdateRequest, FieldUpdateValue } from '../types/index.js';

export const enhancedJiraUpdateToolDefinition: Tool = {
  name: 'enhanced_jira_update',
  description: 'Enhanced unified function to update Jira issues with comprehensive field validation, smart dropdown handling, and flexible input formats',
  inputSchema: {
    type: 'object',
    properties: {
      issueKey: {
        type: 'string',
        description: 'The issue key to update (e.g., PROJ-123)',
      },
      // Standard fields - can be provided individually or as an object
      summary: {
        type: 'string',
        description: 'Update the issue summary/title',
      },
      description: {
        type: 'string',
        description: 'Update the issue description',
      },
      priority: {
        type: 'string',
        description: 'Update priority (Highest, High, Medium, Low, Lowest)',
      },
      assignee: {
        type: 'string',
        description: 'Update assignee (email address or username)',
      },
      status: {
        type: 'string',
        description: 'Update status (e.g., "In Progress", "Done", "To Do")',
      },
      labels: {
        type: 'array',
        items: { type: 'string' },
        description: 'Update labels (array of label strings)',
      },
      components: {
        type: 'array',
        items: { type: 'string' },
        description: 'Update components (array of component names)',
      },
      fixVersions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Update fix versions (array of version names)',
      },
      // Legacy support for structured fields object
      fields: {
        type: 'object',
        description: 'Standard Jira fields to update (legacy format supported)',
      },
      // Custom field support
      customFields: {
        type: 'object',
        description: 'Update custom fields by field ID (e.g., {"customfield_10405": "N/A"})',
      },
      customFieldsByName: {
        type: 'object',
        description: 'Update custom fields by field name (e.g., {"DEV - Has Impact & Change been Unit tested?": "N/A"})',
      },
      // Advanced options
      validateDropdowns: {
        type: 'boolean',
        description: 'Whether to validate dropdown field values and provide suggestions (default: true)',
        default: true,
      },
      addComment: {
        type: 'boolean',
        description: 'Whether to add a comment documenting the update (default: true)',
        default: true,
      },
      allowPartialUpdates: {
        type: 'boolean',
        description: 'Whether to continue with valid fields if some fail (default: false)',
        default: false,
      },
      dryRun: {
        type: 'boolean',
        description: 'Preview the update without applying changes (default: false)',
        default: false,
      },
    },
    required: ['issueKey'],
  },
};

// Helper function to format field value for Jira API with comprehensive field type support
async function formatFieldValue(fieldId: string, value: any, validateDropdowns: boolean = true): Promise<any> {
  const fieldInfo = await getCustomFieldById(fieldId);
  
  if (!fieldInfo) {
    // If we don't know the field type, return value as-is
    return value;
  }
  
  const fieldType = fieldInfo.schema?.custom || fieldInfo.type;
  const isSystemField = fieldInfo.schema?.system;
  
  // Handle dropdown/select fields
  if (fieldInfo.isDropdown) {
    return await formatDropdownValue(fieldId, value, fieldInfo, validateDropdowns);
  }
  
  // Handle system fields
  if (isSystemField) {
    return await formatSystemFieldValue(isSystemField, value, fieldInfo);
  }
  
  // Handle custom field types
  return await formatCustomFieldValue(fieldType, value, fieldInfo);
}

// Helper function to format dropdown/select field values
async function formatDropdownValue(fieldId: string, value: any, fieldInfo: any, validateDropdowns: boolean): Promise<any> {
  if (typeof value === 'string') {
    if (validateDropdowns) {
      const option = await findDropdownOption(fieldId, value);
      if (option) {
        return fieldInfo.allowMultiple ? [{ id: option.id }] : { id: option.id };
      } else {
        throw new Error(`Invalid dropdown value "${value}" for field "${fieldInfo.name}". Use validateDropdowns: false to skip validation.`);
      }
    } else {
      // Skip validation, try to format as dropdown value anyway
      return fieldInfo.allowMultiple ? [{ value: value }] : { value: value };
    }
  } else if (typeof value === 'object' && value.id) {
    // Value is already in correct format
    return fieldInfo.allowMultiple ? [value] : value;
  } else if (Array.isArray(value) && fieldInfo.allowMultiple) {
    // Handle multiple values for multi-select fields
    const formattedValues = [];
    for (const val of value) {
      if (typeof val === 'string') {
        if (validateDropdowns) {
          const option = await findDropdownOption(fieldId, val);
          if (option) {
            formattedValues.push({ id: option.id });
          } else {
            throw new Error(`Invalid dropdown value "${val}" for field "${fieldInfo.name}".`);
          }
        } else {
          formattedValues.push({ value: val });
        }
      } else if (val.id) {
        formattedValues.push(val);
      }
    }
    return formattedValues;
  }
  return value;
}

// Helper function to format system field values
async function formatSystemFieldValue(systemField: string, value: any, fieldInfo: any): Promise<any> {
  switch (systemField) {
    case 'summary':
      return typeof value === 'string' ? value : String(value);
      
    case 'description':
      if (typeof value === 'string') {
        return {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: value }]
            }
          ]
        };
      }
      return value;
      
    case 'assignee':
      return typeof value === 'string' ? { name: value } : value;
      
    case 'reporter':
      return typeof value === 'string' ? { name: value } : value;
      
    case 'priority':
      return typeof value === 'string' ? { name: value } : value;
      
    case 'status':
      return typeof value === 'string' ? { name: value } : value;
      
    case 'components':
      if (Array.isArray(value)) {
        return value.map(comp => typeof comp === 'string' ? { name: comp } : comp);
      }
      return [typeof value === 'string' ? { name: value } : value];
      
    case 'fixVersions':
      if (Array.isArray(value)) {
        return value.map(version => typeof version === 'string' ? { name: version } : version);
      }
      return [typeof value === 'string' ? { name: value } : value];
      
    case 'labels':
      return Array.isArray(value) ? value : [value];
      
    case 'environment':
      if (typeof value === 'string') {
        return {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: value }]
            }
          ]
        };
      }
      return value;
      
    default:
      return value;
  }
}

// Helper function to format custom field values
async function formatCustomFieldValue(fieldType: string, value: any, fieldInfo: any): Promise<any> {
  // Text-based fields
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:textarea' ||
      fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:textfield' ||
      fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:readonlyfield') {
    if (typeof value === 'string') {
      return {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: value }]
          }
        ]
      };
    }
    return value;
  }
  
  // Number fields
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:float' ||
      fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:number') {
    return typeof value === 'number' ? value : Number(value);
  }
  
  // Date fields
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:datepicker') {
    if (typeof value === 'string') {
      return value; // ISO date string
    } else if (value instanceof Date) {
      return value.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    return value;
  }
  
  // DateTime fields
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:datetime') {
    if (typeof value === 'string') {
      return value; // ISO datetime string
    } else if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }
  
  // URL fields
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:url') {
    return typeof value === 'string' ? value : String(value);
  }
  
  // User fields
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:userpicker') {
    if (typeof value === 'string') {
      return { name: value };
    } else if (typeof value === 'object' && value.name) {
      return value;
    }
    return value;
  }
  
  // Group fields
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:grouppicker') {
    if (typeof value === 'string') {
      return { name: value };
    } else if (typeof value === 'object' && value.name) {
      return value;
    }
    return value;
  }
  
  // Project fields
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:project') {
    if (typeof value === 'string') {
      return { key: value };
    } else if (typeof value === 'object' && value.key) {
      return value;
    }
    return value;
  }
  
  // Version fields
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:version') {
    if (typeof value === 'string') {
      return { name: value };
    } else if (typeof value === 'object' && value.name) {
      return value;
    }
    return value;
  }
  
  // Radio buttons (single select)
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons') {
    if (typeof value === 'string') {
      return { value: value };
    } else if (typeof value === 'object' && value.value) {
      return value;
    }
    return value;
  }
  
  // Checkboxes (multi-select)
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes') {
    if (Array.isArray(value)) {
      return value.map(v => typeof v === 'string' ? { value: v } : v);
    }
    return [typeof value === 'string' ? { value: value } : value];
  }
  
  // Cascading select
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:cascadingselect') {
    if (typeof value === 'object' && value.value) {
      return value;
    } else if (typeof value === 'string') {
      return { value: value };
    }
    return value;
  }
  
  // Multi-select
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:multiselect') {
    if (Array.isArray(value)) {
      return value.map(v => typeof v === 'string' ? { value: v } : v);
    }
    return [typeof value === 'string' ? { value: value } : value];
  }
  
  // Labels field
  if (fieldType === 'com.atlassian.jira.plugin.system.customfieldtypes:labels') {
    return Array.isArray(value) ? value : [value];
  }
  
  // For unknown field types, return value as-is
  return value;
}

// Helper function to resolve custom field names to IDs and handle non-custom fields as comments
async function resolveCustomFieldsByName(customFieldsByName: any): Promise<{ resolvedFields: any, commentFields: any }> {
  const resolvedFields: any = {};
  const commentFields: any = {};
  
  for (const [fieldName, value] of Object.entries(customFieldsByName)) {
    const fieldInfo = await getCustomFieldByName(fieldName);
    if (fieldInfo) {
      // It's a custom field - resolve to ID
      resolvedFields[fieldInfo.id] = value;
    } else {
      // It's not a custom field - add to comment fields
      commentFields[fieldName] = value;
    }
  }
  
  return { resolvedFields, commentFields };
}

// Helper function to create comment for non-custom fields
function createCommentForNonCustomFields(commentFields: any): string {
  const sections: string[] = [];
  
  // Non-custom fields section
  if (commentFields && Object.keys(commentFields).length > 0) {
    const nonCustomUpdates = Object.entries(commentFields)
      .map(([name, value]) => {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return `• ${name}: ${valueStr}`;
      })
      .join('\n');
    sections.push(`**Non-Custom Fields (Added as Comments):**\n${nonCustomUpdates}`);
  }
  
  const header = 'Non-custom fields added as comments through jira-bitbucket mcp tool.';
  return `${header}\n\n${sections.join('\n\n')}`;
}

// Helper function to create detailed update comment
async function createUnifiedUpdateComment(
  standardFields: any, 
  customFields: any, 
  customFieldsByName: any
): Promise<string> {
  const sections: string[] = [];
  
  // Standard fields section
  if (standardFields && Object.keys(standardFields).length > 0) {
    const standardUpdates = Object.entries(standardFields)
      .map(([key, value]) => `• ${key}: ${JSON.stringify(value)}`)
      .join('\n');
    sections.push(`**Standard Fields Updated:**\n${standardUpdates}`);
  }
  
  // Custom fields by ID section
  if (customFields && Object.keys(customFields).length > 0) {
    const customUpdates: string[] = [];
    for (const [fieldId, value] of Object.entries(customFields)) {
      try {
        const fieldInfo = await getCustomFieldById(fieldId);
        const fieldName = fieldInfo ? fieldInfo.name : fieldId;
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        customUpdates.push(`• ${fieldName} (${fieldId}): ${valueStr}`);
      } catch (error) {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        customUpdates.push(`• ${fieldId}: ${valueStr}`);
      }
    }
    sections.push(`**Custom Fields Updated (by ID):**\n${customUpdates.join('\n')}`);
  }
  
  // Custom fields by name section
  if (customFieldsByName && Object.keys(customFieldsByName).length > 0) {
    const nameUpdates = Object.entries(customFieldsByName)
      .map(([name, value]) => {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return `• ${name}: ${valueStr}`;
      })
      .join('\n');
    sections.push(`**Custom Fields Updated (by name):**\n${nameUpdates}`);
  }
  
  const header = 'Issue updated through unified jira-bitbucket mcp tool.';
  return `${header}\n\n${sections.join('\n\n')}`;
}

// Enhanced interface to support flexible input formats
interface EnhancedUpdateRequest extends Partial<UnifiedUpdateRequest> {
  issueKey: string;
  // Direct field parameters (alternative to fields object)
  summary?: string;
  description?: string;
  priority?: string;
  assignee?: string;
  status?: string;
  labels?: string[];
  components?: string[];
  fixVersions?: string[];
  // Advanced options
  allowPartialUpdates?: boolean;
  dryRun?: boolean;
}

export async function enhancedJiraUpdate(request: EnhancedUpdateRequest) {
  const { 
    issueKey, 
    fields: legacyFields,
    customFields, 
    customFieldsByName, 
    validateDropdowns = true, 
    addComment: shouldAddComment = true,
    allowPartialUpdates = false,
    dryRun = false,
    // Direct field parameters
    summary,
    description,
    priority,
    assignee,
    status,
    labels,
    components,
    fixVersions
  } = request;
  
  // Combine direct parameters with legacy fields object
  const standardFields = {
    ...legacyFields,
    ...(summary && { summary }),
    ...(description && { description }),
    ...(priority && { priority }),
    ...(assignee && { assignee }),
    ...(status && { status }),
    ...(labels && { labels }),
    ...(components && { components }),
    ...(fixVersions && { fixVersions })
  };

  try {
    // Prepare the update payload
    const updateFields: any = {};
    
    // Process standard fields with enhanced formatting
    if (standardFields) {
      for (const [fieldName, value] of Object.entries(standardFields)) {
        if (value !== undefined && value !== null) {
          // Use the system field formatting function for standard fields
          const formattedValue = await formatSystemFieldValue(fieldName, value, { name: fieldName });
          updateFields[fieldName] = formattedValue;
        }
      }
    }
    
    // Process custom fields by name (resolve to IDs first)
    let resolvedCustomFieldsByName = {};
    let commentFields = {};
    if (customFieldsByName && Object.keys(customFieldsByName).length > 0) {
      const result = await resolveCustomFieldsByName(customFieldsByName);
      resolvedCustomFieldsByName = result.resolvedFields;
      commentFields = result.commentFields;
    }
    
    // Combine all custom fields
    const allCustomFields = { ...customFields, ...resolvedCustomFieldsByName };
    
    // Process and validate custom fields
    for (const [fieldId, value] of Object.entries(allCustomFields)) {
      if (validateDropdowns) {
        // Validate dropdown fields if requested
        const fieldInfo = await getCustomFieldById(fieldId);
        if (fieldInfo?.isDropdown && typeof value === 'string') {
          const validation = await validateDropdownValue(fieldId, value);
          if (!validation.valid) {
            const suggestions = validation.suggestions?.map(s => s.value).join(', ') || 'none';
            throw new Error(
              `Invalid dropdown value "${value}" for field "${fieldInfo.name}". ` +
              `Suggestions: ${suggestions}. Use validateDropdowns: false to skip validation.`
            );
          }
        }
      }
      
      // Format the field value appropriately
      updateFields[fieldId] = await formatFieldValue(fieldId, value, validateDropdowns);
    }
    
    // Dry run - preview the update without applying
    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        issueKey,
        previewFields: updateFields,
        fieldCount: Object.keys(updateFields).length,
        message: `DRY RUN: Would update ${Object.keys(updateFields).length} fields for issue ${issueKey}`,
        standardFieldsPreview: standardFields,
        customFieldsPreview: { ...customFields, ...customFieldsByName },
        commentFieldsPreview: commentFields,
        commentFieldsCount: Object.keys(commentFields).length
      };
    }
    
    // Perform the actual update
    console.log(`Updating issue ${issueKey} with fields:`, JSON.stringify(updateFields, null, 2));
    
    let response;
    try {
      response = await jiraClient.put(`/rest/api/3/issue/${issueKey}`, {
        fields: updateFields,
      });
    } catch (updateError: any) {
      if (allowPartialUpdates && updateError.response?.data?.errors) {
        // Try to identify which fields failed and retry with valid ones
        const errors = updateError.response.data.errors;
        const failedFields = Object.keys(errors);
        const validFields = Object.fromEntries(
          Object.entries(updateFields).filter(([field]) => !failedFields.includes(field))
        );
        
        if (Object.keys(validFields).length > 0) {
          console.log(`Retrying with valid fields only: ${Object.keys(validFields).join(', ')}`);
          response = await jiraClient.put(`/rest/api/3/issue/${issueKey}`, {
            fields: validFields,
          });
          
          return {
            success: true,
            partialUpdate: true,
            issueKey,
            updatedFields: Object.keys(validFields),
            failedFields: failedFields,
            failedFieldErrors: errors,
            message: `Partially updated ${Object.keys(validFields).length} fields for issue ${issueKey}. ${failedFields.length} fields failed.`,
            response: response.data
          };
        }
      }
      throw updateError;
    }
    
    // Add comment for non-custom fields if any
    if (Object.keys(commentFields).length > 0 && !dryRun) {
      try {
        const commentText = createCommentForNonCustomFields(commentFields);
        if (commentText) {
          await addComment(issueKey, commentText);
        }
      } catch (error) {
        console.error(`Failed to add comment for non-custom fields: ${error}`);
        // Don't fail the whole operation if comment fails
      }
    }
    
    // Add comment if requested
    if (shouldAddComment && !dryRun) {
      try {
        const commentText = await createUnifiedUpdateComment(standardFields, customFields, customFieldsByName);
        if (commentText) {
          await addComment(issueKey, commentText);
        }
      } catch (error) {
        console.error(`Failed to add update comment: ${error}`);
        // Don't fail the whole operation if comment fails
      }
    }
    
    return {
      success: true,
      issueKey,
      updatedFields: Object.keys(updateFields),
      fieldCount: Object.keys(updateFields).length,
      commentFields: Object.keys(commentFields),
      commentFieldsCount: Object.keys(commentFields).length,
      message: `Successfully updated ${Object.keys(updateFields).length} fields and added ${Object.keys(commentFields).length} comments for issue ${issueKey}`,
      response: response.data
    };
  } catch (error) {
    throw new Error(`Failed to update issue ${issueKey}: ${error}`);
  }
}

// Legacy function for backward compatibility
export async function unifiedJiraUpdate(request: UnifiedUpdateRequest) {
  return enhancedJiraUpdate(request);
}
