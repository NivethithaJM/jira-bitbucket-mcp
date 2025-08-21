import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Jira API configuration
export const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
export const JIRA_EMAIL = process.env.JIRA_EMAIL;
export const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

// Bitbucket API configuration
export const BITBUCKET_WORKSPACE = process.env.BITBUCKET_WORKSPACE;
export const BITBUCKET_API_KEY = process.env.BITBUCKET_API_KEY;

if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Missing required environment variables: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN');
  process.exit(1);
}

// Bitbucket credentials are now mandatory
if (!BITBUCKET_WORKSPACE || !BITBUCKET_API_KEY) {
  console.error('Missing required Bitbucket environment variables: BITBUCKET_WORKSPACE, BITBUCKET_API_KEY');
  process.exit(1);
}

// Create axios instance for Jira API
export const jiraClient = axios.create({
  baseURL: JIRA_BASE_URL,
  auth: {
    username: JIRA_EMAIL,
    password: JIRA_API_TOKEN,
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Create axios instance for Bitbucket API
export const bitbucketClient = axios.create({
  baseURL: 'https://api.bitbucket.org/2.0',
  auth: {
    username: JIRA_EMAIL, // Use the same Atlassian account email
    password: BITBUCKET_API_KEY, // Use the API token as password
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});
