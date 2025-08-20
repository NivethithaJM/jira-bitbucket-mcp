import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { bitbucketClient } from '../utils/clients.js';

export const getPrDiffToolDefinition: Tool = {
  name: 'get_pr_diff',
  description: 'Get pull request diff information from a Bitbucket URL',
  inputSchema: {
    type: 'object',
    properties: {
      prUrl: {
        type: 'string',
        description: 'The Bitbucket pull request URL (e.g., https://bitbucket.org/workspace/repo/pull-requests/123)',
      },
    },
    required: ['prUrl'],
  },
};

interface ParsedPrUrl {
  workspace: string;
  repository: string;
  prId: string;
}

function parseBitbucketPrUrl(url: string): ParsedPrUrl | null {
  try {
    // Handle both regular and UUID-based URLs
    const urlObj = new URL(url);
    
    // Extract path segments
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
    
    if (pathSegments.length < 4 || pathSegments[2] !== 'pull-requests') {
      return null;
    }
    
    const workspace = pathSegments[0];
    const repository = pathSegments[1];
    const prId = pathSegments[3];
    
    // Validate that we have all required parts
    if (!workspace || !repository || !prId) {
      return null;
    }
    
    return {
      workspace,
      repository,
      prId
    };
  } catch (error) {
    console.error('Error parsing Bitbucket URL:', error);
    return null;
  }
}

export async function getPrDiff(prUrl: string) {
  try {
    // Check if Bitbucket client is available
    if (!bitbucketClient) {
      return {
        table: {
          headers: ['File', 'Status', 'Additions', 'Deletions', 'Changes'],
          rows: [['Error: Bitbucket API not configured. Please set BITBUCKET_WORKSPACE and BITBUCKET_API_KEY environment variables.', '', '', '', '']]
        }
      };
    }

    // Parse the Bitbucket URL
    const parsedUrl = parseBitbucketPrUrl(prUrl);
    if (!parsedUrl) {
      return {
        table: {
          headers: ['File', 'Status', 'Additions', 'Deletions', 'Changes'],
          rows: [['Error: Invalid Bitbucket pull request URL', '', '', '', '']]
        }
      };
    }

    const { workspace, repository, prId } = parsedUrl;
    
    console.log(`Fetching diff for PR ${prId} in ${workspace}/${repository}`);

    // Get the pull request diff using Bitbucket API
    const response = await bitbucketClient.get(`/repositories/${workspace}/${repository}/pullrequests/${prId}/diff`);

    // Parse the diff data
    const diffData = response.data;
    
    if (!diffData || !Array.isArray(diffData)) {
      return {
        table: {
          headers: ['File', 'Status', 'Additions', 'Deletions', 'Changes'],
          rows: [['No diff information available', '', '', '', '']]
        }
      };
    }

    // Process diff data and extract file information
    const fileChanges: any[] = [];
    
    diffData.forEach((fileDiff: any) => {
      if (fileDiff && fileDiff.new && fileDiff.new.path) {
        const fileName = fileDiff.new.path;
        const status = fileDiff.status || 'modified';
        
        // Count additions and deletions
        let additions = 0;
        let deletions = 0;
        
        if (fileDiff.hunks && Array.isArray(fileDiff.hunks)) {
          fileDiff.hunks.forEach((hunk: any) => {
            if (hunk.segments && Array.isArray(hunk.segments)) {
              hunk.segments.forEach((segment: any) => {
                if (segment.type === 'added') {
                  additions += segment.lines ? segment.lines.length : 0;
                } else if (segment.type === 'removed') {
                  deletions += segment.lines ? segment.lines.length : 0;
                }
              });
            }
          });
        }
        
        const totalChanges = additions + deletions;
        
        fileChanges.push({
          file: fileName,
          status: status,
          additions: additions,
          deletions: deletions,
          changes: totalChanges
        });
      }
    });

    // Sort by total changes (most changes first)
    const sortedChanges = fileChanges.sort((a, b) => b.changes - a.changes);

    // Calculate summary statistics
    const totalFiles = sortedChanges.length;
    const totalAdditions = sortedChanges.reduce((sum, file) => sum + file.additions, 0);
    const totalDeletions = sortedChanges.reduce((sum, file) => sum + file.deletions, 0);
    const totalChanges = totalAdditions + totalDeletions;

    // Create summary row
    const summaryRow = [
      `Total (${totalFiles} files)`,
      '',
      totalAdditions.toString(),
      totalDeletions.toString(),
      totalChanges.toString()
    ];

    // Format as table
    const tableRows = sortedChanges.map((file) => [
      file.file,
      file.status,
      file.additions.toString(),
      file.deletions.toString(),
      file.changes.toString()
    ]);

    // Add summary row at the top
    tableRows.unshift(summaryRow);

    return {
      table: {
        headers: ['File', 'Status', 'Additions', 'Deletions', 'Changes'],
        rows: tableRows
      },
      summary: {
        prUrl: prUrl,
        workspace: workspace,
        repository: repository,
        prId: prId,
        totalFiles: totalFiles,
        totalAdditions: totalAdditions,
        totalDeletions: totalDeletions,
        totalChanges: totalChanges
      }
    };

  } catch (error) {
    console.error('Error fetching PR diff:', error);
    
    // Return table format even for errors
    return {
      table: {
        headers: ['File', 'Status', 'Additions', 'Deletions', 'Changes'],
        rows: [[`Error: ${error}`, '', '', '', '']]
      }
    };
  }
}
