# Technical design and repository review

**Updated:** 2026-10-13. **Original review baseline:** `0dea6ca` — Remove dead Family link from Rabbit Hole menu.

## Design boundary

This is a two-page static website. The existing source is authoritative for current behavior; [PRD](prd.md) describes the owner's intended portfolio, and [backlog](backlog.md) tracks differences. The documentation task changes no website runtime files.

## Source baseline

The original review and its checks below used `0dea6ca68ff20ded291c1fb52d3bb666c4f0e208`. The documentation PR is based on `1121b6252a738794aa2dc7eacd536bbbe852129a` — Remove GenMedia AI link from Rabbit Hole menu. Comparing these commits shows only the removal of that link from `index.html`; the other source files and image assets are unchanged. The current Rabbit Hole therefore links to Self Hosted AI and Non-Profits. GenMedia's future inclusion remains an open product decision, not a currently available navigation destination. No original simulated interaction check was rerun for this documentation publication, and no browser or production verification is implied.

## Current architecture

```mermaid
flowchart LR
    Git[GitHub source] -->|Owner-reported integration|Vercel[Vercel hosting]
    Vercel -->|Static files|Browser[Visitor browser]
    DNS[Cloudflare-managed domain and DNS] -.->|Domain configuration|Vercel
    Browser -->|Font requests|Fonts[Google Fonts]
    Browser -->|Navigation|Links[Socials and external side projects]
```

The diagram records the original owner-reported arrangement, not inspected account settings. The original review did not establish Cloudflare traffic proxying. Issue #2 later observed Cloudflare public DNS/responses and Vercel deployment metadata; the [investigation below](#issue-2-investigation--2026-10-13) states their limits. Dashboard DNS targets/proxy flags, configured production branch and preview policy remain unverified.

| Component | Contract |
| --- | --- |
| [index.html](../index.html) | Homepage structure, copy, timeline, SVG identity, links and image references |
| [styles.css](../styles.css) | Homepage layout, palette, portrait treatment and project cards |
| [main.js](../main.js) | Empty entry point since #6 removed the dropdown; kept for future behavior |
| [nonprofits.html](../nonprofits.html) | Standalone deck with inline CSS and JavaScript; no dependency on homepage styles or script |
| `images/` | Five JPEG assets referenced by the homepage |

There is no package manifest, compilation, server-side code, database, API integration, form submission, browser storage or analytics code in the reviewed source. The external AI links are navigation destinations, not embedded AI capabilities.

## Homepage behavior

The homepage uses Cormorant Garamond and Jost from Google Fonts, with serif and sans-serif fallbacks. Its palette is defined by CSS variables: background `#0c0a08`, panel `#14110d`, cream `#ece3d6`, muted `#9a9186` and gold `#b99a6a`. These values, the existing tagline and the inline M mark are the retained identity baseline.

The layout has a header, hero, four-photo gallery, employment timeline and copyright. The desktop social rail becomes a footer at widths of 980 px and below. Additional breakpoints at 560, 1360 and 1600 px adjust typography, timeline position and rail placement. These are source observations, not proof of successful device layouts.

**Issue #5 update (2026-10-14):** the hero now names Mick above the tagline, uses the approved intro copy, shows `002.jpg` as a 4:3 portrait with a descriptive `alt`, and adds labeled Email/LinkedIn links visible at every width. On mobile the introduction precedes the portrait. Experience is its own `#info` section after Rabbit Hole, with years, company and approved one-liners readable at rest (muted text 6.4:1, cream 15.6:1 against the background). The 1360 px timeline breakpoint is gone; experience stacks at 560 px. The Rabbit Hole keeps the three remaining placeholder photos until #6, and the dropdown is unchanged until #7.

