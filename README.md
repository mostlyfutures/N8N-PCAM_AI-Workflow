# Autonomous PCAM Programming Assistant - N8N Workflow

## Overview

This N8N workflow implements a sophisticated autonomous programming assistant that uses **PCAM (Persona, Context, Action, Metrics) decomposition** to analyze user prompts and automatically execute programming tasks without requiring manual confirmation for each command.

**Current Version:** V3 (Patch Generation + CLI Integration)

The system generates structured patches that can be reviewed and applied through an interactive CLI tool, providing a complete autonomous programming workflow with human-in-the-loop approval.

## 🚀 How It Works

### Quick Example

```bash
# 1. Send request to your N8N webhook
curl -X POST 'YOUR_WEBHOOK_URL' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "Add user authentication with JWT tokens",
    "projectPath": "/path/to/your/project"
  }'

# 2. Workflow creates patch in .pcamaw/patches/

# 3. Review and apply with CLI
cd pcamaw-cli
pcamaw list                    # See available patches
pcamaw open auth-feature       # Review in VS Code
pcamaw apply auth-feature      # Apply with interactive commit/push
```

### The Workflow Will:

1. ✅ Analyze your prompt (PCAM decomposition)
2. ✅ Load safety config from `config.json`
3. ✅ Read project blueprint from `priv/project.md`
4. ✅ Check autonomy confidence (>55%)
5. ✅ Generate structured patch files
6. ✅ Store patches in `.pcamaw/patches/` for CLI review

## Key Features

### 🤖 PCAM Decomposition Engine
- Weighted backend/UI-UX keyword detection to bias downstream plans
- PCAM metrics drive an autonomy score; execution only proceeds when confidence > 55%

### 📘 Project Blueprint Awareness
- Automatically ingests `priv/project.md` (or provided path) to surface roadmap tasks
- Extracts backend and UI/UX to-do lists that get folded into execution plans

### 🧭 Backend & UI/UX Planner
- Shapes separate command queues for backend, UI/UX, and general setup work
- Anchors commands around project conventions (Truffle, Next.js linting, modal scaffolds, etc.)

### 📝 Safe File Writing
- Creates files with approved extensions (.md, .json, .ts, .tsx, .js, .jsx, .css, .gitignore)
- Uses templates for common files (.gitignore, README.md)
- Enforces size limits (50KB default)
- Prevents accidental file overwrites
- Respects custom configuration

### 🎯 Patch Generation System (V3)
- Workflow creates structured patches in `.pcamaw/patches/`
- Each patch contains file changes with diffs
- JSON storage for easy review and application
- Integrates with CLI for approval workflow

### 🖥️ Interactive CLI Tool (V3)
- **Cross-platform**: macOS, Windows, Linux
- **Patch management**: List, show, stage, clear patches
- **VS Code integration**: Open patches for review
- **Git workflow**: Interactive commit and push
- **Safety prompts**: Review before applying changes
- **Commands**: `list`, `show`, `open`, `apply`, `stage`, `clear`

### 🔒 Autonomous Safety System
- Filters commands against a curated allowlist and blocks destructive patterns
- Records every skipped or failing command for later review
- File extension validation and size limits
- Prevents system-level modifications

### 📊 Results & Audit Reporting
- Summarizes completion ratios per track (backend / UI/UX / general)
- Produces audit reports with outstanding commands and safety incidents
- Full execution logs for compliance

## Workflow Architecture

**V1 (Command Execution Only):**
```
Webhook Trigger → PCAM Engine → Blueprint Loader → Autonomy Gate
  → Structure Analyzer → Command Planner → Command Runner
  → Results Aggregator → Safety Monitor → Response
```

**V2 (With File Writing):**
```
Webhook Trigger → PCAM Engine → Config & Blueprint Loader → Autonomy Gate
  ↓ (approved)                                              ↓ (rejected)
Execution Planner → Command Runner → Safe File Writer   Manual Review
  → Results Aggregator → Response ←─────────────────────────┘
```

**V3 (Patch Generation + CLI Integration) - Current:**
```
Webhook Trigger → PCAM Engine → Config & Blueprint Loader → Autonomy Gate
  ↓ (approved)                                              ↓ (rejected)
Patch Generator → .pcamaw/patches/<name>.json          Manual Review
                         ↓
                   PCAMAW CLI
                         ↓
  List → Show → Open (VS Code) → Apply → Commit → Push
```

## Usage

### 1. Deploy the Workflow

**Recommended: V3 (Full System)**

1. Import `autonomous-pcam-programming-workflow-v2.json` into your N8N instance
2. Update `config.json` to enable file writing:
   ```json
   {
     "autonomous_programming_config": {
       "safety": {
         "enable_file_writing": true,
         "allowed_file_extensions": [".md", ".json", ".ts", ".tsx", ".js", ".jsx", ".css", ".gitignore"]
       }
     }
   }
   ```
3. Activate the workflow
4. Note the webhook URL provided by N8N

**Alternative Versions:**
- **V1**: `autonomous-pcam-programming-workflow.json` (command execution only)
- **V2**: `autonomous-pcam-programming-workflow-v2.json` (adds file writing)

