import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { jiraClient } from '../utils/clients.js';

export const summarizeJiraTicketToolDefinition: Tool = {
  name: 'summarize_jira_ticket',
  description: 'Get a comprehensive summary of a Jira ticket including all information, comments, custom fields, attachments, and structured analysis',
  inputSchema: {
    type: 'object',
    properties: {
      issueKey: {
        type: 'string',
        description: 'The Jira issue key to summarize (e.g., PROJ-123)',
      },
    },
    required: ['issueKey'],
  },
};

interface JiraComment {
  id: string;
  author: {
    displayName: string;
    emailAddress: string;
  };
  body: string;
  created: string;
  updated: string;
}

interface JiraAttachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  created: string;
  content: string;
}

interface CustomField {
  id: string;
  name: string;
  value: any;
}

export async function summarizeJiraTicket(issueKey: string) {
  try {
    // Get the main issue details with all fields
    const issueResponse = await jiraClient.get(`/rest/api/3/issue/${issueKey}`, {
      params: {
        expand: 'renderedFields,names,schema,transitions,operations,editmeta,changelog,versionedRepresentations,customfield_*,attachment,comment'
      }
    });

    const issue = issueResponse.data;
    const fields = issue.fields;

    // Get comments
    const commentsResponse = await jiraClient.get(`/rest/api/3/issue/${issueKey}/comment`, {
      params: {
        maxResults: 1000,
        orderBy: 'created DESC'
      }
    });
    const comments: JiraComment[] = commentsResponse.data.comments || [];

    // Get attachments
    const attachments: JiraAttachment[] = fields.attachment || [];

    // Extract custom fields
    const customFields: CustomField[] = [];
    Object.keys(fields).forEach(key => {
      if (key.startsWith('customfield_') && fields[key] !== null && fields[key] !== undefined) {
        const fieldName = key;
        const fieldValue = fields[key];
        customFields.push({
          id: key,
          name: key, // We'll try to get the actual name if possible
          value: fieldValue
        });
      }
    });

    // Extract fix versions and identified versions
    const fixVersions = fields.fixVersions || [];
    const affectedVersions = fields.versions || [];

    // Parse description (handle both string and structured content)
    let description = '';
    if (typeof fields.description === 'string') {
      description = fields.description;
    } else if (fields.description && fields.description.content) {
      // Handle structured content (Atlassian Document Format)
      description = extractTextFromStructuredContent(fields.description.content);
    }

    // Extract steps to reproduce from description or custom fields
    const stepsToReproduce = extractStepsToReproduce(description, customFields);

    // Analyze comments for discussion summary
    const discussionSummary = analyzeComments(comments);

    // Extract root cause and solution from comments and description
    const { rootCause, solution } = extractRootCauseAndSolution(description, comments);

    // Create structured summary
    const summary = {
      issueKey: issueKey,
      basicInfo: {
        summary: fields.summary,
        status: fields.status?.name,
        priority: fields.priority?.name,
        assignee: fields.assignee?.displayName || 'Unassigned',
        reporter: fields.reporter?.displayName,
        created: fields.created,
        updated: fields.updated,
        resolution: fields.resolution?.name,
        issueType: fields.issuetype?.name,
        project: fields.project?.name
      },
      versions: {
        fixVersions: fixVersions.map((v: any) => ({
          name: v.name,
          description: v.description,
          released: v.released,
          releaseDate: v.releaseDate
        })),
        affectedVersions: affectedVersions.map((v: any) => ({
          name: v.name,
          description: v.description,
          released: v.released,
          releaseDate: v.releaseDate
        }))
      },
      description: description,
      stepsToReproduce: stepsToReproduce,
      rootCause: rootCause,
      solution: solution,
      discussionSummary: discussionSummary,
      attachments: attachments.map(att => ({
        filename: att.filename,
        size: att.size,
        mimeType: att.mimeType,
        created: att.created
      })),
      customFields: customFields,
      comments: comments.map(comment => ({
        author: comment.author.displayName,
        body: comment.body,
        created: comment.created,
        updated: comment.updated
      })),
      metadata: {
        totalComments: comments.length,
        totalAttachments: attachments.length,
        totalCustomFields: customFields.length,
        lastUpdated: fields.updated
      }
    };

    return summary;
  } catch (error) {
    throw new Error(`Failed to summarize Jira ticket ${issueKey}: ${error}`);
  }
}

