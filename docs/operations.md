# Operations guide

Updated: 2026-10-13. Operator and sole maintainer: Mick Verzola.

## Operating model

The GitHub source repository is private, verified on 2026-10-13 after the owner requested the visibility change. This changes source access; no website access or Vercel settings were changed by that action.

The owner reports that [mickverzola.com](https://mickverzola.com) is deployed from GitHub through Vercel, with the domain managed by Cloudflare. Automatic deployment is believed to occur after GitHub pushes. The later issue #2 investigation observed successful GitHub deployment metadata and public HTTP responses; account settings, configured production branch and browser behavior remain unverified.

The portfolio has no application database, background jobs, local production server or application accounts to operate. The personal AI link leads outside this repository; GenMedia is absent from the newer source base and its future role remains open. This guide covers the portfolio and its links, not operation or recovery of those destinations.

## Local preview

Open `index.html` directly for a basic view. With Python 3 installed, run from the repository root:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/` and `/nonprofits.html`. Stop with Ctrl+C. This optional development server serves the directory, so keep it on localhost. Python is a preview convenience, not a website runtime dependency. A local preview does not validate Vercel routing or deployment settings.

## Confirm the hosting configuration

Before the next remote release, complete [B05](backlog.md#b05--confirm-hosting-and-preview-configuration):

1. In Vercel, identify the project connected to `mickverzola/mickverzola-website` and record its actual name. Inspect the connected repository and production branch.
2. Record the root directory, framework preset, install/build/output settings and any deployment exclusions. The source needs no compilation; do not assume the dashboard has a particular preset or output value.
3. Check whether branch pushes produce previews and production-branch changes publish automatically. Inspect a deployment's commit, environment and status to establish the actual behavior.
4. Inspect assigned domains and HTTPS status. In Cloudflare, confirm the records and whether they are proxied; use Vercel's instructions for this specific project rather than copied DNS values.
5. Record preview access restrictions and the available rollback method. Keep login credentials and tokens outside the repository.

Vercel's [Git integration guide](https://vercel.com/docs/git) distinguishes production branch deployments from previews. It describes provider behavior, not evidence of this project's configuration.

## Issue 2 hosting investigation — 2026-10-13

Read-only investigation at merged baseline `df58ff754f8ddeea554509dc19e0a8616e42b0a9`; [TDD](tdd.md#issue-2-investigation--2026-10-13) records HTTP timings, content comparisons and browser-access failure. The initial clean workspace was safely synchronized by fetching `origin` and creating `docs/issue-2-browser-release-evidence` from `origin/main`; no existing work was discarded.

| Item | Evidence class and result | Remaining confirmation |
| --- | --- | --- |
| Hosting arrangement | Owner reports GitHub → Vercel, Cloudflare-managed domain | Account configuration inspection |
| Vercel project/repository | GitHub Vercel bot deployments/statuses in `mickverzola/mickverzola-website`; status links identify `mickverzola/mickverzola-website` project path | Connected repository setting, project ID and integration configuration not inspected |
| Production branch/automation | Merge to GitHub `main` at `df58ff754f8ddeea554509dc19e0a8616e42b0a9` followed by successful `Production`-labeled deployment 7039017944; submitted branch commit also has successful `Preview` deployment 7038622333 | This supports automation for these events; configured production branch, exclusions and future push behavior remain unverified |
| Root/framework/install/build/output | Source is static; no tracked Vercel config or build pipeline | All dashboard values and overrides unknown; no default values assumed |
| Preview access | Both pages on immutable preview and merged deployment URLs return 302 to Vercel SSO for unauthenticated curl | Exact protection policy and authorized reviewer access unknown |
| Domains | Apex publicly redirects 308 to `www`; canonical homepage/deck/CSS/script/images return 200 | Vercel domain assignments, active deployment mapping and certificate dashboard status unknown |
| Cloudflare DNS/proxy | Public DNS and response observations below support Cloudflare in the serving path | Dashboard record types/origin targets/TTL/proxy flags and redirect rules unknown |
| Rollback | Provider documentation describes rollback to a previous deployment | Project plan, permissions, eligible known-good target and UI availability unknown; no rollback executed |

Vercel settings at `https://vercel.com/mickverzola/mickverzola-website/settings` returned **307 to its auth-redirect path**, and `https://dash.cloudflare.com/` returned **403**, rechecked at 13:06 UTC. No authenticated browser surface or Vercel/Cloudflare connector was available; no account settings could be inspected. No credentials were requested, extracted or exposed.

Public DNS at approximately 13:03–13:07 UTC resolved apex and `www` to **104.21.66.42 / 172.67.200.184**; apex NS records were **ignacio.ns.cloudflare.com / karina.ns.cloudflare.com**. The public `www` CNAME query exposed no CNAME target (SOA response). Public responses contain `Server: cloudflare` and `cf-cache-status`, while canonical asset responses also expose `x-vercel-cache`. This supports a Cloudflare serving/proxy path; public edge addresses do not reveal Vercel origin targets or the configured proxy toggle. Do not copy these edge IPs into DNS configuration. The homepage response also rewrites email links and adds a Cloudflare decoder; its effective browser behavior needs #12 evidence.

### Preview and release evidence steps

1. For this baseline, inspect [GitHub Production deployment status](https://api.github.com/repos/mickverzola/mickverzola-website/deployments/7039017944/statuses) and [Vercel deployment details](https://vercel.com/mickverzola/mickverzola-website/68mCP4t5VvAVxEV5wru7wP4aKYZY). Metadata ties success to the merged SHA; it does not prove active custom-domain routing. GitHub's environment label is `Production`, but its separate `production_environment` flag is false.
2. The submitted SHA `88e23e3fc2dcea9bea6fe5a11e94a12c582b0331` preview is `https://mickverzola-website-ubwh84wdb-mickverzola.vercel.app`. The merged SHA deployment is `https://mickverzola-website-o6zjcuagm-mickverzola.vercel.app`. Open `/` and `/nonprofits.html` using an authorized reviewer session; record the actual access outcome. Do not disable protection to complete a check.
3. For a new PR, obtain its deployment URL and SHA from that PR's Vercel checks/deployment status, rather than assuming the old preview points to it. Use local preview instructions only as an alternative whose routing/auth differences are stated.
4. With browser access, capture the TDD follow-up viewport matrix, all slides and interactions, and a Network-panel loading baseline with cache/throttling conditions. Neither real-device checks nor emulation have been performed here.
5. After an owner-reviewed merge, verify Vercel's assigned production domains and active deployment SHA, then check `https://www.mickverzola.com/`, `/nonprofits.html` and assets in a browser. Apex redirects are part of the observed public path. Runtime file matches alone cannot identify a documentation-only deployment.

### Conditional recovery procedure

The current [Vercel rollback guide](https://vercel.com/docs/deployments/rollback-production-deployment), read on 2026-10-13, describes `vercel rollback <previous-deployment-url-or-id>` and `vercel rollback status`; rollback changes production routing without rebuilding. This is provider guidance, **not a verified available operation in this project**. Confirm authorized project access, plan restrictions and an eligible retained deployment before relying on it. The guide limits Hobby rollback to the immediately previous production deployment; other plans allow older targets. No CLI project link, account plan or rollback control was inspected, and no deployment is designated known-good from browser evidence.

If a bad release occurs, identify the affected deployment and an eligible verified target, use the confirmed project rollback control/command, verify completion, then check the canonical domain, apex redirect, deck and assets. Reconcile faulty source through a reviewed revert/fix PR before the next deployment. This investigation does not execute recovery or change any hosting setting.

### Follow-up disposition

[#12 — Complete browser and hosting evidence before release acceptance](https://github.com/mickverzola/mickverzola-website/issues/12) records the missing browser/device screenshots and interactions, browser network evidence, Vercel settings/domain mapping, Cloudflare dashboard DNS/proxy/transformations and project-specific rollback prerequisites. It remains open and blocks final release acceptance under #10; #7/#8 still need their runtime acceptance evidence and #9 needs comparable loading evidence. Issue #2 can close as a completed investigation with these named limitations and follow-up, without declaring the preview/release path fully confirmed.

## Publish a change

Follow the [workflow](workflow.md): branch, verify, preview, pull request and owner review before merge. Once the hosting configuration is confirmed, merging to its production branch should follow that recorded deployment path.

After the deployment finishes, compare its commit with the merged change and check:

- Homepage loads with CSS, the M mark, fonts or readable fallbacks, and all images.
- Tagline, accepted professional copy and employment history appear correctly.
- Rabbit Hole opens and closes; INFO reaches the timeline.
- Social destinations and email are correct in both desktop and mobile presentation.
- The deck's seven slides and controls work; new project links use actual destinations.

Use a fresh/private browser session if cached content makes the result unclear. Record the deployment URL/ID, commit and observed result in the PR or delivery note. No production release was performed by the documentation task.

## Diagnose common problems

| Symptom | Check first |
| --- | --- |
| Change is missing | Is the expected commit deployed to production, or only to a preview? Did deployment fail? Is the browser using cached content? |
| Whole site/domain is unavailable | Vercel deployment and domain status, then Cloudflare DNS/HTTPS configuration; compare the Vercel deployment URL with the custom domain |
| Images or styling missing | Browser Network panel for failed paths; filename case and deployed asset presence |
| Fonts look different | Google Fonts request and connectivity; source contains fallback font families |
| Dropdown behaves inconsistently | Browser console, `main.js` loading and the hover/JavaScript mismatch in R04 |
| Space does not advance the deck | Known R05; buttons and arrow handling are separate paths |
| An AI link fails | Verify the configured destination; diagnose that external project separately |

The web research tool's failure to retrieve this domain during review is not an outage report.

## Recover from a bad release

First identify the failing deployment and the last known-good one. Use the rollback option available in the project's Vercel account, following [Vercel's recovery guide](https://vercel.com/docs/deployments/rollback-production-deployment), then check the affected pages and the public domain. Project access and available rollback choices must be confirmed; a working rollback was not tested here.

Reconcile Git after restoring service so a later deployment does not reintroduce the problem. Revert the faulty source change through a branch and reviewed PR, or implement a focused correction. Avoid force-pushing or erasing history. With no application database, recovery concerns deployed files and hosting configuration rather than a data migration.

Git preserves committed source and images; uncommitted changes need their own protection. Keep a small record of verified deployment/DNS settings outside credentials. No automatic settings backup or restore drill exists in this repository.

## Occasional upkeep

Check content and links when experience changes or a project becomes publishable. Update desktop and mobile copies of social links together. Review the copyright year when editing the homepage. Recheck layout and image sizes when replacing photos. Inspect provider configuration when changing domain or hosting settings. No daily operating routine or monitoring service is required by the owner.
