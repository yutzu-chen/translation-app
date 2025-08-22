#!/bin/bash

# Claude Code with LiteLLM Global Setup Script (Fixed Version)
# This script sets up Claude Code globally to work with Holidu's LiteLLM OIDC endpoint
# Based on the "Using Claude Code with LiteLLM - Developer Setup Guide"

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
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

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Homebrew is installed
check_homebrew() {
    if ! command_exists brew; then
        print_error "Homebrew is not installed. Please install Homebrew first:"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    print_success "Homebrew is installed"
}

# Function to install Volta
install_volta() {
    print_header "Installing Volta (Node.js Version Manager)"
    
    if command_exists volta; then
        print_success "Volta is already installed"
    else
        print_info "Installing Volta via Homebrew..."
        brew install volta
        print_success "Volta installed successfully"
    fi
    
    # Check if Volta is configured in shell
    if ! grep -q "VOLTA_HOME" ~/.zshrc 2>/dev/null; then
        print_info "Adding Volta configuration to ~/.zshrc..."
        echo "" >> ~/.zshrc
        echo "# Volta configuration" >> ~/.zshrc
        echo "export VOLTA_HOME=\"\$HOME/.volta\"" >> ~/.zshrc
        echo "export PATH=\"\$VOLTA_HOME/bin:\$PATH\"" >> ~/.zshrc
        print_success "Volta configuration added to ~/.zshrc"
    else
        print_success "Volta is already configured in ~/.zshrc"
    fi
    
    # Source the updated .zshrc
    export VOLTA_HOME="$HOME/.volta"
    export PATH="$VOLTA_HOME/bin:$PATH"
}

# Function to install Node.js via Volta
install_nodejs() {
    print_header "Installing Node.js via Volta"
    
    if command_exists volta; then
        print_info "Installing latest Node.js LTS via Volta..."
        volta install node
        print_success "Node.js installed successfully"
        
        # Verify installation
        print_info "Node.js version: $(node --version)"
        print_info "npm version: $(npm --version)"
    else
        print_error "Volta is not available. Please restart your terminal and run this script again."
        exit 1
    fi
}

# Function to install Claude Code
install_claude_code() {
    print_header "Installing Claude Code"
    
    if command_exists claude; then
        print_success "Claude Code is already installed"
        print_info "Current version: $(claude --version)"
    else
        print_info "Installing Claude Code globally..."
        npm install -g @anthropic-ai/claude-code
        print_success "Claude Code installed successfully"
        print_info "Installed version: $(claude --version)"
    fi
}

# Function to install jq
install_jq() {
    print_header "Installing jq (JSON processor)"
    
    if command_exists jq; then
        print_success "jq is already installed"
    else
        print_info "Installing jq via Homebrew..."
        brew install jq
        print_success "jq installed successfully"
    fi
}

# Function to store credentials in keychain
store_credentials() {
    print_header "Storing LiteLLM Credentials in Keychain"
    
    print_info "Please provide your LiteLLM credentials."
    print_warning "These credentials should be obtained from: https://wat-n8n.holidu.cloud/form/litellm-request-key"
    echo ""
    
    # Get Client ID
    read -p "Enter your LiteLLM Client ID: " CLIENT_ID
    if [[ -z "$CLIENT_ID" ]]; then
        print_error "Client ID cannot be empty"
        exit 1
    fi
    
    # Get Client Secret
    read -s -p "Enter your LiteLLM Client Secret: " CLIENT_SECRET
    echo ""
    if [[ -z "$CLIENT_SECRET" ]]; then
        print_error "Client Secret cannot be empty"
        exit 1
    fi
    
    # Store credentials in keychain
    print_info "Storing credentials in macOS keychain..."
    
    # Store Client ID
    security add-generic-password -a "dev-litellm-client" -s "dev-litellm-client-id" -w "$CLIENT_ID" -U 2>/dev/null || {
        print_error "Failed to store Client ID in keychain"
        exit 1
    }
    
    # Store Client Secret
    security add-generic-password -a "dev-litellm-client" -s "dev-litellm-client-secret" -w "$CLIENT_SECRET" -U 2>/dev/null || {
        print_error "Failed to store Client Secret in keychain"
        exit 1
    }
    
    print_success "Credentials stored successfully in keychain"
}

