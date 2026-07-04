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

<!-- BEGIN:dual-agent-workflow-rules -->
# Dual-Agent Workspace Isolation
The user operates using TWO separate agent conversations:
- ONE exclusively for the Frontend (this conversation)
- ONE exclusively for the Backend

**CRITICAL RULE:**
You MUST NOT attempt to directly modify the backend codebase from this conversation, nor should you make assumptions about backend state without verifying. If a task requires changes in the backend, you MUST provide a clear, concise instruction/prompt in your response that the user can copy and paste to the Backend Agent. This ensures clear boundaries and trackability between the two projects.
<!-- END:dual-agent-workflow-rules -->