function extractTextFromStructuredContent(content: any[]): string {
  let text = '';
  
  function processNode(node: any) {
    if (node.type === 'text') {
      text += node.text || '';
    } else if (node.content && Array.isArray(node.content)) {
      node.content.forEach(processNode);
    }
    
    // Add line breaks for paragraph breaks
    if (node.type === 'paragraph') {
      text += '\n';
    }
  }
  
  content.forEach(processNode);
  return text.trim();
}

function extractStepsToReproduce(description: string, customFields: CustomField[]): string {
  // Look for common patterns in description
  const patterns = [
    /steps?\s*to\s*reproduce?[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
    /reproduction\s*steps?[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
    /how\s*to\s*reproduce?[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i
  ];
  
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Look in custom fields for steps to reproduce
  for (const field of customFields) {
    if (field.name.toLowerCase().includes('steps') || 
        field.name.toLowerCase().includes('reproduce') ||
        field.name.toLowerCase().includes('reproduction')) {
      return String(field.value);
    }
  }
  
  return 'Steps to reproduce not explicitly documented.';
}

function analyzeComments(comments: JiraComment[]): string {
  if (comments.length === 0) {
    return 'No comments found.';
  }
  
  const discussionPoints: string[] = [];
  const participants = new Set<string>();
  
  comments.forEach(comment => {
    participants.add(comment.author.displayName);
    
    // Extract key discussion points (simplified analysis)
    const body = comment.body.toLowerCase();
    if (body.includes('root cause') || body.includes('cause')) {
      discussionPoints.push(`Root cause discussed by ${comment.author.displayName}`);
    }
    if (body.includes('solution') || body.includes('fix') || body.includes('resolution')) {
      discussionPoints.push(`Solution discussed by ${comment.author.displayName}`);
    }
    if (body.includes('investigation') || body.includes('analysis')) {
      discussionPoints.push(`Investigation/analysis by ${comment.author.displayName}`);
    }
  });
  
  const summary = [
    `Total comments: ${comments.length}`,
    `Participants: ${Array.from(participants).join(', ')}`,
    `Key discussion points: ${discussionPoints.length > 0 ? discussionPoints.join('; ') : 'General discussion'}`
  ].join('\n');
  
  return summary;
}

function extractRootCauseAndSolution(description: string, comments: JiraComment[]): { rootCause: string, solution: string } {
  let rootCause = 'Root cause not explicitly documented.';
  let solution = 'Solution not explicitly documented.';
  
  // Look for root cause in description
  const rootCausePatterns = [
    /root\s*cause[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
    /cause[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
    /reason[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i
  ];
  
  for (const pattern of rootCausePatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      rootCause = match[1].trim();
      break;
    }
  }
  
  // Look for solution in description
  const solutionPatterns = [
    /solution[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
    /resolution[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
    /fix[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i
  ];
  
  for (const pattern of solutionPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      solution = match[1].trim();
      break;
    }
  }
  
  // Look in comments for root cause and solution
  comments.forEach(comment => {
    const body = comment.body.toLowerCase();
    if (body.includes('root cause') && rootCause === 'Root cause not explicitly documented.') {
      rootCause = `Root cause mentioned in comment by ${comment.author.displayName}: ${comment.body.substring(0, 200)}...`;
    }
    if ((body.includes('solution') || body.includes('fix')) && solution === 'Solution not explicitly documented.') {
      solution = `Solution mentioned in comment by ${comment.author.displayName}: ${comment.body.substring(0, 200)}...`;
    }
  });
  
  return { rootCause, solution };
}
