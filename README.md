# mickverzola.com

Mick Verzola's personal site: one interactive page plus a blog. The page is a field of dust that starts as turbulence and
settles into shapes as you scroll (the M mark, a portrait, three small diagrams, three years,
a horizon).

It is a static site with no build step and no dependencies. Vercel deploys the repository
as it is, and `mickverzola.com` points at it.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The homepage content: the tagline, about, experience, contact links. Readable with JavaScript off. |
| `styles.css` | Layout and type for all three modes (live, motion off, plain); the comment at the top lists them. |
| `main.js` | The dust: a WebGL2 particle simulation, written by hand. The comment at the top explains how it works. |
| `favicon.svg` | The M mark; dark on light tabs, light on dark tabs. |
| `images/portrait-*.jpg` | The portrait at four widths. `main.js` samples `portrait-800.jpg` into dust. |
| `images/og.jpg` | The 1200×630 picture shown when the link is shared. |
| `blog/index.html` | The blog's list of posts, newest first. "Read my blog" on the homepage opens it. |
| `blog/<slug>/index.html` | One post per folder, so its address is `/blog/<slug>/`. |
| `blog/blog.css` | Look of the list and the posts. Same palette and fonts as `styles.css`, no dust. |
| `blog/blog.js` | Builds each post's "On this page" list from its `h2`/`h3` headings. Posts read fine without it. |
| `blog/_template.html` | The page to copy for a new post. Kept off the live site by `.vercelignore`. |

## Run it locally

Any static file server works. From this folder, in PowerShell or Git Bash:

```
python -m http.server 8137 --bind 127.0.0.1
```

Then open http://127.0.0.1:8137/. Opening `index.html` straight from disk may show the still
page only, because browsers restrict module scripts and image reads on `file://`.
The blog needs the server too: its links start with `/`, which only work when served.

## Things worth knowing

- **Motion is optional.** The switch at the bottom right turns motion off and on, and the
  choice is remembered. If the system asks for reduced motion, the site starts with motion off.
- **Motion off is still the dust.** A second, short-lived engine with more grains settles each
  scene once and hangs a still frame of it behind that section. Nothing moves after that.
- **Plain page.** With no WebGL2 or no JavaScript, visitors get an ordinary page with the photo
  and the logo.
- **Scenes are data.** `SCENES` in `main.js` lists each scene's settings in page order, matched
  to the `data-scene` attributes in `index.html`. `layout()` says where each shape sits, and
  uses the same 9/10 aspect threshold as the stacked layout in `styles.css`.
- **Changing the words is safe.** The text lives only in `index.html`. Changing a year means
  changing it in the HTML and in the `['2018', '2023', '2024']` list in `main.js`.
- **Quality adapts.** If frames run long, the field sheds grains, then resolution. It checks
  that a step actually helped before keeping it.
- **Test hooks.** `?plates` starts with motion off. `?still` forces the plain page. `?n=60000` sets the grain count. `?debug`
  exposes `window.__field` with `stats()` and `step(frames)` for stepping the simulation by hand.

## Add a blog post

1. Pick a short address for it, in lowercase with dashes, for example `my-new-post`.
2. Copy `blog/_template.html` to `blog/my-new-post/index.html`.
3. In the copy, replace every capitalized placeholder: `POST TITLE`, `ONE-LINE SUMMARY`,
   `POST-SLUG` (the address from step 1), `YYYY-MM-DD`, `Mon D, YYYY` and `READ-MINUTES`
   (about one minute per 230 words). Then delete the comment at the top of the file.
4. Replace the sample sections ("First section", "Second section") with the post. The comment
   above them lists the pieces you can use: sections, a lead paragraph, figures, status pills.
   Delete that comment when done.
5. In `blog/index.html`, copy the `<li>` of the newest post, paste it at the top of the list
   and change its link, date (twice), title and summary.
6. Check it on the local server (see "Run it locally"): open http://127.0.0.1:8137/blog/.

Links inside the blog start with `/` (for example `/blog/blog.css`), so pages work at any depth.
