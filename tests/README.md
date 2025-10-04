# Test Suite

This directory contains validation tests for the autonomous N8N workflow components.

## Test Files

### `test_command_planner.js`
Validates the Autonomous Command Planner safety logic:
- ✅ Safe command approval (npm, git, grep, etc.)
- ✅ Dangerous command blocking (rm -rf, sudo, etc.)
- ✅ Command categorization (backend/uiux/general)
- ✅ Security boundary enforcement
- ✅ Edge case handling

**Run:** `node tests/test_command_planner.js`

### `test_blueprint_parser.js`
Validates the Project Blueprint Loader parsing logic:
- ✅ UI/UX task detection (buttons, modals, images, etc.)
- ✅ Backend task detection (contracts, tests, migrations)
- ✅ Testing requirement extraction
- ✅ Documentation section detection
- ✅ Network/environment detection
- ✅ Deduplication and edge cases

**Run:** `node tests/test_blueprint_parser.js`

## Running All Tests

```bash
# Run command planner tests
node tests/test_command_planner.js

# Run blueprint parser tests
node tests/test_blueprint_parser.js

# Run all tests
npm test  # (if configured in package.json)
```

## Test Results

Both test suites should pass with 100% success:
- Command Planner: 32/32 tests passing
- Blueprint Parser: 26/26 tests passing

## Adding New Tests

To add new test cases:

1. Open the relevant test file
2. Add a new test using the pattern:
   ```javascript
   tests.test('Description of what it should do', () => {
     const result = functionToTest(input);
     assert.strictEqual(result.expected, actualValue);
   });
   ```

3. Run the test file to validate

## Integration with Workflow

These tests validate the core logic used in:
- **Project Blueprint Loader** node (`project-blueprint-loader`)
- **Autonomous Command Planner** node (`command-planner`)

The test logic mirrors the actual workflow code to ensure safety guarantees hold during autonomous execution.
