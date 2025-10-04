# PCAMAW CLI

Command-line interface for managing PCAMAW (Persona, Context, Action, Metrics) patches and integrating with VS Code.

## Overview

The PCAMAW CLI helps you:
- **Stage patches** from N8N workflow outputs
- **Review changes** in VS Code before applying
- **Apply patches** to your workspace
- **Commit and push** changes with interactive prompts

## Installation

### Prerequisites

- Node.js 14+ installed
- Git repository initialized
- VS Code with `code` CLI command available

### Setup

1. **Install dependencies:**
   ```bash
   cd pcamaw-cli
   npm install
   ```

2. **Make executable:**
   ```bash
   chmod +x bin/pcamaw.js
   ```

3. **Link globally (optional):**
   ```bash
   npm link
   ```
   
   After linking, you can use `pcamaw` from anywhere. Otherwise, use `./bin/pcamaw.js` from the CLI directory.

## Commands

### `pcamaw list` (alias: `ls`)

List all staged patches.

```bash
pcamaw list
```

**Output:**
```
📋 Staged Patches:

1. feature-auth
   Created: 10/4/2025, 2:30:15 PM
   Files: 3

2. bugfix-validation
   Created: 10/4/2025, 1:15:42 PM
   Files: 2
```

---

### `pcamaw show <patchName>`

Show detailed information about a specific patch.

```bash
pcamaw show feature-auth
```

**Output:**
```
📄 Patch: feature-auth

Created: 10/4/2025, 2:30:15 PM
Description: Add user authentication with JWT

Files to be modified:
  src/auth.js (create)
  src/middleware/auth.js (create)
  package.json (modify)
```

---

### `pcamaw open <patchName>`

Open a patch in VS Code for review.

```bash
pcamaw open feature-auth
```

**Options:**
- `-w, --workspace <path>` - Workspace path to open in VS Code (default: current directory)

**What it does:**
1. Opens VS Code with the workspace
2. Opens all files in the patch
3. Creates a `.patch` preview file for review

**Example with workspace:**
```bash
pcamaw open feature-auth --workspace /path/to/project
```

---

### `pcamaw apply <patchName>`

Apply a patch to your workspace with interactive commit/push workflow.

```bash
pcamaw apply feature-auth
```

**Options:**
- `--no-commit` - Skip the commit workflow (just write files)
- `--auto-push` - Automatically push after committing (skip push prompt)

**Interactive Flow:**

1. **Review Summary:**
   ```
   📄 Patch Summary:
   
   Name: feature-auth
   Description: Add user authentication with JWT
   Files to modify: 3
     • src/auth.js (create)
     • src/middleware/auth.js (create)
     • package.json (modify)
   
   ? Apply this patch to your workspace? (Y/n)
   ```

2. **Apply Files:**
   ```
   ⚙️  Applying patch...
   ✅ Applied 3 file(s)
   ```

3. **Review Git Status:**
   ```
   📊 Git Status:
   
   ?? src/auth.js
   ?? src/middleware/auth.js
   M  package.json
   
   ? Commit these changes? (Y/n)
   ```

4. **Edit Commit Message:**
   Opens your editor with suggested message:
   ```
   chore: Apply PCAMAW patch "feature-auth"
   
   Add user authentication with JWT
   ```

5. **Confirm Push:**
   ```
   ✅ Changes committed
   
   ? Push changes to remote? (y/N)
   ```

**Examples:**

```bash
# Standard workflow with all prompts
pcamaw apply feature-auth

# Apply files only, skip commit
pcamaw apply feature-auth --no-commit

# Apply, commit, and auto-push
pcamaw apply feature-auth --auto-push
```

---

### `pcamaw stage <files...>`

Manually create a patch from files.

```bash
pcamaw stage src/auth.js src/middleware/auth.js --name "feature-auth" --description "Add authentication"
```

**Required Options:**
- `-n, --name <name>` - Patch name
- `-d, --description <description>` - Patch description

**What it does:**
1. Runs `git diff` on specified files
2. Captures current changes
3. Saves as a patch in `.pcamaw/patches/<name>.json`

**Example:**
```bash
pcamaw stage src/**/*.js \
  --name "refactor-services" \
  --description "Refactor service layer to use dependency injection"
```

**Note:** Files must have uncommitted changes for the diff to capture them.

---

### `pcamaw clear`

Remove all staged patches.

```bash
pcamaw clear
```

**Options:**
- `-f, --force` - Skip confirmation prompt

**Interactive:**
```
? Clear all staged patches? (y/N)
```

**Force mode:**
```bash
pcamaw clear --force
```

---

## Workflow Integration

### With N8N PCAMAW Workflow

1. **N8N generates patch** → Saved to `.pcamaw/patches/<name>.json`
2. **Review in VS Code:**
   ```bash
   pcamaw open <name>
   ```
