export interface CommitPattern {
  id?: number;
  repo_path: string;
  commit_type: string;
  message_format: string;
  frequency: number;
  last_used: string;
}

export interface RepoAnalysis {
  branch_pattern: string;
  commit_style: "conventional" | "standard" | "custom";
  average_commit_size: number;
  most_changed_files: string[];
}

export interface CommitSuggestion {
  type: string;
  scope?: string;
  message: string;
  body?: string;
}

export interface ReviewIssue {
  type: "large_file" | "secret" | "breaking_change" | "formatting";
  severity: "low" | "medium" | "high";
  file: string;
  message: string;
  line?: number;
}

export interface RebaseInfo {
  current_branch: string;
  target_branch: string;
  commits_ahead: number;
  commits_behind: number;
  conflicts_likely: boolean;
  shared_commits: string[];
}
