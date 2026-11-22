# mickverzola.com

Mick Verzola's personal site. One page: a field of dust that starts as turbulence and
settles into shapes as you scroll (the M mark, a portrait, three small diagrams, three years,
a horizon).

It is a static site with no build step and no dependencies. Vercel deploys the repository
as it is, and `mickverzola.com` points at it.

## Files

| File | What it is |
| --- | --- |
| `index.html` | All content: the tagline, about, experience, contact links. Readable with JavaScript off. |
| `styles.css` | Layout and type for all three modes (live, motion off, plain); the comment at the top lists them. |
| `main.js` | The dust: a WebGL2 particle simulation, written by hand. The comment at the top explains how it works. |
| `favicon.svg` | The M mark; dark on light tabs, light on dark tabs. |
| `images/portrait-*.jpg` | The portrait at four widths. `main.js` samples `portrait-800.jpg` into dust. |
| `images/og.jpg` | The 1200×630 picture shown when the link is shared. |

## Run it locally

Any static file server works. From this folder, in PowerShell or Git Bash:

```
python -m http.server 8137 --bind 127.0.0.1
```

Then open http://127.0.0.1:8137/. Opening `index.html` straight from disk may show the still
page only, because browsers restrict module scripts and image reads on `file://`.

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
