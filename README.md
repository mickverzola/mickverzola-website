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

The owner reports GitHub → Vercel deployment with the domain managed through Cloudflare. Automatic deployment is believed to be enabled; the production branch and project settings still need confirmation. The local default branch is `main`, which does not prove Vercel's production configuration.

The 2026-10-13 review documented the existing site and owner interview at source commit `0dea6ca`. This documentation branch starts from `1121b62`, which subsequently removed the GenMedia link; see the [source baseline](docs/tdd.md#source-baseline). The overhaul and review fixes are backlog work. Earlier source checks found valid JavaScript syntax and intact local page references, plus accessibility and image-size issues. Browser, device and production behavior were not verified; see the [review evidence](docs/tdd.md#review-findings-and-verification).