3. **Apply with commit:**
   ```bash
   pcamaw apply <name>
   ```

### Manual Workflow

1. **Make changes** to files
2. **Stage as patch:**
   ```bash
   pcamaw stage file1.js file2.js --name "my-changes" --description "Updated logic"
   ```
3. **Review:**
   ```bash
   pcamaw show my-changes
   ```
4. **Apply later:**
   ```bash
   pcamaw apply my-changes
   ```

---

## File Storage

Patches are stored in `.pcamaw/patches/` as JSON files:

```json
{
  "name": "feature-auth",
  "timestamp": 1759602965370,
  "description": "Add user authentication with JWT",
  "files": [
    {
      "path": "src/auth.js",
      "operation": "create",
      "content": "...",
      "diff": "...",
      "size": 1234
    }
  ],
  "metadata": {}
}
```

**Fields:**
- `name` - Unique identifier
- `timestamp` - Creation time (Unix ms)
- `description` - Human-readable description
- `files[]` - Array of file changes
  - `path` - Relative file path
  - `operation` - `create`, `modify`, or `delete`
  - `content` - Full file content (for create/modify)
  - `diff` - Git diff output
  - `size` - Content size in bytes

---

## VS Code Integration

### Requirements

The VS Code CLI must be available in your PATH:

```bash
which code
# Should output: /usr/local/bin/code
```

### Installing VS Code CLI

1. Open VS Code
2. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
3. Type "Shell Command: Install 'code' command in PATH"
4. Select and execute

### What the CLI Does

- `openWorkspace(path)` - Opens workspace in VS Code
- `openFiles(files, workspace)` - Opens specific files
- `openPatch(patch)` - Opens all patch files for review
- `createPatchPreview(patch)` - Generates `.patch` file
- `openDiff(file1, file2)` - Opens diff view

---

## Safety Features

### Git Safety
- ✅ Detects if you're in a git repository
- ✅ Shows current branch before operations
- ✅ Displays git status after applying patches
- ✅ Requires confirmation before commits
- ✅ Requires separate confirmation for pushes

### Patch Validation
- ✅ Validates patch structure before applying
- ✅ Shows file summary before writing
- ✅ Preserves original diffs for review
- ✅ Supports rollback (via git reset)

### User Control
- ✅ Interactive prompts for all destructive actions
- ✅ `--force` flags to skip confirmations
- ✅ `--no-commit` to apply without committing
- ✅ Manual commit message editing

---

## Troubleshooting

### Command not found: `pcamaw`

**Solution 1:** Use the full path:
```bash
./bin/pcamaw.js list
```

**Solution 2:** Link globally:
```bash
npm link
```

**Solution 3:** Add to PATH:
```bash
export PATH="$PATH:/path/to/pcamaw-cli/bin"
```

---

### VS Code doesn't open

**Check if `code` command is available:**
```bash
which code
```

**If not found:**
1. Open VS Code
2. Cmd+Shift+P → "Install 'code' command in PATH"

---

### Patch apply fails

**Check file paths:**
- Paths are relative to workspace root
- Use `pcamaw show <name>` to verify paths

**Check git status:**
```bash
git status
```
- Uncommitted changes may conflict
- Commit or stash before applying

---

### Push fails

**Check remote:**
```bash
git remote -v
```

**Set up remote:**
```bash
git remote add origin <url>
```

**Push manually:**
```bash
git push origin <branch>
```

---

## Examples

### Complete Workflow Example

```bash
# 1. List available patches from N8N workflow
pcamaw list

# 2. Show details
pcamaw show feature-auth

# 3. Open in VS Code for review
pcamaw open feature-auth

# 4. Apply with full workflow (review → commit → push)
pcamaw apply feature-auth
```

### Quick Apply Without Review

```bash
pcamaw apply bugfix-validation --auto-push
```

### Stage and Apply Later

```bash
# Stage changes
git add src/utils/validation.js
pcamaw stage src/utils/validation.js \
  --name "improve-validation" \
  --description "Add email validation"

# Reset to keep as patch only
git reset HEAD src/utils/validation.js

# Apply later
pcamaw apply improve-validation
```

---

## Development

### Project Structure

```
pcamaw-cli/
├── bin/
│   └── pcamaw.js           # Main CLI entry point
├── lib/
│   ├── patch-manager.js    # Patch storage & retrieval
│   ├── vscode-integration.js  # VS Code launcher
│   └── commit-workflow.js  # Git commit/push flow
├── package.json
└── README.md
```

### Running Tests

```bash
npm test
```

### Dependencies

- **commander** - CLI framework
- **chalk** - Terminal colors
- **inquirer** - Interactive prompts

---

## License

MIT

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review N8N workflow configuration
- Ensure git and VS Code are properly set up
