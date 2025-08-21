#!/bin/bash

# Jira-Bitbucket MCP Server Installation Script
# This script automates the installation and setup process

set -e  # Exit on any error

echo "🚀 Jira-Bitbucket MCP Server Installation"
echo "=========================================="
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

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Build the project
build_project() {
    print_status "Building the project..."
    npm run build
    print_success "Project built successfully"
}

# Get project path
get_project_path() {
    PROJECT_PATH=$(pwd)
    print_status "Project path: $PROJECT_PATH"
}

# Generate MCP configuration
create_mcp_config() {
    print_status "Generating MCP configuration..."
    
    echo ""
    print_status "📋 MCP Configuration for jira-bitbucket-mcp"
    echo "=================================================="
    echo ""
    echo "Copy the following configuration to your mcp.json file:"
    echo ""
    echo "----------------------------------------"
    cat << EOF
{
  "mcpServers": {
    "jira-bitbucket-mcp": {
      "command": "node",
      "args": ["$PROJECT_PATH/dist/index.js"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-jira-api-token",
        "BITBUCKET_WORKSPACE": "your-workspace-name",
        "BITBUCKET_API_TOKEN": "your-bitbucket-api-token"
      }
    }
  }
}
EOF
    echo "----------------------------------------"
    echo ""
    print_success "Configuration generated successfully!"
    echo ""
    print_status "📝 Next Steps:"
    echo "1. Copy the configuration above"
    echo "2. Paste it into your mcp.json file at your desired location"
    echo "3. Update the environment variables with your actual credentials"
    echo ""
    print_warning "⚠️  Important: Replace ALL placeholder values with your actual credentials!"
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Installation completed successfully!"
    echo "======================================"
    echo ""
    echo "Next steps:"
    echo "1. Generate API tokens:"
    echo "   - Go to https://id.atlassian.com/manage-profile/security/api-tokens"
    echo "   - Create two API tokens (one for Jira, one for Bitbucket)"
    echo "   - Set expiration to 1 year"
    echo "   - Select all scopes except delete actions"
    echo ""
    echo "2. Configure MCP:"
    echo "   - Copy the configuration shown above"
    echo "   - Paste it into your mcp.json file at your desired location"
    echo "   - Replace placeholder values with your actual credentials"
    echo "   - JIRA_BASE_URL: Your Jira instance URL"
    echo "   - JIRA_EMAIL: Your Atlassian account email"
    echo "   - JIRA_API_TOKEN: Your Jira API token"
    echo "   - BITBUCKET_WORKSPACE: Your Bitbucket workspace name"
    echo "   - BITBUCKET_API_TOKEN: Your Bitbucket API token"
    echo ""
    echo "3. Restart Cursor IDE:"
    echo "   - Close Cursor completely"
    echo "   - Reopen Cursor"
    echo "   - The MCP server will be available in your AI assistant"
    echo ""
    echo "4. Test the connection:"
    echo "   - Try asking: 'Search for Jira issues in project PROJ'"
    echo ""
    echo "📖 For detailed documentation, see README.md"
}

# Main installation process
main() {
    echo "Starting installation..."
    echo ""
    
    check_nodejs
    install_dependencies
    build_project
    get_project_path
    create_mcp_config
    show_next_steps
}

# Run main function
main "$@"
