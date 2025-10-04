# Changelog

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

### Planned for V3.0
- [ ] LLM-based code generation
- [ ] Context-aware file content
- [ ] Project scaffolding (full boilerplates)
- [ ] Interactive approval workflows
- [ ] Web UI for monitoring
