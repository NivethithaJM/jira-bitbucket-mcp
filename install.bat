@echo off
setlocal enabledelayedexpansion

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
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js %NODE_VERSION% is installed

:: Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

:: Build the project
echo [INFO] Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build project
    pause
    exit /b 1
)
echo [SUCCESS] Project built successfully

:: Get project path
for %%i in (.) do set PROJECT_PATH=%%~fi
echo [INFO] Project path: %PROJECT_PATH%

:: Create MCP configuration
echo [INFO] Creating MCP configuration...
if exist mcp.json (
    echo [WARNING] mcp.json already exists. Checking for existing configuration...
    
    :: Check if jira-bitbucket-mcp server already exists
    findstr /c:"jira-bitbucket-mcp" mcp.json >nul
    if %errorlevel% equ 0 (
        echo [INFO] Found existing jira-bitbucket-mcp configuration. Verifying environment variables...
        
        :: Check for placeholder values
        set has_placeholders=false
        set missing_vars=
        
        findstr /c:"your-domain.atlassian.net" mcp.json >nul
        if %errorlevel% equ 0 (
            set has_placeholders=true
            set missing_vars=%missing_vars% JIRA_BASE_URL
        )
        
        findstr /c:"your-email@example.com" mcp.json >nul
        if %errorlevel% equ 0 (
            set has_placeholders=true
            set missing_vars=%missing_vars% JIRA_EMAIL
        )
        
        findstr /c:"your-jira-api-token" mcp.json >nul
        if %errorlevel% equ 0 (
            set has_placeholders=true
            set missing_vars=%missing_vars% JIRA_API_TOKEN
        )
        
        findstr /c:"your-workspace-name" mcp.json >nul
        if %errorlevel% equ 0 (
            set has_placeholders=true
            set missing_vars=%missing_vars% BITBUCKET_WORKSPACE
        )
        
        findstr /c:"your-bitbucket-api-token" mcp.json >nul
        if %errorlevel% equ 0 (
            set has_placeholders=true
            set missing_vars=%missing_vars% BITBUCKET_API_TOKEN
        )
        
        if "%has_placeholders%"=="true" (
            echo [WARNING] Found placeholder values in existing configuration:
            echo    - %missing_vars%
            echo.
            echo [INFO] Please update these values in mcp.json with your actual credentials:
            echo    - JIRA_BASE_URL: Your Jira instance URL
            echo    - JIRA_EMAIL: Your Atlassian account email
            echo    - JIRA_API_TOKEN: Your Jira API token
            echo    - BITBUCKET_WORKSPACE: Your Bitbucket workspace name
            echo    - BITBUCKET_API_TOKEN: Your Bitbucket API token
            echo.
            echo [SUCCESS] Skipping MCP configuration creation ^(using existing config^)
        ) else (
            echo [SUCCESS] Existing jira-bitbucket-mcp configuration appears to be properly configured
            echo [INFO] All environment variables have been set with actual values
        )
    ) else (
        echo [INFO] No existing jira-bitbucket-mcp configuration found. Appending to existing mcp.json...
        
        :: Backup existing config
        copy mcp.json mcp.json.backup >nul
        echo [WARNING] Backed up existing mcp.json to mcp.json.backup
        
        :: For Windows, provide detailed manual instructions
        echo [INFO] Please manually add the jira-bitbucket-mcp configuration to your existing mcp.json
        echo [INFO] Follow these steps:
        echo.
        echo 1. Open mcp.json in a text editor
        echo 2. Find the closing brace of the last server configuration
        echo 3. Add a comma after the closing brace of the last server
        echo 4. Add the following configuration before the closing brace of mcpServers:
        echo.
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
        echo.
        echo [INFO] Your final mcp.json should look like this:
        echo.
        echo {
        echo   "mcpServers": {
        echo     "jira-fun": {
        echo       "command": "node",
        echo       "args": ["/path/to/fun/dist/fun.js"]
        echo     },
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
        echo.
        echo [WARNING] Please update the environment variables with your actual credentials
    )
) else (
    :: Create new mcp.json file
    echo [INFO] Creating new mcp.json configuration...
    (
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
    ) > mcp.json
    
    echo [SUCCESS] MCP configuration created at mcp.json
    echo.
    echo [INFO] 📝 Environment Variables Setup Instructions:
    echo.
    echo Please update the following environment variables in mcp.json:
    echo.
    echo   🔧 JIRA_BASE_URL:
    echo      - Replace: https://your-domain.atlassian.net
    echo      - With: Your actual Jira Cloud instance URL
    echo      - Example: https://mycompany.atlassian.net
    echo.
    echo   📧 JIRA_EMAIL:
    echo      - Replace: your-email@example.com
    echo      - With: Your Atlassian account email address
    echo      - Example: john.doe@company.com
    echo.
    echo   🔑 JIRA_API_TOKEN:
    echo      - Replace: your-jira-api-token
    echo      - With: Your Jira API token
    echo      - Generate at: https://id.atlassian.com/manage-profile/security/api-tokens
    echo.
    echo   🏢 BITBUCKET_WORKSPACE:
    echo      - Replace: your-workspace-name
    echo      - With: Your Bitbucket workspace name
    echo      - Example: mycompany
    echo.
    echo   🔑 BITBUCKET_API_TOKEN:
    echo      - Replace: your-bitbucket-api-token
    echo      - With: Your Bitbucket API token
    echo      - Generate at: https://id.atlassian.com/manage-profile/security/api-tokens
    echo.
    echo [WARNING] ⚠️  Important: Replace ALL placeholder values with your actual credentials!
)

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
echo 2. Update mcp.json:
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
