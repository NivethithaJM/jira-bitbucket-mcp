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

# Create MCP configuration
create_mcp_config() {
    print_status "Creating MCP configuration..."
    
    # Check if mcp.json already exists
    if [ -f "mcp.json" ]; then
        print_warning "mcp.json already exists. Checking for existing configuration..."
        
        # Check if jira-bitbucket-mcp server already exists
        if grep -q '"jira-bitbucket-mcp"' mcp.json; then
            print_status "Found existing jira-bitbucket-mcp configuration. Verifying environment variables..."
            
            # Check for placeholder values
            local has_placeholders=false
            local missing_vars=()
            
            # Check each required environment variable
            if grep -q '"JIRA_BASE_URL": "https://your-domain.atlassian.net"' mcp.json; then
                has_placeholders=true
                missing_vars+=("JIRA_BASE_URL")
            fi
            
            if grep -q '"JIRA_EMAIL": "your-email@example.com"' mcp.json; then
                has_placeholders=true
                missing_vars+=("JIRA_EMAIL")
            fi
            
            if grep -q '"JIRA_API_TOKEN": "your-jira-api-token"' mcp.json; then
                has_placeholders=true
                missing_vars+=("JIRA_API_TOKEN")
            fi
            
            if grep -q '"BITBUCKET_WORKSPACE": "your-workspace-name"' mcp.json; then
                has_placeholders=true
                missing_vars+=("BITBUCKET_WORKSPACE")
            fi
            
            if grep -q '"BITBUCKET_API_TOKEN": "your-bitbucket-api-token"' mcp.json; then
                has_placeholders=true
                missing_vars+=("BITBUCKET_API_TOKEN")
            fi
            
            if [ "$has_placeholders" = true ]; then
                print_warning "Found placeholder values in existing configuration:"
                for var in "${missing_vars[@]}"; do
                    echo "   - $var"
                done
                echo ""
                print_status "Please update these values in mcp.json with your actual credentials:"
                echo "   - JIRA_BASE_URL: Your Jira instance URL"
                echo "   - JIRA_EMAIL: Your Atlassian account email"
                echo "   - JIRA_API_TOKEN: Your Jira API token"
                echo "   - BITBUCKET_WORKSPACE: Your Bitbucket workspace name"
                echo "   - BITBUCKET_API_TOKEN: Your Bitbucket API token"
                echo ""
                print_success "Skipping MCP configuration creation (using existing config)"
            else
                print_success "Existing jira-bitbucket-mcp configuration appears to be properly configured"
                print_status "All environment variables have been set with actual values"
            fi
        else
            print_status "No existing jira-bitbucket-mcp configuration found. Appending to existing mcp.json..."
            
            # Backup existing config
            cp mcp.json mcp.json.backup
            print_warning "Backed up existing mcp.json to mcp.json.backup"
            
            # Create a more robust approach using jq if available, otherwise use sed
            if command -v jq &> /dev/null; then
                print_status "Using jq for JSON manipulation..."
                
                # Create the new server configuration as JSON
                cat > temp_server.json << EOF
{
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
EOF
                
                # Merge the new server into existing mcpServers
                jq '.mcpServers += input' mcp.json temp_server.json > mcp.json.new
                mv mcp.json.new mcp.json
                rm -f temp_server.json
                
            else
                print_status "Using sed for JSON manipulation..."
                
                # Find the line before the closing brace of mcpServers and add comma
                # This handles the case where there are multiple servers
                sed -i.bak '/^  }$/i\    ,' mcp.json
                
                # Add the new server configuration before the closing brace
                sed -i.bak2 '/^  }$/i\
    "jira-bitbucket-mcp": {\
      "command": "node",\
      "args": ["'"$PROJECT_PATH"'/dist/index.js"],\
      "env": {\
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",\
        "JIRA_EMAIL": "your-email@example.com",\
        "JIRA_API_TOKEN": "your-jira-api-token",\
        "BITBUCKET_WORKSPACE": "your-workspace-name",\
        "BITBUCKET_API_TOKEN": "your-bitbucket-api-token"\
      }\
    }' mcp.json
                
                # Clean up backup files created by sed
                rm -f mcp.json.bak mcp.json.bak2
            fi
            
            print_success "Added jira-bitbucket-mcp configuration to existing mcp.json"
            print_warning "Please update the environment variables in mcp.json with your actual credentials"
        fi
    else
        # Create new mcp.json file
        print_status "Creating new mcp.json configuration..."
        cat > mcp.json << EOF
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
        
        print_success "MCP configuration created at mcp.json"
        echo ""
        print_status "📝 Environment Variables Setup Instructions:"
        echo ""
        echo "Please update the following environment variables in mcp.json:"
        echo ""
        echo "  🔧 JIRA_BASE_URL:"
        echo "     - Replace: https://your-domain.atlassian.net"
        echo "     - With: Your actual Jira Cloud instance URL"
        echo "     - Example: https://mycompany.atlassian.net"
        echo ""
        echo "  📧 JIRA_EMAIL:"
        echo "     - Replace: your-email@example.com"
        echo "     - With: Your Atlassian account email address"
        echo "     - Example: john.doe@company.com"
        echo ""
        echo "  🔑 JIRA_API_TOKEN:"
        echo "     - Replace: your-jira-api-token"
        echo "     - With: Your Jira API token"
        echo "     - Generate at: https://id.atlassian.com/manage-profile/security/api-tokens"
        echo ""
        echo "  🏢 BITBUCKET_WORKSPACE:"
        echo "     - Replace: your-workspace-name"
        echo "     - With: Your Bitbucket workspace name"
        echo "     - Example: mycompany"
        echo ""
        echo "  🔑 BITBUCKET_API_TOKEN:"
        echo "     - Replace: your-bitbucket-api-token"
        echo "     - With: Your Bitbucket API token"
        echo "     - Generate at: https://id.atlassian.com/manage-profile/security/api-tokens"
        echo ""
        print_warning "⚠️  Important: Replace ALL placeholder values with your actual credentials!"
    fi
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
    echo "2. Update mcp.json:"
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
