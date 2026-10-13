# Operations guide

Updated: 2026-10-13. Operator and sole maintainer: Mick Verzola.

## Operating model

The GitHub source repository is private, verified on 2026-10-13 after the owner requested the visibility change. This changes source access; no website access or Vercel settings were changed by that action.

The owner reports that [mickverzola.com](https://mickverzola.com) is deployed from GitHub through Vercel, with the domain managed by Cloudflare. Automatic deployment is believed to occur after GitHub pushes. Account settings, production branch and successful live behavior were not independently verified in this review.

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
