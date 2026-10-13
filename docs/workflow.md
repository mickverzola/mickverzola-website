# Development workflow

Updated: 2026-10-13. Owner: Mick Verzola, sole maintainer.

The owner chose **branch → preview → pull request → review → merge** for work with Codex, Claude Code or both. The assistant helps implement and verify; Mick supplies product facts and reviews the result. This is the intended workflow, not a claim that branch protection or preview automation has been configured.

## Task loop

1. Read the relevant PRD requirements, current source, backlog item and ADRs. Inspect `git status` before editing and preserve unrelated work.
2. Ask about missing professional facts, project details or material design choices. Do not invent credentials, job titles, metrics, links or owner preferences.
3. Create a focused branch from the current intended base, usually `main`. Use a name such as `content/project-showcase` or `fix/deck-navigation`.
4. Make one coherent change. Preserve the tagline, M logo, palette and social links unless Mick explicitly revises that direction. Update affected documents with the code.
5. Preview locally and run the checks appropriate to the change. For website changes, capture enough visual evidence or exact preview steps for Mick to review.
6. When publishing a branch is within the task's authorization, push it and inspect the Vercel preview if one is generated. Record the URL and source commit. If previews are unavailable, explain the gap and complete local verification; do not call that a verified Vercel preview.
7. Open a pull request when remote delivery is authorized. Describe the resulting behavior, backlog reference, preview, checks and limitations. Mick reviews before merge.
8. After merge, verify the actual Vercel deployment and public site. Update the backlog from evidence. A merge or successful upload alone does not prove a good release.

Vercel supports Git-triggered production and preview deployments, but this project's settings still need confirmation. See [operations](operations.md#confirm-the-hosting-configuration) and [Vercel Git documentation](https://vercel.com/docs/git).

## Working with either assistant

Give Codex or Claude Code the outcome, affected backlog item, retained brand requirements and available project facts. Both should follow this document; neither tool is a runtime dependency.

When alternating tools, hand over the current branch, changed files, checks already run, outstanding questions and next step. When using both concurrently, assign separate files or separate branches/worktrees and reconcile the result deliberately. Do not let two sessions overwrite the same uncommitted files or publish competing versions.

## Verification by change type

| Change | Meaningful checks |
| --- | --- |
| Documentation | Check local links and heading targets; reconcile owner facts and status labels; inspect the diff |
| Copy or project entries | Verify supplied facts and real destinations; check desktop and mobile wrapping; retain brand/socials |
| Layout or imagery | Check representative desktop/mobile widths, crops, readability, zoom and network payload |
| Dropdown | Mouse, touch, Tab, Enter/Space activation, Escape, focus visibility and expanded state |
| Deck | All seven slides, bounds, buttons, arrow/Space keys, vertical scrolling, swipe and zoom |
| JavaScript | Syntax plus changed interaction in a browser; syntax alone is insufficient |
| Hosting | Match deployment to commit; verify homepage, deck and assets on the intended domain |

If Node is available, run `node --check main.js` for the external script. The deck script is inline and needs a separate syntax or browser check. There is no repository test runner or CI check today. Add automation only when it addresses a repeated need.

## Review and release

A pull request should state the problem, resulting behavior, preview and verification, with any remaining uncertainty. A redesign preview should show how experience and selected work communicate breadth of skills while retaining the identity Mick likes.

Treat changes to the production-tracked branch as potentially public. The existing hosting connection may deploy them automatically. Keep credentials, private screenshots and unpublished work details out of commits. Use the existing session's authorization for routine work; document gaps rather than inventing extra approval stages.
