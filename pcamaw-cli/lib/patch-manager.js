const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

/**
 * PatchManager - Manages staged patches in .pcamaw/patches/
 * 
 * Patches are stored as JSON files with metadata and file changes.
 * Each patch contains: name, timestamp, description, files[], and optional git info.
 */
class PatchManager {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
    this.patchesDir = path.join(baseDir, '.pcamaw', 'patches');
  }

  /**
   * Ensure the patches directory exists
   */
  async ensurePatchesDir() {
    try {
      await fs.mkdir(this.patchesDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw new Error(`Failed to create patches directory: ${error.message}`);
      }
    }
  }

  /**
   * List all staged patches
   * @returns {Promise<Array>} Array of patch metadata objects
   */
  async listPatches() {
    await this.ensurePatchesDir();
    
    try {
      const files = await fs.readdir(this.patchesDir);
      const patchFiles = files.filter(f => f.endsWith('.json'));
      
      const patches = await Promise.all(
        patchFiles.map(async (file) => {
          const content = await fs.readFile(path.join(this.patchesDir, file), 'utf-8');
          return JSON.parse(content);
        })
      );
      
      // Sort by timestamp (newest first)
      return patches.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      throw new Error(`Failed to list patches: ${error.message}`);
    }
  }

  /**
   * Get a specific patch by name
   * @param {string} patchName - Name of the patch
   * @returns {Promise<Object|null>} Patch object or null if not found
   */
  async getPatch(patchName) {
    await this.ensurePatchesDir();
    
    const patchPath = path.join(this.patchesDir, `${patchName}.json`);
    
    try {
      const content = await fs.readFile(patchPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw new Error(`Failed to read patch: ${error.message}`);
    }
  }

  /**
   * Save a patch to the staging area
   * @param {Object} patch - Patch object with name, files, description
   * @returns {Promise<Object>} Saved patch object
   */
  async savePatch(patch) {
    await this.ensurePatchesDir();
    
    const patchData = {
      name: patch.name,
      timestamp: patch.timestamp || Date.now(),
      description: patch.description || '',
      files: patch.files || [],
      metadata: patch.metadata || {}
    };
    
    const patchPath = path.join(this.patchesDir, `${patch.name}.json`);
    
    try {
      await fs.writeFile(patchPath, JSON.stringify(patchData, null, 2), 'utf-8');
      return patchData;
    } catch (error) {
      throw new Error(`Failed to save patch: ${error.message}`);
    }
  }

  /**
   * Create a patch from file paths by reading git diff
   * @param {Array<string>} filePaths - Array of file paths to include
   * @param {Object} options - { name, description }
   * @returns {Promise<Object>} Created patch object
   */
  async createPatchFromFiles(filePaths, options = {}) {
    await this.ensurePatchesDir();
    
    const files = [];
    
    for (const filePath of filePaths) {
      const fullPath = path.join(this.baseDir, filePath);
      
      try {
        // Check if file exists
        await fs.access(fullPath);
        
        // Try to get git diff for the file
        let diff = '';
        try {
          diff = execSync(`git diff HEAD -- "${filePath}"`, {
            cwd: this.baseDir,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
          });
        } catch (error) {
          // If no git diff (new file or not in git), read full content
          const content = await fs.readFile(fullPath, 'utf-8');
          diff = `--- /dev/null\n+++ b/${filePath}\n${content.split('\n').map(line => '+' + line).join('\n')}`;
        }
        
        files.push({
          path: filePath,
          operation: diff ? 'modify' : 'create',
          diff: diff || '',
          size: (await fs.stat(fullPath)).size
        });
      } catch (error) {
        console.warn(`Warning: Could not process file ${filePath}: ${error.message}`);
      }
    }
    
    const patch = {
      name: options.name || `patch-${Date.now()}`,
      description: options.description || '',
      timestamp: Date.now(),
      files
    };
    
    return await this.savePatch(patch);
  }

  /**
   * Delete a patch
   * @param {string} patchName - Name of the patch to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePatch(patchName) {
    await this.ensurePatchesDir();
    
    const patchPath = path.join(this.patchesDir, `${patchName}.json`);
    
    try {
      await fs.unlink(patchPath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw new Error(`Failed to delete patch: ${error.message}`);
    }
  }

  /**
   * Clear all staged patches
   * @returns {Promise<number>} Number of patches deleted
   */
  async clearPatches() {
    await this.ensurePatchesDir();
    
    const patches = await this.listPatches();
    
    for (const patch of patches) {
      await this.deletePatch(patch.name);
    }
    
    return patches.length;
  }

  /**
   * Apply a patch to the working directory (write files)
   * @param {Object} patch - Patch object to apply
   * @returns {Promise<Array>} Array of applied file paths
   */
  async applyPatch(patch) {
    const appliedFiles = [];
    
    for (const file of patch.files) {
      const targetPath = path.join(this.baseDir, file.path);
      const targetDir = path.dirname(targetPath);
      
      // Ensure directory exists
      await fs.mkdir(targetDir, { recursive: true });
      
      // For now, apply the diff content directly
      // In a more sophisticated version, we'd parse and apply the actual diff
      if (file.operation === 'create' && file.diff) {
        const content = file.diff.split('\n')
          .filter(line => line.startsWith('+'))
          .map(line => line.substring(1))
          .join('\n');
        
        await fs.writeFile(targetPath, content, 'utf-8');
        appliedFiles.push(file.path);
      } else if (file.operation === 'modify' && file.diff) {
        // For modify operations, we'd need a proper diff parser
        // For now, just log a warning
        console.warn(`Warning: Modify operation for ${file.path} not fully implemented yet`);
      }
    }
    
    return appliedFiles;
  }
}

module.exports = PatchManager;
