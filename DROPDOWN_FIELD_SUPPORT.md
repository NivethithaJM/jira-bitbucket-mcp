# Dropdown Custom Field Support

This document describes the enhanced support for updating dropdown custom fields in the Jira MCP server.

## Overview

The Jira MCP server now includes specialized tools for managing dropdown custom fields with proper validation, option discovery, and error handling.

## New Tools

### 1. `get_dropdown_field_options`

Gets available options for a dropdown custom field.

**Parameters:**
- `fieldId` (string): The custom field ID (e.g., `customfield_10405`)

**Returns:**
```json
{
  "fieldId": "customfield_10405",
  "fieldName": "DEV - Has Impact & Change been Unit tested?",
  "fieldType": "com.atlassian.jira.plugin.system.customfieldtypes:select",
  "options": [
    {
      "id": "12149",
      "value": "Not Done",
      "self": "https://ovaledge.atlassian.net/rest/api/3/customFieldOption/12149"
    },
    {
      "id": "12299",
      "value": "N/A",
      "self": "https://ovaledge.atlassian.net/rest/api/3/customFieldOption/12299"
    }
  ],
  "optionCount": 2,
  "allowMultiple": false
}
```

### 2. `validate_dropdown_value`

Validates if a value is valid for a dropdown field and returns available options.

**Parameters:**
- `fieldId` (string): The custom field ID
- `value` (string): The value to validate

**Returns:**
```json
{
  "fieldId": "customfield_10405",
  "fieldName": "DEV - Has Impact & Change been Unit tested?",
  "value": "N/A",
  "valid": true,
  "error": null,
  "availableOptions": [...],
  "optionCount": 2
}
```

### 3. `update_dropdown_field`

Updates a dropdown custom field with proper validation.

**Parameters:**
- `issueKey` (string): The issue key to update (e.g., `NFD-38469`)
- `fieldId` (string): The custom field ID
- `value` (string): The value to set (will be validated)
- `addComment` (boolean, optional): Whether to add a comment about the update (default: true)

**Returns:**
```json
{
  "success": true,
  "issueKey": "NFD-38469",
  "fieldId": "customfield_10405",
  "fieldName": "DEV - Has Impact & Change been Unit tested?",
  "value": "N/A",
  "result": {...}
}
```

### 4. `get_field_info`

Gets detailed information about a custom field including type and options.

**Parameters:**
- `fieldId` (string): The custom field ID

**Returns:**
```json
{
  "found": true,
  "fieldInfo": {
    "fieldId": "customfield_10405",
    "fieldName": "DEV - Has Impact & Change been Unit tested?",
    "fieldType": "com.atlassian.jira.plugin.system.customfieldtypes:select",
    "options": [...],
    "allowMultiple": false
  }
}
```

## Usage Examples

### Example 1: Get dropdown options
```javascript
// Get available options for a dropdown field
const options = await getDropdownFieldOptions("customfield_10405");
console.log("Available options:", options.options.map(o => o.value));
```

### Example 2: Validate a value before updating
```javascript
// Validate if "N/A" is a valid option
const validation = await validateDropdownValue("customfield_10405", "N/A");
if (validation.valid) {
  console.log("Value is valid!");
} else {
  console.log("Error:", validation.error);
}
```

### Example 3: Update a dropdown field
```javascript
// Update the field to "N/A"
const result = await updateDropdownField(
  "NFD-38469",
  "customfield_10405",
  "N/A",
  true // Add comment
);
console.log("Update successful:", result.success);
```

## Error Handling

The tools include comprehensive error handling:

1. **Field Not Found**: Returns appropriate error if the field doesn't exist
2. **Invalid Value**: Validates values against available options
3. **API Errors**: Handles Jira API errors gracefully
4. **Network Issues**: Provides clear error messages for connectivity problems

## Technical Details

### Field Metadata Discovery

The system automatically discovers field metadata using the Jira API:
- Fetches field information from `/rest/api/3/field`
- Gets field options from `/rest/api/3/issue/createmeta`
- Caches field information for performance

### Value Validation

Values are validated in multiple ways:
1. **Case-insensitive matching**: "N/A", "n/a", "Na" all match
2. **ID matching**: Can use option IDs directly
3. **Exact value matching**: Matches the exact option value

### API Format

The system automatically formats values for the Jira API:
```json
{
  "fields": {
    "customfield_10405": {
      "id": "12299",
      "value": "N/A"
    }
  }
}
```

## Migration from Old Tools

If you were using the old `update_issue_fields` tool for dropdown fields, you can now use the new specialized tools:

**Old way:**
```javascript
await updateIssueFields("NFD-38469", null, null, null, null, null, null, null, null, {
  "customfield_10405": {"value": "N/A"}
});
```

**New way:**
```javascript
await updateDropdownField("NFD-38469", "customfield_10405", "N/A");
```

## Best Practices

1. **Always validate first**: Use `validate_dropdown_value` before updating
2. **Check field info**: Use `get_field_info` to understand field properties
3. **Handle errors**: Always handle potential validation errors
4. **Use descriptive comments**: Set `addComment` to true for audit trails

## Troubleshooting

### Common Issues

1. **"Field not found"**: Check the field ID is correct
2. **"Invalid value"**: Use `get_dropdown_field_options` to see available values
3. **"API error"**: Check Jira permissions and field accessibility

### Debug Steps

1. Get field info: `get_field_info("customfield_10405")`
2. Check options: `get_dropdown_field_options("customfield_10405")`
3. Validate value: `validate_dropdown_value("customfield_10405", "your_value")`
4. Update field: `update_dropdown_field("ISSUE-123", "customfield_10405", "your_value")`

## Future Enhancements

Planned improvements:
- Support for multi-select dropdowns
- Bulk field updates
- Field dependency handling
- Advanced validation rules
- Field option caching optimization
