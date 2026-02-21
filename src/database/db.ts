import Database from "better-sqlite3";
import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { SCHEMA } from "./schema";

const DB_DIR = join(homedir(), ".gitflow");
const DB_PATH = join(DB_DIR, "gitflow.db");

if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

export const db: Database.Database = new Database(DB_PATH);

db.exec(SCHEMA);

export const saveCommitPattern = (
  repoPath: string,
  commitType: string,
  messageFormat: string,
) => {
  const stmt = db.prepare(`
    INSERT INTO commit_patterns (repo_path, commit_type, message_format, frequency, last_used)
    VALUES (?, ?, ?, 1, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      frequency = frequency + 1,
      last_used = datetime('now')
  `);

  stmt.run(repoPath, commitType, messageFormat);
};

export const getCommitPatterns = (repoPath: string, limit = 5) => {
  const stmt = db.prepare(`
    SELECT commit_type, message_format, frequency
    FROM commit_patterns
    WHERE repo_path = ?
    ORDER BY frequency DESC, last_used DESC
    LIMIT ?
  `);

  return stmt.all(repoPath, limit);
};

export const saveRepoConfig = (repoPath: string, config: any) => {
  const stmt = db.prepare(`
    INSERT INTO repo_config (repo_path, branch_pattern, commit_style)
    VALUES (?, ?, ?)
    ON CONFLICT(repo_path) DO UPDATE SET
      branch_pattern = excluded.branch_pattern,
      commit_style = excluded.commit_style
  `);

  stmt.run(repoPath, config.branch_pattern, config.commit_style);
};

export const getRepoConfig = (repoPath: string) => {
  const stmt = db.prepare(`
    SELECT * FROM repo_config WHERE repo_path = ?
  `);

  return stmt.get(repoPath);
};
