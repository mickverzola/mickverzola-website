# ADR-003 — Review a branch and preview before merging

**Status:** Accepted workflow; provider automation and enforcement unverified.

**Date:** 2026-10-13. **Decision source:** Owner interview.

## Context

Mick is the sole maintainer and works with Codex, Claude Code or both. Production may update automatically from GitHub changes, so he wants a reviewable result before merge.

## Decision

Use a focused branch, a preview and a pull request before merging. Mick reviews the result. Apply the same workflow with either assistant, with an explicit handover or separate work areas when both are involved.

## Rationale and alternatives

The owner chose this sequence over direct edits to main. It makes website behavior and visual changes reviewable before the production-tracked branch changes. No additional approval committee, mandatory second reviewer or branch-protection configuration was requested.

## Consequences and verification

Record the preview and checks in the PR. Confirm actual Vercel preview/production behavior through B05. Document local-only verification when the provider preview cannot be produced. Existing task authorization determines whether a branch is pushed, a PR is opened or a release is made; this record does not claim those actions have occurred.

## Related documents

- [Workflow](../workflow.md)
- [Publishing](../operations.md#publish-a-change)
- [B05 — Hosting verification](../backlog.md#b05--confirm-hosting-and-preview-configuration)
