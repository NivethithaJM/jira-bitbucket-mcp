# Unified Jira Update Function - Complete Guide

This guide explains the enhanced custom field support and unified update functionality implemented in the Jira-Bitbucket MCP server.

## Overview

The unified update system combines three previously separate update methods into a single, powerful function with enhanced dropdown field support and comprehensive validation.

## Key Features

### 1. Enhanced Custom Field Cache

The custom field cache now stores comprehensive information about each field:

```typescript
interface CustomFieldInfo {
  id: string;                        // e.g., "customfield_10405"
  name: string;                      // e.g., "DEV - Has Impact & Change been Unit tested?"
  type: string;                      // Technical field type
  isDropdown?: boolean;              // Automatically detected
  allowMultiple?: boolean;           // For multi-select fields
  dropdownOptions?: DropdownFieldOption[]; // All available options
  lastOptionsUpdate?: number;        // Cache timestamp
}
```

### 2. Dropdown Field Support

#### Automatic Detection
The system automatically identifies dropdown fields based on their type:
- Single-select dropdowns
- Multi-select dropdowns  
- Radio buttons
- Multi-checkboxes

#### Option Discovery
For each dropdown field, the system fetches and caches all available options:

```typescript
interface DropdownFieldOption {
  id: string;      // e.g., "12299"
  value: string;   // e.g., "N/A"
  self?: string;   // API URL
  disabled?: boolean;
}
```

#### Value Validation
Before updating dropdown fields, the system validates values:

```typescript
// Example validation result
{
  valid: true,
  option: { id: "12299", value: "N/A" }
}

// Or for invalid values
{
  valid: false,
  suggestions: [
    { id: "12299", value: "N/A" },
    { id: "12149", value: "Not Done" }
  ]
}
```

### 3. Unified Update Function

The `unified_jira_update` function combines all update methods:

#### Input Parameters

```typescript
interface UnifiedUpdateRequest {
  issueKey: string;                    // Required: Issue to update
  fields?: {                           // Optional: Standard Jira fields
    summary?: string;
    description?: string;
    priority?: string;
    assignee?: string;
    status?: string;
    labels?: string[];
    components?: string[];
    fixVersions?: string[];
  };
  customFields?: {                     // Optional: Custom fields by ID
    [fieldId: string]: any;
  };
  customFieldsByName?: {               // Optional: Custom fields by name
    [fieldName: string]: any;
  };
  validateDropdowns?: boolean;         // Optional: Default true
  addComment?: boolean;                // Optional: Default true
}
```

#### Smart Field Resolution

When using `customFieldsByName`, the system automatically:
1. Searches for fields by name (case-insensitive)
2. Resolves field names to their technical IDs
3. Provides clear error messages for unknown fields

#### Example Usage

```json
{
  "issueKey": "NFD-38469",
  "fields": {
    "summary": "Updated SQL Error Issue",
    "priority": "High"
  },
  "customFields": {
    "customfield_10405": "N/A"
  },
  "customFieldsByName": {
    "DEV - Has Impact & Change been Unit tested?": "N/A",
    "QA Test Status": "Not Required"
  },
  "validateDropdowns": true,
  "addComment": true
}
```

## Validation and Error Handling

### Dropdown Validation

When `validateDropdowns: true` (default), the system:

1. **Exact Match**: Looks for exact value matches (case-insensitive)
2. **Partial Match**: Provides suggestions for similar values
3. **Error Messages**: Clear error messages with suggestions

Example error:
```
Invalid dropdown value "Not Applicable" for field "DEV - Has Impact & Change been Unit tested?". 
Suggestions: N/A, Not Done, Done. 
Use validateDropdowns: false to skip validation.
```

### Field Resolution Errors

When field names cannot be resolved:
```
Custom field not found: "Unknown Field Name". 
Available fields can be listed using list_custom_fields tool.
```

## Documentation and Comments

### Automatic Comments

When `addComment: true` (default), the system adds detailed comments:

