// mickverzola.com blog: builds "On this page" from the post's h2/h3 headings and marks
// the section being read. Posts read fine without it; the list just stays hidden.

const toc = document.querySelector('.toc');
const prose = document.querySelector('.prose');

if (toc && prose) {
  const heads = [...prose.querySelectorAll('h2, h3')];
  const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // Ids already on the page (the logo symbol, main, ...) are taken; a clash gets -2, -3.
  const taken = new Set([...document.querySelectorAll('[id]')].map(el => el.id));
  const unique = (base, i) => {
    let id = base || `section-${i + 1}`, n = 2;
    while (taken.has(id)) id = `${base || `section-${i + 1}`}-${n++}`;
    taken.add(id);
    return id;
  };
  const list = toc.querySelector('ol');
  const links = new Map();

  heads.forEach((h, i) => {
    if (!h.id) h.id = unique(slug(h.textContent), i);
    const li = document.createElement('li');
    if (h.tagName === 'H3') li.className = 'sub';
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.dataset.toc || h.textContent;
    li.append(a);
    list.append(li);
    links.set(h, a);
  });

  if (heads.length > 2) {
    toc.hidden = false;
    const details = toc.querySelector('details');
    const wide = matchMedia('(min-width: 961px)');
    const sync = () => { details.open = wide.matches; };
    sync();
    wide.addEventListener('change', sync);
    // On narrow screens, fold the list away again after a jump.
    list.addEventListener('click', e => { if (e.target.closest('a') && !wide.matches) details.open = false; });

    // The current section is the last heading that has scrolled past the top third.
    let current = null;
    const mark = () => {
      const line = innerHeight * 0.33;
      let pick = heads[0];
      for (const h of heads) {
        if (h.getBoundingClientRect().top <= line) pick = h; else break;
      }
      if (pick === current) return;
      if (current) links.get(current).removeAttribute('aria-current');
      const a = links.get(pick);
      a.setAttribute('aria-current', 'true');
      current = pick;
      // Keep the marked entry visible when the list is taller than its box (scrolls the list, not the page).
      if (wide.matches && details.scrollHeight > details.clientHeight) {
        details.scrollTop = a.offsetTop - details.clientHeight / 2;
      }
    };
    let queued = false;
    addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; mark(); });
    }, { passive: true });
    mark();
  }
}
