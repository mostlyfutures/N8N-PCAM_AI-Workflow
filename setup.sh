#!/bin/bash

# Autonomous PCAM Programming Setup Script
# Helps set up and test the N8N autonomous programming workflow

set -e  # Exit on any error

echo "🤖 Autonomous PCAM Programming Assistant - Setup Script"
echo "======================================================"

# Check if N8N is installed
check_n8n() {
    if ! command -v n8n &> /dev/null; then
        echo "❌ N8N not found. Please install N8N first:"
        echo "   npm install -g n8n"
        echo "   or"
        echo "   docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n"
        exit 1
    else
        echo "✅ N8N installation found"
        n8n --version
    fi
}

# Import workflow into N8N
import_workflow() {
    local workflow_file="autonomous-pcam-programming-workflow.json"
    
    if [ ! -f "$workflow_file" ]; then
        echo "❌ Workflow file not found: $workflow_file"
        echo "   Make sure you're in the correct directory"
        exit 1
    fi
    
    echo "📥 Importing workflow into N8N..."
    echo "   File: $workflow_file"
    echo "   Please manually import this file into your N8N instance:"
    echo "   1. Open N8N web interface (usually http://localhost:5678)"
    echo "   2. Click 'Import from File'"
    echo "   3. Select the workflow file: $workflow_file"
    echo "   4. Activate the workflow"
    echo "   5. Copy the webhook URL for testing"
}

# Setup Python test environment
setup_python_client() {
    echo "🐍 Setting up Python test client..."
    
    # Check Python installation
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 not found. Please install Python 3.7+"
        exit 1
    fi
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "   Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    echo "   Activating virtual environment..."
    source venv/bin/activate
    
    # Install required packages
    echo "   Installing dependencies..."
    pip install requests
    
    echo "✅ Python client setup complete"
    echo "   To use the test client:"
    echo "   source venv/bin/activate"
    echo "   python test_client.py"
}

# Validate workflow configuration
validate_config() {
    echo "⚙️  Validating configuration..."
    
    local config_file="config.json"
    if [ ! -f "$config_file" ]; then
        echo "❌ Configuration file not found: $config_file"
        exit 1
    fi
    
    # Basic JSON validation
    if ! python3 -m json.tool "$config_file" > /dev/null 2>&1; then
        echo "❌ Invalid JSON in configuration file"
        exit 1
    fi
    
    echo "✅ Configuration file is valid"
}

# Test webhook connectivity
test_webhook() {
    echo "🌐 Testing webhook connectivity..."
    
    read -p "Enter your N8N webhook URL: " webhook_url
    
    if [ -z "$webhook_url" ]; then
        echo "⏭️  Skipping webhook test (no URL provided)"
        return
    fi
    
    # Test with a simple ping
    test_payload='{"prompt": "test connection", "projectPath": "/tmp"}'
    
    echo "   Testing connection to: $webhook_url"
    
    if curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$test_payload" \
        "$webhook_url" \
        --max-time 10 > /dev/null; then
        echo "✅ Webhook is responding"
    else
        echo "❌ Webhook test failed"
        echo "   - Check if N8N is running"
        echo "   - Verify the webhook URL is correct"
        echo "   - Ensure the workflow is activated"
    fi
}

# Create example project for testing
create_example_project() {
    echo "📁 Creating example project for testing..."
    
    local example_dir="example-project"
    
    if [ -d "$example_dir" ]; then
        echo "   Example project already exists: $example_dir"
        return
    fi
    
    mkdir -p "$example_dir/src"
    mkdir -p "$example_dir/tests"
    
    # Create package.json
    cat > "$example_dir/package.json" << 'EOF'
{
  "name": "autonomous-pcam-example",
  "version": "1.0.0",
  "description": "Example project for PCAM autonomous programming",
  "main": "src/index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node src/index.js",
    "build": "echo \"Build complete\""
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
EOF
    
    # Create main source file
    cat > "$example_dir/src/index.js" << 'EOF'
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from PCAM autonomous programming!',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
EOF
    
    # Create README
    cat > "$example_dir/README.md" << 'EOF'
# PCAM Autonomous Programming Example

This is a test project for the autonomous PCAM programming workflow.

## Test Commands

Try these prompts with the autonomous system:

- "Analyze project structure and dependencies"
- "Run npm install and npm test"
- "Add .gitignore file for Node.js project"
- "Build the project and check for errors"

## Usage

```bash
npm install
npm start
```
EOF

    echo "✅ Example project created: $example_dir"
    echo "   You can use this path for testing: $(pwd)/$example_dir"
}

# Display usage instructions
show_usage() {
    echo ""
    echo "📚 USAGE INSTRUCTIONS"
    echo "==================="
    echo ""
    echo "1. Start N8N (if not running):"
    echo "   n8n start"
    echo ""
    echo "2. Import the workflow:"
    echo "   - Open http://localhost:5678 in your browser"
    echo "   - Import autonomous-pcam-programming-workflow.json"
    echo "   - Activate the workflow"
    echo "   - Note the webhook URL"
    echo ""
    echo "3. Test with Python client:"
    echo "   source venv/bin/activate"
    echo "   python test_client.py"
    echo ""
    echo "4. Test with curl:"
    echo "   curl -X POST 'YOUR_WEBHOOK_URL' \\"
    echo "        -H 'Content-Type: application/json' \\"
    echo "        -d '{\"prompt\": \"analyze my project\", \"projectPath\": \"$(pwd)/example-project\"}'"
    echo ""
    echo "5. Example prompts to try:"
    echo "   - 'Analyze my React project and optimize dependencies'"
    echo "   - 'Run all tests and generate coverage report'"
    echo "   - 'Create .gitignore and README.md files'"
    echo "   - 'Build project and check for security vulnerabilities'"
    echo ""
}

# Main setup function
main() {
    echo "Starting autonomous PCAM programming setup..."
    echo ""
    
    # Run setup steps
    check_n8n
    echo ""
    
    validate_config
    echo ""
    
    import_workflow
    echo ""
    
    setup_python_client
    echo ""
    
    create_example_project
    echo ""
    
    test_webhook
    echo ""
    
    show_usage
    
    echo "🎉 Setup complete! Your autonomous PCAM programming assistant is ready."
    echo ""
    echo "⚠️  IMPORTANT SAFETY NOTES:"
    echo "   - Only run in safe, isolated environments"
    echo "   - Review the safety configuration in config.json"
    echo "   - Monitor the audit logs for all autonomous operations"
    echo "   - Test thoroughly before using on production projects"
    echo ""
    echo "Happy autonomous programming! 🤖✨"
}

# Help function
show_help() {
    echo "Autonomous PCAM Programming Setup Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --check        Only check prerequisites"
    echo "  --test         Only test webhook connectivity"
    echo "  --example      Only create example project"
    echo ""
    echo "Default: Run full setup"
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    --check)
        check_n8n
        validate_config
        ;;
    --test)
        test_webhook
        ;;
    --example)
        create_example_project
        ;;
    *)
        main
        ;;
esac