```
Issue updated through unified jira-bitbucket mcp tool.

**Standard Fields Updated:**
• summary: "Updated SQL Error Issue"
• priority: "High"

**Custom Fields Updated (by ID):**
• DEV - Has Impact & Change been Unit tested? (customfield_10405): "N/A"

**Custom Fields Updated (by name):**
• DEV - Has Impact & Change been Unit tested?: "N/A"
• QA Test Status: "Not Required"
```

## Migration from Previous Methods

### From `update_issue`
```javascript
// OLD
await updateIssue("NFD-123", {
  summary: "New summary",
  customfield_10405: { id: "12299" }
});

// NEW
await unifiedJiraUpdate({
  issueKey: "NFD-123",
  fields: { summary: "New summary" },
  customFields: { customfield_10405: "N/A" }  // Simplified!
});
```

### From `update_issue_fields`
```javascript
// OLD
await updateIssueFields(
  "NFD-123",
  "New summary",      // summary
  undefined,          // description
  "High",            // priority
  undefined,          // assignee
  undefined,          // status
  undefined,          // labels
  undefined,          // components
  undefined,          // fixVersions
  { customfield_10405: "N/A" }  // customFields
);

// NEW
await unifiedJiraUpdate({
  issueKey: "NFD-123",
  fields: {
    summary: "New summary",
    priority: "High"
  },
  customFields: { customfield_10405: "N/A" }
});
```

### From Field Names
```javascript
// NEW - Use field names directly!
await unifiedJiraUpdate({
  issueKey: "NFD-123",
  customFieldsByName: {
    "DEV - Has Impact & Change been Unit tested?": "N/A",
    "QA Test Status": "Not Required"
  }
});
```

## Testing the Enhanced Functionality

### 1. List Available Fields
```javascript
// Get all custom fields with dropdown info
const fields = await listCustomFields();
console.log(fields.filter(f => f.isDropdown));
```

### 2. Validate Dropdown Values
```javascript
// Check if a value is valid
const validation = await validateDropdownValue("customfield_10405", "N/A");
if (!validation.valid) {
  console.log("Suggestions:", validation.suggestions?.map(s => s.value));
}
```

### 3. Get Field Options
```javascript
// Get all available options for a dropdown field
const options = await getDropdownFieldOptions("customfield_10405");
console.log("Available options:", options.map(o => o.value));
```

## Performance Considerations

### Caching Strategy
- **Custom Fields**: Cached for 24 hours (fields rarely change)
- **Dropdown Options**: Fetched once per cache refresh
- **Parallel Fetching**: All dropdown options fetched concurrently
- **Lazy Loading**: Options only fetched for dropdown fields

### Memory Usage
- Efficient storage of field metadata
- Options stored only for dropdown fields
- Cache invalidation available via `clear_custom_field_cache`

## Troubleshooting

### Common Issues

1. **Field Not Found**
   - Use `list_custom_fields` to see available fields
   - Check field name spelling and case

2. **Invalid Dropdown Value**
   - Use `get_dropdown_field_options` to see valid options
   - Check the suggestions in validation error messages

3. **Permission Errors**
   - Ensure user has permission to update the field
   - Some fields may be read-only or restricted

4. **Cache Issues**
   - Use `clear_custom_field_cache` to refresh field information
   - Restart the MCP server if needed

### Debug Mode

For detailed logging, check the console output when using the functions. The system provides comprehensive logging of:
- Cache hits/misses
- Field resolution steps
- Dropdown option fetching
- Validation results

## Future Enhancements

The unified update system provides a foundation for future enhancements:
- Support for more field types (dates, numbers, users)
- Batch updates across multiple issues
- Field dependency validation
- Custom validation rules
- Integration with Jira workflows

## Conclusion

The unified update system significantly simplifies Jira issue updates while providing robust validation and error handling. It combines the best features of all previous update methods into a single, powerful interface that's both easy to use and highly reliable.
