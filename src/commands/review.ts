import { Command } from "commander";
import { GitHelper } from "../utils/git-helper";
import { CodeAnalyzer } from "../utils/analysis";
import { header, success, error, info, warning } from "../utils/formatter";

export const reviewCommand = new Command("review")
  .description("Review recent commits for potential issues")
  .option("-n, number <count>", "Number of commits to review", "5")
  .action(async (options) => {
    header("Commit Review");

    const git = new GitHelper();

    try {
      //Check if it is a repo
      const isRepo = await git.isGitRepo();
      if (!isRepo) {
        error("Not a git repository");
        process.exit(1);
      }

      const count = parseInt(options.number, 10);
      const commits = await git.getRecentCommits(count);

      if (commits.length === 0) {
        warning("No commits found.");
        return;
      }

      info(`Reveiwing last ${commits.length} commit(s)...\n`);

      let totalIssues = 0;

      for (const commit of commits) {
        const shortHash = commit.hash.substring(0, 7);
        const message = commit.message.split("\n")[0];

        console.log(`📝 ${shortHash}: ${message}`);
        console.log(`   Author: ${commit.author_name}`);
        console.log(`   Date: ${commit.date}\n`);

        //Get diff for commit
        const diff = await git.git.show([commit.hash]);

        const filesChanged = await git.git.show([
          "--name-only",
          "--format=",
          commit.hash,
        ]);
        const files = filesChanged.trim().split("\n").filter(Boolean);

        //Analyze
        const issues = CodeAnalyzer.analyzeDiff(diff, files);

        if (issues.length === 0) {
          success(" No issues found.\n");
        } else {
          totalIssues += issues.length;
          issues.forEach((issue) => {
            const icon =
              issue.severity === "high"
                ? "🔴"
                : issue.severity === "medium"
                  ? "🟡"
                  : "🟢";
            console.log(
              `   ${icon} [${issue.severity.toUpperCase()}] ${issue.type}`,
            );
            console.log(`      ${issue.message}`);
            if (issue.line) {
              console.log(`      Line: ${issue.line}`);
            }
          });
          console.log();
        }
      }

      console.log("─".repeat(60));
      if (totalIssues === 0) {
        success(` All ${commits.length} commit(s) look good!`);
      } else {
        warning(
          `Found ${totalIssues} potential issue(s) across ${commits.length} commit(s)`,
        );
      }
    } catch (err) {
      error(`Review failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
