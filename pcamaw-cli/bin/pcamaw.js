#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const PatchManager = require('../lib/patch-manager');
const VSCodeIntegration = require('../lib/vscode-integration');
const CommitWorkflow = require('../lib/commit-workflow');

const patchManager = new PatchManager();
const vscodeIntegration = new VSCodeIntegration();
const commitWorkflow = new CommitWorkflow(patchManager, vscodeIntegration);

program
  .name('pcamaw')
  .description('CLI to manage PCAMAW patches and sync with VS Code')
  .version('0.1.0');

program
  .command('list')
  .alias('ls')
  .description('List all staged patches')
  .action(async () => {
    try {
      const patches = await patchManager.listPatches();
      
      if (patches.length === 0) {
        console.log(chalk.yellow('No patches staged yet.'));
        console.log(chalk.gray('\nUse PCAMAW workflow to generate patches.'));
        return;
      }

      console.log(chalk.bold('\n📋 Staged Patches:\n'));
      patches.forEach((patch, index) => {
        console.log(chalk.cyan(`${index + 1}. ${patch.name}`));
        console.log(chalk.gray(`   Created: ${new Date(patch.timestamp).toLocaleString()}`));
        console.log(chalk.gray(`   Files: ${patch.files.length}`));
        console.log();
      });
    } catch (error) {
      console.error(chalk.red('Error listing patches:', error.message));
      process.exit(1);
    }
  });

program
  .command('show <patchName>')
  .description('Show patch details and diff preview')
  .action(async (patchName) => {
    try {
      const patch = await patchManager.getPatch(patchName);
      
      if (!patch) {
        console.log(chalk.red(`Patch "${patchName}" not found.`));
        process.exit(1);
      }

      console.log(chalk.bold(`\n📄 Patch: ${patch.name}\n`));
      console.log(chalk.gray(`Created: ${new Date(patch.timestamp).toLocaleString()}`));
      console.log(chalk.gray(`Description: ${patch.description || 'No description'}\n`));
      
      console.log(chalk.bold('Files to be modified:'));
      patch.files.forEach(file => {
        console.log(chalk.cyan(`  ${file.path} (${file.operation})`));
      });
      
      console.log(chalk.gray('\nUse `pcamaw open <patchName>` to open in VS Code'));
    } catch (error) {
      console.error(chalk.red('Error showing patch:', error.message));
      process.exit(1);
    }
  });

program
  .command('open <patchName>')
  .description('Open patch in VS Code for review')
  .option('-w, --workspace <path>', 'Workspace path to open')
  .action(async (patchName, options) => {
    try {
      const patch = await patchManager.getPatch(patchName);
      
      if (!patch) {
        console.log(chalk.red(`Patch "${patchName}" not found.`));
        process.exit(1);
      }

      console.log(chalk.bold(`\n🚀 Opening patch in VS Code...\n`));
      
      const workspacePath = options.workspace || process.cwd();
      const success = await vscodeIntegration.openPatch(patch, workspacePath);
      
      if (success) {
        console.log(chalk.green('✅ Patch opened in VS Code'));
        console.log(chalk.gray('\nReview the changes, then use:'));
        console.log(chalk.cyan('  pcamaw apply <patchName>'), chalk.gray('to apply changes'));
      } else {
        console.log(chalk.yellow('⚠️  Could not open VS Code'));
        console.log(chalk.gray('\nMake sure VS Code is installed and the `code` command is available.'));
      }
    } catch (error) {
      console.error(chalk.red('Error opening patch:', error.message));
      process.exit(1);
    }
  });

program
  .command('apply <patchName>')
  .description('Apply patch to workspace and optionally commit/push')
  .option('--no-commit', 'Skip commit prompt')
  .option('--auto-push', 'Automatically push after commit')
  .action(async (patchName, options) => {
    try {
      const patch = await patchManager.getPatch(patchName);
      
      if (!patch) {
        console.log(chalk.red(`Patch "${patchName}" not found.`));
        process.exit(1);
      }

      console.log(chalk.bold(`\n📝 Applying patch: ${patchName}\n`));
      
      await commitWorkflow.applyPatch(patch, {
        skipCommit: !options.commit,
        autoPush: options.autoPush
      });
      
      console.log(chalk.green('\n✅ Patch workflow complete!'));
    } catch (error) {
      console.error(chalk.red('Error applying patch:', error.message));
      process.exit(1);
    }
  });

program
  .command('stage <files...>')
  .description('Manually stage files as a patch')
  .option('-n, --name <name>', 'Patch name')
  .option('-d, --description <desc>', 'Patch description')
  .action(async (files, options) => {
    try {
      const patchName = options.name || `manual-patch-${Date.now()}`;
      
      console.log(chalk.bold(`\n📦 Creating patch: ${patchName}\n`));
      
      const patch = await patchManager.createPatchFromFiles(files, {
        name: patchName,
        description: options.description || 'Manually staged files'
      });
      
      console.log(chalk.green(`✅ Patch created: ${patch.name}`));
      console.log(chalk.gray(`   Staged ${files.length} file(s)`));
      console.log(chalk.cyan(`\nUse: pcamaw open ${patch.name}`));
    } catch (error) {
      console.error(chalk.red('Error staging files:', error.message));
      process.exit(1);
    }
  });

program
  .command('clear')
  .description('Clear all staged patches')
  .option('-f, --force', 'Skip confirmation')
  .action(async (options) => {
    try {
      if (!options.force) {
        const inquirer = require('inquirer');
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Clear all staged patches?',
            default: false
          }
        ]);
        
        if (!confirm) {
          console.log(chalk.yellow('Cancelled.'));
          return;
        }
      }
      
      await patchManager.clearPatches();
      console.log(chalk.green('✅ All patches cleared.'));
    } catch (error) {
      console.error(chalk.red('Error clearing patches:', error.message));
      process.exit(1);
    }
  });

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
