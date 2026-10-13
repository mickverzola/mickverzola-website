# Product requirements — Mick Verzola portfolio

**Updated:** 2026-10-13. **Status:** Owner interview incorporated; content overhaul remains future work.

Planning baseline for Portfolio v1, submitted through [issue #1](https://github.com/mickverzola/mickverzola-website/issues/1). See the [versioning rules](README.md#versioned-planning-baseline); this states intended outcomes, not delivered or verified website behavior.

## Purpose and audience

Provide a personal introduction, evidence of experience and breadth of skills, and a gateway to side projects. Recruiters and potential employers should leave with the impression that Mick is multi-skilled. Mick also uses the site himself to reach personal projects.

The website remains a simple personal portfolio. The linked AI services and ecommerce project are separate projects, with their own implementation and operations.

## Owner-confirmed direction

| Topic | Accepted answer |
| --- | --- |
| Professional emphasis | Experience and current people leadership at Netflix; do not foreground the formal job title |
| Tone | Let the company and work carry weight without excessive emphasis on seniority |
| Tagline | Preserve “Finding clarity where others see complexity.” |
| Identity | Preserve the M logo and current color scheme |
| Social links | Preserve the existing social and email links |
| Career history | Keep the employment timeline |
| Selected work | Highlight an ecommerce website, the local AI stack, and future projects |
| Ecommerce availability | Public site and repository are not yet published; do not invent or advertise live URLs |
| Non-Profits presentation | Keep it as a sample output of the local AI stack |
| Self Hosted AI | Link to `https://ai.mickverzola.com`, which Mick uses for his personal AI |
| Photos | Placeholder content; the owner likes their appearance, but their permanent role is unresolved |
| Overhaul | Open to reorganizing and improving the site while preserving the identity above |
| Maintenance | Mick is the sole maintainer, working with Codex and/or Claude Code |
| Delivery | Branch, preview and pull request before merging |
| Hosting | `mickverzola.com`, GitHub → Vercel, domain managed through Cloudflare |

The accepted public narrative is current people leadership at Netflix, without emphasizing the formal role title.

## Functional requirements

| ID | Requirement | Current position |
| --- | --- | --- |
| FR-01 | Introduce Mick using the retained tagline and a concise professional summary | Tagline and summary exist; people-leadership emphasis is future content work |
| FR-02 | Present the employment timeline | Exists: Netflix, Astreya and Solarwinds; detailed roles and descriptions are not supplied |
| FR-03 | Provide Facebook, Instagram, GitHub, LinkedIn and email access | Exists in the desktop rail and mobile footer |
| FR-04 | Provide a gateway to personal side projects | Rabbit Hole links exist; external service operation is outside this repository |
| FR-05 | Show selected work that supports breadth of skills | Future work; gallery photos currently have no project descriptions or links |
| FR-06 | Retain the Non-Profits presentation and identify it as a local AI output sample | Deck exists; its portfolio context is not yet shown |
| FR-07 | Preserve the tagline, M logo and current palette through an overhaul | Existing identity is the baseline to retain |

The ecommerce entry may describe an unpublished project once Mick supplies publishable details. Its repository and demo links should appear only when actual destinations are available. Do not infer its identity from other local repositories or invent project outcomes, metrics or confidential work examples.

## Quality goals

The site should be understandable on desktop and mobile, make essential information readable without hover, and allow visitors to use navigation with a keyboard. Image optimization should preserve the appearance Mick likes. These are proposed review targets with concrete checks in the [backlog](backlog.md), not a claim that the current site meets an accessibility or performance certification.

The owner specified a qualitative success measure: a visitor sees a multi-skilled person. Review the future preview by asking whether the professional summary and selected work support that impression. No traffic target, conversion target, uptime commitment or analytics requirement was supplied.

## Scope boundaries

No application accounts, checkout, inventory management, AI chat backend, CMS or contact-form service are requested for this portfolio. Links may lead to projects that have those capabilities; this repo does not implement them. A portfolio overhaul does not authorize changing those projects.

## Open content decisions

- Exact selected-work descriptions, screenshots and publishable evidence.
- Ecommerce project name and destinations when available.
- Whether GenMedia AI should return to future navigation and how to describe it; the current source base has removed its link.
- Final page arrangement and the permanent role of the placeholder photos.
- Whether a résumé link is wanted; it was not requested.

These are questions for the future content task. They do not prevent documenting the current site. See [B01](backlog.md#b01--plan-and-deliver-the-portfolio-content-overhaul).
