# Backlog

Updated: 2026-10-13. IDs below are local planning references, not GitHub issue numbers.

The owner requested problem-focused GitHub tracking aligned with the PRD and TDD. The [Portfolio v1 milestone](https://github.com/mickverzola/mickverzola-website/milestone/1) and ten open issues were created and verified on 2026-10-13. No website fixes have been implemented. The sequence below remains suggested, without dates or a promised release; see the [delivery plan](delivery-plan.md) for dependencies and completion rules.

| Item | Status | Suggested sequence |
| --- | --- | --- |
| D01 — Review and document the repository | Source review/draft complete; baseline publication under #1 awaits review and merge; runtime verification excluded | Baseline |
| B01 — Portfolio content overhaul | Accepted direction to explore; design and delivery unscheduled | Choose content, then preview |
| B02 — Homepage reading and navigation | Proposed; findings R02–R04/R06 | Address alongside overhaul |
| B03 — Retained presentation usability | Proposed; findings R05/R06 | Small independent fix |
| B04 — Image optimization | Proposed; finding R01 | After image role/crops are selected |
| B05 — Confirm hosting and preview configuration | Open verification; finding R08 | Before next remote release |
| B06 — Review presentation claims and framing | Proposed; deck retained as AI sample | With its portfolio entry |

## GitHub execution mapping

B01–B06 remain local grouping IDs, not GitHub issue numbers. GitHub owns task status; creating an issue does not complete its work. [#1](https://github.com/mickverzola/mickverzola-website/issues/1) records the planning-baseline PR and documentation commit; final baseline links must use the merged commit after owner review.

| Local group | GitHub issues |
| --- | --- |
| D01 follow-up | [#1 — Publish documentation baseline](https://github.com/mickverzola/mickverzola-website/issues/1) |
| B01 | [#3 — Content/composition spike](https://github.com/mickverzola/mickverzola-website/issues/3), [#5 — Story/contact](https://github.com/mickverzola/mickverzola-website/issues/5), [#6 — Selected work](https://github.com/mickverzola/mickverzola-website/issues/6) |
| B02 | [#5 — Story/contact layout](https://github.com/mickverzola/mickverzola-website/issues/5), [#7 — Reading/navigation](https://github.com/mickverzola/mickverzola-website/issues/7) |
| B03 | [#8 — Deck controls](https://github.com/mickverzola/mickverzola-website/issues/8) |
| B04 | [#3 — Image-role decision](https://github.com/mickverzola/mickverzola-website/issues/3), [#9 — Image optimization](https://github.com/mickverzola/mickverzola-website/issues/9) |
| B05 | [#2 — Browser/delivery spike](https://github.com/mickverzola/mickverzola-website/issues/2) |
| B06 | [#3 — Sample/content decision](https://github.com/mickverzola/mickverzola-website/issues/3), [#4 — AI sample editorial review](https://github.com/mickverzola/mickverzola-website/issues/4) |
| Combined outcome/release | [#10 — Portfolio acceptance and production verification](https://github.com/mickverzola/mickverzola-website/issues/10) |

## D01 — Review and documentation

**Source review and draft complete; publication pending review/merge:** README, PRD, TDD, workflow, backlog, delivery plan, operations and ADRs were created from source review and the owner interview. Earlier draft validation covered 13 Markdown files and 51 local file/heading links; the publication PR records checks for the expanded set. The [TDD evidence](tdd.md#review-findings-and-verification) retains the original check limits and distinguishes the newer source base. This item does not complete any runtime fix or claim a deployed release. After merge, record final PRD/TDD references using the merged commit in delivery issues #1–#10 before accepting #1.

## B01 — Plan and deliver the portfolio content overhaul

**Direction:** Explore a clearer showcase of experience and breadth of skills. **Requirements:** FR-01–FR-07. **Finding:** R07.

First resolve the content and arrangement with Mick: current people leadership at Netflix, the ecommerce project, local AI stack and future work. Preserve the tagline, M logo, current palette, employment timeline and social access. Photos remain placeholders; their look is liked but their permanent role is undecided. GenMedia's role remains open.

**Acceptance:** A reviewed preview explains the professional story and selected work using owner-supplied facts. It presents the Non-Profits deck as a local AI output sample. Unpublished projects are described honestly without fabricated demo/repository links. Social links work in desktop and mobile layouts. The owner confirms that the result communicates a multi-skilled person. Optional share metadata uses approved copy and imagery.

## B02 — Make the homepage readable and navigation coherent

**Status:** Proposed. **Requirements:** FR-02–FR-04, FR-07 and quality goals. **Findings:** R02–R04/R06.

**Acceptance:** Employment history is readable at rest without hover. Normal text affected by the low-contrast styles meets the 4.5:1 reference target. Images have meaningful alternatives or intentionally empty alternatives according to their role. Dropdown visual state and `aria-expanded` agree, keyboard navigation and Escape work, and focus is visible. Use appropriate navigation semantics rather than incomplete menu-widget roles. Reduced-motion preferences suppress unnecessary movement while preserving content. Check mouse, keyboard and touch in a browser, with the palette retained.

## B03 — Fix and verify the retained deck's reading controls

**Status:** Proposed. **Requirement:** FR-06. **Findings:** R05/R06.

**Acceptance:** Actual Space and arrow keys advance as intended without duplicate changes from focused buttons. Previous/Next clamp at the first/last slide. Zoom and readable scrolling remain available. Vertical reading gestures do not unexpectedly change slides. The counter exposes changes appropriately to assistive technology, and reduced motion is supported. All seven slides remain reachable at desktop and mobile sizes, including small screens and landscape. Keep the sample content pending B06's editorial review.

## B04 — Reduce image transfer size without losing the visual treatment

**Status:** Proposed. **Requirement:** FR-07 and quality goals. **Depends on:** B01's image-role decision. **Finding:** R01.

**Acceptance:** Select display-sized assets and crops, preserve the approved appearance, and avoid deferring the primary hero image. Use responsive sources or below-fold lazy loading where they actually help. Compare transferred bytes against the **15,751,376-byte** JPEG baseline and review the result on mobile and desktop. Agree on a size target during implementation; no performance budget or measured page-load result currently exists.

## B05 — Confirm hosting and preview configuration

**Status:** Open verification. **Depends on:** Access to the owner-managed accounts. **Finding:** R08.

**Acceptance:** Record the actual Vercel project, repository connection, production branch, root/build/output settings, automatic-deployment behavior, preview access and domains. Verify the Cloudflare records and proxy setting without guessing values. Match a deployment to a known commit and check homepage/deck/assets. Record how to return to a known-good deployment. Update operations; no hosting migration is requested.

## B06 — Review the retained AI sample's claims and context

**Status:** Proposed. **Requirement:** FR-06.

**Acceptance:** Mick approves the sample's description. Quantified productivity, privacy and deployment claims are supported, qualified, revised or removed through an editorial decision. Desktop table and mobile cards convey the same approved content. Its portfolio framing identifies the local AI origin and does not present generated claims as verified project results.

## Maintaining status

Start implementation only in an authorized task. Keep accepted direction separate from completed behavior. Update the item with its PR/commit, preview and relevant checks; include browser or production limitations. New side projects can become new content items when Mick supplies their identity and evidence.
