# GitFlow CLI

> Smart Git workflow automation that learns from your patterns and keeps you safe.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

## 🎯 What is GitFlow?

GitFlow is a command-line tool that makes Git workflows smarter by:
- 🤖 **Auto-generating commit messages** based on your code changes
- 🔍 **Scanning commits for secrets** before you push (API keys, passwords, tokens)
- 🛡️ **Checking rebase safety** to prevent dangerous operations
- 📊 **Learning your patterns** to suggest better messages over time

## ✨ Features

### Smart Commit Messages
Analyzes your staged changes and suggests conventional commit messages:
```bash
$ git add src/auth/login.ts
$ gitflow commit

✓ Analyzing changes...
? Select commit message:
❯ fix(auth): resolve login timeout issue
  chore: update login.ts
  Write custom message
```

### Security Scanning
Detects potential secrets before they reach your repository:
```bash
$ gitflow review

📝 a1b2c3d: feat: add authentication
   🔴 [HIGH] secret
      Potential secret detected: "const API_KEY = 'sk-1234...'"
      Line: 47
```

### Rebase Safety Check
Prevents dangerous rebases that could break your team's work:
```bash
$ gitflow rebase-safe

📊 Branch Analysis:
🔴 DANGER: Found 2 shared commit(s)!
❌ Rebase is NOT RECOMMENDED!
```

### Pattern Learning
Remembers your commit style and suggests similar messages:
```bash
Most used patterns:
1. feat: add new feature (8 times)
2. fix: resolve bug (6 times)
3. docs: update README (4 times)
```

## 🚀 Installation

### From Source
```bash
git clone https://github.com/joss12/gitflow-cli.git
cd gitflow-cli
npm install
npm run build
npm link
```

### Prerequisites

- Node.js 16+ 
- Git 2.0+
- A Git repository

## 📖 Usage

### 1. Initialize in a Repository
```bash
cd your-project
gitflow init
```

This analyzes your repository and learns your commit patterns.

### 2. Smart Commit
```bash
# Stage your changes
git add .

# Use GitFlow to commit
gitflow commit
```

**Options:**
- `-m, --message <message>` - Use custom message directly
- `--skip-hooks` - Skip git hooks

### 3. Review Recent Commits
```bash
gitflow review           # Review last 5 commits
gitflow review -n 10     # Review last 10 commits
```

Scans for:
- 🔐 Secrets (API keys, passwords, tokens)
- 📦 Large files (>1MB)
- ⚠️ Breaking changes
- 🔧 Common issues (env files, dependency changes)

### 4. Check Rebase Safety
```bash
    gitflow rebase-safe              # Interactive branch selection
gitflow rebase-safe -t main      # Check against main branch
```

Analyzes:
- Commits ahead/behind
- Shared commit detection
- Remote branch status
- Force-push requirements

## 📚 Commands Reference

| Command | Description | Options |
|---------|-------------|---------|
| `gitflow init` | Initialize GitFlow for repository | - |
| `gitflow commit` | Generate smart commit messages | `-m <message>`, `--skip-hooks` |
| `gitflow review` | Scan commits for issues | `-n <count>` |
| `gitflow rebase-safe` | Check if rebasing is safe | `-t <branch>` |

## 🏗️ How It Works

### Commit Message Generation

1. **Analyzes staged changes** - Reads file types and diff content
2. **Detects commit type** - Identifies feat/fix/docs/test/chore based on files
3. **Extracts scope** - Uses directory structure for scoping
4. **Loads past patterns** - Queries SQLite for your most-used messages
5. **Suggests messages** - Combines AI analysis with learned patterns

### Security Detection

Uses regex patterns to detect:
```typescript
/api[_-]?key/i       // API_KEY, api-key, apiKey
/secret/i            // SECRET, my_secret
/password/i          // PASSWORD, pwd
/token/i             // TOKEN, auth_token
/aws[_-]?access/i    // AWS_ACCESS_KEY
```

