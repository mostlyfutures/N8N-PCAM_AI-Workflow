# Test Suite Documentation

This directory contains validation tests for the Autonomous PCAM Programming workflow.

## Test Files

### 1. `test_command_planner.js` (32 tests)
**Purpose:** Validates that the Autonomous Command Planner correctly filters commands through safety guardrails.

**Coverage:**
- ✅ Safe command approval (ls, npm install, git status, etc.)
- ✅ Dangerous command blocking (rm -rf, sudo, shutdown, etc.)
- ✅ Command categorization (backend/uiux/general)
- ✅ Security boundary enforcement
- ✅ Real-world command scenarios

**Run:**
```bash
node tests/test_command_planner.js
```

**Expected Output:** `32 passed, 0 failed`

---

### 2. `test_blueprint_parser.js` (26 tests)
**Purpose:** Validates that the Blueprint Parser correctly extracts tasks from `priv/project.md`.

**Coverage:**
- ✅ UI/UX task detection (modals, buttons, components)
- ✅ Backend task detection (contracts, migrations, tests)
- ✅ Testing task identification
- ✅ Documentation parsing
- ✅ Edge cases and malformed input

**Run:**
```bash
node tests/test_blueprint_parser.js
```

**Expected Output:** `26 passed, 0 failed`

---

### 3. `test_file_writer.js` (20 tests) - V2 Only
**Purpose:** Validates that the Safe File Writer enforces security policies for file creation.

**Coverage:**
- ✅ Allowed file extension approval (.md, .json, .ts, .js, .gitignore)
- ✅ Blocked file extension rejection (.sh, .exe, .py)
- ✅ File size limit enforcement (50KB default)
- ✅ Template usage (node_gitignore, basic_readme)
- ✅ Overwrite prevention
- ✅ Security boundary tests

**Run:**
```bash
node tests/test_file_writer.js
```

**Expected Output:** `20 passed, 0 failed`

---

## Running All Tests

```bash
npm run test
# or manually:
node tests/test_command_planner.js && \
node tests/test_blueprint_parser.js && \
node tests/test_file_writer.js
```

**Total Coverage:** 78 tests across all suites
