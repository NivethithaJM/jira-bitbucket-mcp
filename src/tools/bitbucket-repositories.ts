import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getBitbucketRepositoriesCached } from '../utils/cache.js';

export const getBitbucketRepositoriesToolDefinition: Tool = {
  name: 'get_bitbucket_repositories',
  description: 'List all repositories in the configured Bitbucket workspace',
  inputSchema: {
    type: 'object',
    properties: {
      maxResults: {
        type: 'number',
        description: 'Maximum number of results to return (default: 50)',
        default: 50,
      },
    },
  },
};

export async function getBitbucketRepositories(maxResults: number = 50) {
  try {
    const result = await getBitbucketRepositoriesCached(maxResults);
    
    // Return in the same format as before for compatibility
    return {
      values: result.repositories,
      cached: result.cached,
      pagelen: result.repositories.length,
      size: result.repositories.length
    };
  } catch (error) {
    throw new Error(`Failed to get Bitbucket repositories: ${error}`);
  }
}
