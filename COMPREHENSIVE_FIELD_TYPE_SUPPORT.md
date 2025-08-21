# Comprehensive Field Type Support

The enhanced unified Jira update functionality now supports **all available Jira field types** with intelligent formatting and validation.

## 🎯 **Overview**

The system automatically detects field types and applies the correct formatting for:
- **Standard Jira fields** (summary, description, priority, assignee, etc.)
- **Custom fields** (text, number, date, dropdown, user picker, etc.)
- **Complex field types** (multi-select, cascading select, rich text, etc.)

## 📋 **Supported Field Types**

### **Standard Jira Fields**

| Field Type | Input Format | API Format | Example |
|------------|--------------|------------|---------|
| **Summary** | `string` | `string` | `"Updated summary"` |
| **Description** | `string` | `ADF Document` | `"Rich text description"` |
| **Priority** | `string` | `{ name: string }` | `"High"` |
| **Assignee** | `string` | `{ name: string }` | `"user@example.com"` |
| **Reporter** | `string` | `{ name: string }` | `"user@example.com"` |
| **Status** | `string` | `{ name: string }` | `"In Progress"` |
| **Labels** | `string[]` | `string[]` | `["urgent", "bug"]` |
| **Components** | `string[]` | `{ name: string }[]` | `["Frontend", "Backend"]` |
| **Fix Versions** | `string[]` | `{ name: string }[]` | `["v1.0.0", "v1.1.0"]` |
| **Environment** | `string` | `ADF Document` | `"Production environment"` |

### **Custom Field Types**

#### **Text-Based Fields**
| Field Type | Input Format | API Format | Example |
|------------|--------------|------------|---------|
| **Text Field** | `string` | `ADF Document` | `"Simple text"` |
| **Text Area** | `string` | `ADF Document` | `"Multi-line text"` |
| **Read-only Field** | `string` | `ADF Document` | `"Read-only content"` |

#### **Numeric Fields**
| Field Type | Input Format | API Format | Example |
|------------|--------------|------------|---------|
| **Number** | `number` | `number` | `42` |
| **Float** | `number` | `number` | `3.14` |

#### **Date/Time Fields**
| Field Type | Input Format | API Format | Example |
|------------|--------------|------------|---------|
| **Date Picker** | `string` or `Date` | `string` | `"2024-01-15"` |
| **DateTime** | `string` or `Date` | `string` | `"2024-01-15T10:30:00Z"` |

#### **Reference Fields**
| Field Type | Input Format | API Format | Example |
|------------|--------------|------------|---------|
| **User Picker** | `string` | `{ name: string }` | `"user@example.com"` |
| **Group Picker** | `string` | `{ name: string }` | `"developers"` |
| **Project** | `string` | `{ key: string }` | `"PROJ"` |
| **Version** | `string` | `{ name: string }` | `"v1.0.0"` |
| **URL** | `string` | `string` | `"https://example.com"` |

#### **Selection Fields**
| Field Type | Input Format | API Format | Example |
|------------|--------------|------------|---------|
| **Dropdown** | `string` | `{ id: number }` or `{ value: string }` | `"Yes"` |
| **Radio Buttons** | `string` | `{ value: string }` | `"Option 1"` |
| **Multi-Select** | `string[]` | `{ value: string }[]` | `["Option 1", "Option 2"]` |
| **Checkboxes** | `string[]` | `{ value: string }[]` | `["Check 1", "Check 2"]` |
| **Cascading Select** | `object` | `{ value: string }` | `{ value: "Parent/Child" }` |
| **Labels** | `string[]` | `string[]` | `["label1", "label2"]` |

## 🚀 **Usage Examples**

### **Standard Fields**
```javascript
await enhancedJiraUpdate({
  issueKey: 'PROJ-123',
  summary: 'Updated summary',
  description: 'Rich text description',
  priority: 'High',
  assignee: 'user@example.com',
  labels: ['urgent', 'bug'],
  components: ['Frontend', 'Backend'],
  fixVersions: ['v1.0.0']
});
```

### **Custom Fields by ID**
```javascript
await enhancedJiraUpdate({
  issueKey: 'PROJ-123',
  customFields: {
    'customfield_10001': 42,                    // Number field
    'customfield_10002': '2024-01-15',          // Date field
    'customfield_10003': 'https://example.com', // URL field
    'customfield_10004': 'user@example.com',    // User field
    'customfield_10005': ['label1', 'label2']   // Labels field
  }
});
```

### **Custom Fields by Name**
```javascript
await enhancedJiraUpdate({
  issueKey: 'PROJ-123',
  customFieldsByName: {
    'DEV - Has Impact & Change been Unit tested?': 'Yes',
    'Functional Review Comments': 'Review completed',
    'Test Notes': 'This becomes a comment'  // Non-custom field
  }
});
```

