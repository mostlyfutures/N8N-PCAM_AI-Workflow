# PCAMAW CLI

Command-line interface for managing PCAMAW (Persona, Context, Action, Metrics) patches and integrating with VS Code.

## Quick Reference

| Platform | Installation | Usage | VS Code CLI Setup |
|----------|-------------|-------|-------------------|
| **🍎 macOS** | `npm install && npm link` | `pcamaw list` | `Cmd+Shift+P` → "Install 'code' command" |
| **🪟 Windows** | `npm install && npm link` | `pcamaw list` or `node bin\pcamaw.js list` | Usually automatic with VS Code install |
| **🐧 Linux** | `npm install && sudo npm link` | `pcamaw list` | Add `/usr/share/code/bin` to PATH |

**Commands:** `list`, `show`, `open`, `apply`, `stage`, `clear`  
**Global Install:** `npm link` (makes `pcamaw` available everywhere)  
**Local Usage:** `./bin/pcamaw.js` (macOS/Linux) or `node bin\pcamaw.js` (Windows)

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

### Platform-Specific Setup

<details>
<summary><strong>🍎 macOS</strong></summary>

#### 1. Install Dependencies
```bash
cd pcamaw-cli
npm install
```

#### 2. Make Executable
```bash
chmod +x bin/pcamaw.js
```

#### 3. Option A: Link Globally (Recommended)
```bash
npm link
```
Now use `pcamaw` from anywhere in your terminal.

#### 4. Option B: Use Directly
```bash
./bin/pcamaw.js list
```

#### 5. Install VS Code CLI
If `code` command not available:
1. Open VS Code
2. Press `Cmd+Shift+P`
3. Type "Shell Command: Install 'code' command in PATH"
4. Select and execute

#### Verify Installation
```bash
which code        # Should show /usr/local/bin/code
pcamaw --version  # Should show 0.1.0
```

</details>

<details>
<summary><strong>🪟 Windows</strong></summary>

#### 1. Install Dependencies
```cmd
cd pcamaw-cli
npm install
```

#### 2. Option A: Link Globally (Recommended)
```cmd
npm link
```
Now use `pcamaw` from any Command Prompt or PowerShell window.

#### 3. Option B: Use Directly with Node
```cmd
node bin\pcamaw.js list
```

#### 4. Option C: Create Batch File (Advanced)
Create `pcamaw.bat` in a directory in your PATH:
```batch
@echo off
node "C:\path\to\N8N Workflow\pcamaw-cli\bin\pcamaw.js" %*
```

#### 5. Install VS Code CLI
The `code` command should work automatically after installing VS Code.

If not available:
1. Open VS Code
2. Press `Ctrl+Shift+P`
3. Type "Shell Command: Install 'code' command in PATH"
4. Select and execute
5. Restart your terminal

#### Verify Installation (PowerShell)
```powershell
Get-Command code    # Should show VS Code path
pcamaw --version    # Should show 0.1.0
```

#### Verify Installation (Command Prompt)
```cmd
where code         # Should show VS Code path
pcamaw --version   # Should show 0.1.0
```

#### Common Windows Issues

**Issue: "pcamaw is not recognized"**
- Solution: Use `node bin\pcamaw.js` instead, or run `npm link` as Administrator

**Issue: "cannot be loaded because running scripts is disabled"**
- Solution (PowerShell): Run as Administrator:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

</details>

<details>
<summary><strong>🐧 Linux</strong></summary>

#### 1. Install Dependencies
```bash
cd pcamaw-cli
npm install
```

#### 2. Make Executable
```bash
chmod +x bin/pcamaw.js
```

#### 3. Option A: Link Globally (Recommended)
```bash
npm link
```
Or with sudo if needed:
```bash
sudo npm link
```

Now use `pcamaw` from anywhere in your terminal.

#### 4. Option B: Add to PATH
Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export PATH="$PATH:/full/path/to/pcamaw-cli/bin"
```
Then reload:
```bash
source ~/.bashrc  # or ~/.zshrc
```

#### 5. Option C: Create Symlink
```bash
sudo ln -s /full/path/to/pcamaw-cli/bin/pcamaw.js /usr/local/bin/pcamaw
```

#### 6. Install VS Code CLI
If `code` command not available:

**Debian/Ubuntu:**
```bash
# Should be installed with VS Code, if not:
sudo update-alternatives --install /usr/bin/code code /usr/share/code/bin/code 100
```

**Or manually add to PATH:**
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export PATH="$PATH:/usr/share/code/bin"
```

**Snap installation:**
If installed via Snap, use:
```bash
code() {
    /snap/bin/code "$@"
}
```

#### Verify Installation
```bash
which code        # Should show path to code binary
which pcamaw      # Should show /usr/local/bin/pcamaw or npm link path
pcamaw --version  # Should show 0.1.0
```

</details>

### Quick Start (All Platforms)

After installation, verify everything works:

```bash
# Check version
pcamaw --version

# View help
pcamaw --help

# Test with empty patches
pcamaw list
```

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

<details>
<summary><strong>macOS / Linux</strong></summary>

**Solution 1:** Use the full path:
```bash
./bin/pcamaw.js list
```

**Solution 2:** Link globally:
```bash
npm link
# Or with sudo
sudo npm link
```

