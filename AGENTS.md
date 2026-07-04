<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:git-workflow-rules -->
# Git Workflow Standards
You MUST follow professional DevOps standards for all code changes:
1. Always `git pull origin main` to sync with your colleague's latest changes before starting work.
2. Always create a new branch for changes (e.g., `feat/xxx`, `fix/xxx`, `chore/xxx`).
3. Make your code changes and verify them.
4. Commit using Conventional Commits (e.g., `feat: added feature`, `fix: resolved issue`).
5. Run `git pull` on the remote branch (or rebase with main) before pushing to ensure no conflicts.
6. Push the branch to the remote repository.
7. Notify the user to create a Pull Request (PR) to merge into the main branch.
<!-- END:git-workflow-rules -->
