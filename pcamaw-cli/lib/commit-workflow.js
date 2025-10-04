const inquirer = require('inquirer');
const { execSync } = require('child_process');
const chalk = require('chalk');

/**
 * CommitWorkflow - Interactive workflow for applying patches and committing to git
 * 
 * Guides users through reviewing, applying, committing, and pushing changes.
 */
class CommitWorkflow {
  constructor(patchManager, vscodeIntegration) {
    this.patchManager = patchManager;
    this.vscodeIntegration = vscodeIntegration;
  }

  /**
   * Check if we're in a git repository
   * @returns {boolean}
   */
  isGitRepo() {
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current git branch
   * @returns {string}
   */
  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Check if there are uncommitted changes
   * @returns {boolean}
   */
  hasUncommittedChanges() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      return status.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Apply a patch to the workspace with interactive prompts
   * @param {Object} patch - Patch to apply
   * @param {Object} options - { skipCommit, autoPush }
   * @returns {Promise<void>}
   */
  async applyPatch(patch, options = {}) {
    const { skipCommit = false, autoPush = false } = options;

    // Step 1: Show patch summary and confirm
    console.log(chalk.bold(`\n📄 Patch Summary:\n`));
    console.log(chalk.cyan(`Name: ${patch.name}`));
    console.log(chalk.gray(`Description: ${patch.description || 'No description'}`));
    console.log(chalk.gray(`Files to modify: ${patch.files.length}`));
    
    patch.files.forEach(file => {
      console.log(chalk.yellow(`  • ${file.path} (${file.operation})`));
    });

    const { confirmApply } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmApply',
        message: 'Apply this patch to your workspace?',
        default: true
      }
    ]);

    if (!confirmApply) {
      console.log(chalk.yellow('Patch application cancelled.'));
      return;
    }

    // Step 2: Apply the patch
    console.log(chalk.gray('\n⚙️  Applying patch...'));
    
    try {
      const appliedFiles = await this.patchManager.applyPatch(patch);
      console.log(chalk.green(`✅ Applied ${appliedFiles.length} file(s)`));
      
      if (appliedFiles.length === 0) {
        console.log(chalk.yellow('No files were modified. Patch may be empty or already applied.'));
        return;
      }
    } catch (error) {
      console.error(chalk.red(`❌ Failed to apply patch: ${error.message}`));
      return;
    }

    // Step 3: Check if we're in a git repo
    if (!this.isGitRepo()) {
      console.log(chalk.yellow('\n⚠️  Not in a git repository. Skipping commit/push workflow.'));
      console.log(chalk.gray('Files have been written to disk.'));
      return;
    }

    // Step 4: Show git status
    console.log(chalk.bold('\n📊 Git Status:\n'));
    try {
      const status = execSync('git status --short', { encoding: 'utf-8' });
      console.log(status);
    } catch (error) {
      console.error(chalk.red('Failed to get git status'));
    }

    if (skipCommit) {
      console.log(chalk.gray('\nSkipping commit (--no-commit flag set)'));
      return;
    }

    // Step 5: Prompt for commit
    const { shouldCommit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldCommit',
        message: 'Commit these changes?',
        default: true
      }
    ]);

    if (!shouldCommit) {
      console.log(chalk.yellow('\nChanges applied but not committed.'));
      console.log(chalk.gray('You can commit manually with: git add . && git commit'));
      return;
    }

    // Step 6: Get commit message
    const suggestedMessage = `chore: Apply PCAMAW patch "${patch.name}"\n\n${patch.description || 'Automated changes from PCAMAW workflow'}`;
    
    const { commitMessage } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'commitMessage',
        message: 'Edit commit message (will open in editor):',
        default: suggestedMessage,
        waitUserInput: false
      }
    ]);

    // Step 7: Stage and commit
    try {
      console.log(chalk.gray('\n📝 Staging changes...'));
      execSync('git add .', { stdio: 'inherit' });
      
      console.log(chalk.gray('💾 Creating commit...'));
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
      
      console.log(chalk.green('✅ Changes committed'));
    } catch (error) {
      console.error(chalk.red(`❌ Commit failed: ${error.message}`));
      return;
    }

    // Step 8: Prompt for push
    if (autoPush) {
      console.log(chalk.gray('\n🚀 Auto-pushing to remote...'));
      await this.pushChanges();
      return;
    }

    const { shouldPush } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldPush',
        message: 'Push changes to remote?',
        default: false
      }
    ]);

    if (shouldPush) {
      await this.pushChanges();
    } else {
      console.log(chalk.yellow('\nChanges committed but not pushed.'));
      console.log(chalk.gray(`You can push manually with: git push origin ${this.getCurrentBranch()}`));
    }
  }

  /**
   * Push changes to remote with safety checks
   * @returns {Promise<void>}
   */
  async pushChanges() {
    const currentBranch = this.getCurrentBranch();
    
    console.log(chalk.gray(`\n🚀 Pushing to origin/${currentBranch}...`));
    
    try {
      // Check if remote exists
      execSync('git remote get-url origin', { stdio: 'ignore' });
      
      // Push
      execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
      
      console.log(chalk.green(`✅ Successfully pushed to origin/${currentBranch}`));
    } catch (error) {
      console.error(chalk.red(`❌ Push failed: ${error.message}`));
      console.log(chalk.yellow('\nYou may need to:'));
      console.log(chalk.gray('  • Set up a remote: git remote add origin <url>'));
      console.log(chalk.gray(`  • Push manually: git push origin ${currentBranch}`));
    }
  }

  /**
   * Interactive workflow for reviewing and applying multiple patches
   * @returns {Promise<void>}
   */
  async reviewPatches() {
    const patches = await this.patchManager.listPatches();
    
    if (patches.length === 0) {
      console.log(chalk.yellow('No patches available for review.'));
      return;
    }

    console.log(chalk.bold('\n📋 Available Patches:\n'));
    
    const choices = patches.map((patch, index) => ({
      name: `${index + 1}. ${patch.name} (${patch.files.length} files) - ${new Date(patch.timestamp).toLocaleDateString()}`,
      value: patch.name,
      short: patch.name
    }));

    choices.push({ name: chalk.gray('(Cancel)'), value: null });

    const { selectedPatch } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedPatch',
        message: 'Select a patch to review:',
        choices
      }
    ]);

    if (!selectedPatch) {
      console.log(chalk.yellow('Cancelled.'));
      return;
    }

    const patch = await this.patchManager.getPatch(selectedPatch);
    
    // Open in VS Code for review
    console.log(chalk.gray('\n🔍 Opening patch in VS Code...'));
    await this.vscodeIntegration.openPatch(patch);

    // Wait for user to review
    const { proceedWithApply } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceedWithApply',
        message: 'Reviewed in VS Code. Apply this patch?',
        default: true
      }
    ]);

    if (proceedWithApply) {
      await this.applyPatch(patch);
    } else {
      console.log(chalk.yellow('Patch not applied.'));
    }
  }
}

module.exports = CommitWorkflow;