**Issue #6 update (2026-10-14):** the Rabbit Hole dropdown is replaced by a plain RABBIT HOLE in-page link, which removes R04's dual hover/`.open` state and incomplete menu roles; #7 still owns focus, contrast and reduced-motion checks. “Enter the Rabbit Hole” moved into the intro and now leads to the work section. The section shows two approved project cards (Self-Hosted AI, live, with its sample deck; the MTG singles storefront under What's Next) and no images. No link to `ai.mickverzola.com` remains anywhere on the page. `000.jpg`, `001.jpg`, `003.jpg` and `004.jpg` were no longer referenced; #9 removed them.

**Issue #7 update (2026-10-14):** R02 resolved for the homepage: the copyright now uses muted text (6.37:1); all homepage text measures ≥ 6.07:1 on its background (cream/gold/muted on `#0c0a08` and `#14110d`). A shared gold `:focus-visible` outline covers every link. A `prefers-reduced-motion` block disables smooth scrolling, transitions, the portrait hover zoom and hover slide-ups while keeping colour changes. Decorative SVGs are `aria-hidden`; the nav and both social groups are labelled; the logo links to `#top`. R03 is resolved by #5's portrait `alt` and #6 removing the placeholders; R04 by #6 removing the dropdown. The deck's own motion and zoom (R05/R06) remain under #8.

**Issue #9 update (2026-10-14), R01:** the five original photos (15,751,376 bytes, 3024×4032-class JPEGs) are removed. The portrait is pre-cropped to 4:3 (full width, vertical offset 55%, matching the #5 framing) and exported as progressive mozjpeg (q80, no metadata) at five widths:

| File | Size | Bytes |
| --- | --- | --- |
| `portrait-640.jpg` | 640×480 | 69,696 |
| `portrait-800.jpg` | 800×600 | 102,145 |
| `portrait-1024.jpg` | 1024×768 | 156,390 |
| `portrait-1280.jpg` | 1280×960 | 227,134 |
| `portrait-1600.jpg` | 1600×1200 | 333,029 |

`<img srcset sizes="(max-width: 980px) 100vw, min(50vw, 768px)">` lets the browser choose. The image has `width`/`height` (no layout shift), `fetchpriority="high"`, and is not lazy-loaded because it is the hero. WebP was tried and saved only ~3% on this foliage-heavy photo, so it was dropped for simplicity.

Measured locally (Chrome, http-server with caching disabled, DPR 1): the 1440×900 desktop slot of 713×534 resolves to `portrait-800.jpg`, and a 390×844 frame resolved to `portrait-640.jpg` (69,996 B transferred). The whole homepage transferred 82,775 B over that loopback run, excluding cross-origin Google Fonts. Higher-density screens will pick a larger file (at most 333 KB). A worst-case 333,029 B against the 3,586,457 B the portrait previously cost is a 91% reduction, or 98% against the 15.75 MB image baseline. These are loopback measurements, not a page-speed or Vercel/CDN result; production transfer belongs to #12/#10.

At the original review baseline, the Rabbit Hole dropdown linked to Self Hosted AI, GenMedia AI and the local deck, each in a new tab with `rel="noopener"`; the newer base removes GenMedia as noted above. JavaScript changes `.open` and `aria-expanded`; CSS can also reveal the menu through hover. INFO targets the employment block. “Enter the Rabbit Hole” targets the section containing that same link. The four photos are noninteractive, so this section currently provides no selected-work discovery path.

## Non-Profits presentation

The retained presentation is a sample generated by the owner's local AI stack. Seven slides cover AI use in research-focused nonprofits. A page-local index selects the active slide; Previous and Next controls are disabled at the respective bounds. Arrow-key handlers and horizontal swipe detection also change slides.

The deck swaps its comparison table for stacked cards at 768 px and below. It fixes the page to the viewport and uses nested scrolling inside slides. Its viewport settings and touch handler attempt to restrict zoom. Without JavaScript, the initially active title slide remains visible but the deck does not advance.

Sample content includes quantified productivity claims and broad deployment/privacy claims without citations. This review did not validate those claims. Presenting the deck as an AI output sample must not imply that its claims are independently verified or that this portfolio operates the described systems.

### Editorial disposition — issue #4, 2026-10-14

