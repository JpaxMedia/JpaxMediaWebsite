(() => {
  // The whole world as plain text: every stop on the road, downtown, and each room, in reading order.
  // For screen readers, for anyone who'd rather read, and for browsers that can't run the 3D (it opens on its own there).
  const btn = document.getElementById('text-btn'), box = document.getElementById('textv');
  if (!btn || !box) return;
  const body = box.querySelector('.textv-body'), close = box.querySelector('.textv-close');
  const W = window.JPAXWorld || {};
  const plain = h => String(h || '').replace(/<[^>]+>/g, '');
  const link = (label, href) => '<a href="' + href + '" target="_blank" rel="noopener">' + label + '</a>';
  const offerList = list => list && list.length ? '<ul class="textv-offers">' + list.map(o => '<li><span>' + o[0] + '</span><span>' + o[1] + '</span></li>').join('') + '</ul>' : '';

  function build() {
    const STOPS = W.STOPS || [];
    const C = window.JPAXCity || {};
    const SPOTS = (C.SPOTS || []).filter(s => !/^door-/.test(s.id)).concat(Object.values(C.DOORS || {}));
    const R = window.JPAXRooms || {}, ROOMS = R.ROOMS || {}, FILMS = R.FILMS || [];
    const roomNames = {};
    STOPS.forEach(s => { if (s.room) roomNames[s.room[0]] = s.eyebrow; });
    let h = '<h1 id="textv-title">The JPAX-verse, <em>as text.</em></h1>'
      + '<p class="textv-lede">Everything in the JPAX-verse, in the order you’d meet it: the road, downtown, then inside each building.</p>';

    h += '<h2>The road</h2>';
    STOPS.forEach((s, i) => {
      h += '<section><div class="eyebrow">Stop ' + (i + 1) + ' · ' + s.eyebrow + '</div><h3>' + plain(s.h) + '</h3><p>' + s.body + '</p>';
      if (s.julian) h += '<blockquote class="julian"><div class="eyebrow">From Julian</div>' + s.julian + '</blockquote>';
      if (s.calc && W.calcHTML) h += W.calcHTML(true);
      h += offerList(s.offers);
      if (s.note) h += '<p class="note">' + s.note + '</p>';
      if (s.quote) h += '<p class="quote">“' + s.quote + '”</p>';
      if (s.proof) h += '<p class="note">' + s.proof.text + (s.proof.src ? ' <small>(' + s.proof.src + ')</small>' : '') + '</p>';
      const links = [];
      if (s.primary && s.primary.href) links.push(link(s.primary.label, s.primary.href));
      if (s.link) links.push(link(s.link.label, s.link.href));
      if (links.length) h += '<p class="textv-links">' + links.join(' · ') + '</p>';
      h += '</section>';
    });

    if (SPOTS.length) {
      h += '<h2>Downtown</h2><p>Past the busy shop, a town of real work, one part per client: Southern Pavers at the north end, JPAX in the middle, 27 Birds to the south, and Apex Trophy Expeditions along the north cross street. Films play on the buildings, and each client has a door you can go through.</p>';
      SPOTS.forEach(s => {
        h += '<section><div class="eyebrow">' + s.eyebrow + '</div><h3>' + plain(s.h) + '</h3><p>' + s.body + '</p>'
          + (s.offers ? '<p class="note">' + s.offers + '</p>' : '') + (s.small ? '<p><small>' + s.small + '</small></p>' : '')
          + (s.link ? '<p class="textv-links">' + link(s.link[0], s.link[1]) + '</p>' : '') + '</section>';
      });
    }

    const ids = Object.keys(ROOMS);
    if (ids.length) {
      h += '<h2>Inside the buildings</h2>';
      ids.forEach(id => {
        const room = ROOMS[id];
        h += '<section class="textv-room"><h3>' + room.name + '</h3>' + (roomNames[id] ? '<div class="eyebrow">From the stop: ' + roomNames[id] + '</div>' : '');
        Object.values(room.spots).forEach(sp => {
          h += '<div class="textv-spot"><div class="eyebrow">' + sp.eyebrow + '</div><h4>' + plain(sp.h) + '</h4><p>' + sp.body + '</p>';
          if (sp.films) h += '<ul>' + FILMS.map(f => '<li>' + f.name + ' · ' + f.by + '</li>').join('') + '</ul>';
          h += offerList(sp.offers);
          if (sp.note) h += '<p class="note">' + sp.note + '</p>';
          if (sp.small) h += '<p><small>' + sp.small + '</small></p>';
          const links = [];
          if (sp.primary) links.push(link(sp.primary[0], sp.primary[1]));
          if (sp.link) links.push(link(sp.link[0], sp.link[1]));
          if (links.length) h += '<p class="textv-links">' + links.join(' · ') + '</p>';
          h += '</div>';
        });
        h += '</section>';
      });
    }

    h += '<footer class="textv-sign"><strong>JPAX Media LLC</strong><br>Julian Johnson, Founder<br>'
      + link('jpaxmedia.com', 'https://jpaxmedia.com') + ' · <a href="mailto:julian@jpaxmedia.com">julian@jpaxmedia.com</a> · (860) 494-3090<br>Greenville, South Carolina<br><em>There’s a better way.</em></footer>';
    body.innerHTML = h;
    if (W.bindCalc) W.bindCalc(body);
  }

  let back = null;
  function open() {
    build();
    back = document.activeElement;
    box.hidden = false; document.body.classList.add('reading');
    btn.setAttribute('aria-expanded', 'true');
    body.scrollTop = 0; close.focus();
  }
  function shut() {
    box.hidden = true; document.body.classList.remove('reading');
    btn.setAttribute('aria-expanded', 'false');
    if (back && back.focus) back.focus();
  }
  btn.addEventListener('click', () => (box.hidden ? open() : shut()));
  close.addEventListener('click', shut);
  // keys typed while reading stay here: arrows scroll the text instead of driving the road
  box.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Escape' && !close.hidden) shut();
    if (e.key !== 'Tab') return;
    // Tab stays inside the text version while it's open
    const f = [...box.querySelectorAll('button:not([hidden]), a[href], input, summary')].filter(el => el.offsetParent);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  box.addEventListener('wheel', e => e.stopPropagation(), { passive: true });

  if (W.noGL) { open(); close.hidden = true; }
})();
