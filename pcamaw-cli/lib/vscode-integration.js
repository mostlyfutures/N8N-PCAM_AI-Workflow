const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * VSCodeIntegration - Opens patches in VS Code using `code` CLI
 * 
 * Supports opening workspaces, specific files, and generating diff views.
 */
class VSCodeIntegration {
  /**
   * Check if VS Code CLI is available
   * @returns {boolean} True if `code` command is available
   */
  isVSCodeAvailable() {
    try {
      execSync('which code', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Open a workspace in VS Code
   * @param {string} workspacePath - Path to workspace directory
   * @returns {Promise<boolean>} True if successful
   */
  async openWorkspace(workspacePath) {
    if (!this.isVSCodeAvailable()) {
      return false;
    }
    
    try {
      execSync(`code "${workspacePath}"`, { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error('Failed to open workspace:', error.message);
      return false;
    }
  }

  /**
   * Open specific files in VS Code
   * @param {Array<string>} filePaths - Array of file paths to open
   * @param {string} workspaceDir - Workspace directory (optional)
   * @returns {Promise<boolean>} True if successful
   */
  async openFiles(filePaths, workspaceDir = process.cwd()) {
    if (!this.isVSCodeAvailable()) {
      return false;
    }
    
    try {
      const fullPaths = filePaths.map(f => path.join(workspaceDir, f));
      const filesArg = fullPaths.map(p => `"${p}"`).join(' ');
      
      execSync(`code ${filesArg}`, { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error('Failed to open files:', error.message);
      return false;
    }
  }

  /**
   * Open patch files in VS Code for review
   * @param {Object} patch - Patch object with files array
   * @param {string} workspacePath - Workspace path to open
   * @returns {Promise<boolean>} True if successful
   */
  async openPatch(patch, workspacePath = process.cwd()) {
    if (!this.isVSCodeAvailable()) {
      console.warn('VS Code CLI not found. Install with: https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line');
      return false;
    }
    
    try {
      // First, open the workspace
      execSync(`code "${workspacePath}"`, { stdio: 'ignore' });
      
      // Wait a moment for VS Code to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then open each file mentioned in the patch
      if (patch.files && patch.files.length > 0) {
        const filesToOpen = patch.files.map(f => path.join(workspacePath, f.path));
        const filesArg = filesToOpen.map(p => `"${p}"`).join(' ');
        
        execSync(`code ${filesArg}`, { stdio: 'ignore' });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to open patch in VS Code:', error.message);
      return false;
    }
  }

  /**
   * Open VS Code with a diff view (requires VS Code extension or manual setup)
   * @param {string} originalFile - Original file path
   * @param {string} modifiedFile - Modified file path
   * @returns {Promise<boolean>} True if successful
   */
  async openDiff(originalFile, modifiedFile) {
    if (!this.isVSCodeAvailable()) {
      return false;
    }
    
    try {
      execSync(`code --diff "${originalFile}" "${modifiedFile}"`, { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error('Failed to open diff:', error.message);
      return false;
    }
  }

  /**
   * Create a temporary patch preview file for VS Code
   * @param {Object} patch - Patch object
   * @param {string} outputDir - Directory to write preview file
   * @returns {Promise<string>} Path to preview file
   */
  async createPatchPreview(patch, outputDir = '/tmp') {
    const previewPath = path.join(outputDir, `${patch.name}.patch`);
    
    let previewContent = `# Patch: ${patch.name}\n`;
    previewContent += `# Created: ${new Date(patch.timestamp).toLocaleString()}\n`;
    previewContent += `# Description: ${patch.description || 'No description'}\n\n`;
    
    for (const file of patch.files) {
      previewContent += `\n## File: ${file.path} (${file.operation})\n\n`;
      previewContent += file.diff || '(No diff available)\n';
      previewContent += '\n---\n';
    }
    
    await fs.writeFile(previewPath, previewContent, 'utf-8');
    return previewPath;
  }

  /**
   * Open the patch preview file in VS Code
   * @param {Object} patch - Patch object
   * @returns {Promise<boolean>} True if successful
   */
  async openPatchPreview(patch) {
    if (!this.isVSCodeAvailable()) {
      return false;
    }
    
    try {
      const previewPath = await this.createPatchPreview(patch);
      execSync(`code "${previewPath}"`, { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error('Failed to open patch preview:', error.message);
      return false;
    }
  }
}

module.exports = VSCodeIntegration;
