@echo off
setlocal enabledelayedexpansion

:: Jira-Bitbucket MCP Server Installation Script for Windows
:: This script automates the installation and setup process

echo 🚀 Jira-Bitbucket MCP Server Installation
echo ==========================================
echo.

:: Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo [INFO] Visit: https://nodejs.org/
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 18 (
    echo [ERROR] Node.js version 18+ is required. Current version: 
    node --version
    pause
    exit /b 1
)

echo [SUCCESS] Node.js version detected correctly
echo.

:: Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully
echo.

:: Build the project
echo [INFO] Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build the project
    pause
    exit /b 1
)
echo [SUCCESS] Project built successfully
echo.

:: Get project path
for %%i in (.) do set PROJECT_PATH=%%~fi
echo [INFO] Project path: %PROJECT_PATH%
echo.

:: Generate MCP configuration
echo [INFO] Generating MCP configuration...
echo.
echo [INFO] 📋 MCP Configuration for jira-bitbucket-mcp
echo ==================================================
echo.
echo Copy the following configuration to your mcp.json file:
echo.
echo ----------------------------------------
echo {
echo   "mcpServers": {
echo     "jira-bitbucket-mcp": {
echo       "command": "node",
echo       "args": ["%PROJECT_PATH%\dist\index.js"],
echo       "env": {
echo         "JIRA_BASE_URL": "https://your-domain.atlassian.net",
echo         "JIRA_EMAIL": "your-email@example.com",
echo         "JIRA_API_TOKEN": "your-jira-api-token",
echo         "BITBUCKET_WORKSPACE": "your-workspace-name",
echo         "BITBUCKET_API_TOKEN": "your-bitbucket-api-token"
echo       }
echo     }
echo   }
echo }
echo ----------------------------------------
echo.
echo [SUCCESS] Configuration generated successfully!
echo.
echo [INFO] 📝 Next Steps:
echo 1. Copy the configuration above
echo 2. Paste it into your mcp.json file at your desired location
echo 3. Update the environment variables with your actual credentials
echo.
echo [WARNING] ⚠️  Important: Replace ALL placeholder values with your actual credentials!

:: Display next steps
echo.
echo 🎉 Installation completed successfully!
echo ======================================
echo.
echo Next steps:
echo 1. Generate API tokens:
echo    - Go to https://id.atlassian.com/manage-profile/security/api-tokens
echo    - Create two API tokens ^(one for Jira, one for Bitbucket^)
echo    - Set expiration to 1 year
echo    - Select all scopes except delete actions
echo.
echo 2. Configure MCP:
echo    - Copy the configuration shown above
echo    - Paste it into your mcp.json file at your desired location
echo    - Replace placeholder values with your actual credentials
echo    - JIRA_BASE_URL: Your Jira instance URL
echo    - JIRA_EMAIL: Your Atlassian account email
echo    - JIRA_API_TOKEN: Your Jira API token
echo    - BITBUCKET_WORKSPACE: Your Bitbucket workspace name
echo    - BITBUCKET_API_TOKEN: Your Bitbucket API token
echo.
echo 3. Restart Cursor IDE:
echo    - Close Cursor completely
echo    - Reopen Cursor
echo    - The MCP server will be available in your AI assistant
echo.
echo 4. Test the connection:
echo    - Try asking: 'Search for Jira issues in project PROJ'
echo.
echo 📖 For detailed documentation, see README.md
echo.
pause
