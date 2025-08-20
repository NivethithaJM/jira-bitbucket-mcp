import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { bitbucketClient } from '../utils/clients.js';

export const addBitbucketCommentToolDefinition: Tool = {
  name: 'add_bitbucket_comment',
  description: 'Add a comment to a Bitbucket pull request. Markdown input will be automatically converted to HTML.',
  inputSchema: {
    type: 'object',
    properties: {
      prUrl: {
        type: 'string',
        description: 'The Bitbucket pull request URL (e.g., https://bitbucket.org/workspace/repo/pull-requests/123)',
      },
      comment: {
        type: 'string',
        description: 'The comment text to add (markdown will be converted to HTML)',
      },
    },
    required: ['prUrl', 'comment'],
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

// Simple markdown to HTML converter (same as Jira comments)
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;
  
  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // Convert italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Convert inline code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Convert code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Convert line breaks (double newlines to paragraphs)
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // Convert single line breaks to <br>
  html = html.replace(/\n/g, '<br>');
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br><\/p>/g, '');
  
  return html;
}

// Check if text contains markdown patterns
function isMarkdown(text: string): boolean {
  const markdownPatterns = [
    /^#{1,6}\s/m,           // Headers
    /\*\*.*?\*\*/,          // Bold
    /__.*?__/,              // Bold
    /\*.*?\*/,              // Italic
    /_.*?_/,                // Italic
    /`.*?`/,                // Inline code
    /```[\s\S]*?```/,       // Code blocks
    /\[.*?\]\(.*?\)/,       // Links
    /^\* /m,                // Unordered lists
    /^\d+\. /m,             // Ordered lists
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
}

export async function addBitbucketComment(prUrl: string, comment: string) {
  try {
    // Check if Bitbucket client is available
    if (!bitbucketClient) {
      throw new Error('Bitbucket API not configured. Please set BITBUCKET_WORKSPACE and BITBUCKET_API_KEY environment variables.');
    }

    // Parse the Bitbucket URL
    const parsedUrl = parseBitbucketPrUrl(prUrl);
    if (!parsedUrl) {
      throw new Error('Invalid Bitbucket pull request URL');
    }

    const { workspace, repository, prId } = parsedUrl;
    
    console.log(`Adding comment to PR ${prId} in ${workspace}/${repository}`);

    // Add the required prefix (same as Jira comments)
    const prefix = "Added through jira-bitbucket mcp tool.\n\n";
    const fullComment = prefix + comment;
    
    // Check if the comment contains markdown and convert to HTML if needed
    const processedComment = isMarkdown(fullComment) ? convertMarkdownToHtml(fullComment) : fullComment;
    
    // Prepare the comment payload for Bitbucket API
    // Bitbucket API expects content.raw structure
    const commentPayload = {
      content: {
        raw: fullComment
      }
    };
    
    // Add comment to the pull request
    const response = await bitbucketClient.post(
      `/repositories/${workspace}/${repository}/pullrequests/${prId}/comments`,
      commentPayload
    );
    
    return {
      ...response.data,
      processedComment: processedComment,
      wasMarkdown: isMarkdown(fullComment),
      originalComment: comment,
      prUrl: prUrl,
      workspace: workspace,
      repository: repository,
      prId: prId
    };
  } catch (error) {
    throw new Error(`Failed to add comment to pull request: ${error}`);
  }
}
