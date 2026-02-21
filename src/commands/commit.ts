import { Command } from "commander";
import inquirer from "inquirer";
import { GitHelper } from "../utils/git-helper";
import { CodeAnalyzer } from "../utils/analysis";
import { saveCommitPattern, getCommitPatterns } from "../database/db";
import {
  header,
  success,
  error,
  info,
  warning,
  spinner,
} from "../utils/formatter";

export const commitCommand = new Command("commit")
  .description("Generate smart commit messages based on staged changes")
  .option("-m, --message <message>", "Use custom commit message")
  .option("--skip-hooks", "Skip git hooks")
  .action(async (options) => {
    header("Smart Commit");

    const git = new GitHelper();

    try {
      const isRepo = await git.isGitRepo();
      if (!isRepo) {
        error("Not a git repository.");
        process.exit(1);
      }

      const stagedFiles = await git.getStagedFiles();
      if (stagedFiles.length === 0) {
        warning("No staged files found.");
        info('Use "git add <files>" to stage changes first.');
        process.exit(0);
      }

      info(`Staged files (${stagedFiles.length}):`);
      stagedFiles.forEach((file) => console.log(`  • ${file}`));
      console.log();

      if (options.message) {
        const loading = spinner("Committing changes...");
        await git.git.commit(
          options.message,
          options.skipHooks ? ["--no-verify"] : [],
        );
        loading.succeed();
        success(`Committed: ${options.message}`);
        return;
      }

      const loading = spinner("Analyzing changes...");
      const diff = await git.getDiff(true);
      loading.succeed();

      const suggestion = CodeAnalyzer.generateCommitSuggestion(
        diff,
        stagedFiles,
      );
      const repoRoot = await git.getRepoRoot();
      const patterns = getCommitPatterns(repoRoot, 3) as any[];

      const options_list: string[] = [];

      const suggestionMsg = suggestion.scope
        ? `${suggestion.type}(${suggestion.scope}): ${suggestion.message}`
        : `${suggestion.type}: ${suggestion.message}`;
      options_list.push(suggestionMsg);

      patterns.forEach((pattern: any) => {
        const msg = `${pattern.commit_type}: ${pattern.message_format}`;
        if (!options_list.includes(msg)) {
          options_list.push(msg);
        }
      });

      options_list.push("Write custom message");

      const { selectedMessage } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedMessage",
          message: "Select commit message:",
          choices: options_list,
        },
      ]);

      let finalMessage = selectedMessage;

      if (selectedMessage === "Write custom message") {
        const { customMessage } = await inquirer.prompt([
          {
            type: "input",
            name: "customMessage",
            message: "Enter commit message:",
            validate: (input) =>
              input.trim().length > 0 || "Message cannot be empty",
          },
        ]);
        finalMessage = customMessage;
      }

      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Commit with message: "${finalMessage}"?`,
          default: true,
        },
      ]);

      if (!confirm) {
        warning("Commit cancelled.");
        return;
      }

      const commitLoading = spinner("Committing changes...");
      await git.git.commit(finalMessage);
      commitLoading.succeed();

      const [type] = finalMessage.split(":");
      saveCommitPattern(repoRoot, type.trim(), finalMessage);

      success("Committed successfully!");
      info(`Message: ${finalMessage}`);
    } catch (err) {
      error(`Commit failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