> **Note:** Keep `priv/project.md` (or your custom blueprint file) accessible to the N8N worker so the workflow can derive backend/UI-UX tasks.

### 2. Install the CLI Tool (V3 Only)

#### macOS / Linux
```bash
cd pcamaw-cli
npm install
chmod +x bin/pcamaw.js
npm link
```

#### Windows (PowerShell as Administrator)
```powershell
cd pcamaw-cli
npm install
npm link
```

#### Verify Installation
```bash
pcamaw --version  # Should show 0.1.0
pcamaw --help     # Shows all commands
```

**📚 Full CLI documentation:** See [`pcamaw-cli/README.md`](pcamaw-cli/README.md)

### 3. Setup VS Code CLI (V3 Only)

**macOS:**
1. Open VS Code
2. `Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH"

**Windows:**
- Usually automatic with VS Code installation
- If not: Reinstall with "Add to PATH" checked

**Linux:**
```bash
sudo update-alternatives --install /usr/bin/code code /usr/share/code/bin/code 100
```

### 4. Send Programming Requests

**POST** to your webhook URL with JSON payload:

```json
{
  "prompt": "Analyze my React project and optimize the build configuration",
  "projectPath": "/path/to/your/project"
}
```

### 5. Review and Apply Patches (V3)

```bash
# List available patches
pcamaw list

# Review in VS Code
pcamaw open my-feature

# Apply with interactive workflow
pcamaw apply my-feature
  # → Confirms patch summary
  # → Applies files
  # → Shows git status
  # → Prompts for commit message
  # → Optionally pushes to remote
```

### Supported Prompt Categories

#### Analysis Commands
- "Analyze the codebase structure"
- "Review dependencies for security issues" 
- "Examine performance bottlenecks"

#### Creation Commands  
- "Create a new React component"
- "Build API endpoints for user management"
- "Generate test files for existing modules"

#### Modification Commands
- "Refactor the authentication system"
- "Update dependencies to latest versions"
- "Optimize database queries"

#### Testing Commands
- "Run all unit tests"
- "Execute integration test suite" 
- "Validate code coverage"

#### Deployment Commands
- "Build and deploy to staging"
- "Create Docker container"
- "Publish npm package"

## Safety Features

### Approved Safe Commands
```bash
# File Operations
ls, pwd, find, grep, cat, head, tail, wc

# Git Operations  
git status, git log, git diff, git branch

# Package Managers
npm list, npm run, npm test, npm install
pip list, pip install, python -m
cargo check, cargo test, cargo build

# Safe File Creation
mkdir -p, touch, echo

# Containerization
docker build, docker run --rm
```

### Blocked Dangerous Commands
```bash
# File Destruction
rm -rf, rm -f, del /f, format

# System Modifications
sudo, chmod 777, chown

# Destructive Git Operations
git push --force, git reset --hard

# Package Removal
npm uninstall, pip uninstall
```

### Autonomous Execution Criteria
- Command must match approved safe patterns
- No dangerous keywords detected
- Automation confidence > 50%
- Project structure analysis successful
- Safety checks passed

## Response Format

### Autonomous Response Body (sent by `Webhook Response` node)
```json
{
  "prompt": "Wire up the create market UI and confirm backend tests",
  "status": "partial",
  "summary": "Backend: 67% complete | UI/UX: 33% complete | General: 100% complete",
  "patchGenerated": true,
  "patchPath": ".pcamaw/patches/create-market-ui-1633024800000.json",
  "outstanding": {
    "backend": ["npx truffle test"],
    "uiux": ["find components -maxdepth 1 -name \"*CreateMarket*\" || echo \"Market creation modal missing\""],
    "general": []
  },
  "safetyAlerts": [
    {
      "command": "rm -rf .next",
      "category": "general",
      "reason": "Command blocked by safety policy"
    }
  ],
  "auditReport": {
    "manual_review_required": false,
    "incidents": [
      {
        "type": "blocked_command",
        "command": "rm -rf .next",
        "category": "general",
        "message": "Command blocked by safety policy"
      }
    ]
  }
}
```

### Manual Review Bypass (Autonomy Gate false)
When PCAM confidence stays below threshold, the workflow short-circuits to the response composer with a guidance payload:

```json
{
  "prompt": "Deploy to production and clean the server",
  "status": "manual-review-required",
  "summary": "Automation paused: autonomy score below safety threshold",
  "patchGenerated": false,
  "outstanding": {},
  "safetyAlerts": [],
  "auditReport": {
    "manual_review_required": true,
    "incidents": []
  }
}
```

## CLI Commands Reference (V3)

```bash
# List all patches
pcamaw list

# Show patch details
pcamaw show <patch-name>

# Open patch in VS Code
pcamaw open <patch-name>

# Apply patch interactively
pcamaw apply <patch-name>

# Apply and auto-push
pcamaw apply <patch-name> --auto-push

# Apply without commit
pcamaw apply <patch-name> --no-commit

# Manually stage files as patch
pcamaw stage file1.js file2.js --name "my-patch" --description "Changes"

