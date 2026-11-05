(() => {
  // Downtown on foot. The streets come from blender/city.py (models/city-*.model.json, models/city.json);
  // this file borrows the scene from world.js and drives the camera while you walk.
  const W = window.JPAXWorld;
  // walk up to a feature building and its story comes up
  const SPOTS = [
    { id: 'cinema-screen', r: 15, eyebrow: 'Brand Studio · Video Studio', h: 'Tonight’s program: <em>client films.</em>',
      body: 'On the big screen: the JPAX brand film, then a walkthrough of the outdoor builder I made for Southern Pavers, then 27 Birds playing “Train Train” live. In the display cases: edited and drone work for Southern Pavers. Inside, a screen where you choose what plays.',
      offers: 'Edited from $1,200 · Animated from $2,500 · Filmed from $3,500', room: ['cinema', 'Step inside and pick a film'], link: ['See the Video Studio', 'https://jpaxmedia.com/video-studio'] },
    { id: 'yard-ad', r: 14, eyebrow: 'Client work · Southern Pavers', h: 'One video. <em>58 conversations.</em>',
      body: '“3 Mistakes”: a video I planned, scripted, shot, and still run. $8.15 in ad spend per conversation, under $500 in total.',
      small: 'Meta figures through Sept 25, 2026. Customer outcomes reported by Southern Pavers.', link: ['Read the Southern Pavers story', 'https://jpaxmedia.com/work/southern-pavers'] },
    { id: 'venue-window', r: 12, eyebrow: 'Client work · 27 Birds', h: 'Now booking <em>house parties.</em>',
      body: 'A Facebook campaign I shot, cut, and run for the band. It sends people to a website and lead system I built and still manage. In the front window, songs I filmed at their shows; on the walls, my photos from the same nights.',
      small: 'Results reported by 27 Birds. Exact numbers kept private at the band’s request.', offers: 'Campaigns from $1,500/mo plus ad spend',
      link: ['Visit 27birdsband.com', 'https://27birdsband.com'] },
    { id: 'gate-north', r: 15, eyebrow: 'Downtown · how it’s laid out', h: 'Southern Pavers starts <em>here.</em>',
      body: 'This first block is Southern Pavers: the patio visualizer explained on the arch, the website I built them on the wall, “3 Mistakes” over the paver yard, their own job footage cut down, my drone over their work, and a showroom you can walk into. The first cross street is Apex Trophy Expeditions: a film of the website I built at one end, the booking system I’m building at the other, and their lodge. The middle block is mine: the studio, the cinema, the shops where the Ops Audit and the System live. Past the second cross street, it’s 27 Birds and their venue.',
      small: 'Ember Coffee is a sample, not a client. The Jupiter tour runs on phantom clients and example data.',
      offers: 'Edited from $1,200 · Animated from $2,500 · Filmed from $3,500', link: ['See the Video Studio', 'https://jpaxmedia.com/video-studio'] },
    { id: 'bb-party', r: 11, eyebrow: 'Client work · 27 Birds', h: 'A house-party ad, <em>shot and cut by me.</em>',
      body: 'Another cut from the “Now booking house parties” campaign I run for the band. Down by the venue: an animated short I made for them, and songs I filmed at their shows.',
      small: 'Results reported by 27 Birds. Exact numbers kept private at the band’s request.', offers: 'Campaigns from $1,500/mo plus ad spend',
      link: ['Visit 27birdsband.com', 'https://27birdsband.com'] },
    { id: 'bb-lostdog', r: 11, eyebrow: 'Client work · 27 Birds', h: 'An unplugged night, <em>promoted.</em>',
      body: 'A promo I made for the band’s unplugged show at The Lost Dog in Shelby, NC: a bulldog, a 27 Birds frisbee, and the date on the last card.',
      offers: 'Edited from $1,200 · Animated from $2,500 · Filmed from $3,500', link: ['Visit 27birdsband.com', 'https://27birdsband.com'] }

  ];
  SPOTS.push({ id: 'bb-spsite', r: 10, eyebrow: 'Client work · Southern Pavers', h: 'The website, <em>whole.</em>',
    body: 'The Southern Pavers site I designed and built: fast on a phone, a free estimate one tap away, and the patio visualizer built in. My tracking has counted 1,706 visitors.',
    offers: 'Website creation from $3,500 · Web management from $400/mo', link: ['Visit southernpaversscpro.com', 'https://southernpaversscpro.com'] });
  // the doors you can go through, by room. Each client has its own part of town.
  const DOORS = {
    pavers: { eyebrow: 'Client · Southern Pavers', h: 'The Southern Pavers showroom. <em>Come in.</em>',
      body: 'Southern Pavers builds patios in the Upstate, and this end of town is theirs. Inside: the visualizer explainer, “3 Mistakes,” the films from their jobs, and what the ad brought in.',
      room: ['pavers', 'Step inside'], link: ['Read the Southern Pavers story', 'https://jpaxmedia.com/work/southern-pavers'] },
    birds: { eyebrow: 'Client · 27 Birds', h: 'The band’s room. <em>Doors are open.</em>',
      body: 'The south end of town belongs to 27 Birds. Inside: the stage, songs I filmed at their shows on the big screen, my photos on the walls, and the house-party campaign I run for them.',
      small: 'Results reported by 27 Birds. Exact numbers kept private at the band’s request.', room: ['birds', 'Step inside'],
      link: ['Visit 27birdsband.com', 'https://27birdsband.com'] },
    apex: { eyebrow: 'Client · Apex Trophy Expeditions', h: 'Trips worth <em>crossing the world for.</em>',
      body: 'Apex is a booking agency for hunting and big-game fishing: muskox and caribou in West Greenland, yellowfin and swordfish in the Gulf of Mexico. I designed and built their website, and I’m building their booking system: one place for every inquiry, client and outfitter. The films at each end of the street show both. This street is theirs.',
      offers: 'Website creation from $3,500', room: ['apex', 'Step into the lodge'], link: ['Visit apextrophyexpeditions.com', 'https://apextrophyexpeditions.com'] },
    studio: { eyebrow: 'JPAX · The studio', h: 'Where the films <em>get cut.</em>',
      body: 'My desk, the monitors, the camera kit, and 27 Birds on the TV. The middle of town is JPAX: the cinema, and a door for each thing I do.',
      room: ['studio', 'Step inside'] },
    cabin: { eyebrow: 'JPAX · Ops Audit', h: 'Two weeks on your phone line. <em>$2,000 flat.</em>',
      body: 'Inside: a phone wired to a laptop, the explainer on the big screen, and a report card built from your own numbers.', room: ['cabin', 'Step inside'] },
    hall: { eyebrow: 'JPAX · Systems', h: 'The install, <em>handed over.</em>',
      body: 'Inside: the one dashboard the install hands you, the monthly scorecard, and the seat.', small: 'The screens inside show example figures.',
      offers: 'System Install from $12,000 · Operating Partner from $1,500/mo', room: ['hall', 'Step inside'] },
    storefront: { eyebrow: 'JPAX · Websites', h: 'Every site I’ve built, <em>live.</em>',
      body: 'Inside: Southern Pavers, 27 Birds, Apex, Anthony D’Antonio’s music hub, Bats Reacts and jpaxmedia.com, plus how a website build works.',
      offers: 'Website creation from $3,500 · Web management from $400/mo', room: ['storefront', 'Step inside'] },
    cinema: { eyebrow: 'Brand Studio · Video Studio', h: 'The cinema. <em>Pick a film.</em>',
      body: 'Nineteen films inside: Southern Pavers, 27 Birds, Apex Trophy Expeditions, the Video Studio’s own, a Jupiter tour and Ember Coffee, a sample.',
      offers: 'Edited from $1,200 · Animated from $2,500 · Filmed from $3,500', room: ['cinema', 'Step inside'] },
    workshop: { eyebrow: 'JPAX · Custom apps', h: 'The apps I’ve built, <em>running.</em>',
      body: 'Inside: the Southern Pavers patio visualizer, the Apex booking system I’m building, Jupiter, and how a custom app build works.',
      offers: 'Custom app builds from $8,000', room: ['workshop', 'Step inside'] },
    jupiter: { eyebrow: 'Jupiter', h: 'I run JPAX on <em>my own system.</em>',
      body: 'Step into the planetarium: Jupiter in the middle, every client in orbit around it, and the screens that show how it works, with Nova drafting and me approving.',
      small: 'Shown on phantom clients and example data.', room: ['jupiter', 'Step into the planetarium'], link: ['See Jupiter', 'https://jpaxmedia.com/jupiter'] }
  };
  if (W && W.noGL) window.JPAXCity = { SPOTS, DOORS };
  if (!W || W.noGL) return;
  const { THREE, scene, camera, canvas } = W;
  const EYE = 1.72, RADIUS = 0.35, WALK = 3.4, RUN = 6.8;

  const root = new THREE.Group();
  root.position.set(W.CITY.x, 0, W.CITY.z);
  scene.add(root);

  const el = id => document.getElementById(id);
  const hud = { back: el('walk-back'), map: el('walk-map'), hint: el('walk-hint'), stick: el('walk-stick'), load: el('walk-load'), fade: el('fade') };
  const coarse = matchMedia('(pointer: coarse)').matches;
  if (coarse) {
    document.body.classList.add('coarse');
    hud.hint.textContent = 'Left thumb to walk · drag to look';
  }

  // ---------- loading ----------
  let meta = null, loading = null;
  function load() {
    if (loading) return loading;
    const part = i => new Promise(res => W.loadModel('city-' + i, m => { root.add(m.scene); res(); }, res));
    loading = Promise.all([fetch('models/city.json').then(r => r.json()), part(0), part(1), part(2)])
      .then(([m]) => { meta = m; build(); });
    return loading;
  }

  // ---------- the work on show: films, marquees, plaques ----------
  const screens = [];
  const texLoader = new THREE.TextureLoader();
  function canvasPlane(w, h, px, draw) {
    const c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * h / w);
    draw(c.getContext('2d'), c.width, c.height);
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
  }
  function place(m, pos, ry, dz) {
    m.position.set(pos[0] + Math.sin(ry) * (dz || 0), pos[1], pos[2] + Math.cos(ry) * (dz || 0));
    m.rotation.y = ry; root.add(m); return m;
  }
  // one texture per picture, however many windows and walls show it
  const texCache = {};
  const tex = src => texCache[src] || (texCache[src] = new Promise(res => texLoader.load(src, res)));
  function addScreen(s) {
    // the back of a two-sided screen shares the front's film
    const twin = s.twin && screens.find(sc => sc.s.id === s.twin);
    const mat = twin ? twin.mesh.material : new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: !!s.alpha });
    if (!twin) tex(s.poster).then(t => { if (!mat.map || !mat.map.isVideoTexture) { mat.map = t; mat.needsUpdate = true; } });
    const mesh = place(new THREE.Mesh(new THREE.PlaneGeometry(s.size[0], s.size[1]), mat), s.pos, s.ry);
    if (s.label && s.id !== 'cinema-screen') {
      // labels grow with the screen so the ones up on roofs still read from the street
      const lw = Math.max(1.4, s.size[0] + 0.3), lh = Math.max(0.2, Math.min(0.5, s.size[1] * 0.065));
      place(canvasPlane(lw, lh, lw / lh > 14 ? 1024 : 512, (x, w, h) => {
        x.fillStyle = 'rgba(12,11,10,.85)'; x.fillRect(0, 0, w, h);
        x.fillStyle = '#ECE6DA'; x.font = '600 ' + Math.round(h * 0.5) + 'px "Hanken Grotesk", Arial, sans-serif';
        x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s.label, w / 2, h / 2 + 1);
      }), [s.pos[0], s.pos[1] - s.size[1] / 2 - lh / 2 - 0.12, s.pos[2]], s.ry, 0.02);
    }
    if (twin || (!s.video && !s.playlist)) return;   // a twin, or a still photo
    const v = document.createElement('video');
    Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'none' });
    v.setAttribute('playsinline', ''); v.src = s.video || s.playlist[0];
    // a playlist plays each clip through, then the next
    if (s.playlist) {
      let at = 0;
      v.loop = false;
      v.addEventListener('ended', () => { at = (at + 1) % s.playlist.length; v.src = s.playlist[at]; v.play().catch(() => {}); });
    }
    // the cinema's big screen runs a program: the brand film for a little while, then the
    // Southern Pavers outdoor builder walkthrough all the way through, then 27 Birds live, then around again
    if (s.id === 'cinema-screen') {
      const program = [s.video, 'media/sp-builder-loop.mp4', 'media/b27-traintrain-loop.mp4'];
      let at = 0, shown = 0;
      v.loop = false;
      v.addEventListener('ended', () => {
        shown += v.duration || 0;
        if (at === 0 && shown < 20) { v.currentTime = 0; v.play().catch(() => {}); return; }
        at = (at + 1) % program.length; shown = 0;
        v.src = program[at]; v.play().catch(() => {});
      });
    }
    const vtex = new THREE.VideoTexture(v);
    v.addEventListener('playing', () => { mat.map = vtex; mat.needsUpdate = true; }, { once: true });
    screens.push({ s, mesh, v, on: false });
  }
  // lamp-post banners: the district you're standing in, in its client's colours. One canvas per kind, both faces.
  const BODY_FONT = '"Hanken Grotesk", Arial, sans-serif', DISPLAY_FONT = 'Fraunces, Georgia, serif';
  const bannerGeo = new THREE.PlaneGeometry(0.62, 1.32);
  const BANNER = {
    sp: ['#13213a', '#ffffff', 'SOUTHERN', 'PAVERS', 'Upstate SC', '700', BODY_FONT],
    b27: ['#2a1216', '#f0c987', '27', 'BIRDS', 'Live band', '700', BODY_FONT],
    apex: ['#0d1716', '#d4a64f', 'APEX', '', 'Trophy Expeditions', '500', DISPLAY_FONT],
    jpax: ['#161310', '#ECE6DA', 'JPAX', '', 'There’s a better way.', '400', DISPLAY_FONT]
  };
  const bannerMat = {};
  function addBanner(b) {
    const spec = BANNER[b.kind]; if (!spec) return;
    if (!bannerMat[b.kind]) {
      const [bg, fg, l1, l2, sub, wt, font] = spec;
      const c = document.createElement('canvas'); c.width = 240; c.height = 512;
      const x = c.getContext('2d');
      x.fillStyle = bg; x.fillRect(0, 0, 240, 512);
      x.fillStyle = fg; x.globalAlpha = 0.5; x.fillRect(20, 26, 200, 3); x.fillRect(20, 483, 200, 3); x.globalAlpha = 1;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      const size = l2 ? (l1.length > 4 ? 44 : 96) : 70;
      x.font = wt + ' ' + size + 'px ' + font;
      if ('letterSpacing' in x) x.letterSpacing = (l1.length > 4 ? 2 : 4) + 'px';
      x.fillText(l1, 120, l2 ? 200 : 230);
      if (l2) { x.font = wt + ' ' + (l1.length > 4 ? 44 : 50) + 'px ' + font; x.fillText(l2, 120, l1.length > 4 ? 255 : 285); }
      if ('letterSpacing' in x) x.letterSpacing = '1px';
      x.font = '500 19px ' + BODY_FONT; x.globalAlpha = 0.8; x.fillText(sub, 120, 410); x.globalAlpha = 1;
      const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
      bannerMat[b.kind] = new THREE.MeshBasicMaterial({ map: t });
    }
    for (const turn of [0, Math.PI]) {
      const m = new THREE.Mesh(bannerGeo, bannerMat[b.kind]);
      m.position.fromArray(b.pos); m.rotation.y = b.ry + turn; root.add(m);
    }
  }

  // every way in is marked: a lit ENTER blade beside the door that reads from down the street,
  // and a warm pool of light on the sidewalk. Walk into the doorway and you're inside.
  const DOOR_NAME = { pavers: 'Southern Pavers', storefront: 'JPAX · Websites', workshop: 'JPAX · Custom apps', cabin: 'JPAX · Ops Audit',
    studio: 'JPAX · The studio', hall: 'JPAX · Systems', apex: 'Apex · the lodge', birds: '27 Birds', cinema: 'The cinema', jupiter: 'The planetarium' };
  const doorMarks = [];
  let poolTex = null;
  function addDoorMark(d) {
    if (!d.sign || !d.face) return;
    const name = DOOR_NAME[d.room] || '';
    const sign = canvasPlane(1.25, 0.62, 512, (x, w, h) => {
      x.fillStyle = '#161310'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#f2e2c0'; x.lineWidth = 6; x.strokeRect(5, 5, w - 10, h - 10);
      x.fillStyle = '#ECE6DA'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = '700 ' + Math.round(h * 0.36) + 'px "Hanken Grotesk", Arial, sans-serif';
      if ('letterSpacing' in x) x.letterSpacing = Math.round(h * 0.08) + 'px';
      x.fillText('ENTER', w / 2 + h * 0.04, h * 0.42);
      if ('letterSpacing' in x) x.letterSpacing = '1px';
      x.font = '500 ' + Math.round(h * 0.15) + 'px "Hanken Grotesk", Arial, sans-serif'; x.fillStyle = '#A79E90';
      x.fillText(name, w / 2, h * 0.76);
    });
    for (const turn of [Math.PI / 2, -Math.PI / 2]) {
      const m = turn > 0 ? sign : sign.clone();
      place(m, d.sign, d.ry + turn, 0); m.position.y = d.sign[1];
    }
    // the bracket the blade hangs from
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.0), new THREE.MeshBasicMaterial({ color: 0x1c1a18 }));
    arm.position.set(d.sign[0] - Math.sin(d.ry) * 0.4, d.sign[1] + 0.34, d.sign[2] - Math.cos(d.ry) * 0.4); arm.rotation.y = d.ry; root.add(arm);
    if (!poolTex) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(246,226,188,.75)'); g.addColorStop(0.55, 'rgba(246,226,188,.25)'); g.addColorStop(1, 'rgba(246,226,188,0)');
      x.fillStyle = g; x.fillRect(0, 0, 128, 128); poolTex = new THREE.CanvasTexture(c);
    }
    const wide = d.wide || 1.6;
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(wide + 1.2, 2.4), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    pool.rotation.set(-Math.PI / 2, d.ry, 0, 'YXZ');
    pool.position.set(d.face[0] + Math.sin(d.ry) * 1.0, (d.y0 || 0) + 0.2, d.face[1] + Math.cos(d.ry) * 1.0); root.add(pool);
    doorMarks.push({ d, pool, ph: Math.random() * 6 });
  }
  let doorArmed = true;
  function doorWalk(time, forward) {
    let near = 1e9;
    for (const m of doorMarks) {
      m.pool.material.opacity = W.reduce ? 0.8 : 0.65 + Math.sin(time * 2.2 + m.ph) * 0.25;
      const d = m.d, dist = Math.hypot(me.x - d.face[0], me.z - d.face[1]);
      near = Math.min(near, dist);
      if (doorArmed && forward && dist < (d.wide || 1.5) / 2 + 0.3 && window.JPAXRooms && !W.inside) {
        doorArmed = false;
        window.JPAXRooms.enter(d.room, { city: true });
      }
    }
    if (!doorArmed && near > 2.6) doorArmed = true;
  }

  // string lights: a sagging wire between two fronts with warm bulbs every metre, all in two draw calls
  function addStrings(list) {
    const wire = [], bulbs = [];
    for (const [x0, y0, z0, x1, y1, z1] of list) {
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(8, Math.round(len / 0.9)), sag = len * 0.05;
      let prev = null;
      for (let i = 0; i <= n; i++) {
        const t = i / n, p = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - sag * 4 * t * (1 - t), z0 + (z1 - z0) * t];
        if (prev) wire.push(...prev, ...p);
        if (i > 0 && i < n) bulbs.push(p[0], p[1] - 0.12, p[2]);
        prev = p;
      }
    }
    const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wire, 3));
    root.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: 0x1a1714 })));
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,246,224,1)'); g.addColorStop(0.18, 'rgba(255,226,170,.95)');
    g.addColorStop(0.45, 'rgba(242,190,120,.28)'); g.addColorStop(1, 'rgba(242,190,120,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(bulbs, 3));
    root.add(new THREE.Points(bg, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(c), size: 0.55, sizeAttenuation: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  }
  function marquee(text) {
    return (x, w, h) => {
      x.fillStyle = '#efe4cc'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#1a1512'; x.font = '700 ' + Math.round(h * 0.56) + 'px "Hanken Grotesk", Arial, sans-serif';
      if ('letterSpacing' in x) x.letterSpacing = Math.round(h * 0.12) + 'px';
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 2);
    };
  }
  function plaque(eyebrow, title, em, body, small) {
    return (x, w, h) => {
      const pad = w * 0.07;
      x.fillStyle = '#161310'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#2A2622'; x.lineWidth = 4; x.strokeRect(2, 2, w - 4, h - 4);
      x.textAlign = 'left'; x.textBaseline = 'alphabetic';
      x.fillStyle = '#A79E90'; x.font = '600 ' + Math.round(w * 0.026) + 'px "Hanken Grotesk", Arial, sans-serif';
      if ('letterSpacing' in x) x.letterSpacing = '4px';
      x.fillText(eyebrow, pad, pad + w * 0.03);
      if ('letterSpacing' in x) x.letterSpacing = '0px';
      let y = pad + w * 0.11;
      x.font = '300 ' + Math.round(w * 0.062) + 'px Fraunces, Georgia, serif'; x.fillStyle = '#ECE6DA';
      x.fillText(title, pad, y);
      const tw = x.measureText(title + ' ').width;
      x.font = 'italic 300 ' + Math.round(w * 0.062) + 'px Fraunces, Georgia, serif'; x.fillStyle = '#8BE8A6';
      if (pad + tw + x.measureText(em).width < w - pad) x.fillText(em, pad + tw, y); else { y += w * 0.075; x.fillText(em, pad, y); }
      x.font = '400 ' + Math.round(w * 0.031) + 'px "Hanken Grotesk", Arial, sans-serif'; x.fillStyle = '#A79E90';
      y += w * 0.07;
      for (const line of wrap(x, body, w - pad * 2)) { x.fillText(line, pad, y); y += w * 0.044; }
      if (small) { x.font = '400 ' + Math.round(w * 0.024) + 'px "Hanken Grotesk", Arial, sans-serif'; x.fillStyle = '#6F675D'; x.fillText(small, pad, h - pad * 0.8); }
    };
  }
  function wrap(x, text, max) {
    const out = []; let line = '';
    for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > max && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line); return out;
  }
  const BOARDS = {
    cinema: marquee('VIDEO STUDIO  ·  SEND THE IDEA. GET THE FILM.'),
    venue: marquee('27 BIRDS  ·  NOW BOOKING HOUSE PARTIES'),
    yard: plaque('JPAX CLIENT WORK', 'One video.', '58 conversations.', 'Southern Pavers “3 Mistakes”: planned, scripted, shot and run by JPAX. $8.15 per conversation, under $500 in ad spend.', 'Meta figures through Sept 25, 2026'),
    jupiter: plaque('JUPITER', 'I run JPAX on', 'my own system.', 'My private operations cockpit. Every install runs on the same infrastructure.', '')
  };
  function addBoard(b) {
    const draw = BOARDS[b.kind]; if (!draw) return;
    const wide = b.size[0] / b.size[1] > 4;
    place(canvasPlane(b.size[0], b.size[1], wide ? 2048 : 900, draw), b.pos, b.ry, 0.015);
  }

  // the planetarium's marquee: a big lit sign across the front of the drum, over the door, that reads from
  // Main Street. It sits in front of the small baked JUPITER fascia (blender/city.py, observatory()) and covers it
  function jupiterMarquee() {
    const W0 = 10.4, H0 = 2.5, top = 3.0, doorZ = -140.5 + 8.05;
    const m = canvasPlane(W0, H0, 2048, (x, w, h) => {
      const r = h * 0.09;
      x.beginPath(); x.moveTo(r, 6); x.arcTo(w - 6, 6, w - 6, h - 6, r); x.arcTo(w - 6, h - 6, 6, h - 6, r); x.arcTo(6, h - 6, 6, 6, r); x.arcTo(6, 6, w - 6, 6, r); x.closePath();
      x.fillStyle = 'rgba(10,14,16,0.95)'; x.fill();
      x.shadowColor = 'rgba(139,232,166,0.9)'; x.shadowBlur = 18; x.strokeStyle = '#8BE8A6'; x.lineWidth = 5; x.stroke();
      x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      x.shadowBlur = 0; x.fillStyle = '#A79E90'; x.font = '600 ' + Math.round(h * 0.075) + 'px "Hanken Grotesk", Arial, sans-serif';
      if ('letterSpacing' in x) x.letterSpacing = Math.round(h * 0.03) + 'px';
      x.fillText('THE PLANETARIUM  ·  STEP INSIDE', w / 2, h * 0.2);
      if ('letterSpacing' in x) x.letterSpacing = Math.round(h * 0.07) + 'px';
      x.font = '600 ' + Math.round(h * 0.4) + 'px "Hanken Grotesk", Arial, sans-serif';
      x.shadowColor = 'rgba(139,232,166,0.85)'; x.shadowBlur = h * 0.06; x.fillStyle = '#8BE8A6';
      x.fillText('JUPITER', w / 2 + h * 0.035, h * 0.62);
      x.shadowBlur = h * 0.02; x.fillStyle = '#C9F5D6'; x.fillText('JUPITER', w / 2 + h * 0.035, h * 0.62);
      if ('letterSpacing' in x) x.letterSpacing = '0px';
      x.shadowBlur = 0;
      const plain = 'I run JPAX on ', em = 'my own system.';
      x.font = '300 ' + Math.round(h * 0.13) + 'px Fraunces, Georgia, serif'; const pw = x.measureText(plain).width;
      x.font = 'italic 300 ' + Math.round(h * 0.13) + 'px Fraunces, Georgia, serif'; const ew = x.measureText(em).width;
      const x0 = (w - pw - ew) / 2;
      x.textAlign = 'left';
      x.font = '300 ' + Math.round(h * 0.13) + 'px Fraunces, Georgia, serif'; x.fillStyle = '#ECE6DA'; x.fillText(plain, x0, h * 0.85);
      x.font = 'italic 300 ' + Math.round(h * 0.13) + 'px Fraunces, Georgia, serif'; x.fillStyle = '#8BE8A6'; x.fillText(em, x0 + pw, h * 0.85);
    });
    // lit from within: no fog, no tone mapping, so it carries down the street at night
    Object.assign(m.material, { fog: false, toneMapped: false });
    m.position.set(0, top + 4.2 + H0 / 2, doorZ + 1.8); root.add(m);
    // a soft green spill around it
    for (const [gx, s, o] of [[0, 14, 0.18], [-4.2, 5, 0.22], [4.2, 5, 0.22]]) {
      const g = W.glow(0x8be8a6, s, o); g.material.fog = false; g.position.set(gx, top + 4.2 + H0 / 2, doorZ + 1.6); root.add(g);
    }
  }

  // ---------- things the bake can't do: lamp glow, the map ----------
  let mapBase = null, jupiter = null;
  function build() {
    const fx = meta.features || {};
    (fx.screens || []).forEach(addScreen);
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => (fx.boards || []).forEach(addBoard));
    if (fx.sky) {
      jupiter = new THREE.Sprite(new THREE.SpriteMaterial({ map: texLoader.load('media/jupiter-planet.webp'), fog: false, transparent: true, depthWrite: false }));
      jupiter.position.fromArray(fx.sky.jupiter); jupiter.scale.setScalar(26); jupiter.visible = false; root.add(jupiter);
    }
    for (const [x, y, z] of meta.lamps) {
      const g = W.glow(0xf3e3c3, 3.2, 0.55); g.position.set(x, y - 0.1, z); root.add(g);
    }
    if (fx.strings && fx.strings.length) addStrings(fx.strings);
    for (const [x, y, z] of meta.candles || []) {
      const g = W.glow(0xffc982, 0.9, 0.7); g.position.set(x, y, z); root.add(g);
    }
    fontsReady.then(() => (fx.banners || []).forEach(addBanner));
    if (fx.sky) fontsReady.then(jupiterMarquee);
    for (const d of fx.doors || []) {
      const card = DOORS[d.room]; if (!card) continue;
      SPOTS.push(Object.assign({ id: d.id, r: 5.5, pos: d.pos }, card));
      fontsReady.then(() => addDoorMark(d));
    }

    // the map: streets and buildings, drawn once
    const c = document.createElement('canvas'); c.width = hud.map.width; c.height = hud.map.height;
    const x = c.getContext('2d'), [bx0, bz0, bx1, bz1] = meta.bounds;
    const sx = c.width / (bx1 - bx0 + 8), sz = c.height / (bz1 - bz0 + 8);
    mapBase = { c, toX: v => (v - bx0 + 4) * sx, toY: v => (bz1 + 4 - v) * sz };
    x.fillStyle = 'rgba(236,230,218,.16)';
    for (const [x0, z0, x1, z1] of meta.walk) x.fillRect(mapBase.toX(x0), mapBase.toY(z1), (x1 - x0) * sx, (z1 - z0) * sz);
    x.fillStyle = 'rgba(167,158,144,.55)';
    for (const [x0, z0, x1, z1] of meta.buildings) x.fillRect(mapBase.toX(x0) + 0.5, mapBase.toY(z1) + 0.5, (x1 - x0) * sx - 1, (z1 - z0) * sz - 1);
  }

  // ---------- walking ----------
  const me = { x: 0, z: 96, y: 0.14, yaw: 0, pitch: -0.04, bob: 0 };
  let tickN = 0;
  // films play only when you're close (big screens from farther off), and only the
  // nearest few at once so phones keep up
  const MAX_PLAYING = coarse ? 4 : 8;
  const VOICED = new Set(['end-apex-site', 'end-apex-plan']), VOICE_REACH = 34;
  let filmHeard = false;
  function updateScreens() {
    const near = [];
    for (const sc of screens) {
      const reach = (coarse ? 30 : 48) * Math.min(2.2, Math.max(1, Math.max(sc.s.size[0], sc.s.size[1]) / 3.5));
      const d = Math.hypot(sc.s.pos[0] - me.x, sc.s.pos[2] - me.z) / reach;
      if (W.walking && d < 1) near.push([d, sc]);
    }
    near.sort((a, b) => a[0] - b[0]);
    const play = new Set(near.slice(0, MAX_PLAYING).map(n => n[1]));
    let heard = false;
    for (const sc of screens) {
      const want = play.has(sc);
      if (want && !sc.on) { sc.on = true; sc.v.play().catch(() => {}); }
      else if (!want && sc.on) { sc.on = false; sc.v.pause(); }
      // the Apex films carry Nova's voice: with sound on, it fades in as you walk up the street to the screen
      if (VOICED.has(sc.s.id)) {
        const d = Math.hypot(sc.s.pos[0] - me.x, sc.s.pos[2] - me.z);
        const vol = W.sound && W.walking && !W.inside && sc.on ? Math.pow(Math.max(0, 1 - d / VOICE_REACH), 1.4) : 0;
        sc.v.muted = vol < 0.02;
        sc.v.volume = Math.min(1, vol);
        if (vol > 0.1) heard = true;
      }
    }
    if (heard !== filmHeard) { filmHeard = heard; W.emit('filmvoice', heard); }
  }
  // stepping into a room leaves the street's voiced films behind
  W.on('inside', id => {
    if (!id) return;
    for (const sc of screens) if (VOICED.has(sc.s.id)) sc.v.muted = true;
    if (filmHeard) { filmHeard = false; W.emit('filmvoice', false); }
  });
  function stopScreens() {
    for (const sc of screens) if (sc.on) { sc.on = false; sc.v.pause(); sc.v.muted = true; }
    if (filmHeard) { filmHeard = false; W.emit('filmvoice', false); }
  }

  const card = document.createElement('section');
  card.className = 'walk-card'; card.setAttribute('aria-live', 'polite'); card.hidden = true;
  document.getElementById('walk').appendChild(card);
  let spotShown = null;
  function spotPos(sp) {
    if (sp.pos) return sp.pos;
    const sc = screens.find(s => s.s.id === sp.id);
    return sc ? [sc.s.pos[0], sc.s.pos[2]] : null;
  }
  function updateSpot() {
    let best = null, bd = 1e9;
    for (const sp of SPOTS) {
      const p = spotPos(sp); if (!p) continue;
      const d = Math.hypot(p[0] - me.x, p[1] - me.z);
      if (d < sp.r && d < bd) { bd = d; best = sp; }
    }
    if (best === spotShown) return;
    spotShown = best;
    if (!best) { card.hidden = true; return; }
    card.innerHTML = '<div class="eyebrow">' + best.eyebrow + '</div><h2>' + best.h + '</h2><p>' + best.body + '</p>'
      + (best.offers ? '<div class="note">' + best.offers + '</div>' : '')
      + (best.small ? '<small>' + best.small + '</small>' : '')
      + (best.room ? '<button class="btn" type="button" data-room="' + best.room[0] + '">' + best.room[1] + ' →</button>' : '')
      + (best.link ? '<a class="text-link" href="' + best.link[1] + '" target="_blank" rel="noopener">' + best.link[0] + '</a>' : '');
    card.querySelectorAll('[data-room]').forEach(b => b.addEventListener('click', () => window.JPAXRooms && window.JPAXRooms.enter(b.dataset.room, { city: true })));
    card.hidden = false; hud.hint.style.opacity = 0;
    W.emit('spot', best.id);
  }
  const keys = new Set();
  const stick = { x: 0, y: 0, id: null };
  let look = null, hintTimer = 0;

  function groundY(x, z) {
    for (const [x0, z0, x1, z1, y0, y1] of meta.levels || []) {
      if (x >= x0 && x <= x1 && z >= z0 && z <= z1) return y0 + (y1 - y0) * (z - z0) / (z1 - z0);
    }
    return 0.14;
  }
  function inside(x, z) {
    for (const [x0, z0, x1, z1] of meta.walk) if (x >= x0 && x <= x1 && z >= z0 && z <= z1) return true;
    return false;
  }
  function free(x, z) {
    const r = RADIUS;
    if (!inside(x - r, z - r) || !inside(x + r, z - r) || !inside(x - r, z + r) || !inside(x + r, z + r)) return false;
    for (const [x0, z0, x1, z1] of meta.obstacles) if (x > x0 - r && x < x1 + r && z > z0 - r && z < z1 + r) return false;
    return true;
  }

  addEventListener('keydown', e => {
    if (!W.walking || W.inside) return;
    if (e.key === 'Escape') { exit(); return; }
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift'].includes(k)) { keys.add(k); e.preventDefault(); }
  });
  addEventListener('keyup', e => keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));
  addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', e => {
    if (!W.walking || W.inside) return;
    look = { id: e.pointerId, x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!look || e.pointerId !== look.id) return;
    const k = e.pointerType === 'mouse' ? 0.0034 : 0.0052;
    me.yaw -= (e.clientX - look.x) * k;
    me.pitch = Math.max(-1.1, Math.min(1.0, me.pitch - (e.clientY - look.y) * k));
    look.x = e.clientX; look.y = e.clientY;
  });
  const endLook = e => { if (look && e.pointerId === look.id) look = null; };
  canvas.addEventListener('pointerup', endLook);
  canvas.addEventListener('pointercancel', endLook);

  // left-thumb stick on touch screens
  const knob = hud.stick.querySelector('i');
  function stickMove(e) {
    const r = hud.stick.getBoundingClientRect(), R = r.width / 2;
    let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
    const d = Math.hypot(dx, dy), lim = R - 12;
    if (d > lim) { dx *= lim / d; dy *= lim / d; }
    stick.x = dx / lim; stick.y = dy / lim;
    knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  }
  hud.stick.addEventListener('pointerdown', e => { stick.id = e.pointerId; hud.stick.setPointerCapture(e.pointerId); stickMove(e); });
  hud.stick.addEventListener('pointermove', e => { if (e.pointerId === stick.id) stickMove(e); });
  const stickEnd = e => { if (e.pointerId !== stick.id) return; stick.id = null; stick.x = stick.y = 0; knob.style.transform = ''; };
  hud.stick.addEventListener('pointerup', stickEnd);
  hud.stick.addEventListener('pointercancel', stickEnd);

  const fwd = new THREE.Vector3();
  W.walkTick = (dt, time) => {
    if (glide) { glideTick(dt); return; }
    if (!meta) return;
    // input: forward/back and strafe, relative to where you're looking
    let f = 0, s = 0;
    if (keys.has('w') || keys.has('ArrowUp')) f += 1;
    if (keys.has('s') || keys.has('ArrowDown')) f -= 1;
    if (keys.has('d')) s += 1;
    if (keys.has('a')) s -= 1;
    if (keys.has('ArrowLeft')) me.yaw += dt * 1.9;
    if (keys.has('ArrowRight')) me.yaw -= dt * 1.9;
    f -= stick.y; s += stick.x;
    const mag = Math.hypot(f, s);
    if (mag > 1) { f /= mag; s /= mag; }
    const speed = (keys.has('Shift') || Math.hypot(stick.x, stick.y) > 0.92) ? RUN : WALK;
    const sy = Math.sin(me.yaw), cy = Math.cos(me.yaw);
    const dx = (-sy * f + cy * s) * speed * dt, dz = (-cy * f - sy * s) * speed * dt;
    if (dx || dz) {
      if (free(me.x + dx, me.z + dz)) { me.x += dx; me.z += dz; }
      else if (free(me.x + dx, me.z)) me.x += dx;
      else if (free(me.x, me.z + dz)) me.z += dz;
      const was = Math.floor(me.bob / Math.PI);
      me.bob += Math.hypot(dx, dz) * 2.1;
      if (Math.floor(me.bob / Math.PI) !== was) W.emit('step');
      if (!hintTimer) hintTimer = time;
    }
    if (hintTimer && time - hintTimer > 4) hud.hint.style.opacity = 0;
    doorWalk(time, f > 0.2);

    const bob = W.reduce ? 0 : Math.sin(me.bob) * 0.035;
    me.y += (groundY(me.x, me.z) - me.y) * Math.min(1, dt * 10);
    camera.position.set(W.CITY.x + me.x, EYE + me.y + bob, W.CITY.z + me.z);
    if (jupiter) jupiter.visible = true;
    // films play only when you're close; info cards follow you
    if ((tickN = (tickN + 1) % 15) === 0) { updateScreens(); updateSpot(); }
    camera.rotation.set(me.pitch, me.yaw, 0, 'YXZ');
    drawMap();
  };

  function drawMap() {
    if (!mapBase) return;
    const x = hud.map.getContext('2d');
    x.clearRect(0, 0, hud.map.width, hud.map.height);
    x.drawImage(mapBase.c, 0, 0);
    const px = mapBase.toX(me.x), py = mapBase.toY(me.z);
    x.save(); x.translate(px, py); x.rotate(-me.yaw);
    x.fillStyle = 'rgba(139,232,166,.18)';
    x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 34, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55); x.closePath(); x.fill();
    x.fillStyle = '#8BE8A6';
    x.beginPath(); x.moveTo(0, -8); x.lineTo(5.5, 6); x.lineTo(0, 3); x.lineTo(-5.5, 6); x.closePath(); x.fill();
    x.restore();
  }

  // ---------- in and out ----------
  function fade(fn) {
    hud.fade.classList.add('on');
    setTimeout(() => { fn(); requestAnimationFrame(() => hud.fade.classList.remove('on')); }, W.reduce ? 0 : 460);
  }
  // From the last stop, the drive carries on down the road and into the foot of Main Street, then hands you
  // the controls. From anywhere else (or with reduced motion), a short fade straight to the same spot.
  let glide = null;
  const ahead = new THREE.Vector3(), glideQ = new THREE.Quaternion(), glideTo = new THREE.Vector3();
  function startGlide() {
    const road = W.CITY_ROAD, start = camera.position.clone(), y1 = EYE + 0.14;
    const pts = [start];
    for (const u of [0, 0.4, 0.75, 1]) { const q = road.getPointAt(u); q.y = start.y + (y1 - start.y) * (0.25 + u * 0.75); pts.push(q); }
    pts.push(new THREE.Vector3(W.CITY.x, y1, W.CITY.z + 96));
    glideTo.set(W.CITY.x, y1 - 0.6, W.CITY.z + 30);
    glide = { t: 0, dur: 6.5, path: new THREE.CatmullRomCurve3(pts, false, 'centripetal'), q0: camera.quaternion.clone(), fog0: scene.fog.density };
    W.walking = true;
    document.body.classList.add('walking', 'gliding');
    W.resize();
    me.x = 0; me.z = 96; me.y = 0.14; me.yaw = 0; me.pitch = -0.04;
    if (!meta) load();
    W.emit('city', true);
  }
  function glideTick(dt) {
    const g = glide;
    g.t = Math.min(g.dur, g.t + dt);
    const k = g.t / g.dur, e = k * k * (3 - 2 * k);
    camera.position.copy(g.path.getPointAt(e));
    ahead.copy(g.path.getPointAt(Math.min(1, e + 0.12))); ahead.y -= 0.4;
    ahead.lerp(glideTo, Math.min(1, Math.max(0, (e - 0.35) / 0.55)));
    camera.lookAt(ahead); glideQ.copy(camera.quaternion);
    camera.quaternion.copy(g.q0).slerp(glideQ, Math.min(1, e / 0.28));
    W.walkFog = g.fog0 + (0.011 - g.fog0) * e;
    if (g.t < g.dur) return;
    // hand over: the walking camera picks up exactly where the glide left it
    glide = null; W.walkFog = null;
    const d = new THREE.Vector3(); camera.getWorldDirection(d);
    me.yaw = Math.atan2(-d.x, -d.z); me.pitch = Math.asin(Math.max(-1, Math.min(1, d.y)));
    camera.rotation.order = 'YXZ';
    document.body.classList.remove('gliding');
    hud.hint.style.opacity = 1; hintTimer = 0;
    if (!meta) { hud.load.hidden = false; load().then(() => { hud.load.hidden = true; }); }
    hud.back.focus({ preventScroll: true });
  }
  function enter() {
    if (W.walking) return;
    if (!W.inside && !W.reduce && W.CITY_ROAD && camera.position.distanceTo(W.CITY_ROAD.getPointAt(0)) < 90) { startGlide(); return; }
    fade(() => {
      W.walking = true;
      document.body.classList.add('walking');
      camera.rotation.order = 'YXZ';
      W.resize();
      hud.hint.style.opacity = 1; hintTimer = 0;
      me.x = 0; me.z = 96; me.y = 0.14; me.yaw = 0; me.pitch = -0.04;
      if (!meta) { hud.load.hidden = false; load().then(() => { hud.load.hidden = true; }); }
      hud.back.focus({ preventScroll: true });
      W.emit('city', true);
    });
  }
  function exit() {
    if (!W.walking || glide) return;
    fade(() => {
      W.walking = false; keys.clear(); look = null;
      stopScreens(); card.hidden = true; spotShown = null; if (jupiter) jupiter.visible = false;
      document.body.classList.remove('walking');
      camera.rotation.order = 'XYZ';
      W.resize();
      W.goTo(6);
      W.emit('city', false);
    });
  }
  hud.back.addEventListener('click', exit);

  // a place on the rail for downtown
  const rail = el('rail');
  if (rail) {
    const g = document.createElement('div'); g.className = 'rail-group';
    g.innerHTML = '<div class="rail-lane">Downtown</div><div class="rail-stops"><button class="rail-btn" type="button" aria-label="Walk downtown"><span class="dot"></span><span class="lbl">City</span></button></div>';
    g.querySelector('button').addEventListener('click', enter);
    rail.appendChild(g);
  }

  window.JPAXCity = { enter, exit, load, me, stopScreens, keys, SPOTS, DOORS };
})();