### **Mixed Approach**
```javascript
await enhancedJiraUpdate({
  issueKey: 'PROJ-123',
  // Standard fields
  summary: 'Updated summary',
  priority: 'High',
  // Custom fields by ID
  customFields: {
    'customfield_10001': 42
  },
  // Custom fields by name
  customFieldsByName: {
    'DEV - Has Impact & Change been Unit tested?': 'Yes'
  }
});
```

## 🔧 **Advanced Features**

### **Dry Run Mode**
Test field formatting without making actual updates:
```javascript
await enhancedJiraUpdate({
  issueKey: 'PROJ-123',
  dryRun: true,
  summary: 'Test summary',
  customFields: {
    'customfield_10001': 42
  }
});
```

### **Dropdown Validation**
Control dropdown value validation:
```javascript
await enhancedJiraUpdate({
  issueKey: 'PROJ-123',
  customFields: {
    'customfield_10001': 'Custom Value'
  },
  validateDropdowns: false  // Skip validation
});
```

### **Partial Updates**
Allow partial updates when some fields fail:
```javascript
await enhancedJiraUpdate({
  issueKey: 'PROJ-123',
  allowPartialUpdates: true,
  customFields: {
    'customfield_10001': 'Valid Value',
    'customfield_10002': 'Invalid Value'
  }
});
```

## 🧠 **Smart Field Detection**

The system automatically:

1. **Identifies field types** from Jira metadata
2. **Applies correct formatting** based on field type
3. **Validates dropdown values** against available options
4. **Handles non-custom fields** as comments
5. **Supports multiple input formats** (string, array, object)

### **Field Type Detection**
```javascript
// The system automatically detects:
- Standard fields (summary, description, etc.)
- Custom field types (text, number, date, dropdown, etc.)
- Field schemas and validation rules
- Multi-value vs single-value fields
```

### **Automatic Formatting**
```javascript
// Input: "High"
// Output for priority: { name: "High" }

// Input: "Rich text"
// Output for description: { type: "doc", version: 1, content: [...] }

// Input: ["Option 1", "Option 2"]
// Output for multi-select: [{ value: "Option 1" }, { value: "Option 2" }]
```

## 📊 **Field Type Mapping**

### **System Field Types**
- `summary` → String
- `description` → ADF Document
- `priority` → { name: string }
- `assignee` → { name: string }
- `reporter` → { name: string }
- `status` → { name: string }
- `labels` → string[]
- `components` → { name: string }[]
- `fixVersions` → { name: string }[]
- `environment` → ADF Document

### **Custom Field Types**
- `com.atlassian.jira.plugin.system.customfieldtypes:textfield` → ADF Document
- `com.atlassian.jira.plugin.system.customfieldtypes:textarea` → ADF Document
- `com.atlassian.jira.plugin.system.customfieldtypes:number` → number
- `com.atlassian.jira.plugin.system.customfieldtypes:float` → number
- `com.atlassian.jira.plugin.system.customfieldtypes:datepicker` → string (YYYY-MM-DD)
- `com.atlassian.jira.plugin.system.customfieldtypes:datetime` → string (ISO)
- `com.atlassian.jira.plugin.system.customfieldtypes:url` → string
- `com.atlassian.jira.plugin.system.customfieldtypes:userpicker` → { name: string }
- `com.atlassian.jira.plugin.system.customfieldtypes:grouppicker` → { name: string }
- `com.atlassian.jira.plugin.system.customfieldtypes:project` → { key: string }
- `com.atlassian.jira.plugin.system.customfieldtypes:version` → { name: string }
- `com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons` → { value: string }
- `com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes` → { value: string }[]
- `com.atlassian.jira.plugin.system.customfieldtypes:multiselect` → { value: string }[]
- `com.atlassian.jira.plugin.system.customfieldtypes:cascadingselect` → { value: string }
- `com.atlassian.jira.plugin.system.customfieldtypes:labels` → string[]

## ✅ **Benefits**

1. **Universal Support**: Handles all Jira field types automatically
2. **Intelligent Formatting**: Applies correct API format for each field type
3. **Flexible Input**: Accepts various input formats (string, array, object)
4. **Smart Validation**: Validates dropdown values against available options
5. **Error Handling**: Graceful handling of invalid field types or values
6. **Backward Compatibility**: Works with existing field update patterns
7. **Dry Run Support**: Test field formatting without making changes
8. **Partial Updates**: Continue with valid fields even if some fail

## 🔍 **Error Handling**

The system provides clear error messages for:
- Invalid dropdown values
- Unsupported field types
- Malformed input data
- API validation errors
- Rate limiting issues

## 📝 **Best Practices**

1. **Use field names** when possible for better readability
2. **Enable dry run** to test field formatting before updates
3. **Disable dropdown validation** for custom values
4. **Use partial updates** for complex field sets
5. **Check field types** in dry run results
6. **Handle errors gracefully** with try-catch blocks

This comprehensive field type support ensures that all Jira fields can be updated reliably and efficiently through the unified update functionality.
