#!/usr/bin/env node

/**
 * Bitbucket API Token Test Script
 * This script tests your Bitbucket API token authentication
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BITBUCKET_WORKSPACE = process.env.BITBUCKET_WORKSPACE;
const BITBUCKET_API_KEY = process.env.BITBUCKET_API_KEY;
const JIRA_EMAIL = process.env.JIRA_EMAIL;

console.log('🔍 Bitbucket API Token Test\n');

// Check environment variables
if (!BITBUCKET_WORKSPACE || !BITBUCKET_API_KEY || !JIRA_EMAIL) {
  console.error('❌ Missing required environment variables:');
  console.error(`   BITBUCKET_WORKSPACE: ${BITBUCKET_WORKSPACE ? '✅ Set' : '❌ Missing'}`);
  console.error(`   BITBUCKET_API_KEY: ${BITBUCKET_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.error(`   JIRA_EMAIL: ${JIRA_EMAIL ? '✅ Set' : '❌ Missing'}`);
  process.exit(1);
}

console.log('✅ Environment variables are set');
console.log(`   Workspace: ${BITBUCKET_WORKSPACE}`);
console.log(`   Email: ${JIRA_EMAIL}`);
console.log(`   API Key: ${BITBUCKET_API_KEY.substring(0, 8)}...`);

// Test 1: List repositories
console.log('\n🧪 Test 1: List repositories');
try {
  const response = await axios.get(`https://api.bitbucket.org/2.0/repositories/${BITBUCKET_WORKSPACE}`, {
    auth: {
      username: JIRA_EMAIL,
      password: BITBUCKET_API_KEY,
    },
    headers: {
      'Accept': 'application/json',
    },
  });
  
  console.log('✅ Repository list test passed');
  console.log(`   Found ${response.data.values?.length || 0} repositories`);
  
  if (response.data.values && response.data.values.length > 0) {
    console.log('   Sample repositories:');
    response.data.values.slice(0, 3).forEach(repo => {
      console.log(`     - ${repo.name} (${repo.slug})`);
    });
  }
} catch (error) {
  console.error('❌ Repository list test failed');
  console.error(`   Status: ${error.response?.status}`);
  console.error(`   Message: ${error.response?.data?.error?.message || error.message}`);
}

// Test 2: Test specific repository (oasis_repo)
console.log('\n🧪 Test 2: Test oasis_repo access');
try {
  const response = await axios.get(`https://api.bitbucket.org/2.0/repositories/${BITBUCKET_WORKSPACE}/oasis_repo`, {
    auth: {
      username: JIRA_EMAIL,
      password: BITBUCKET_API_KEY,
    },
    headers: {
      'Accept': 'application/json',
    },
  });
  
  console.log('✅ oasis_repo access test passed');
  console.log(`   Repository: ${response.data.name}`);
  console.log(`   Slug: ${response.data.slug}`);
  console.log(`   Type: ${response.data.scm}`);
} catch (error) {
  console.error('❌ oasis_repo access test failed');
  console.error(`   Status: ${error.response?.status}`);
  console.error(`   Message: ${error.response?.data?.error?.message || error.message}`);
  
  if (error.response?.status === 404) {
    console.log('   💡 Repository "oasis_repo" might not exist or you might not have access');
  }
}

// Test 3: List pull requests (if repository exists)
console.log('\n🧪 Test 3: List pull requests');
try {
  const response = await axios.get(`https://api.bitbucket.org/2.0/repositories/${BITBUCKET_WORKSPACE}/oasis_repo/pullrequests`, {
    auth: {
      username: JIRA_EMAIL,
      password: BITBUCKET_API_KEY,
    },
    headers: {
      'Accept': 'application/json',
    },
    params: {
      pagelen: 5,
      state: 'OPEN'
    }
  });
  
  console.log('✅ Pull requests test passed');
  console.log(`   Found ${response.data.values?.length || 0} open pull requests`);
  
  if (response.data.values && response.data.values.length > 0) {
    console.log('   Sample pull requests:');
    response.data.values.slice(0, 3).forEach(pr => {
      console.log(`     - #${pr.id}: ${pr.title} (${pr.state})`);
    });
  }
} catch (error) {
  console.error('❌ Pull requests test failed');
  console.error(`   Status: ${error.response?.status}`);
  console.error(`   Message: ${error.response?.data?.error?.message || error.message}`);
}

console.log('\n📋 Summary:');
console.log('If all tests passed, your Bitbucket API token is working correctly.');
console.log('If you see 401 errors, check:');
console.log('1. API token has correct scopes (Repositories: Read, Pull requests: Read)');
console.log('2. API token is not expired');
console.log('3. Email address matches your Atlassian account');
console.log('4. Workspace name is correct');
