#!/usr/bin/env node

/**
 * MCP Debug Script
 * This script helps diagnose MCP-related issues and provides troubleshooting information
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 MCP Debug Utility\n');

// Check if dist directory exists
const distPath = join(process.cwd(), 'dist');
if (!existsSync(distPath)) {
  console.error('❌ dist/ directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Check if main entry point exists
const mainFile = join(distPath, 'index.js');
if (!existsSync(mainFile)) {
  console.error('❌ dist/index.js not found. Please run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Build files found');

// Check environment variables
const requiredEnvVars = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.log('\n💡 To fix this, set the following environment variables:');
  missingEnvVars.forEach(varName => {
    console.log(`   export ${varName}="your-value-here"`);
  });
  console.log('\nOr add them to your MCP configuration file (mcp.json)');
  process.exit(1);
}

console.log('✅ Required environment variables are set');

// Test MCP server startup
console.log('\n🚀 Testing MCP server startup...');

const mcpProcess = spawn('node', [mainFile], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

let output = '';
let errorOutput = '';

mcpProcess.stdout.on('data', (data) => {
  output += data.toString();
});

mcpProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('Server output:', data.toString().trim());
});

mcpProcess.on('close', (code) => {
  console.log(`\n📊 Server process exited with code: ${code}`);
  
  if (code === 0) {
    console.log('✅ Server started successfully');
  } else {
    console.log('❌ Server failed to start');
    if (errorOutput) {
      console.log('\n🔍 Error details:');
      console.log(errorOutput);
    }
  }
});

mcpProcess.on('error', (error) => {
  console.error('❌ Failed to start server process:', error.message);
});

// Test with a simple JSON-RPC message
setTimeout(() => {
  console.log('\n📨 Testing JSON-RPC communication...');
  
  const testMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  }) + '\n';
  
  mcpProcess.stdin.write(testMessage);
  
  setTimeout(() => {
    console.log('\n⏰ Test completed. Terminating server...');
    mcpProcess.kill('SIGTERM');
  }, 3000);
}, 2000);

// Diagnostic information
console.log('\n📋 Diagnostic Information:');
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Working directory: ${process.cwd()}`);

// Check package.json
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  console.log(`Package name: ${packageJson.name}`);
  console.log(`Package version: ${packageJson.version}`);
} catch (error) {
  console.log('Could not read package.json');
}

console.log('\n💡 Common solutions for MCP error 32603:');
console.log('1. Ensure all environment variables are correctly set');
console.log('2. Check that the MCP configuration file (mcp.json) is valid');
console.log('3. Verify the server process can start without errors');
console.log('4. Ensure the Node.js version is compatible (18+)');
console.log('5. Check that all dependencies are installed (npm install)');
console.log('6. Rebuild the project (npm run build)');