### Rebase Safety

Executes Git commands to analyze:
```bash
git rev-list --count current..target    # Commits behind
git rev-list --count target..current    # Commits ahead
git log --format=%H branch1...branch2   # Shared commits
```

## 🗄️ Data Storage

GitFlow stores data locally in `~/.gitflow/gitflow.db`:

**Tables:**
- `commit_patterns` - Your commit history and frequency
- `repo_config` - Repository settings and preferences

**Privacy:** All data stays on your machine. No external API calls.

## 🛠️ Tech Stack

- **TypeScript** - Type-safe development
- **Commander.js** - CLI framework
- **simple-git** - Git operations
- **Inquirer.js** - Interactive prompts
- **better-sqlite3** - Local database
- **Chalk, Ora, Boxen** - Terminal UI

## 📊 Examples

### Example 1: First-Time Setup
```bash
$ cd my-project
$ gitflow init

╭────────────────────────────────╮
│  GitFlow Initialization        │
╰────────────────────────────────╯

✓ Repository analyzed successfully!
✓ Repository: /home/user/my-project
ℹ Default branch: main
ℹ Commit style: conventional
ℹ Total branches: 3
```

### Example 2: Smart Commit Workflow
```bash
$ echo "export default App;" > src/App.tsx
$ git add src/App.tsx
$ gitflow commit

ℹ Staged files (1):
  • src/App.tsx

✓ Analyzing changes...
? Select commit message: feat(src): update App.tsx
? Commit with message: "feat(src): update App.tsx"? Yes
✓ Committed successfully!
```

### Example 3: Catching Security Issues
```bash
$ gitflow review -n 3

📝 abc1234: feat: add API integration
   🔴 [HIGH] secret
      Potential secret detected: "const API_KEY = 'sk-proj...'"
      Line: 12

📝 def5678: fix: resolve timeout
✓    No issues found.

────────────────────────────────────────────────────────────
⚠ Found 1 potential issue(s) across 3 commit(s).
```

### Example 4: Preventing Dangerous Rebases
```bash
$ gitflow rebase-safe -t main

ℹ Current branch: feature/authentication
ℹ Target branch: main

📊 Branch Analysis:

ℹ Commits ahead of main: 5
ℹ Commits behind main: 2
🔴 DANGER: Found 3 shared commit(s)!

⚠️ Warnings:
  • Rebasing shared commits will rewrite history
  • Branch exists on remote - requires force push

❌ Rebase is NOT RECOMMENDED!
ℹ Consider using merge instead: git merge main
```

## 🎯 Why GitFlow?

### Time Savings
- **Before:** 2 minutes per commit × 15 commits/day = 30 minutes
- **After:** 10 seconds per commit × 15 commits/day = 2.5 minutes
- **Saved:** 27.5 minutes per day = **115 hours per year**

### Security
- Catches secrets before they reach remote
- Prevents costly data breach incidents
- Industry average breach cost: **$4.45M** (IBM 2023)

### Team Collaboration
- Consistent commit message style
- Self-documenting commit history
- Faster code reviews
- Better Git archaeology

## 🔮 Future Enhancements

- [ ] Integration with GitHub/GitLab APIs
- [ ] Team-wide pattern sharing
- [ ] Custom rule configuration
- [ ] Pre-commit hook integration
- [ ] Conflict prediction
- [ ] Commit message templates

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`gitflow commit` 😉)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👤 Author

**Eddy Mouity**
- GitHub: [@BornToShine](https://github.com/joss12)
- LinkedIn:[@Eddy-Mouity](linkedin.com/in/eddy-mouity-30b38421a)

## 🙏 Acknowledgments

- Inspired by [Commitizen](https://github.com/commitizen/cz-cli)
- Uses [Conventional Commits](https://www.conventionalcommits.org/) specification
- Built with love for the developer community

---

**Built with ❤️ to make Git workflows smarter**

