# Mick Verzola — personal portfolio

A simple personal portfolio and gateway to side projects at [mickverzola.com](https://mickverzola.com). It introduces Mick, shares an employment timeline, links to social profiles and personal projects, and includes a sample presentation produced with his local AI stack.

The intended audience includes recruiters and potential employers. A future content overhaul should leave visitors with the impression that Mick is multi-skilled, with current people leadership at Netflix and practical side projects as supporting evidence. Preserve the tagline, M logo, color scheme and social links.

## Run locally

Open `index.html` in a browser for a basic preview. There is no installation or build step. For an HTTP preview, with Python 3 installed, run from the repository root:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Visit `http://127.0.0.1:8000/` and `http://127.0.0.1:8000/nonprofits.html`. Stop the server with Ctrl+C. This command serves the whole working directory; use it locally only.

## Source

| File | Purpose |
| --- | --- |
| [index.html](index.html) | Portfolio content, navigation, logo and social links |
| [styles.css](styles.css) | Homepage palette, layout, typography and responsive behavior |
| [main.js](main.js) | Rabbit Hole dropdown behavior |
| [nonprofits.html](nonprofits.html) | Self-contained seven-slide AI presentation |
| `images/000.jpg`–`004.jpg` | Hero and four gallery placeholders |

The site uses plain HTML, CSS and browser JavaScript. Google Fonts supplies the homepage fonts. There is no application backend, database, package manifest or build pipeline in this repository.

## Documentation

- [Documentation guide](docs/README.md)
- [Product requirements](docs/prd.md)
- [Technical design and repository review](docs/tdd.md)
- [Development workflow](docs/workflow.md)
- [Backlog](docs/backlog.md)
- [Portfolio v1 delivery plan](docs/delivery-plan.md)
- [Operations](docs/operations.md)
- [Architecture decision records](docs/adr/README.md)

## Hosting and status

The GitHub source repository is private; its visibility was changed at the owner's request and verified through GitHub on 2026-10-13.

The owner reports GitHub → Vercel deployment with the domain managed through Cloudflare. Issue #2 observed successful Vercel deployment metadata for the merged baseline, an apex redirect to `www`, and HTTP 200 responses for the canonical homepage/deck/assets. Account settings, configured production branch and browser behavior still need confirmation; see [operations findings](docs/operations.md#issue-2-hosting-investigation--2026-10-13).

The original 2026-10-13 review used source commit `0dea6ca`; the published baseline uses runtime base `1121b62`, which removed the GenMedia link. PR #11 merged at `df58ff754f8ddeea554509dc19e0a8616e42b0a9`. The overhaul and review fixes remain backlog work. Earlier source checks found valid JavaScript syntax and intact local page references, plus accessibility and image-size issues. Issue #2 adds measured HTTP image transfers; browser/device behavior and the custom domain's active deployment SHA remain unverified. See the [investigation evidence](docs/tdd.md#issue-2-investigation--2026-10-13) and open [follow-up #12](https://github.com/mickverzola/mickverzola-website/issues/12).
