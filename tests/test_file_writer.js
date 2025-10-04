/**
 * File Writer Validation Tests
 * 
 * Validates that the Safe File Writer correctly:
 * 1. Creates files with approved extensions
 * 2. Blocks unapproved file types
 * 3. Respects size limits
 * 4. Uses templates correctly
 * 5. Prevents file overwrites
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

// File writing logic (extracted from workflow)
function validateFileOperation(fileOp, safetyConfig, projectPath) {
  const allowedExtensions = safetyConfig.safety?.allowed_file_extensions || ['.md', '.txt', '.json', '.gitignore'];
  const maxBytes = safetyConfig.safety?.max_file_bytes || 50000;
  const fileWritingEnabled = safetyConfig.safety?.enable_file_writing !== false;

  if (!fileWritingEnabled) {
    return { status: 'disabled', reason: 'File writing disabled in config' };
  }

  const filePath = path.join(projectPath, fileOp.file_path || '');
  const ext = path.extname(filePath);

  if (!allowedExtensions.includes(ext) && ext !== '') {
    return { status: 'blocked', reason: `Extension ${ext} not in allowed list` };
  }

  let content = '';
  const templates = {
    node_gitignore: `node_modules/\n.env\n.env.local\n.DS_Store\ndist/\nbuild/\ncoverage/\n*.log`,
    basic_readme: `# Project\n\n## Overview\nAutomatically generated project documentation.\n`
  };

  if (fileOp.content_template && templates[fileOp.content_template]) {
    content = templates[fileOp.content_template];
  } else if (fileOp.content) {
    content = fileOp.content;
  } else {
    return { status: 'skipped', reason: 'No content or template provided' };
  }

  if (content.length > maxBytes) {
    return { status: 'blocked', reason: `Content exceeds max size (${maxBytes} bytes)` };
  }

  if (fs.existsSync(filePath)) {
    return { status: 'skipped', reason: 'File already exists', file_path: filePath };
  }

  return { status: 'approved', content, file_path: filePath };
}

// Test Suite
class FileWriterTests {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  test(name, fn) {
    try {
      fn();
      this.passed++;
      this.tests.push({ name, status: 'PASS' });
      console.log(`✅ ${name}`);
    } catch (error) {
      this.failed++;
      this.tests.push({ name, status: 'FAIL', error: error.message });
      console.error(`❌ ${name}: ${error.message}`);
    }
  }

  summary() {
    console.log('\n' + '='.repeat(60));
    console.log(`Test Summary: ${this.passed} passed, ${this.failed} failed`);
    console.log('='.repeat(60));
    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

const tests = new FileWriterTests();
const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-writer-test-'));
const safetyConfig = {
  safety: {
    enable_file_writing: true,
    allowed_file_extensions: ['.md', '.txt', '.json', '.gitignore', '.js', '.ts'],
    max_file_bytes: 50000
  }
};

// Allowed Extension Tests
tests.test('Should approve .md file creation', () => {
  const fileOp = { file_path: 'README.md', content: '# Test' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'approved');
});

tests.test('Should approve .gitignore file creation', () => {
  const fileOp = { file_path: '.gitignore', content: 'node_modules/' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'approved');
});

tests.test('Should approve .json file creation', () => {
  const fileOp = { file_path: 'package.json', content: '{}' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'approved');
});

tests.test('Should approve .js file creation', () => {
  const fileOp = { file_path: 'index.js', content: 'console.log("test");' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'approved');
});

// Blocked Extension Tests
tests.test('Should block .sh file creation', () => {
  const fileOp = { file_path: 'script.sh', content: '#!/bin/bash' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'blocked');
  assert(result.reason.includes('not in allowed list'));
});

tests.test('Should block .exe file creation', () => {
  const fileOp = { file_path: 'malware.exe', content: 'binary data' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'blocked');
});

tests.test('Should block .py file creation (not in allowed list)', () => {
  const fileOp = { file_path: 'script.py', content: 'print("test")' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'blocked');
});

// Size Limit Tests
tests.test('Should block file exceeding size limit', () => {
  const largeContent = 'x'.repeat(60000);
  const fileOp = { file_path: 'large.txt', content: largeContent };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'blocked');
  assert(result.reason.includes('exceeds max size'));
});

tests.test('Should approve file within size limit', () => {
  const normalContent = 'x'.repeat(1000);
  const fileOp = { file_path: 'normal.txt', content: normalContent };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'approved');
});

// Template Tests
tests.test('Should use node_gitignore template', () => {
  const fileOp = { file_path: '.gitignore', content_template: 'node_gitignore' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'approved');
  assert(result.content.includes('node_modules'));
});

tests.test('Should use basic_readme template', () => {
  const fileOp = { file_path: 'README.md', content_template: 'basic_readme' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'approved');
  assert(result.content.includes('# Project'));
});

tests.test('Should skip when no content or template provided', () => {
  const fileOp = { file_path: 'empty.txt' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'skipped');
  assert(result.reason.includes('No content'));
});

// File Existence Tests
tests.test('Should skip if file already exists', () => {
  const testFile = path.join(testDir, 'existing.txt');
  fs.writeFileSync(testFile, 'already here');
  
  const fileOp = { file_path: 'existing.txt', content: 'new content' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'skipped');
  assert(result.reason.includes('already exists'));
});

// Disabled Writing Tests
tests.test('Should block all operations when writing disabled', () => {
  const disabledConfig = {
    safety: { ...safetyConfig.safety, enable_file_writing: false }
  };
  const fileOp = { file_path: 'test.md', content: '# Test' };
  const result = validateFileOperation(fileOp, disabledConfig, testDir);
  assert.strictEqual(result.status, 'disabled');
});

// Edge Cases
tests.test('Should handle nested directory paths', () => {
  const fileOp = { file_path: 'src/components/Button.tsx', content: 'export const Button = () => {};' };
  const customConfig = {
    safety: {
      ...safetyConfig.safety,
      allowed_file_extensions: ['.tsx']
    }
  };
  const result = validateFileOperation(fileOp, customConfig, testDir);
  assert.strictEqual(result.status, 'approved');
});

tests.test('Should handle files with no extension (like .gitignore)', () => {
  const fileOp = { file_path: '.env.example', content: 'API_KEY=' };
  const customConfig = {
    safety: {
      ...safetyConfig.safety,
      allowed_file_extensions: ['.example']
    }
  };
  const result = validateFileOperation(fileOp, customConfig, testDir);
  assert.strictEqual(result.status, 'approved');
});

// Security Tests
tests.test('Security: Should never approve binary files', () => {
  const fileOp = { file_path: 'binary.bin', content: '\x00\x01\x02\x03' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'blocked');
});

tests.test('Security: Should never approve executable scripts outside allowed list', () => {
  const fileOp = { file_path: 'run.bat', content: '@echo off' };
  const result = validateFileOperation(fileOp, safetyConfig, testDir);
  assert.strictEqual(result.status, 'blocked');
});

tests.test('Security: Should respect custom allowed extensions', () => {
  const customConfig = {
    safety: {
      enable_file_writing: true,
      allowed_file_extensions: ['.custom'],
      max_file_bytes: 50000
    }
  };
  const fileOp = { file_path: 'data.custom', content: 'custom data' };
  const result = validateFileOperation(fileOp, customConfig, testDir);
  assert.strictEqual(result.status, 'approved');
});

// Cleanup
tests.test('Cleanup: Remove test directory', () => {
  fs.rmSync(testDir, { recursive: true, force: true });
  assert(!fs.existsSync(testDir));
});

// Run all tests
tests.summary();

module.exports = { validateFileOperation, FileWriterTests };
