# ADR-002 — Record the existing managed hosting arrangement

**Status:** Owner-reported baseline; deployment settings unverified.

**Date:** 2026-10-13.

## Context

The source is a plain static website in GitHub. Mick reports Vercel hosting for `mickverzola.com` and Cloudflare management of the domain. He believes GitHub pushes trigger automatic deployment. The repository contains no deployment configuration.

## Decision

Document GitHub → Vercel and the Cloudflare-managed domain as the existing arrangement. Preserve uncertainty about the production branch, build/output settings, previews, DNS records and proxy mode. No hosting migration is requested.

## Rationale and alternatives

The operations guide must describe the owner's actual arrangement instead of assuming GitHub Pages, Cloudflare Pages or a self-hosted server. The owner did not supply the historical reason for choosing Vercel; none is invented here.

## Consequences and verification

Provider defaults do not prove project configuration. Complete B05 before treating automatic deployment, previews or rollback as verified. No DNS values or credentials belong in this decision record.

## Related documents

- [Operations](../operations.md#confirm-the-hosting-configuration)
- [B05 — Hosting verification](../backlog.md#b05--confirm-hosting-and-preview-configuration)
- [Current architecture](../tdd.md#current-architecture)
