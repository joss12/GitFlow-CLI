export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS commit_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo_path TEXT NOT NULL,
    commit_type TEXT NOT NULL,
    message_format TEXT NOT NULL,
    frequency INTEGER DEFAULT 1,
    last_used DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS repo_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo_path TEXT UNIQUE NOT NULL,
    branch_pattern TEXT,
    commit_style TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_repo_path ON commit_patterns(repo_path);
  CREATE INDEX IF NOT EXISTS idx_commit_type ON commit_patterns(commit_type);
`;