**Solution 3:** Add to PATH (add to `~/.bashrc` or `~/.zshrc`):
```bash
export PATH="$PATH:/full/path/to/pcamaw-cli/bin"
```
Then reload: `source ~/.bashrc` or `source ~/.zshrc`

</details>

<details>
<summary><strong>Windows</strong></summary>

**Solution 1:** Use with Node:
```cmd
node bin\pcamaw.js list
```

**Solution 2:** Link globally (run as Administrator):
```cmd
npm link
```

**Solution 3:** Add to PATH:
1. Search for "Environment Variables" in Windows
2. Edit "Path" variable
3. Add: `C:\path\to\pcamaw-cli\bin`
4. Restart terminal

**Solution 4:** Create batch file `pcamaw.bat`:
```batch
@echo off
node "C:\full\path\to\pcamaw-cli\bin\pcamaw.js" %*
```
Place in a directory that's in your PATH.

</details>

---

### VS Code doesn't open

<details>
<summary><strong>macOS</strong></summary>

**Check if `code` command is available:**
```bash
which code
# Should show: /usr/local/bin/code
```

**If not found:**
1. Open VS Code
2. Press `Cmd+Shift+P`
3. Type "Shell Command: Install 'code' command in PATH"
4. Execute
5. Restart terminal

</details>

<details>
<summary><strong>Windows</strong></summary>

**Check if `code` command is available:**
```cmd
where code
```
Or PowerShell:
```powershell
Get-Command code
```

**If not found:**
1. Reinstall VS Code and check "Add to PATH" during installation
2. Or manually add to PATH:
   - Default location: `C:\Program Files\Microsoft VS Code\bin`
   - Add to System Environment Variables
3. Restart terminal/PowerShell

</details>

<details>
<summary><strong>Linux</strong></summary>

**Check if `code` command is available:**
```bash
which code
```

**If not found:**

**Debian/Ubuntu:**
```bash
sudo update-alternatives --install /usr/bin/code code /usr/share/code/bin/code 100
```

**Snap installation:**
```bash
sudo snap install code --classic
```

**Manual PATH (add to `~/.bashrc` or `~/.zshrc`):**
```bash
export PATH="$PATH:/usr/share/code/bin"
```
Then: `source ~/.bashrc`

**Verify:**
```bash
code --version
```

</details>

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

## Platform-Specific Usage Notes

### File Paths

<details>
<summary><strong>macOS / Linux</strong></summary>

Use forward slashes for paths:
```bash
pcamaw stage src/auth.js lib/utils.js --name "my-patch"
```

Paths are relative to current directory:
```bash
cd /Users/username/project
pcamaw stage ./src/**/*.js --name "refactor"
```

</details>

<details>
<summary><strong>Windows</strong></summary>

**Command Prompt:** Use backslashes or forward slashes:
```cmd
pcamaw stage src\auth.js lib\utils.js --name "my-patch"
```

**PowerShell:** Forward slashes work best:
```powershell
pcamaw stage src/auth.js lib/utils.js --name "my-patch"
```

**Git Bash on Windows:** Use forward slashes (Unix-style):
```bash
pcamaw stage src/auth.js lib/utils.js --name "my-patch"
```

**Important:** If using `node bin\pcamaw.js` directly, use backslashes for the bin path:
```cmd
node bin\pcamaw.js list
```

</details>

### Shell Differences

<details>
<summary><strong>Terminal Shells Comparison</strong></summary>

| Shell | Platform | Command Example |
|-------|----------|----------------|
| **Bash** | macOS/Linux | `pcamaw list` |
| **Zsh** | macOS | `pcamaw list` |
| **PowerShell** | Windows | `pcamaw list` |
| **CMD** | Windows | `pcamaw list` |
| **Git Bash** | Windows | `pcamaw list` |

**Multi-line commands:**

**Bash/Zsh (macOS/Linux):**
```bash
pcamaw stage file1.js file2.js \
  --name "my-changes" \
  --description "Updated logic"
```

**PowerShell (Windows):**
```powershell
pcamaw stage file1.js file2.js `
  --name "my-changes" `
  --description "Updated logic"
```

**CMD (Windows):**
```cmd
pcamaw stage file1.js file2.js ^
  --name "my-changes" ^
  --description "Updated logic"
```

</details>

---

## Examples

### Complete Workflow Example

**macOS / Linux:**
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

**Windows (PowerShell):**
```powershell
# 1. List available patches from N8N workflow
pcamaw list

# 2. Show details
pcamaw show feature-auth

# 3. Open in VS Code for review
pcamaw open feature-auth

# 4. Apply with full workflow (review → commit → push)
pcamaw apply feature-auth
```

**Windows (if not globally linked):**
```cmd
node bin\pcamaw.js list
node bin\pcamaw.js show feature-auth
node bin\pcamaw.js open feature-auth
node bin\pcamaw.js apply feature-auth
```

### Quick Apply Without Review

```bash
pcamaw apply bugfix-validation --auto-push
```

### Stage and Apply Later

**macOS / Linux:**
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

**Windows (PowerShell):**
```powershell
# Stage changes
git add src/utils/validation.js
pcamaw stage src/utils/validation.js `
  --name "improve-validation" `
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
