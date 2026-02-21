import { ReviewIssue, CommitSuggestion } from "../types";

export class CodeAnalyzer {
  static analyzeDiff(diff: string, files: string[]): ReviewIssue[] {
    const issues: ReviewIssue[] = [];

    //check for large files (>1MB in diff)
    if (diff.length > 1000000) {
      issues.push({
        type: "large_file",
        severity: "medium",
        file: "multiple",
        message:
          "Large diff detected (>1MB). Consider splitting into smaller commits.",
      });
    }

    //Check for potential secrets
    const secretPatterns = [
      /api[_-]?key/i,
      /secret/i,
      /password/i,
      /token/i,
      /aws[_-]?access/i,
    ];

    const diffLines = diff.split("\n");
    diffLines.forEach((line, index) => {
      if (line.startsWith("+")) {
        secretPatterns.forEach((pattern) => {
          if (pattern.test(line)) {
            issues.push({
              type: "secret",
              severity: "high",
              file: "unknwon",
              message: `Potential secrret detected: "${line.substring(0, 50)}...`,
              line: index + 1,
            });
          }
        });
      }
    });

    //Check breaking changes keyword
    const breakingKeywords = ["BREAKING CHANGE", "breaking:", "BREAKING:"];
    breakingKeywords.forEach((keyword) => {
      if (diff.includes(keyword)) {
        issues.push({
          type: "breaking_change",
          severity: "high",
          file: "multiple",
          message:
            "Breaking change detected in commit. Ensure proper versioning.",
        });
      }
    });

    // Check common issues in specific files
    files.forEach((file) => {
      if (file.includes("package.json") && diff.includes("dependencies")) {
        issues.push({
          type: "formatting",
          severity: "low",
          file,
          message: "Dependencies changed. Remember to run npm install.",
        });
      }

      if (file.endsWith(".env") || file.endsWith(".env.example")) {
        issues.push({
          type: "secret",
          severity: "medium",
          file,
          message: "Environment file changed. Verify no secrets are commited",
        });
      }
    });

    return issues;
  }

  //Generate commit message suggestion based on diff.
  static generateCommitSuggestion(
    diff: string,
    files: string[],
  ): CommitSuggestion {
    //AnalyzeDiff file types
    const hasTests = files.some(
      (f) => f.includes("test") || f.includes("spec"),
    );

    const hasDocs = files.some(
      (f) => f.includes("README") || f.includes(".md"),
    );

    const hasConfig = files.some(
      (f) => f.includes("config") || f.includes(".json") || f.includes(".yaml"),
    );

    //Determine commit type
    let type = "fast";
    let scope = "";

    if (hasTests && files.length === 1) {
      type = "test";
    } else if (hasDocs && files.length === 1) {
      type = "docs";
    } else if (hasConfig) {
      type = "chore";
    } else if (diff.includes("fix") || diff.includes("bug")) {
      type = "fix";
    } else if (diff.includes("refactor")) {
      type = "refactor";
    }

    //Determine scope from files
    if (files.length === 1) {
      const file = files[0];
      const parts = file.split("/");
      if (parts.length > 1) {
        scope = parts[0];
      }
    }

    // Generate message
    const fileList = files.slice(0, 3).join(", ");
    const moreFile = files.length > 3 ? `and ${files.length - 3} more` : "";

    return {
      type,
      scope: scope || undefined,
      message: `update ${fileList}${moreFile}`,
      body: `Modified files:\n${files.map((f) => `- ${f}`).join("\n")}`,
    };
  }

  //Detect commit message style
  static detectCommitStyle(
    messages: string[],
  ): "conventional" | "standard" | "custom" {
    const conventionalPattern =
      /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+/;

    const conventionalCount = messages.filter((msg) =>
      conventionalPattern.test(msg),
    ).length;

    if (conventionalCount / messages.length > 0.7) {
      return "conventional";
    }

    return "standard";
  }
}