# Function to create global token helper script
create_global_token_helper() {
    print_header "Creating Global Token Helper Script"
    
    local GLOBAL_CLAUDE_DIR="$HOME/.config/claude"
    
    print_info "Creating global Claude directory: $GLOBAL_CLAUDE_DIR"
    mkdir -p "$GLOBAL_CLAUDE_DIR"
    
    print_info "Creating global token helper script..."
    
    cat > "$GLOBAL_CLAUDE_DIR/get-litellm-key.sh" << 'EOF'
#!/bin/bash

# Global LiteLLM token helper script
# This script retrieves credentials from keychain and gets an access token

# Retrieve credentials from keychain
DEV_LITELLM_CLIENT_ID=$(security find-generic-password -a "dev-litellm-client" -s "dev-litellm-client-id" -w 2>/dev/null)
DEV_LITELLM_CLIENT_SECRET=$(security find-generic-password -a "dev-litellm-client" -s "dev-litellm-client-secret" -w 2>/dev/null)

# Check if credentials were retrieved successfully
if [ -z "$DEV_LITELLM_CLIENT_ID" ] || [ -z "$DEV_LITELLM_CLIENT_SECRET" ]; then
    echo "Error: Could not retrieve credentials from keychain" >&2
    echo "Make sure you've stored them using the setup script or:" >&2
    echo "security add-generic-password -a \"dev-litellm-client\" -s \"dev-litellm-client-id\" -w \"your-client-id\"" >&2
    echo "security add-generic-password -a \"dev-litellm-client\" -s \"dev-litellm-client-secret\" -w \"your-client-secret\"" >&2
    exit 1
fi

# Get the token
TEMP_TOKEN=$(curl -s -X POST https://auth.holidu.com/realms/guest/protocol/openid-connect/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=client_credentials&client_id=$DEV_LITELLM_CLIENT_ID&client_secret=$DEV_LITELLM_CLIENT_SECRET" | jq -r .access_token)

# Check if token retrieval was successful
if [ "$TEMP_TOKEN" = "null" ] || [ -z "$TEMP_TOKEN" ]; then
    echo "Error: Failed to retrieve access token" >&2
    echo "Please check your credentials and network connectivity" >&2
    exit 1
fi

echo $TEMP_TOKEN
EOF

    chmod +x "$GLOBAL_CLAUDE_DIR/get-litellm-key.sh"
    print_success "Global token helper script created at: $GLOBAL_CLAUDE_DIR/get-litellm-key.sh"
}

# Function to configure global environment variables
configure_global_environment() {
    print_header "Configuring Global Environment Variables"
    
    print_info "Adding global LiteLLM configuration to ~/.zshrc..."
    
    # Remove any existing LiteLLM configuration
    if grep -q "# Global LiteLLM configuration for Claude Code" ~/.zshrc 2>/dev/null; then
        print_info "Updating existing LiteLLM configuration..."
        # Create a backup
        cp ~/.zshrc ~/.zshrc.backup.$(date +%Y%m%d_%H%M%S)
        # Remove old configuration
        sed -i '' '/# Global LiteLLM configuration for Claude Code/,/^$/d' ~/.zshrc
    fi
    
    # Add comprehensive environment configuration
    cat >> ~/.zshrc << 'EOF'

# Global LiteLLM configuration for Claude Code
export CLAUDE_CODE_API_KEY_HELPER_TTL_MS=1200000
export ANTHROPIC_BASE_URL="https://litellm-oidc.holidu.com"
export ANTHROPIC_MODEL="claude-sonnet-4"
export ANTHROPIC_SMALL_FAST_MODEL="claude-3-5-haiku"

# Global Claude Code API Key Helper
export ANTHROPIC_API_KEY_HELPER="$HOME/.config/claude/get-litellm-key.sh"

# Function to get LiteLLM API key for Claude Code
get_claude_api_key() {
    if [ -x "$HOME/.config/claude/get-litellm-key.sh" ]; then
        "$HOME/.config/claude/get-litellm-key.sh"
    else
        echo "Error: Global token helper not found or not executable" >&2
        return 1
    fi
}

# Set ANTHROPIC_API_KEY dynamically when needed
# This ensures Claude Code always has a fresh token
if [ -x "$HOME/.config/claude/get-litellm-key.sh" ]; then
    export ANTHROPIC_API_KEY_COMMAND="$HOME/.config/claude/get-litellm-key.sh"
fi

EOF
    
    print_success "Global environment configuration added to ~/.zshrc"
    
    # Source the configuration for immediate use
    export CLAUDE_CODE_API_KEY_HELPER_TTL_MS=1200000
    export ANTHROPIC_BASE_URL="https://litellm-oidc.holidu.com"
    export ANTHROPIC_MODEL="claude-sonnet-4"
    export ANTHROPIC_SMALL_FAST_MODEL="claude-3-5-haiku"
    export ANTHROPIC_API_KEY_HELPER="$HOME/.config/claude/get-litellm-key.sh"
    
    print_info "Environment variables set for current session"
}

# Function to create default Claude Code settings directory
create_default_claude_settings() {
    print_header "Creating Default Claude Code Settings"
    
    # Create default .claude directory in user's home for global defaults
    local DEFAULT_CLAUDE_DIR="$HOME/.claude"
    
    print_info "Creating default Claude directory: $DEFAULT_CLAUDE_DIR"
    mkdir -p "$DEFAULT_CLAUDE_DIR"
    
    print_info "Creating default Claude Code settings..."
    
    cat > "$DEFAULT_CLAUDE_DIR/settings.json" << 'EOF'
{
  "apiKeyHelper": "~/.config/claude/get-litellm-key.sh",
  "env": {
    "ANTHROPIC_BASE_URL": "https://litellm-oidc.holidu.com",
    "ANTHROPIC_MODEL": "claude-sonnet-4",
    "ANTHROPIC_SMALL_FAST_MODEL": "claude-3-5-haiku"
  },
  "permissions": {
    "allow": [
      "Bash(mv:*)",
      "Bash(cp:*)",
      "Bash(find:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(grep:*)",
      "Bash(sed:*)",
      "Bash(awk:*)",
      "Bash(sort:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(wc:*)",
      "Bash(./gradlew *)",
      "Bash(npm *)",
      "Bash(yarn *)",
      "Bash(pip *)",
      "Bash(python *)",
      "Bash(node *)",
      "Bash(git *)"
    ],
    "deny": []
  }
}
EOF

    print_success "Default Claude Code settings created at: $DEFAULT_CLAUDE_DIR/settings.json"
}

# Function to create a wrapper script for claude command
create_claude_wrapper() {
    print_header "Creating Claude Wrapper Script"
    
    # Create a wrapper script that ensures API key is always available
    local WRAPPER_SCRIPT="$HOME/.local/bin/claude-wrapper"
    
    mkdir -p "$HOME/.local/bin"
    
    cat > "$WRAPPER_SCRIPT" << 'EOF'
#!/bin/bash

# Claude Code wrapper script for LiteLLM integration
# This ensures the API key is always available for Claude Code

# Function to get API key
get_api_key() {
    if [ -x "$HOME/.config/claude/get-litellm-key.sh" ]; then
        "$HOME/.config/claude/get-litellm-key.sh"
    else
        echo "Error: Global token helper not found. Please run the setup script." >&2
        exit 1
    fi
}

# Set environment variables for this session
export ANTHROPIC_BASE_URL="https://litellm-oidc.holidu.com"
export ANTHROPIC_MODEL="claude-sonnet-4"
export ANTHROPIC_SMALL_FAST_MODEL="claude-3-5-haiku"

# Get fresh API key
if ! ANTHROPIC_API_KEY=$(get_api_key); then
    echo "Failed to get API key. Please check your setup." >&2
    exit 1
fi

export ANTHROPIC_API_KEY

# Find the real claude command
CLAUDE_CMD=$(which claude | grep -v "$(basename "$0")" | head -1)

if [ -z "$CLAUDE_CMD" ]; then
    echo "Error: Claude Code command not found. Please install it with: npm install -g @anthropic-ai/claude-code" >&2
    exit 1
fi

# Execute the real claude command with all arguments
exec "$CLAUDE_CMD" "$@"
EOF

    chmod +x "$WRAPPER_SCRIPT"
    print_success "Claude wrapper script created at: $WRAPPER_SCRIPT"
    
    # Add ~/.local/bin to PATH if not already there
    if ! grep -q '$HOME/.local/bin' ~/.zshrc 2>/dev/null; then
        print_info "Adding ~/.local/bin to PATH..."
        echo "" >> ~/.zshrc
        echo "# Add user local bin to PATH (for Claude wrapper)" >> ~/.zshrc
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
        print_success "Added ~/.local/bin to PATH"
    else
        print_success "~/.local/bin is already in PATH"
    fi
    
    # Update PATH for current session
    export PATH="$HOME/.local/bin:$PATH"
}

# Function to test the global setup
test_global_setup() {
    print_header "Testing Global Setup"
    
    print_info "Testing global token helper script..."
    
    if [ -f "$HOME/.config/claude/get-litellm-key.sh" ]; then
        # Test token retrieval
        if TOKEN=$("$HOME/.config/claude/get-litellm-key.sh" 2>/dev/null); then
            if [ ${#TOKEN} -gt 50 ]; then
                print_success "Global token helper is working correctly"
                print_info "Token preview: ${TOKEN:0:50}..."
                
                # Test API access
                print_info "Testing API access..."
                if curl -s -f -H "Authorization: Bearer $TOKEN" \
                   "https://litellm-oidc.holidu.com/v1/models" > /dev/null 2>&1; then
                    print_success "API access is working correctly"
                    
                    # Test claude wrapper
                    if [ -x "$HOME/.local/bin/claude-wrapper" ]; then
                        print_success "Claude wrapper script is ready"
                    else
                        print_warning "Claude wrapper script not found or not executable"
                    fi
                else
                    print_warning "API access test failed. Please check your credentials and network connectivity."
                fi
            else
                print_error "Token appears to be invalid or too short"
            fi
        else
            print_error "Global token helper script failed to retrieve token"
        fi
    else
        print_error "Global token helper script not found"
    fi
}

# Function to show usage instructions
show_global_usage_instructions() {
    print_header "Setup Complete! Global Usage Instructions"
    
    echo -e "${GREEN}✅ Claude Code with LiteLLM is now available globally!${NC}\n"
    
    echo -e "${YELLOW}⚠️  IMPORTANT: Restart your terminal now to load all environment variables!${NC}\n"
    
    echo -e "${BLUE}After restarting your terminal:${NC}"
    echo ""
    echo -e "${BLUE}Global Usage (works from any directory):${NC}"
    echo "  cd /any/project/directory"
    echo "  claude \"Help me refactor this code\""
    echo "  claude \"Create a new React component\""
    echo "  claude \"Review this file for bugs\""
    echo ""
    
    echo -e "${BLUE}Available models (configured globally):${NC}"
    echo "• claude-sonnet-4 (primary model - complex tasks)"
    echo "• claude-3-5-haiku (fast model - simple operations)"
    echo "• gemini-2.5-pro (excellent for code analysis)"
    echo "• gpt-4o-mini (cost-effective for simple tasks)"
    echo ""
    
    echo -e "${BLUE}Configuration locations:${NC}"
    echo "• Global settings: ~/.claude/settings.json"
    echo "• Global token helper: ~/.config/claude/get-litellm-key.sh"
    echo "• Claude wrapper: ~/.local/bin/claude-wrapper"
    echo "• Environment config: ~/.zshrc"
    echo ""
    
    echo -e "${BLUE}Troubleshooting:${NC}"
    echo "• If you get \"Missing API key\" error after restart:"
    echo "  - Test token helper: ~/.config/claude/get-litellm-key.sh"
    echo "  - Test credentials: ./manage-credentials.sh test"
    echo "  - Run diagnostics: ./troubleshoot.sh"
    echo ""
    echo "• Wait 2-3 minutes if you just created credentials"
    echo "• Check budget usage at: https://litellm.holidu.cloud/"
    echo ""
    
    echo -e "${BLUE}Important notes:${NC}"
    echo "• Tokens refresh automatically every 20 minutes"
    echo "• Daily budget limit: \$50 (resets every 24 hours)"
    echo "• Works from any directory without local setup"
    echo "• No need to run claude-setup-project anymore!"
    echo ""
    
    echo -e "${GREEN}🎉 Ready to use! After restarting terminal, just run:${NC}"
    echo -e "${GREEN}   claude \"your request\"${NC}"
}

# Main function
main() {
    print_header "Claude Code with LiteLLM Global Setup (Fixed)"
    
    # Parse command line arguments
    case "${1:-}" in
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "This script sets up Claude Code with LiteLLM globally on your system."
            echo "After setup, you can use 'claude' from any directory without local configuration."
            echo ""
            echo "OPTIONS:"
            echo "  --help, -h       Show this help message"
            echo ""
            echo "The script will:"
            echo "• Install required dependencies (Volta, Node.js, Claude Code, jq)"
            echo "• Configure global environment variables"
            echo "• Store credentials in keychain"
            echo "• Set up global Claude Code configuration"
            echo "• Create wrapper script for seamless operation"
            return
            ;;
    esac
    
    # Global setup
    print_info "Starting global system setup..."
    
    # Prerequisites check
    print_info "Checking prerequisites..."
    check_homebrew
    
    # Install dependencies
    install_volta
    install_nodejs
    install_claude_code
    install_jq
    
    # Store credentials
    store_credentials
    
    # Setup global configuration
    create_global_token_helper
    configure_global_environment
    create_default_claude_settings
    create_claude_wrapper
    
    # Test global setup
    test_global_setup
    
    # Show usage instructions
    show_global_usage_instructions
    
    print_success "Global setup completed successfully!"
    print_warning "Please restart your terminal to use 'claude' from any directory!"
}

# Run main function with all arguments
main "$@"