Mick chose to keep numbers only where published research supports them and otherwise use qualified wording. A provenance banner and a back link (`← mickverzola.com`) now appear above every slide: *Sample output · Self-Hosted AI. Generated with a 27B open-weight model on a single consumer GPU, then edited by Mick for accuracy.* The desktop table and mobile cards carry identical revised wording.

| Slide | Original claim | Disposition | Basis |
| --- | --- | --- | --- |
| 2 | Process 2x to 3x the volume without expanding headcount | Revised: “Take on more research volume without expanding headcount” | No generative-AI study supports the multiplier |
| 2 | Patterns across decades of reports in seconds | Revised: “far faster than manual review” | Speed depends on hardware and corpus |
| 2 | Dramatically reduce administrative overhead | Revised: “Reduce…” | Unquantified intensifier |
| 3 | Local deployment keeps research strictly confidential | Revised: “help keep… confidential” | Absolute guarantee |
| 4 | 60%–70% faster literature synthesis | **Replaced with a cited figure:** writing tasks, including grant writing, 40% faster with 18% higher rated quality | [Noy & Zhang, *Science* 381 (2023)](https://doi.org/10.1126/science.adh2586): randomized experiment, 453 professionals. Corroborated by [MIT News](https://news.mit.edu/2023/study-finds-chatgpt-boosts-worker-productivity-writing-0714) |
| 4 | Saves ~7.5 hrs/week (350–700 hours/year) | Removed | Internally inconsistent (7.5 × 52 ≈ 390); no matching source. Microsoft's [field experiment](https://www.microsoft.com/en-us/research/publication/shifting-work-patterns-with-generative-ai/) measured ~3 h/week less email time, not research time |
| 5 | Cloud: zero IT maintenance; zero setup | Revised: “Minimal…” | Absolute |
| 5 | Local: 100% offline & air-gapped sovereignty | Revised: “Can run fully offline; data stays on your hardware” | Local is not air-gapped by default |
| 5 | Local: total confidentiality, zero external dependencies | Revised: “Strong confidentiality; no reliance on outside AI providers” | Updates and model downloads are external |
| 6 | Summarizes 50-page papers in seconds | Revised: “in minutes rather than hours” | Hardware-dependent |

An evidence-synthesis review ([Abogunrin et al., *Frontiers in Pharmacology*, 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11826052/)) reports >50% screening-time reductions, but mostly for machine-learning tools rather than generative AI, so it was not used to support the literature-synthesis figure. Deck controls (R05/R06) are unchanged and remain under #8.

### Deck controls — issue #8, 2026-10-14

R05 and the deck half of R06 are resolved in source:

- **Keyboard:** ArrowRight/Space go forward and ArrowLeft/Shift+Space go back. The handler ignores events from focused buttons, links and fields, so a focused Previous/Next button fires once through its own click. Modifier-key combinations are left to the browser.
- **Bounds:** `changeSlide` clamps and does nothing at either end. When a focused button becomes disabled, focus moves to the other button.
- **Zoom:** `maximum-scale`/`user-scalable=no` and the double-tap `preventDefault` are removed.
- **Scrolling:** each slide is the only vertical scroll container (`.slide-body` no longer scrolls), and the desktop table scrolls sideways on its own. A new slide starts at the top.
- **Gestures:** a swipe changes slides only when it is horizontal (|dx| ≥ 60 px and ≥ 1.5 × |dy|), single-finger, not on the table, and the page isn't pinch-zoomed.
- **Assistive technology:** the counter is `aria-live="polite"`; the deck is a labelled carousel region with each slide a `group` labelled “n of 7”.
- **Motion:** the slide fade/rise is disabled under `prefers-reduced-motion`.

Local Chrome evidence: synthetic keys and touches exercised every rule above. All seven slides were stepped through at 390×844, 320×568 and 844×390, with one scroll container and no horizontal overflow at each size. Real-device pinch/swipe and an actual screen reader remain #12 checks.

## Review findings and verification

Reviewed all four source files, asset sizes, tracked inventory and Git history. JavaScript syntax and selected interactions were checked with Node and a small in-memory DOM simulation. This is source review, not browser automation.

| Finding | Evidence and implication | Work |
| --- | --- | --- |
| R01 — Large image payload | Five JPEGs total **15,751,376 bytes / 15.02 MiB**, with each about 2.8–3.6 MB. No lazy-loading or responsive image sources are declared. This is an asset-size observation; load time was not measured. | B04 |
| R02 — Essential text has low contrast | Experience and copyright use cream at 22% opacity on the dark background, approximately **1.74:1** after alpha compositing. Experience brightens only on hover. Normal text's 4.5:1 reference target comes from [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). | B02 |
| R03 — Placeholder image alternatives | All five homepage images use `alt="..."`. Meaningful images need actual descriptions; decorative placeholders need an intentional empty alternative. Their final role must follow the content decision. | B02 |
| R04 — Dropdown has two visibility states | CSS hover can reveal the dropdown while `aria-expanded` remains false. Escape only closes `.open`, so a hovering pointer can still keep it visible. `menu`/`menuitem` roles are supplied without the matching menu-widget keyboard behavior. A simpler disclosure navigation is described in the [W3C example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/). | B02 |
| R05 — Deck Space shortcut is broken | The handler compares `e.key` with `'Space'`. An actual Space key returns `' '`, as documented by [MDN](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key). The simulated actual key did not advance the deck. | B03 |
| R06 — Deck reading and motion need review | `user-scalable=no`, `maximum-scale=1.0` and double-tap suppression attempt to restrict zoom; browser behavior varies. See [MDN viewport guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport). Swipe logic considers horizontal distance only. Neither page has reduced-motion styling. Actual zoom, vertical-scroll interactions and small-screen layout need browser/device checks. | B02, B03 |
| R07 — Portfolio evidence is sparse | No project summaries, outcomes or repository/demo cards exist. Netflix is named but the accepted people-leadership emphasis is absent. The presentation link is not contextualized as an AI sample. | B01 |
| R08 — Deployment settings are external | No Vercel configuration or CI workflow is tracked. This does not mean deployment automation is absent; account settings must establish the actual release path. | B05 |

Neither page includes description or social-preview metadata. This is an optional presentation improvement within B01, not an accepted SEO programme.

| Check performed | Result and limit |
| --- | --- |
| `node --check main.js` | Passed syntax only |
| Compile inline deck script with Node's `vm.Script` | Passed syntax only |
| Homepage local `src`/`href` targets | All referenced local files exist |
| Dropdown click, outside click and Escape | Passed in the simulated DOM; CSS hover and real focus behavior not exercised |
| Deck initial state, arrow advancement and repeated boundary navigation | Passed in the simulated DOM |
| Deck Space event with `key: ' '` | Reproduced failure to advance |
| CSS contrast calculation | Approximately 1.74:1 for the specified default text/background pair; no full-page accessibility audit |
| Live site | Web research tool could not retrieve the public URL; no uptime conclusion |

No fixes, performance measurements, external-link health checks, real-device checks, Vercel account inspection or production release were performed by the original review. The later investigation below adds HTTP transfer and deployment evidence with separate limits.

## Issue 2 investigation — 2026-10-13

Baseline PR #11 merged into `main` at **`df58ff754f8ddeea554509dc19e0a8616e42b0a9`** (12:54:06 UTC). Its tree matches submitted `88e23e3fc2dcea9bea6fe5a11e94a12c582b0331` exactly; only 14 Markdown files differ from runtime base `1121b6252a738794aa2dc7eacd536bbbe852129a`. Issues #1–#10 now use merged-commit PRD/TDD links; #1 closed after its acceptance checks. This investigation branch starts at the merged SHA and changes documentation only.

### Browser access and interaction limits

The available computer/browser tool was rechecked: `cua.getState()` returned `apps: []` and `browsers: []`; `cua.createBrowserTab('iab', 'https://mickverzola.com', {visible: true})` returned **Browser is not available: iab**. No available browser could render either page. No screenshots, actual viewport sizes, browser version, device pixel ratio, console results or observed interaction results exist for this session. Neither desktop/mobile emulation nor a real-device check occurred. HTTP retrieval does not execute JavaScript, render fonts/images or test mouse, keyboard, touch, zoom, motion preferences or accessibility.

The explicit follow-up is [#12 — Complete browser and hosting evidence before release acceptance](https://github.com/mickverzola/mickverzola-website/issues/12). Its proposed CSS viewports are **1440×900 desktop, 390×844 mobile, 320×568 narrow mobile and 844×390 landscape**; these are future checks, not measurements. Capture the homepage, dropdown states and all seven deck slides, and check INFO, social/email destinations, dropdown state/Escape, bounds, buttons, arrows/actual Space, zoom, nested scrolling, gestures and reduced motion. Source findings R02–R06 have since been addressed in #5–#8; real-browser and device confirmation remains here.

### Deployment and public HTTP evidence

GitHub's Vercel status reports success for the merged SHA at 12:54:21 UTC, with [deployment details](https://vercel.com/mickverzola/mickverzola-website/68mCP4t5VvAVxEV5wru7wP4aKYZY). GitHub deployment **7039017944** has environment label `Production` and a success status at 12:54:22 UTC, identifying [the deployment URL](https://mickverzola-website-o6zjcuagm-mickverzola.vercel.app). The API's separate `production_environment` boolean is false; the environment label and successful status are metadata, not independent proof of the custom domain's active routing or configured production branch.

Preview deployment **7038622333** is labeled `Preview`, SHA `88e23e3fc2dcea9bea6fe5a11e94a12c582b0331`, success at 12:36:35 UTC: [immutable preview URL](https://mickverzola-website-ubwh84wdb-mickverzola.vercel.app). Both `/` and `/nonprofits.html` on both deployment URLs returned **302 to `https://vercel.com/sso-api`** in unauthenticated HTTP checks, rechecked at 13:06 UTC. Authentication query parameters and cookies are omitted. These responses establish an access restriction for this client, not its full policy or logged-in reviewer access.

Public HTTP checks at 13:02 UTC found **308 redirects** from `https://mickverzola.com/` and each tested page/asset to the same path at `https://www.mickverzola.com`. Direct canonical GETs at 13:06:23–13:06:28 UTC returned:

| Canonical URL | HTTP | Downloaded body bytes | TTFB / total seconds | Comparison with source at merged SHA |
| --- | --- | --- | --- | --- |
| [Homepage](https://www.mickverzola.com/) | 200 | 10,193 | 0.785 / 0.788 | Diff consists of two rewritten email links and injected Cloudflare decoder script |
| [Seven-slide deck](https://www.mickverzola.com/nonprofits.html) | 200 | 18,520 | 0.455 / 0.458 | SHA-256 byte match |
| [CSS](https://www.mickverzola.com/styles.css) | 200 | 11,215 | 0.326 / 0.327 | SHA-256 byte match |
| [JavaScript](https://www.mickverzola.com/main.js) | 200 | 1,058 | 0.346 / 0.347 | SHA-256 byte match |

The served homepage changes both `mailto:` hrefs to `/cdn-cgi/l/email-protection#…` and injects `/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js`. This is an observed response transformation; dashboard settings and browser restoration of email actions were not verified. The rest of the homepage has no textual difference in `git diff --no-index`. All five downloaded JPEGs also match source SHA-256. These checks show source-consistent runtime content with that transformation, but cannot distinguish documentation-only commits sharing these assets or prove the custom domain is serving the merged deployment. Resolve that mapping in #12/#10.

### Measured image transfers

Direct serial HTTPS GETs using **Windows curl 8.21.0 / Schannel**, 2026-10-13 13:06:25–13:06:28 UTC, downloaded full bodies to temporary files. Each used a separate curl process, no browser cache, cookies, auth, conditional headers, compression option or network throttling; the machine's normal network was used. No viewport applies. Timing includes connection/TLS and transfer for each request, excludes the apex redirect (canonical URLs were requested directly), and is a single sample rather than a distribution. Curl `size_download`, `time_starttransfer` and `time_total` supply the measurements. No raw cookies, tokens or private account output are committed.

| Canonical image URL | Download bytes | TTFB seconds | Total seconds |
| --- | --- | --- | --- |
| [000.jpg](https://www.mickverzola.com/images/000.jpg) | 2,877,847 | 0.318 | 0.479 |
| [001.jpg](https://www.mickverzola.com/images/001.jpg) | 3,118,304 | 0.322 | 0.492 |
| [002.jpg](https://www.mickverzola.com/images/002.jpg) | 3,586,457 | 0.381 | 0.535 |
| [003.jpg](https://www.mickverzola.com/images/003.jpg) | 3,388,062 | 0.156 | 0.358 |
| [004.jpg](https://www.mickverzola.com/images/004.jpg) | 2,780,706 | 0.201 | 0.407 |

All returned HTTP 200, `Content-Type: image/jpeg`, `cf-cache-status: REVALIDATED`, `x-vercel-cache: MISS`, and `Cache-Control: public, max-age=14400, must-revalidate`. The measured **15,751,376 body bytes** total equals the earlier file-size baseline, now supported by actual downloads. It excludes HTTP/TLS overhead and other page resources. Approximately 2.271 seconds is the sum of serial request durations, not page load time. There is no browser waterfall, image decode/paint, LCP, concurrent page-loading or mobile-network measurement. CDN caches were not purged and origin-cold behavior is not claimed. #9 must compare equivalent measured conditions and add browser evidence under #12.

### Hosting evidence and disposition

See [operations investigation](operations.md#issue-2-hosting-investigation--2026-10-13) for the settings matrix, DNS observations, preview procedure and conditional rollback guidance. Owner-reported hosting, observed public responses and verified GitHub metadata remain distinct. Issue #2's output is this limited investigation and explicit follow-up #12; it does not confirm the complete release path. #12 remains open as a prerequisite for #10. No runtime, hosting settings or other implementation issues were changed.

## Future design implications

The overhaul should improve the professional narrative and selected-work presentation while retaining the brand elements in FR-07 and social access in FR-03. It should keep the employment timeline and frame the deck as sample work. The ecommerce project has no published destination yet.

The current static implementation can support those outcomes. Retaining it is a review recommendation, not an invented owner decision about future frameworks. Any technology change should explain what concrete portfolio requirement needs it. No framework migration is part of this documentation task.

Keep project content curated in source unless an actual editing requirement justifies another system. An unpublished project can have an honest descriptive entry without a dead demo button. Issue #3 resolved project copy, layout, GenMedia and photo roles; see below.

### Composition decisions from issue #3 — 2026-10-14

Content is approved in the [PRD](prd.md#approved-content-issue-3). The technical consequences for implementation:

- **One static page.** Sections in order: intro (tagline, copy, portrait, socials), Rabbit Hole (project cards), experience, footer. No new pages, framework or build step.
- **Navigation.** With Self Hosted AI unlinked and GenMedia removed, the Rabbit Hole dropdown has only one destination left. Replace it with plain in-page links (RABBIT HOLE → the project section, INFO → experience). This removes the dual hover/`.open` state and incomplete menu roles behind R04 instead of repairing them; #7 keeps keyboard, focus and reduced-motion checks for the new links. The Non-Profits deck is reached from the Self-Hosted AI card.
- **Images.** `000.jpg`, `001.jpg`, `003.jpg` and `004.jpg` leave the page; `002.jpg` becomes the portrait with a real `alt`, addressing R03. That shrinks #9 to one display-sized portrait (measured against the 15,751,376-byte baseline) plus future project media.
- **Project clips.** When Mick supplies ~5 s clips, use muted, looping, `playsinline` video with a poster frame, no autoplay under `prefers-reduced-motion`, and a still image fallback. Keep each clip small enough that it does not undo #9's savings; agree a size target then.
- **No private destinations.** Cards carry no repository or demo links while both project repositories are private and the storefront is unlaunched.

## Self-Hosted AI architecture page — issue #21, 2026-10-14

`self-hosted-ai.html` is linked from the Self-Hosted AI card (**View the architecture →**, between the stack description and Sample output). It is a standalone static page in the portfolio palette with a back link. Owner-chosen design:

- **Boot sequence:** `docker compose up`-style lines appear in the platform's Compose dependency order and light each component. It is skippable and collapses afterwards.
- **Request tracer:** an inline SVG generated from one data model (14 components, 19 connections) with two layouts: a 4-column grid, and a 2-column stack at ≤ 720 px with curved routes around boxes and larger text and short subtitles. A glowing packet traces five flows: Ask a question, Learn a document, Answer from my docs, Use a cloud model, and Share the GPU. Each step updates an ordered, `aria-live` step list.
- **Components:** each box is a focusable button (mouse, touch, Enter/Space) that shows its role in an `aria-live` panel.
- **Reduced motion:** no boot animation, and a flow shows its whole route at once with the numbered steps.
- **Source and limits:** the diagram follows `ai-personal` `docs/tdd.md` §3 at commit `9c3a3bc` (2026-10-13), with Cloudflare named and the optional cloud API shown as owner-approved. It deliberately omits ports, volumes, hostnames and access policies. When that architecture changes, update the `NODES`/`EDGES`/`FLOWS` data in the page.
- **Weight:** 24,262 B (8,358 B gzipped), plus the shared Google Fonts. No library and no build step.

Local Chrome evidence: the boot sequence completed and autoplayed the first flow. Selecting a component and switching flows updated the panel, step list and `aria-pressed`. At 1440, 390 and 320 px wide there is no horizontal overflow. Node labels render at ≈15 px at 390 and ≈12 px at 320 (subtitles ≈10 / 8 px). Not verified: real touch devices, an actual screen reader, and OS-level reduced motion (#12).
### Ingestion workflow section — issue #25, 2026-10-14

A second section on `self-hosted-ai.html` (`#ingestion`) shows the n8n workflow behind the n8n box. It is reached from the n8n component's panel (**See the workflow, node by node →**) and from the *Learn a document* flow (**See the ingestion workflow, node by node →**). Either link scrolls to the section, focuses its heading and starts *New file*. **↑ Back to the architecture diagram** returns to `#architecture`. The homepage card is unchanged.

- **Source:** `ai-personal` `n8n/knowledge-ingestion.json`, last changed at commit `fcc6ed78987b703484c985beeeea1388eb81587f` (2026-10-13; unchanged at that repo's `9c3a3bc` HEAD). The page's `WF` / `WF_EDGES` data hold the 27 node names, types, editor positions and error-output flags, plus all 34 connections, including the Loop files `done`/`loop` outputs, the seven error outputs to *Skipped (error)* and both loop-backs. A one-off script compared the page data with the JSON field by field: all match. When the workflow changes, update that data and the source commit in the section note. Node descriptions were written from each node's code and parameters.
- **Canvas (≥ 1200 px):** an n8n-style inline SVG using the JSON positions. The single editor row is folded into two at *Compare Drive vs index* (x ≥ 1020 is shifted left 2,420 and down 540) so it fits the page. The canvas breaks out of the 1,100 px column to at most 1,340 px. Error outputs are dashed and run along a shared bus into *Skipped (error)*.
- **Stages (< 1200 px):** the same 27 nodes as buttons grouped Setup → Inventory → Compare → Delete / Per-file loop → Summary, not a shrunken canvas. Each button expands its role inline. A sticky line shows the current step while the stages light up.
- **Scenarios:** *New file*, *Edited file*, *Deleted from Drive*, *File can't be parsed* (one run with a 4xx placeholder file and a 5xx file retried next run) and *Drive returns nothing* (safety stop). Nodes light in execution order (`executionOrder: v1`, deletions branch first) and get success or error marks. Connections show item badges, and the step list is numbered and `aria-live`. Branches that receive zero items stop, as in n8n; for example, a delete-only run never reaches the loop or Run summary. The replay reflects the code: Parse has `neverError`, so *Build chunks* decides (4xx → placeholder chunk; 5xx → error output), and *Run summary* fails the execution when any file failed.
- **Zoom:** in the per-file loop the canvas viewBox zooms about 1.44× onto the row. A panel shows a document split into chunks at Parse, chunks gaining 768-d + BM25 vectors at Embed, and points landing in Qdrant at Upsert. Stale points are struck out at Remove stale chunks. Chunk IDs shown are the workflow's own hash of made-up file IDs. On stage layouts the panel sits inside the loop stage.
- **Illustrative figures:** owner-approved invented numbers (2026-10-14), labelled "Example run · illustrative figures" in the toolbar, the canvas corner and the run panel. The five runs form one consistent sequence: 41 → 42 documents / 1,280 → 1,288 points (new, 8 chunks); 1,288 → 1,286 (edited to 6 chunks, 2 stale removed); 42 → 41 / 1,280 (deleted); 41 → 42 / 1,281 (1 placeholder, 1 failed); 42 / 1,281 untouched (safety stop).
- **Public-safe:** no Drive folder ID, service URLs or ports, credential names or keys, and no collection name. Shown: chunk sizes (1,500 / 1,800 / 200 overlap / 300 combine), nomic-embed-text 768-d and Qdrant-computed BM25 sparse vectors. A text scan for addresses, ports and credential identifiers found none in the new section.
- **Reduced motion:** a scenario shows the whole path, final badges and marks, and all numbered steps at once. There is no canvas zoom, and the zoom panel sits statically under the canvas in its final state.
- **Weight:** the page grows from 24,262 B to 75,938 B (+51,676 B). Gzipped (`gzip -9`) it grows from 8,337 B to 21,903 B (+13,566 B). No new requests, no library and no build step.

Local Chrome evidence: served with `http-server -c-1` and checked in same-origin iframes at 1440×900, 390×844 and 320×568.

- No horizontal page overflow at any size, including with all 27 stage buttons expanded. Canvas node labels render at ≈14.7 px at 1440 (≈21 px while zoomed), item badges ≈11.5 px and the `done`/`loop` output labels ≈10.5 px. Stage button names render at 14.7 px and types at 11.5 px at 390 and 320. Zoom labels and point IDs were checked for clipping at 390 and 320 and adjusted until none clipped.
- All five scenarios were replayed at 1440 and 390. Final node and badge counts matched the scenario data: New and Edited 24 nodes / 24 badges; Deleted 14 / 13; Can't parse 23 ok + 2 error (Build chunks, Run summary) / 26; Drive returns nothing 10 ok + 1 error (Compare) / 10. At 1440 the canvas zoomed for New, Edited and Can't parse (zoom stages doc → parse → embed → upsert → stale/fail) and returned to the full view. Reduced motion (emulated by overriding `matchMedia` in a 1440 and a 390 frame) gave the same final counts with no step animation or zoom.
- All 27 canvas nodes are focusable and showed their role on click, Enter and Space. All 27 stage buttons toggled their role with `aria-expanded`. Both entry links focused the section heading and started *New file*, and the back link reached the diagram. The existing diagram still has 14 components, 19 connections and 5 flows, and the boot skip still works.

The Chrome window was reported as hidden throughout, which pauses `requestAnimationFrame` and smooth scrolling and throttles timers. The 1440 logic run therefore used a test-only shim that completes each animation frame and wait immediately; the zoom moment and the stage view were then inspected in screenshots with the state set directly. Not verified: real-time animation pacing and smooth scrolling in a visible window, real touch devices, an actual screen reader and OS-level reduced motion (#12). Owner review of the desktop and phone preview is pending.
