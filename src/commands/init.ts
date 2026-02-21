import { Command } from "commander";
import { GitHelper } from "../utils/git-helper";
import { saveRepoConfig } from "../database/db";
import { CodeAnalyzer } from "../utils/analysis";
import { header, success, error, info, spinner } from "../utils/formatter";

export const initCommand = new Command("init")
  .description("Initialize GitFlow for this repository")
  .action(async () => {
    header("GitFlow Initialization");

    const git = new GitHelper();
    const loading = spinner("Analyzing repository...");

    try {
      const isRepo = await git.isGitRepo();
      if (!isRepo) {
        loading.fail();
        error('Not a git repository. Run "git init" first.');
        process.exit(1);
      }

      const repoRoot = await git.getRepoRoot();
      const branches = await git.getBranches();
      const recentCommits = await git.getRecentCommits(20);

      const branchPattern = branches.some((b) => b.includes("main"))
        ? "main"
        : branches.some((b) => b.includes("master"))
          ? "master"
          : "develop";

      const commitMessages = recentCommits.map((c) => c.message);
      const commitStyle = CodeAnalyzer.detectCommitStyle(commitMessages);

      saveRepoConfig(repoRoot, {
        branch_pattern: branchPattern,
        commit_style: commitStyle,
      });

      loading.succeed("Repository analyzed successfully!");

      success(`Repository: ${repoRoot}`);
      info(`Default branch: ${branchPattern}`);
      info(`Commit style: ${commitStyle}`);
      info(`Total branches: ${branches.length}`);

      console.log();
      success("GitFlow initialized! You can now use:");
      console.log("  • gitflow commit    - Smart commit message generation");
      console.log("  • gitflow review    - Review commits for issues");
      console.log("  • gitflow rebase-safe - Check rebase safety");
    } catch (err) {
      loading.fail();
      error(`Initialization failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
