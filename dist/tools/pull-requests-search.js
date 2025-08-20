import { jiraClient } from '../utils/clients.js';
import { getIssueRemoteId } from '../utils/cache.js';
export const getPullRequestsForIssueToolDefinition = {
    name: 'get_pull_requests_for_issue',
    description: 'Search all Bitbucket repositories for pull requests that reference a specific Jira issue key',
    inputSchema: {
        type: 'object',
        properties: {
            issueKey: {
                type: 'string',
                description: 'The Jira issue key to search for (e.g., NFD-41327)',
            },
        },
        required: ['issueKey'],
    },
};
export async function getPullRequestsForIssue(issueKey) {
    try {
        // Get the issue remote ID using cache
        const issueInfo = await getIssueRemoteId(issueKey);
        console.log(`Issue ${issueKey} has remote ID: ${issueInfo.remoteId} (cached: ${issueInfo.cached})`);
        // Use the Jira dev-status API with the remote ID (issueId)
        const response = await jiraClient.get(`/rest/dev-status/latest/issue/detail`, {
            params: {
                issueId: issueInfo.remoteId,
                applicationType: 'bitbucket',
                dataType: 'pullrequest'
            }
        });
        // Process pull requests and format as table
        // The API returns { detail: [{ pullRequests: [...] }] }
        const allPullRequests = [];
        const details = response.data?.detail || [];
        // Extract pull requests from each detail object
        details.forEach((detail) => {
            if (detail.pullRequests && Array.isArray(detail.pullRequests)) {
                allPullRequests.push(...detail.pullRequests);
            }
        });
        // Sort PRs by creation time in descending order (newest first)
        const sortedPRs = allPullRequests.sort((a, b) => {
            const dateA = new Date(a.lastUpdate || a.created || a.created_on || 0).getTime();
            const dateB = new Date(b.lastUpdate || b.created || b.created_on || 0).getTime();
            return dateB - dateA;
        });
        // Format as table with specified columns
        const tableData = sortedPRs.map((pr) => ({
            repository: pr.repositoryName || 'Unknown Repository',
            status: pr.status || 'UNKNOWN',
            url: pr.url || `https://bitbucket.org/unknown/pull-requests/${pr.id}`,
            title: pr.name || pr.title || 'Untitled PR',
            sourceBranch: pr.source?.branch?.name || pr.sourceBranch || 'Unknown',
            targetBranch: pr.destination?.branch?.name || pr.targetBranch || 'Unknown',
            assignee: pr.author?.name || 'Unassigned',
            createdDate: new Date(pr.lastUpdate || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }));
        // Always return table format, even if no PRs found
        return {
            table: {
                headers: ['Repository', 'Status', 'URL', 'PR Title', 'Source Branch', 'Target Branch', 'Assignee', 'Created Date'],
                rows: tableData.length > 0
                    ? tableData.map((pr) => [
                        pr.repository,
                        pr.status,
                        pr.url,
                        pr.title,
                        pr.sourceBranch,
                        pr.targetBranch,
                        pr.assignee,
                        pr.createdDate
                    ])
                    : [['No pull requests found', '', '', '', '', '', '', '']]
            }
        };
    }
    catch (error) {
        // Return table format even for errors
        return {
            table: {
                headers: ['Repository', 'Status', 'URL', 'PR Title', 'Source Branch', 'Target Branch', 'Assignee', 'Created Date'],
                rows: [[`Error: ${error}`, '', '', '', '', '', '', '']]
            }
        };
    }
}
//# sourceMappingURL=pull-requests-search.js.map