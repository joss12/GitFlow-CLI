import { Command } from "commander";
import inquirer from "inquirer";
import { GitHelper } from "../utils/git-helper";
import {
  header,
  success,
  error,
  info,
  warning,
  spinner,
} from "../utils/formatter";

export const rebaseCommand = new Command("rebase-safe")
  .description("Check if rebasing is safe")
  .option("-t, --target <branch>", "Target branch to rebase onto")
  .action(async (options) => {
    header("Rebase Safety Check");

    const git = new GitHelper();

    try {
      // Check if it's a git repo
      const isRepo = await git.isGitRepo();
      if (!isRepo) {
        error("Not a git repository.");
        process.exit(1);
      }

      // Check for uncommitted changes
      const hasChanges = await git.hasUncommittedChanges();
      if (hasChanges) {
        error("You have uncommitted changes.");
        info("Commit or stash your changes before rebasing.");
        process.exit(1);
      }

      const currentBranch = await git.getCurrentBranch();
      let targetBranch = options.target;

      // If no target specified, ask user
      if (!targetBranch) {
        const branches = await git.getBranches();
        const otherBranches = branches.filter(
          (b) => !b.includes("*") && b !== currentBranch,
        );

        if (otherBranches.length === 0) {
          error("No other branches found.");
          process.exit(1);
        }

        const { selected } = await inquirer.prompt([
          {
            type: "list",
            name: "selected",
            message: "Select target branch to rebase onto:",
            choices: otherBranches,
          },
        ]);
        targetBranch = selected;
      }

      info(`Current branch: ${currentBranch}`);
      info(`Target branch: ${targetBranch}\n`);

      const loading = spinner("Analyzing branches...");

      // Get commits ahead/behind
      const commitsAhead = await git.getCommitsAhead(
        currentBranch,
        targetBranch,
      );
      const commitsBehind = await git.getCommitsBehind(
        currentBranch,
        targetBranch,
      );

      // Get shared commits
      const sharedCommits = await git.getSharedCommits(
        currentBranch,
        targetBranch,
      );

      loading.succeed();

      // Display analysis
      console.log("Branch Analysis:\n");
      info(`Commits ahead of ${targetBranch}: ${commitsAhead}`);
      info(`Commits behind ${targetBranch}: ${commitsBehind}`);
      console.log();

      // Safety checks
      let isSafe = true;
      const warnings: string[] = [];

      if (commitsAhead === 0) {
        warning("Your branch has no new commits.");
        warnings.push("No commits to rebase - consider pulling instead.");
        isSafe = false;
      }

      if (commitsBehind === 0) {
        success("✓ Your branch is up to date with target.");
      } else {
        info(`Target has ${commitsBehind} new commit(s).`);
      }

      if (sharedCommits.length > 0) {
        error(`DANGER: Found ${sharedCommits.length} shared commit(s)!`);
        warnings.push(
          "Rebasing shared commits will rewrite history for other developers.",
        );
        warnings.push(
          "This can cause issues for anyone who has pulled these commits.",
        );
        isSafe = false;
      }

      // Check if branch is pushed to remote
      const remoteBranches = await git.getRemoteBranches();
      const isRemote = remoteBranches.some((b) => b.includes(currentBranch));

      if (isRemote) {
        warning("⚠️  Branch exists on remote.");
        warnings.push(
          "After rebasing, you'll need to force push (git push --force-with-lease).",
        );
      }

      console.log();
      console.log("─".repeat(60));
      console.log();

      if (warnings.length > 0) {
        console.log("Warnings:\n");
        warnings.forEach((w) => warning(`  • ${w}`));
        console.log();
      }

      if (isSafe && warnings.length === 0) {
        success("Rebase appears SAFE!");
        info(`You can proceed with: git rebase ${targetBranch}`);
      } else if (warnings.length > 0 && isSafe) {
        warning("Rebase is possible but requires caution.");
        info("Review warnings above before proceeding.");
      } else {
        error("Rebase is NOT RECOMMENDED!");
        info("Consider using merge instead: git merge " + targetBranch);
      }
    } catch (err) {
      error(`Safety check failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
