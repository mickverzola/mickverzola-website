# Portfolio delivery plan

Updated: 2026-10-13. **Status:** Baseline #1 accepted through merged PR #11; issue #2 investigation recorded with open release prerequisites under #12. Website implementation has not started.

## Problem and outcome

The current portfolio establishes a visual identity but provides sparse evidence of Mick's people leadership and breadth of skills. Reading/navigation issues make that evidence harder to discover, and runtime/deployment behavior remains unverified.

The outcome is a portfolio where recruiters and employers understand who Mick is, what he leads and builds, and how to contact him. Mick retains a gateway to personal projects. Preserve the tagline, M logo, palette, employment timeline and all existing social links.

## Planning authority

The [PRD](prd.md) owns audience, intended outcomes and scope. The [TDD](tdd.md) owns technical facts, design implications and verification evidence. GitHub issues own execution status; the [backlog](backlog.md) maps local B01–B06 groups to those issues. The [workflow](workflow.md) owns branch → preview → PR → review → merge. Proposed approaches may evolve while remaining within those requirements.

The accepted baseline is the owner-aligned 2026-10-13 set, merged through PR #11 at `df58ff754f8ddeea554509dc19e0a8616e42b0a9`, with original source review `0dea6ca` and runtime base `1121b62` (see the [TDD](tdd.md#source-baseline)). Issue #1 records acceptance checks and final versioned PRD/TDD links; workspace-only references in issues #1–#10 were replaced and read back. Later evidence updates do not move that fixed baseline. Publication does not complete a website fix or verify a browser release.

## Milestone and work items

[Portfolio v1 — clear professional story and credible selected work](https://github.com/mickverzola/mickverzola-website/milestone/1) has no agreed due date. Its exit is an owner-reviewed portfolio outcome, acceptance evidence and commit-matched production verification.

| GitHub item | Problem area | Local group | PRD/TDD alignment |
| --- | --- | --- | --- |
| [#1](https://github.com/mickverzola/mickverzola-website/issues/1) | Documentation baseline | D01 | FR-01–FR-07; TDD design boundary |
| [#2](https://github.com/mickverzola/mickverzola-website/issues/2) | Spike: browser evidence and delivery path | B05 | Quality goals; R08 and runtime verification gaps |
| [#3](https://github.com/mickverzola/mickverzola-website/issues/3) | Spike: publishable content and page composition | B01/B04/B06 | FR-01–FR-07; R07 |
| [#4](https://github.com/mickverzola/mickverzola-website/issues/4) | AI sample claims and provenance | B06 | FR-06; TDD presentation content |
| [#5](https://github.com/mickverzola/mickverzola-website/issues/5) | Professional story and contact | B01/B02 | FR-01/FR-02/FR-03/FR-07; R02/R07 |
| [#6](https://github.com/mickverzola/mickverzola-website/issues/6) | Selected-work evidence and discovery | B01 | FR-04/FR-05/FR-06/FR-07; R07 |
| [#7](https://github.com/mickverzola/mickverzola-website/issues/7) | Homepage reading and navigation | B02 | FR-02/FR-03/FR-04/FR-07; R02–R04/R06 |
| [#8](https://github.com/mickverzola/mickverzola-website/issues/8) | Presentation reading controls | B03 | FR-06; R05/R06 |
| [#9](https://github.com/mickverzola/mickverzola-website/issues/9) | Image transfer and appearance | B04 | FR-07 and quality goals; R01 |
| [#10](https://github.com/mickverzola/mickverzola-website/issues/10) | Outcome and production verification | B01–B06 | FR-01–FR-07; TDD verification |
| [#12](https://github.com/mickverzola/mickverzola-website/issues/12) | Missing browser/account/release evidence from #2 | B05; supports B02/B03/B04 | Quality goals; R01/R04–R06/R08 |

Each issue states the problem, alignment, proposed approach, acceptance criteria/investigation outputs, constraints and dependency references. Full issue bodies on GitHub are the execution records; avoid maintaining duplicate task status here.

## Sequence and dependencies

1. Publish the documentation baseline (#1).
2. Establish browser/release evidence (#2) and resolve publishable content/composition (#3). Each spike starts with one working session; it ends with recorded findings, decisions and explicit follow-ups, not an implied implementation.
3. After #3, review sample claims (#4), implement professional story/contact (#5), and homepage reading/navigation (#7). Selected work (#6) depends on #3 and #4.
4. Deck controls (#8) can be implemented independently; browser acceptance evidence is needed before closure. Image optimization (#9) follows #3 and final selected-work imagery/layout (#6).
5. Review the combined outcome and verify release (#10) after #1–#9 outputs/acceptance are satisfied. Unresolved spike findings that are release prerequisites must be resolved through follow-up work before release.

Issue #2's recorded limitations are explicitly assigned to #12, which remains a prerequisite for #10. Its browser matrix and account inspection also supply evidence needed by #7/#8/#9. Closing the investigation does not satisfy B05's full hosting acceptance or imply that the preview/release path is confirmed.

GitHub dependencies are recorded as cross-references in issue bodies; no native blocking relation or GitHub Project automation was configured.

## Completion and changes

Close a spike when its investigation outputs and follow-up disposition are recorded. Close an implementation issue when its acceptance criteria have evidence, including preview/PR links and verification limits. Close the milestone only after the owner accepts the portfolio outcome and production checks match the reviewed commit.

Update PRD when an approved intended outcome/content decision changes; update TDD when implementation or evidence changes; use an ADR for lasting scope/architecture/release decisions. Keep the static portfolio boundary and linked services separate. A framework/backend/CMS/analytics or hosting migration is not required by this plan. Optional share metadata and résumé work remain deferred until wanted; no traffic target or performance certification is invented.
