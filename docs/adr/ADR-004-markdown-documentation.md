# ADR-004 — Maintain a compact Markdown documentation set

**Status:** Adopted in this documentation task.

**Date:** 2026-10-13.

## Context

The repository had no README or planning/operating documents. Mick requested the same document categories as ai-personal and required an interview rather than assumed context.

## Decision

Maintain a root README, docs guide, PRD, TDD, workflow, backlog, delivery plan, operations guide and ADR directory. Use Markdown for readable source diffs. Record interview-backed direction separately from observed implementation and proposed fixes.

## Rationale and alternatives

This satisfies the requested structure without copying another project's application or infrastructure complexity. A single undifferentiated guide would blur product intent, review findings and procedures. Extensive separate reports would make a small site harder to maintain.

## Consequences and verification

Update affected documents with implementation, and check file links, heading targets and status consistency. Keep GitHub issues authoritative for execution status and the backlog as their local planning map. Preserve useful review evidence in the TDD rather than an extra report. Documentation verification does not imply a tested browser session or production release.

## Related documents

- [Documentation guide](../README.md)
- [Root README](../../README.md)
- [Workflow](../workflow.md)
