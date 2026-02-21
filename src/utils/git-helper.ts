import simpleGit, { SimpleGit, LogResult } from "simple-git";

export class GitHelper {
  public git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  async isGitRepo(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentBranch(): Promise<string> {
    const status = await this.git.status();
    return status.current || "unknown";
  }

  async getRepoRoot(): Promise<string> {
    const root = await this.git.revparse(["--show-toplevel"]);
    return root.trim();
  }

  async getStagedFiles(): Promise<string[]> {
    const status = await this.git.status();
    return status.staged;
  }

  async getDiff(staged = true): Promise<string> {
    if (staged) {
      return await this.git.diff(["--cached"]);
    }
    return await this.git.diff();
  }

  async getRecentCommits(count = 10) {
    const log = await this.git.log({ maxCount: count });
    return [...log.all];
  }

  async getBranches(): Promise<string[]> {
    const branches = await this.git.branch();
    return branches.all;
  }

  async getRemoteBranches(): Promise<string[]> {
    const branches = await this.git.branch(["-r"]);
    return branches.all;
  }

  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.git.status();
    return !status.isClean();
  }

  async getCommitsBehind(branch: string, target: string): Promise<number> {
    try {
      const result = await this.git.raw([
        "rev-list",
        "--count",
        `${branch}..${target}`,
      ]);
      return parseInt(result.trim(), 10);
    } catch {
      return 0;
    }
  }

  async getCommitsAhead(branch: string, target: string): Promise<number> {
    try {
      const result = await this.git.raw([
        "rev-list",
        "--count",
        `${target}..${branch}`,
      ]);
      return parseInt(result.trim(), 10);
    } catch {
      return 0;
    }
  }

  async getSharedCommits(branch1: string, branch2: string): Promise<string[]> {
    try {
      const result = await this.git.raw([
        "log",
        "--format=%H",
        `${branch1}...${branch2}`,
      ]);
      return result.trim().split("\n").filter(Boolean);
    } catch {
      return [];
    }
  }
}
