# Changelog for PCAMAW v2

All notable changes to the Autonomous PCAM Programming workflow.

## [2.0.0] - 2025-10-04

### 🎉 Major Release: File Writing Capabilities

#### Added
- **Safe File Writer Node**: Autonomous file creation with strong safety guardrails
  - Supports approved extensions: `.md`, `.mdx`, `.txt`, `.json`, `.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.scss`, `.gitignore`, `.env.example`
  - Template system for common files (`.gitignore`, `README.md`)
  - Size limit enforcement (50KB default)
  - Overwrite prevention
  - Configurable via `config.json`

- **Enhanced Configuration Loading**: 
  - Loads `config.json` dynamically at runtime
  - Supports environment variable overrides (`AUTONOMOUS_CONFIG_PATH`)
  - Merged default + custom configuration

- **File Operation Detection**:
  - Blueprint parser now detects missing files
  - PCAM analyzer recognizes file creation keywords
  - Execution planner generates file operation tasks

- **Test Suite Expansion**:
  - Added `test_file_writer.js` with 20 comprehensive tests
  - Security boundary validation
  - Template rendering verification
  - Extension allowlist enforcement

#### Changed
- Renamed workflow files:
  - V1: `autonomous-pcam-programming-workflow.json` (command execution only)
  - V2: `autonomous-pcam-programming-workflow-v2.json` (with file writing)

- Updated `config.json`:
  - `sandbox_mode`: `false` (enables actual execution)
  - `enable_file_writing`: `true`
  - `allowed_file_extensions`: expanded list
  - `max_file_bytes`: `50000`

- Simplified workflow architecture (V2):
  - 10 nodes (down from 11 in V1)
  - Streamlined data flow
  - Unified config/blueprint loader

#### Security
- All file operations require extension approval
- Size limits prevent abuse
- Template-based content generation
- No arbitrary code execution in file content
- Audit trail for all file operations

#### Documentation
- Updated README.md with V2 usage instructions
- Added file writing safety documentation
- Expanded test suite documentation
- Created CHANGELOG.md

---

## [1.0.0] - 2025-10-04

### 🚀 Initial Release

#### Features
- PCAM (Persona, Context, Action, Metrics) decomposition engine
- Blueprint-aware project analysis (`priv/project.md`)
- Autonomous command execution with safety filtering
- Backend/UI-UX task separation
- Command safety validation (allowlist + blocklist)
- Audit reporting and safety monitoring

#### Test Coverage
- 32 command planner tests
- 26 blueprint parser tests
- Total: 58 tests, 100% pass rate

#### Safety Features
- Dangerous command blocking (`rm -rf`, `sudo`, `shutdown`, etc.)
- Autonomy confidence threshold (55%)
- Manual review fallback for low-confidence operations
- Comprehensive audit logging

---

## Version Comparison

| Feature | V1 | V2 |
|---------|----|----|
| Command Execution | ✅ | ✅ |
| File Writing | ❌ | ✅ |
| Config Loading | ❌ | ✅ |
| Template System | ❌ | ✅ |
| Test Coverage | 58 tests | 78 tests |
| Node Count | 11 | 10 |
| Safety Guardrails | High | High+ |

---

## Migration Guide (V1 → V2)

1. **Backup your current workflow**
2. **Import V2 workflow**: `autonomous-pcam-programming-workflow-v2.json`
3. **Update config.json**:
   ```json
   {
     "autonomous_programming_config": {
       "safety": {
         "sandbox_mode": false,
         "enable_file_writing": true,
         "allowed_file_extensions": [".md", ".json", ".ts", ".js"]
       }
     }
   }
   ```
4. **Run tests**: `node tests/test_file_writer.js`
5. **Test with sample prompt**: "Create a .gitignore file for my Node.js project"

---

## Roadmap

### Planned for V2.1
- [ ] Git commit and push automation
- [ ] Multi-file batch operations
- [ ] Custom template support
- [ ] File editing (not just creation)
- [ ] Diff preview before writing


### Planned for V3.0 (PCAMAW v3)
- [ ] LLM-based code generation
- [ ] Context-aware file content
- [ ] Project scaffolding (full boilerplates)
- [ ] Interactive approval workflows
- [ ] Web UI for monitoring

PCAMAW v3 will introduce a local Next.js web UI that lets users interactively submit prompts, watch PCAM decomposition and execution, and accept produced changes directly into VS Code. The goal is to make autonomous programming visible, controllable, and tightly integrated with the developer's editor.

Core capabilities planned:

- Local Next.js Prompt UI
  - Runs locally (development mode) and provides a single-page app to submit natural language prompts.
  - Shows PCAM analysis (Persona, Context, Actions, Metrics) in real time and lists planned commands and file operations.
  - Visualizes progress as the N8N workflow runs and streams command/file results.

- Workflow Integration
  - The web UI will POST prompts to the N8N webhook (PCAMAW) and receive progressive updates from the workflow (webhook or polling).
  - Support for optional projectPath injection so PCAMAW can analyze the correct repository on disk.

- Approval & Patch Generation
  - When the workflow proposes file creations/patches, the UI will show diffs and allow the user to approve, edit, or reject each change.
  - Approved changes are turned into unified patch files (git-style diffs) and stored locally in a staging area.

- VS Code Sync Flow
  - After user approval, the UI will offer a one-click option to "Open in VS Code" which:
    1. Writes the staged patch files into a workspace-safe temporary folder (or directly into the project when configured)
    2. Optionally opens a VS Code window (via the `vscode://` URI or `code` CLI) showing the changed files and a recommended commit message
    3. Guides the developer through commit + push (or can optionally perform commit/push with explicit user consent)

- Safety & Audit
  - All file write operations still honor `config.json` allowlists and size limits.
  - Interactive approval ensures nothing is written to the working tree without explicit user consent.
  - Audit logs and a history of generated patches are retained for review.

- Developer Experience
  - Small local server (Next.js) + client (React) with minimal dependencies
  - Simple installation script and a `start` command for local testing
  - Optional VS Code extension (future) to embed the UI inside the editor

Milestones for v3

- M1: Next.js prompt UI + webhook integration (submit prompts, display PCAM output)
- M2: Patch generation + diff visualization + staging area
- M3: VS Code sync flow (open in editor + guided commit) with opt-in commit/push
- M4: Optional local agent mode for automated commit + push with strict guardrails and user confirmations

Security notes:

- The UI will default to sandboxed preview mode (no writes) and require explicit enabling of file writes and commits.
- Only allowed file extensions and template sizes will be accepted for automatic writes.
- Any commit/push automation will require explicit user opt-in and will be rate-limited per session.

