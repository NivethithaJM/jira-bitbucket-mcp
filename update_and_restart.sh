#!/bin/bash

# Jira-Bitbucket MCP Server Update and Restart Script
# This script updates the project, rebuilds it, and restarts the MCP server

set -e  # Exit on any error

echo "🔄 Jira-Bitbucket MCP Server Update and Restart"
echo "==============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
check_git_repo() {
    print_status "Checking if this is a git repository..."
    if [ ! -d ".git" ]; then
        print_error "This directory is not a git repository. Please run this script from the project root."
        exit 1
    fi
    print_success "Git repository detected"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Pull latest changes from git
pull_latest_changes() {
    print_status "Pulling latest changes from git..."
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes. Please commit or stash them before updating."
        echo "Current changes:"
        git status --short
        echo ""
        read -p "Do you want to stash changes and continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Stashing changes..."
            git stash
            print_success "Changes stashed successfully"
        else
            print_error "Update cancelled. Please commit or stash your changes first."
            exit 1
        fi
    fi
    
    # Pull latest changes
    git pull origin main
    if [ $? -eq 0 ]; then
        print_success "Successfully pulled latest changes"
    else
        print_error "Failed to pull latest changes. Please check your git configuration."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Build the project
build_project() {
    print_status "Building the project..."
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Project built successfully"
    else
        print_error "Failed to build project"
        exit 1
    fi
}

# Stop running MCP servers
stop_mcp_servers() {
    print_status "Stopping running MCP servers..."
    
    # Find and kill Node.js processes running the MCP server
    PROJECT_PATH=$(pwd)
    SERVER_PROCESSES=$(ps aux | grep "node.*dist/index.js" | grep -v grep | awk '{print $2}')
    
    if [ -n "$SERVER_PROCESSES" ]; then
        print_status "Found running MCP server processes: $SERVER_PROCESSES"
        echo "$SERVER_PROCESSES" | xargs kill -TERM
        sleep 2
        
        # Check if processes are still running and force kill if necessary
        REMAINING_PROCESSES=$(ps aux | grep "node.*dist/index.js" | grep -v grep | awk '{print $2}')
        if [ -n "$REMAINING_PROCESSES" ]; then
            print_warning "Some processes are still running. Force killing..."
            echo "$REMAINING_PROCESSES" | xargs kill -KILL
        fi
        
        print_success "MCP servers stopped successfully"
    else
        print_status "No running MCP servers found"
    fi
}

# Note: MCP server will be started by IDE when restarted
note_mcp_startup() {
    print_status "MCP server startup information..."
    print_status "The MCP server will be started automatically when you restart your IDE"
    print_status "No manual server startup is needed"
    SERVER_PID=""
}

# Display update information
show_update_info() {
    echo ""
    print_status "📋 Update Information:"
    echo "========================"
    echo "Project path: $(pwd)"
    echo "Build status: ✅ Completed successfully"
    echo "MCP servers: ✅ Stopped successfully"
    echo ""
    print_status "Next steps:"
    echo "1. Restart your IDE (Cursor)"
    echo "2. The MCP server will start automatically with your configuration"
    echo "3. Test the connection by asking your AI assistant"
    echo ""
}

# Ask user to restart IDE
ask_restart_ide() {
    echo ""
    print_warning "🔄 IDE Restart Required"
    echo "=========================="
    echo ""
    echo "To complete the update process, please restart your IDE (Cursor):"
    echo ""
    echo "1. Close Cursor completely"
    echo "2. Reopen Cursor"
    echo "3. The MCP server will start automatically with your existing configuration"
    echo ""
    echo "You can test the connection by asking:"
    echo "   - 'Search for Jira issues in project PROJ'"
    echo "   - 'List Bitbucket repositories'"
    echo ""
    print_success "Update process completed successfully!"
    print_status "The MCP server will be ready after IDE restart"
}

# Main update process
main() {
    echo "Starting update process..."
    echo ""
    
    check_git_repo
    check_nodejs
    pull_latest_changes
    install_dependencies
    build_project
    stop_mcp_servers
    note_mcp_startup
    show_update_info
    ask_restart_ide
}

# Run main function
main "$@"
