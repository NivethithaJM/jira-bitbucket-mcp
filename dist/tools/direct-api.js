import { jiraClient } from '../utils/clients.js';
import { getIssueRemoteId } from '../utils/cache.js';
export const getIssuePullRequestsDirectToolDefinition = {
    name: 'get_issue_pull_requests_direct',
    description: 'Get pull requests for an issue using Jira dev-status API directly (more efficient)',
    inputSchema: {
        type: 'object',
        properties: {
            issueKey: {
                type: 'string',
                description: 'The Jira issue key (e.g., NFD-41327)',
            },
        },
        required: ['issueKey'],
    },
};
export async function getIssuePullRequestsDirect(issueKey) {
    try {
        // Get the issue remote ID using cache
        const issueInfo = await getIssueRemoteId(issueKey);
        console.log(`Issue ${issueKey} has remote ID: ${issueInfo.remoteId} (cached: ${issueInfo.cached})`);
        // Try multiple API endpoints for dev-status
        const endpoints = [
            '/rest/dev-status/latest/issue/detail',
            '/rest/dev-status/1.0/issue/detail'
        ];
        let response;
        let usedEndpoint;
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);
                response = await jiraClient.get(endpoint, {
                    params: {
                        issueId: issueInfo.remoteId,
                        applicationType: 'bitbucket',
                        dataType: 'pullrequest'
                    }
                });
                usedEndpoint = endpoint;
                console.log(`Success with endpoint: ${endpoint}`);
                break;
            }
            catch (endpointError) {
                console.log(`Failed with endpoint ${endpoint}:`, endpointError instanceof Error ? endpointError.message : endpointError);
                if (endpoint === endpoints[endpoints.length - 1]) {
                    throw endpointError; // Re-throw if it's the last endpoint
                }
            }
        }
        if (!response) {
            throw new Error('All dev-status API endpoints failed');
        }
        // Debug: Log the full response structure
        console.log(`API Response from ${usedEndpoint}:`, JSON.stringify(response.data, null, 2));
        // Process pull requests and format as table
        const pullRequests = response.data?.detail || [];
        console.log(`Found ${pullRequests.length} pull requests`);
        if (pullRequests.length > 0) {
            console.log('Sample PR structure:', JSON.stringify(pullRequests[0], null, 2));
        }
        // Sort PRs by creation time in descending order (newest first)
        const sortedPRs = pullRequests.sort((a, b) => {
            const dateA = new Date(a.created || a.created_on || 0).getTime();
            const dateB = new Date(b.created || b.created_on || 0).getTime();
            return dateB - dateA;
        });
        // Format as table with specified columns
        const tableData = sortedPRs.map((pr) => ({
            repository: pr.repository?.name || 'Unknown Repository',
            status: pr.status || 'UNKNOWN',
            url: pr.url || pr.links?.html?.href || `https://bitbucket.org/${pr.repository?.name || 'unknown'}/pull-requests/${pr.id}`,
            title: pr.name || pr.title || 'Untitled PR',
            assignee: pr.assignee?.display_name || pr.assignee?.username || 'Unassigned',
            createdDate: new Date(pr.created || pr.created_on || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }));
        return {
            debug: {
                endpointUsed: usedEndpoint,
                issueKey: issueKey,
                remoteId: issueInfo.remoteId,
                rawDataStructure: {
                    hasDetail: !!response.data?.detail,
                    detailLength: pullRequests.length,
                    sampleKeys: pullRequests.length > 0 ? Object.keys(pullRequests[0]) : []
                }
            },
            table: {
                headers: ['Repository', 'Status', 'URL', 'PR Title', 'Assignee', 'Created Date'],
                rows: tableData.map((pr) => [
                    pr.repository,
                    pr.status,
                    pr.url,
                    pr.title,
                    pr.assignee,
                    pr.createdDate
                ])
            }
        };
    }
    catch (error) {
        throw new Error(`Failed to get pull requests for issue ${issueKey} using direct API: ${error}`);
    }
}
//# sourceMappingURL=direct-api.js.map