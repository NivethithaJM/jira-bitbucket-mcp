# Implementation Guidelines

Development and implementation details for the Jira MCP Server.

## Project Structure

```
mcp/
├── src/
│   ├── index.ts                    # Main MCP server entry point
│   ├── tools/                      # Tool implementations
│   │   ├── index.ts                # Tool exports and definitions
│   │   ├── jira-*.ts               # Jira-related tools
│   │   ├── bitbucket-*.ts          # Bitbucket-related tools
│   │   ├── pr-diff.ts              # PR diff tool
│   │   └── cache-management.ts     # Cache operations
│   ├── types/                      # TypeScript definitions
│   └── utils/                      # Utilities (cache, clients)
├── dist/                           # Compiled output
└── package.json                    # Dependencies and scripts
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm package manager

### Setup
```bash
npm install
npm run build
npm run dev
```

### Scripts
```bash
npm run build          # Build project
npm run dev            # Development mode
npm run test           # Run tests
```

## Adding New Tools

1. **Create tool file** in `src/tools/`:
   ```typescript
   export const myNewToolDefinition: Tool = {
     name: 'my_new_tool',
     description: 'Tool description',
     inputSchema: { type: 'object', properties: {}, required: [] }
   };
   
   export async function myNewTool(params: any) {
     return { result: 'success' };
   }
   ```

2. **Export in `src/tools/index.ts`**:
   ```typescript
   export { myNewToolDefinition, myNewTool } from './my-new-tool.js';
   ```

3. **Add handler in `src/index.ts`**:
   ```typescript
   case 'my_new_tool':
     result = await myNewTool(params);
     break;
   ```

## Code Organization

### Tool Structure
- **Tool Definition**: `toolNameToolDefinition`
- **Tool Function**: `toolName`
- **Input Schema**: JSON Schema validation
- **Error Handling**: Try-catch with descriptive messages

### Key Files
- **`utils/clients.ts`**: API client configurations
- **`utils/cache.ts`**: Caching utilities
- **`types/index.ts`**: TypeScript definitions

## Best Practices

### Code Style
- Use TypeScript for type safety
- Follow consistent naming conventions
- Add JSDoc for complex functions

### Error Handling
- Wrap API calls in try-catch
- Provide descriptive error messages
- Handle rate limiting gracefully

### Security
- Never log sensitive data
- Validate all input parameters
- Use environment variables

## Testing & Debugging

### Run Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
DEBUG=* npm run dev        # Debug mode
```

### Test Structure
```typescript
describe('tool-name', () => {
  it('should handle success case', async () => {
    // Test implementation
  });
  
  it('should handle errors', async () => {
    // Error test
  });
});
```

## Deployment

### Build
```bash
npm run build
ls -la dist/
```

## API Integration

### Jira Cloud REST API
- **Base URL**: `https://your-domain.atlassian.net`
- **Auth**: Basic Auth (email + API token)
- **Rate Limit**: 1000 requests/hour

### Bitbucket Cloud REST API
- **Base URL**: `https://api.bitbucket.org/2.0`
- **Auth**: Basic Auth (username + API key)
- **Rate Limit**: 1000 requests/hour

## Caching

### Cache Types
- **Repository Cache**: 10 minutes TTL
- **Issue Cache**: 1 hour TTL
- **Key Format**: `type:identifier`

### Cache Management
- Clear all caches
- Selective clearing
- Statistics monitoring

## Error Handling

### API Errors
```typescript
try {
  const response = await apiClient.get('/endpoint');
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    throw new Error('Authentication failed');
  }
  throw new Error(`API request failed: ${error.message}`);
}
```

### Input Validation
```typescript
if (!issueKey || typeof issueKey !== 'string') {
  throw new Error('Invalid issue key');
}
```

### URL Parsing
```typescript
function parseBitbucketPrUrl(url: string): ParsedPrUrl | null {
  try {
    const urlObj = new URL(url);
    const segments = urlObj.pathname.split('/').filter(s => s.length > 0);
    return segments.length >= 4 ? {
      workspace: segments[0],
      repository: segments[1],
      prId: segments[3]
    } : null;
  } catch (error) {
    return null;
  }
}
```

## Markdown Processing

### Markdown to HTML
```typescript
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return html;
}
```

### Markdown Detection
```typescript
function isMarkdown(text: string): boolean {
  const patterns = [/^#{1,6}\s/m, /\*\*.*?\*\*/, /`.*?`/, /\[.*?\]\(.*?\)/];
  return patterns.some(pattern => pattern.test(text));
}
```

## Performance & Security

### Caching
```typescript
class Cache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 600000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item || Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
}
```

### API Clients
```typescript
export const jiraClient = axios.create({
  baseURL: process.env.JIRA_BASE_URL,
  auth: { username: process.env.JIRA_EMAIL, password: process.env.JIRA_API_TOKEN },
  timeout: 30000
});
```

## Security & Monitoring

### Security
- Store sensitive data in environment variables
- Validate all input parameters
- Use HTTPS for API communications
- Handle rate limiting gracefully

### Logging
```typescript
console.log(JSON.stringify({
  level: 'info',
  timestamp: new Date().toISOString(),
  tool: 'tool_name',
  message: 'Operation description'
}));
```

### Monitoring
- Track API response times
- Monitor cache hit rates
- Log error rates
- Health checks for APIs
