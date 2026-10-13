# Documentation guide

Updated: 2026-10-13.

This set follows the structure used in ai-personal, scaled to a simple personal portfolio. It separates the owner's intent from current implementation, future work and operating instructions.

| Document | Owns |
| --- | --- |
| [Root README](../README.md) | Introduction, source map and local preview |
| [PRD](prd.md) | Audience, purpose, content boundaries and owner answers |
| [TDD](tdd.md) | Current implementation, review evidence and design implications |
| [Workflow](workflow.md) | Working with Codex or Claude Code, previews and pull requests |
| [Backlog](backlog.md) | Local planning groups, issue mapping and acceptance summaries |
| [Delivery plan](delivery-plan.md) | GitHub milestone/issue mapping, dependencies and completion rules |
| [Operations](operations.md) | Hosting checks, publishing, diagnosis and recovery |
| [ADRs](adr/README.md) | Decisions, rationale and consequences |

## Evidence and status

- **Observed:** present in the identified source commit; the original review used `0dea6ca`, with the newer branch base recorded in the TDD.
- **Owner-confirmed:** stated in the 2026-10-13 interview; hosting settings were not independently inspected.
- **Accepted direction:** the owner selected the outcome; implementation may still be open.
- **Proposed:** a review recommendation, with no delivery commitment.
- **Verified:** a specific check passed; its limits are stated.
- **Open:** deliberately unresolved, without an assumed answer.

The interview confirms the portfolio's purpose, retained identity, content priorities and change workflow. Automatic deployment remains the owner's belief. Public-site retrieval through the web research tool was unsuccessful; this is not evidence that the website is down.

## Keeping the set current

Source describes actual behavior. The PRD owns intended outcomes, the TDD owns implementation and evidence, GitHub issues own execution status, the backlog maps planning groups to those issues, and operations owns procedures. Update affected documents with a source change. Use an ADR for a lasting scope, architecture or release decision; ordinary wording and styling changes do not need one.

## Versioned planning baseline

This set is the Portfolio v1 planning baseline submitted through [issue #1](https://github.com/mickverzola/mickverzola-website/issues/1). Its PR and documentation commit are recorded on that issue. Branch links are provisional until owner review and merge; final baseline references must use the full merged commit SHA, including PRD/TDD links in delivery issues #1–#10. Publication does not complete the content overhaul or runtime verification.

Backlog and finding IDs are local references, not GitHub issue numbers. Keep the documentation concise. Do not import ai-personal's infrastructure, business rules or operational complexity into this site.
