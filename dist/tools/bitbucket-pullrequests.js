import { bitbucketClient, BITBUCKET_WORKSPACE } from '../utils/clients.js';
export const getBitbucketPullRequestsToolDefinition = {
    name: 'get_bitbucket_pull_requests',
    description: 'Get pull requests for a specific Bitbucket repository',
    inputSchema: {
        type: 'object',
        properties: {
            repositorySlug: {
                type: 'string',
                description: 'The repository slug/name',
            },
            state: {
                type: 'string',
                description: 'Filter by state (OPEN, MERGED, DECLINED, SUPERSEDED)',
                default: 'OPEN',
            },
            maxResults: {
                type: 'number',
                description: 'Maximum number of results to return (default: 20)',
                default: 20,
            },
        },
        required: ['repositorySlug'],
    },
};
export async function getBitbucketPullRequests(repositorySlug, state = 'OPEN', maxResults = 20) {
    if (!bitbucketClient) {
        return {
            error: 'Bitbucket API not configured',
            message: 'Bitbucket is not configured. Please set BITBUCKET_WORKSPACE and BITBUCKET_API_KEY.',
            suggestion: 'Use get_pull_requests_for_issue with a Jira issue key instead',
            repository: repositorySlug,
            values: [],
            navigationInfo: {
                repositoryUrl: `Repository access requires Bitbucket API configuration`,
                pullRequestsUrl: `Please configure Bitbucket API credentials`
            }
        };
    }
    try {
        const response = await bitbucketClient.get(`/repositories/${BITBUCKET_WORKSPACE}/${repositorySlug}/pullrequests`, {
            params: {
                state,
                pagelen: maxResults,
                fields: 'values.id,values.title,values.description,values.state,values.author,values.source.branch.name,values.destination.branch.name,values.links.html.href,values.created_on,values.updated_on',
            },
        });
        // Add navigation links to each PR
        const pullRequests = response.data.values || [];
        const enhancedPRs = pullRequests.map((pr) => ({
            ...pr,
            navigationLink: pr.links?.html?.href || `https://bitbucket.org/${BITBUCKET_WORKSPACE}/${repositorySlug}/pull-requests/${pr.id}`
        }));
        return {
            ...response.data,
            values: enhancedPRs,
            repository: repositorySlug,
            workspace: BITBUCKET_WORKSPACE,
            navigationInfo: {
                repositoryUrl: `https://bitbucket.org/${BITBUCKET_WORKSPACE}/${repositorySlug}`,
                pullRequestsUrl: `https://bitbucket.org/${BITBUCKET_WORKSPACE}/${repositorySlug}/pull-requests`
            }
        };
    }
    catch (error) {
        throw new Error(`Failed to get Bitbucket pull requests for ${repositorySlug}: ${error}`);
    }
}
//# sourceMappingURL=bitbucket-pullrequests.js.map