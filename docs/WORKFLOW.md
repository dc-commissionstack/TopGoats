<!-- managed:linked-repos -->
## Linked Repositories
- dc-commissionstack/TopGoats
<!-- /managed:linked-repos -->

# Team Workflow

This document outlines the standard workflow for the Top Goats team.

## Code Delivery Process

1.  **Branching Strategy**: 
    -   Create a new branch for every task or feature. 
    -   Branch names should be descriptive (e.g., `feat-style-branding`, `fix-xp-calculation`).
2.  **Development**:
    -   Follow project-specific conventions in `CLAUDE.md` or `AGENTS.md` (if they exist).
    -   Write clean, documented code.
3.  **Pull Requests**:
    -   Once a task is complete, push the branch to GitHub.
    -   Open a Pull Request (PR) against the `main` branch.
    -   Include the task ID in the PR description.
4.  **Submission**:
    -   Submit the task for review using the `finish_task` tool.
    -   Include the PR URL in the task result.
5.  **Review & Merge**:
    -   The team lead (lead) will review the PR.
    -   If approved, the lead will merge the PR using `gh pr merge`.
    -   If rejected, the developer will address the feedback and push updates to the same branch.

## Communication

-   Use the task board (`create_task`, `assign_task`, `review_task`) for the main work loop.
-   Use `send_message` for quick questions or status updates.
-   Share artifacts (designs, reports, screenshots) in `/home/team/shared/`.

## Quality Standards

-   Ensure the app is running and tested before submitting.
-   Maintain the "Raw/Underground" brutalist aesthetic for all UI changes.
-   Respect artist sovereignty in all feature implementations.
