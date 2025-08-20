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

interface FileChange {
  file: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
}

function parseRawDiff(diffString: string): FileChange[] {
  const fileChanges: FileChange[] = [];
  const lines = diffString.split('\n');
  
  let currentFile: FileChange | null = null;
  let inHunk = false;
  
  for (const line of lines) {
    // Check for file header
    if (line.startsWith('diff --git')) {
      // Save previous file if exists
      if (currentFile) {
        currentFile.changes = currentFile.additions + currentFile.deletions;
        fileChanges.push(currentFile);
      }
      
      // Extract filename from diff header
      const match = line.match(/diff --git a\/(.+) b\/(.+)/);
      if (match) {
        const filePath = match[2]; // Use the 'b' path (new file path)
        currentFile = {
          file: filePath,
          status: 'modified',
          additions: 0,
          deletions: 0,
          changes: 0
        };
      }
      inHunk = false;
    }
    // Check for new file
    else if (line.startsWith('new file mode')) {
      if (currentFile) {
        currentFile.status = 'added';
      }
    }
    // Check for deleted file
    else if (line.startsWith('deleted file mode')) {
      if (currentFile) {
        currentFile.status = 'deleted';
      }
    }
    // Check for hunk header
    else if (line.startsWith('@@')) {
      inHunk = true;
    }
    // Count additions and deletions within hunks
    else if (inHunk && currentFile) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        currentFile.additions++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        currentFile.deletions++;
      }
    }
  }
  
  // Add the last file
  if (currentFile) {
    currentFile.changes = currentFile.additions + currentFile.deletions;
    fileChanges.push(currentFile);
  }
  
  return fileChanges;
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

    // Get PR details first to understand the PR structure
    console.log(`Getting PR details for ${prId}...`);
    const prDetailsResponse = await bitbucketClient.get(`/repositories/${workspace}/${repository}/pullrequests/${prId}`);
    const prDetails = prDetailsResponse.data;
    
    if (!prDetails || !prDetails.source || !prDetails.source.commit) {
      return {
        table: {
          headers: ['File', 'Status', 'Additions', 'Deletions', 'Changes'],
          rows: [['No commit information available', '', '', '', '']]
        }
      };
    }
    
    // Get the complete PR diff between source and target branches (includes all commits in the PR)
    const sourceCommit = prDetails.source.commit.hash;
    const targetCommit = prDetails.destination.commit.hash;
    
    console.log(`Getting complete PR diff from ${sourceCommit}..${targetCommit} (includes all commits)`);
    const response = await bitbucketClient.get(`/repositories/${workspace}/${repository}/diff/${sourceCommit}..${targetCommit}`);

    // Parse the diff data - Bitbucket returns raw diff string
    const diffData = response.data;
    
    if (!diffData || typeof diffData !== 'string') {
      return {
        table: {
          headers: ['File', 'Status', 'Additions', 'Deletions', 'Changes'],
          rows: [['No diff information available', '', '', '', '']]
        }
      };
    }

    // Parse the raw diff string
    const fileChanges = parseRawDiff(diffData);
    
    if (fileChanges.length === 0) {
      return {
        table: {
          headers: ['File', 'Status', 'Additions', 'Deletions', 'Changes'],
          rows: [['No file changes detected', '', '', '', '']]
        }
      };
    }

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
        sourceBranch: prDetails.source?.branch?.name || 'unknown',
        targetBranch: prDetails.destination?.branch?.name || 'unknown',
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
