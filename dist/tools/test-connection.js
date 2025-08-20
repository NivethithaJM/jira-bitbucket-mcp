import { BITBUCKET_WORKSPACE, BITBUCKET_API_KEY } from '../utils/clients.js';
import { getBitbucketRepositories } from './bitbucket-repositories.js';
export const testBitbucketConnectionToolDefinition = {
    name: 'test_bitbucket_connection',
    description: 'Test Bitbucket API connection and list repositories',
    inputSchema: {
        type: 'object',
        properties: {
            maxResults: {
                type: 'number',
                description: 'Maximum number of repositories to return (default: 10)',
                default: 10,
            },
        },
    },
};
export async function testBitbucketConnection(maxResults = 10) {
    try {
        const response = await getBitbucketRepositories(maxResults);
        return {
            status: 'success',
            workspace: BITBUCKET_WORKSPACE,
            repositoriesFound: response.values?.length || 0,
            repositories: response.values || [],
            configuration: {
                workspace: BITBUCKET_WORKSPACE,
                apiKeyConfigured: !!BITBUCKET_API_KEY,
                apiKeyLength: BITBUCKET_API_KEY?.length || 0
            }
        };
    }
    catch (error) {
        return {
            status: 'error',
            workspace: BITBUCKET_WORKSPACE,
            error: error instanceof Error ? error.message : String(error),
            configuration: {
                workspace: BITBUCKET_WORKSPACE,
                apiKeyConfigured: !!BITBUCKET_API_KEY,
                apiKeyLength: BITBUCKET_API_KEY?.length || 0
            }
        };
    }
}
//# sourceMappingURL=test-connection.js.map