# Clear all patches
pcamaw clear --force
```

## Advanced Configuration

### Extending Safe Commands
Tweak the allowlist in the **Autonomous Command Planner** node (`safePrefixes` array) to enable additional trusted commands:

```javascript
const safePrefixes = [
  // ... existing prefixes
  'npm run custom-script',
  'npx playwright test'
];
```

Add any sensitive patterns that should always be blocked to the `dangerousPatterns` array in the same node.

### Adjusting Automation Confidence Threshold
Update the PCAM confidence threshold inside the **PCAM Decomposition Engine**:

```javascript
const proceedAutonomously = analysis.metrics.automation_confidence > 0.55;
```

Raise the threshold for stricter control (e.g., `> 0.75`) or lower it for more autonomy (e.g., `> 0.4`).

### Custom Blueprint Location
Set the `PROJECT_BLUEPRINT_PATH` environment variable (or edit the candidate list in **Project Blueprint Loader**) to look up alternative documents:

```bash
export PROJECT_BLUEPRINT_PATH=/workspace/specs/backend_uiux.md
```

### Adding Project-Specific Plans
Inject additional backend/UI-UX tasks in **Project Structure Analyzer** by appending to the `addBackendPlan` / `addUiuxPlan` calls.

## Security Considerations

### Audit Logging
- All operations are logged with timestamps
- Safety checks are recorded for compliance
- Execution results are preserved for analysis

### Network Security  
- No unauthorized network access
- Webhook endpoint should use HTTPS
- Consider IP whitelisting for production

### File System Protection
- Commands are sandboxed to project directory
- No system-level modifications allowed
- File integrity monitoring included

## Testing

### Running Validation Tests

The workflow includes comprehensive test suites to validate safety and parsing logic:

```bash
# Test command planner safety guardrails
node tests/test_command_planner.js

# Test blueprint parsing rules
node tests/test_blueprint_parser.js

# Test file writer safety (V2+)
node tests/test_file_writer.js
```

All test suites should pass with 100% success before deploying the workflow to production.

**Test Coverage:**
- ✅ 32 command planner safety tests
- ✅ 26 blueprint parser validation tests
- ✅ 20 file writer safety tests (V2+)
- ✅ CLI functionality tests (V3)
- ✅ Security boundary enforcement
- ✅ Edge case handling

See `tests/README.md` and `pcamaw-cli/TEST_RESULTS.md` for detailed test documentation.

## Troubleshooting

### Common Issues

1. **Commands Not Executing**
   - Check if commands match approved safe patterns
   - Verify project path exists and is accessible
   - Review safety audit logs for blocked operations

2. **Low Automation Confidence**
   - Refine prompt with specific programming intentions
   - Avoid ambiguous or destructive language
   - Include clear project context

3. **Webhook Timeouts**
   - Complex projects may require longer execution time
   - Consider splitting large operations into smaller workflows
   - Monitor N8N execution limits

4. **Patch Not Generated (V3)**
   - Check autonomy confidence threshold was met
   - Verify `.pcamaw/patches/` directory is writable
   - Review workflow execution logs in N8N

5. **CLI Command Not Found (V3)**
   - **macOS/Linux:** Run `npm link` or use `./bin/pcamaw.js`
   - **Windows:** Run `npm link` as Administrator or use `node bin\pcamaw.js`
   - **Alternative:** Add `pcamaw-cli/bin` to PATH

6. **VS Code Doesn't Open (V3)**
   - **macOS:** `Cmd+Shift+P` → "Install 'code' command in PATH"
   - **Windows:** Reinstall VS Code with "Add to PATH" checked
   - **Linux:** Add `/usr/share/code/bin` to PATH

### Debug Mode
Enable detailed logging by adding debug statements to Code nodes:

```javascript
console.log('Debug info:', JSON.stringify(data, null, 2));
return [{json: {debug: true, ...result}}];
```

## Integration Examples

### GitHub Actions Integration
```yaml
- name: Trigger Autonomous Programming
  run: |
    curl -X POST "${{ secrets.N8N_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{"prompt": "Run tests and update documentation", "projectPath": "${{ github.workspace }}"}'
```

### VS Code Extension
```typescript
async function triggerAutonomousProgramming(prompt: string) {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      prompt,
      projectPath: vscode.workspace.rootPath
    })
  });
  
  const result = await response.json();
  vscode.window.showInformationMessage(result.message);
}
```

## Contributing

To extend this workflow:

1. Fork the workflow in N8N
2. Add new nodes for additional functionality
3. Maintain safety-first approach in all modifications
4. Test thoroughly before production deployment
5. Update documentation for new features
6. Run all test suites:
   ```bash
   # Workflow tests
   node tests/test_command_planner.js
   node tests/test_blueprint_parser.js
   node tests/test_file_writer.js
   
   # CLI tests (see pcamaw-cli/TEST_RESULTS.md)
   ```

See `CHANGELOG.md` for version history and roadmap.

## Version History

- **V1**: Command execution with PCAM decomposition
- **V2**: Added safe file writing with templates
- **V3**: CLI tool with patch management and VS Code integration ← **Current**

## License

This N8N workflow is provided under MIT license for autonomous programming assistance.
