import { jiraClient } from '../utils/clients.js';
export const addCommentToolDefinition = {
    name: 'add_comment',
    description: 'Add a comment to a Jira issue. Markdown input will be automatically converted to HTML.',
    inputSchema: {
        type: 'object',
        properties: {
            issueKey: {
                type: 'string',
                description: 'The issue key to add comment to (e.g., PROJ-123)',
            },
            comment: {
                type: 'string',
                description: 'The comment text to add (markdown will be converted to HTML)',
            },
        },
        required: ['issueKey', 'comment'],
    },
};
// Simple markdown to HTML converter
function convertMarkdownToHtml(markdown) {
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
function isMarkdown(text) {
    const markdownPatterns = [
        /^#{1,6}\s/m, // Headers
        /\*\*.*?\*\*/, // Bold
        /__.*?__/, // Bold
        /\*.*?\*/, // Italic
        /_.*?_/, // Italic
        /`.*?`/, // Inline code
        /```[\s\S]*?```/, // Code blocks
        /\[.*?\]\(.*?\)/, // Links
        /^\* /m, // Unordered lists
        /^\d+\. /m, // Ordered lists
    ];
    return markdownPatterns.some(pattern => pattern.test(text));
}
export async function addComment(issueKey, comment) {
    try {
        // Add the required prefix
        const prefix = "Added through jira-bitbucket mcp tool.\n\n";
        const fullComment = prefix + comment;
        // Check if the comment contains markdown and convert to HTML if needed
        const processedComment = isMarkdown(fullComment) ? convertMarkdownToHtml(fullComment) : fullComment;
        // Use HTML format for Jira comment if we detected/converted markdown
        const requestBody = isMarkdown(fullComment) ? {
            body: processedComment
        } : {
            body: {
                type: 'doc',
                version: 1,
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: processedComment,
                            },
                        ],
                    },
                ],
            },
        };
        const response = await jiraClient.post(`/rest/api/3/issue/${issueKey}/comment`, requestBody);
        return {
            ...response.data,
            processedComment: processedComment,
            wasMarkdown: isMarkdown(fullComment),
            originalComment: comment
        };
    }
    catch (error) {
        throw new Error(`Failed to add comment to issue ${issueKey}: ${error}`);
    }
}
//# sourceMappingURL=jira-comments.js.map