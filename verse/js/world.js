(() => {
  // a tiny event bus so the city and the sound can follow what the road is doing
  const bus = {};
  const emit = (n, ...a) => (bus[n] || []).forEach(f => f(...a));
  // ---------- Content: the road, stop by stop ----------
  const STOPS = [
    { t: 0.0, rail: 'Studio', lane: 'start', hero: true,
      eyebrow: 'JPAX Media · Greenville, SC',
      h: 'Bring them <em>in.</em> Catch the money.',
      body: 'A creative and systems studio for established owners. The Brand Studio brings customers in. The system catches the money. This road is both halves.',
      julian: 'I shoot it, write it, build it, and answer the phone. Same practice. Same standard.',
      calc: 'closed', room: ['studio', 'Step into the studio'],
      primary: { label: 'Start the drive →', go: 1 } },
    { t: 0.17, rail: 'Get seen', lane: 'studio',
      eyebrow: 'Brand Studio · Get seen',
      h: 'Nobody’s heard of us <em>yet.</em>',
      body: 'Send the idea. Get the film, made the way the project needs: animated, cut from your own footage, or filmed on location. Cut wide and vertical. Then one idea, pushed until it pays.',
      offers: [['Video Studio, edited', 'from $1,200'], ['Video Studio, animated', 'from $2,500'], ['Video Studio, filmed', 'from $3,500'], ['Content branding', 'from $1,200/mo'], ['Campaigns', 'from $1,500/mo + ad spend']],
      proof: { text: 'Southern Pavers “3 Mistakes”: 58 customer conversations at $8.15 each, under $500 in ad spend.', src: 'Meta figures through Sept 25, 2026' },
      room: ['cinema', 'Step into the cinema'],
      link: { label: 'See the Video Studio', href: 'https://jpaxmedia.com/video-studio' } },
    { t: 0.33, rail: 'Get chosen', lane: 'studio',
      eyebrow: 'Brand Studio · Get chosen',
      h: 'People look us up, then call <em>someone else.</em>',
      body: 'A custom site built around the jobs you want more of. Fast on a phone, easy to book from, written to sound like you. Your domain, your accounts.',
      offers: [['Website creation', 'from $3,500'], ['Web management', 'from $400/mo']],
      proof: { text: 'Six sites I built, live on the phones: Southern Pavers, 27 Birds, Apex Trophy Expeditions, Anthony D’Antonio’s music hub, Bats Reacts, and jpaxmedia.com. The Southern Pavers site has tracked 1,706 visitors with the system behind it, and I still run the 27 Birds site and its lead system.', src: 'Visitor count: JPAX pixel' },
      room: ['storefront', 'Book from the phone'],
      link: { label: 'Walk the Studio route', href: 'https://jpaxmedia.com/studio' } },
    { t: 0.49, rail: 'Build it', lane: 'studio',
      eyebrow: 'Brand Studio · Build it',
      h: 'Our software doesn’t fit <em>how we work.</em>',
      body: 'Tell me how your business actually runs, and I build the tool around it: quoting tools, customer portals, dashboards, visualizers. Scoped first, then built, and yours when it ships.',
      offers: [['Custom app builds', 'from $8,000']],
      proof: { text: 'Four bays in the lab. The Southern Pavers patio visualizer is live, and 54 people have opened it so far. The Apex Trophy Expeditions booking system is being built now, shown on sample data. Jupiter is the system I run JPAX on, shown on example data and phantom clients. The last bay is how I’d build yours.' },
      room: ['workshop', 'See where it’s built'],
      link: { label: 'Ask about an app', href: 'https://jpaxmedia.com/ops-audit?interest=app#book' } },
    { t: 0.64, rail: 'Ops Audit', lane: 'systems',
      eyebrow: 'Systems · The Ops Audit',
      h: 'The calls come in. The money <em>doesn’t.</em>',
      body: 'Two weeks. I track every call to your line, mystery-shop your after-hours response, and dig up the estimates nobody chased. You get a scored report card, the money math, and a 90-day roadmap.',
      calc: 'open', room: ['cabin', 'Read the report card'],
      offers: [['Ops Audit', '$2,000 flat']],
      note: 'Credited toward the install if you move forward.',
      primary: { label: 'Book an Ops Audit', href: 'https://jpaxmedia.com/ops-audit?lane=systems#book' } },
    { t: 0.79, rail: 'Install', lane: 'systems',
      eyebrow: 'Systems · System Install',
      h: 'Every call <em>answered.</em>',
      body: '24/7 call answering, a text back to every missed call within 60 seconds, estimate follow-up on day 1, 3, 7 and 14, a review engine, one CRM pipeline and one dashboard.',
      offers: [['System Install', 'from $12,000']], room: ['hall', 'See the dashboard'],
      note: '4 to 6 weeks, plus a 30-day tuning window. I don’t sell pieces. The system works because everything works together.' },
    { t: 0.95, rail: 'Partner', lane: 'systems',
      eyebrow: 'Systems · Operating Partner',
      h: 'Who doesn’t want <em>their own system?</em>',
      body: 'I run the machine with you: call answering tuned from real transcripts, a new fix each month, and a monthly read on how the system is doing.',
      offers: [['Operating Partner', 'from $1,500/mo']],
      note: 'I only build for one shop per trade in each market.',
      city: true,
      primary: { label: 'Book an Ops Audit', href: 'https://jpaxmedia.com/ops-audit?lane=systems#book' },
      link: { label: 'Walk the Studio route', href: 'https://jpaxmedia.com/studio' } }
  ];
  const PMAX = STOPS[STOPS.length - 1].t;
  const INSTALL_T = STOPS[5].t;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panel = document.getElementById('panel');
  const railEl = document.getElementById('rail');

  // ---------- UI ----------
  const railBtns = [];
  (function buildRail() {
    const groups = [['', [0]], ['Brand Studio', [1, 2, 3]], ['Systems', [4, 5, 6]]];
    for (const [lane, ids] of groups) {
      const g = document.createElement('div'); g.className = 'rail-group';
      const l = document.createElement('div'); l.className = 'rail-lane'; l.textContent = lane || ' ';
      const s = document.createElement('div'); s.className = 'rail-stops';
      for (const i of ids) {
        const b = document.createElement('button');
        b.className = 'rail-btn'; b.type = 'button'; b.id = 'rail-' + i;
        b.setAttribute('aria-label', STOPS[i].rail);
        b.innerHTML = '<span class="dot"></span><span class="lbl">' + STOPS[i].rail + '</span>';
        b.addEventListener('click', () => goTo(i));
        s.appendChild(b); railBtns[i] = b;
      }
      g.append(l, s); railEl.appendChild(g);
    }
  })();

  // ---------- Your numbers: the site's calculator, inputs stay in this browser ----------
  const NUM_KEY = 'jpax-world-numbers';
  const nums = { missed: 8, rate: 30, value: 400 };
  let numsVersion = 0, entered = false;
  try { const saved = JSON.parse(localStorage.getItem(NUM_KEY)); if (saved) { Object.assign(nums, saved); entered = true; } } catch (e) {}
  const loss = () => Math.round(nums.missed * nums.rate / 100 * nums.value * 52);
  const money = n => '$' + n.toLocaleString('en-US');
  // 1 is the site's default road (8 × 30% × $400); a bigger loss means thicker fog and more calls lost
  const severity = () => Math.min(3, Math.max(0.25, loss() / 49920));
  const mathLine = () => nums.missed + ' missed calls × ' + nums.rate + '% × ' + money(nums.value) + ' × 52 weeks';
  function calcHTML(open) {
    const field = (k, label, min, max, step, pre, post) => '<label><span>' + label + '</span><span class="calc-in">' + (pre || '')
      + '<input type="number" inputmode="numeric" min="' + min + '" max="' + max + '" step="' + step + '" data-k="' + k + '" value="' + nums[k] + '">' + (post || '') + '</span></label>';
    return '<details class="calc"' + (open ? ' open' : '') + '><summary><span>Your numbers</span><span class="calc-sum">' + money(loss()) + ' a year</span></summary>'
      + '<div class="calc-grid">' + field('missed', 'Missed a week', 0, 500, 1) + field('rate', 'Would book', 0, 100, 5, '', '%') + field('value', 'Average job', 0, 100000, 50, '$') + '</div>'
      + '<div class="calc-result"><span class="calc-big">' + money(loss()) + '</span><span>a year slipping off the road</span></div>'
      + '<div class="calc-math">' + mathLine() + '</div>'
      + '<small>Rough estimate from your inputs. The Ops Audit measures the real number.</small></details>';
  }
  function bindCalc(root) {
    root.querySelectorAll('.calc input').forEach(inp => inp.addEventListener('input', () => {
      const v = parseFloat(inp.value);
      if (!isFinite(v) || v < 0) return;
      nums[inp.dataset.k] = Math.min(+inp.max, v);
      numsVersion++; entered = true; emit('numbers');
      try { localStorage.setItem(NUM_KEY, JSON.stringify(nums)); } catch (e) {}
      root.querySelectorAll('.calc-big').forEach(el => el.textContent = money(loss()));
      root.querySelectorAll('.calc-sum').forEach(el => el.textContent = money(loss()) + ' a year');
      root.querySelectorAll('.calc-math').forEach(el => el.textContent = mathLine());
    }));
  }

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function renderPanel(i) {
    const s = STOPS[i];
    let html = '<div class="eyebrow">' + s.eyebrow + '</div>';
    html += s.hero ? '<h1>' + s.h + '</h1>' : '<h2>' + s.h + '</h2>';
    html += '<p>' + s.body + '</p>';
    if (s.calc) html += calcHTML(s.calc === 'open');
    if (s.julian) html += '<div class="julian"><div class="eyebrow">From Julian</div><q>' + s.julian + '</q></div>';
    if (s.offers) html += '<div class="offers">' + s.offers.map(o => '<div class="offer"><span>' + o[0] + '</span><span>' + o[1] + '</span></div>').join('') + '</div>';
    if (s.note) html += '<div class="note">' + s.note + '</div>';
    if (s.quote) html += '<p class="quote">“' + s.quote + '”</p>';
    if (s.proof) html += '<div class="proof"><span>' + s.proof.text + '</span>' + (s.proof.src ? '<small>' + s.proof.src + '</small>' : '') + '</div>';
    const acts = [];
    if (s.primary) acts.push(s.primary.href
      ? '<a class="btn" href="' + s.primary.href + '" target="_blank" rel="noopener">' + s.primary.label + '</a>'
      : '<button class="btn" type="button" data-go="' + s.primary.go + '">' + s.primary.label + '</button>');
    if (s.room) acts.push('<button class="text-link" type="button" data-room="' + s.room[0] + '">' + s.room[1] + ' →</button>');
    if (s.city) acts.push('<button class="text-link" type="button" data-go="0">Drive it again ↺</button>');
    if (s.link) acts.push('<a class="text-link" href="' + s.link.href + '" target="_blank" rel="noopener">' + s.link.label + '</a>');
    if (acts.length) html += '<div class="actions">' + acts.join('') + '</div>';
    const last = i === STOPS.length - 1;
    html += '<div class="nav"><button class="nav-btn" type="button" data-go="' + (i - 1) + '"' + (i === 0 ? ' disabled' : '') + '>← Back</button>'
      + '<span class="nav-count">' + (i + 1) + ' / ' + STOPS.length + '</span>'
      + (last ? '<button class="nav-btn" type="button" data-city>Downtown →</button></div>'
        : '<button class="nav-btn" type="button" data-go="' + (i + 1) + '">Next stop →</button></div>');
    html += '<button class="panel-lower" type="button" data-lower aria-label="Lower the text (H)" title="Lower the text (H)">⌄</button>';
    panel.innerHTML = html;
    panel.querySelectorAll('[data-lower]').forEach(b => b.addEventListener('click', () => api.setLowered(true)));
    panel.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => goTo(+b.dataset.go)));
    bindCalc(panel);
    panel.querySelectorAll('[data-room]').forEach(b => b.addEventListener('click', () => window.JPAXRooms && window.JPAXRooms.enter(b.dataset.room, { stop: i })));
    panel.querySelectorAll('[data-city]').forEach(b => b.addEventListener('click', () => window.JPAXCity && window.JPAXCity.enter()));
  }

  let shownStop = -1;
  function showStop(i) {
    if (i === shownStop) return;
    const first = shownStop === -1;
    shownStop = i;
    emit('stop', i);
    railBtns.forEach((b, k) => { b.classList.toggle('active', k === i); b.classList.toggle('passed', k < i); b.setAttribute('aria-current', k === i ? 'step' : 'false'); });
    if (first || reduce) { renderPanel(i); return; }
    panel.classList.add('swap');
    setTimeout(() => { renderPanel(i); panel.scrollTop = 0; panel.classList.remove('swap'); }, 180);
  }
  showStop(0);

  // ---------- WebGL ----------
  const canvas = document.getElementById('world');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    // no 3D here: js/text.js opens the whole world as text instead
    window.JPAXWorld = { noGL: true, STOPS };
    document.body.classList.add('no-gl');
    const v = document.getElementById('veil'); if (v) v.remove();
    return;
  }
  // phones get a lighter pixel ratio; the bakes carry the detail
  const coarse = matchMedia('(pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));

  // ---------- first load: a short veil with real progress while the landmarks stream in ----------
  const veil = document.getElementById('veil');
  if (veil) {
    const bar = veil.querySelector('.veil-bar i'), msg = veil.querySelector('.veil-msg'), mgr = THREE.DefaultLoadingManager;
    let lifted = false, last = { n: 0, total: 1 };
    const lift = () => {
      if (lifted) return; lifted = true;
      veil.classList.add('gone'); setTimeout(() => veil.remove(), reduce ? 0 : 700);
    };
    mgr.onStart = (url, n, total) => { last = { n, total }; };
    mgr.onProgress = (url, n, total) => {
      last = { n, total };
      if (lifted) return;
      bar.style.transform = 'scaleX(' + (n / total).toFixed(3) + ')';
      msg.textContent = 'Loading the road · ' + n + ' of ' + total;
    };
    // a model's textures start after its file arrives, so wait a beat before calling it done
    mgr.onLoad = () => setTimeout(() => { if (last.n >= last.total) lift(); }, 400);
    veil.querySelector('button').addEventListener('click', lift);
    setTimeout(lift, 9000);
  }
  const FOG = 0x1c1510;   // warm sepia night, after reference/road/
  renderer.setClearColor(FOG);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(FOG, 0.034);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2400);

  const COL = { green: 0x8BE8A6, amber: 0xD9A066, paper: 0xECE6DA, stone: 0xA79E90 };

  // ---------- Noise ----------
  function hash(i, j) {
    let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function vnoise(x, y) {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y) { let s = 0, a = 0.5, f = 1; for (let k = 0; k < 5; k++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }
  function smooth(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  let seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  // ---------- The road ----------
  const ctrl = [[0, 80], [-8, 50], [10, 18], [14, -10], [-4, -40], [-20, -72], [-6, -104], [18, -132], [22, -160], [4, -190], [-8, -218], [0, -250]]
    .map(([x, z]) => new THREE.Vector3(x, 0, z));
  const curve = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal');
  const N = 700;
  const RPX = new Float32Array(N), RPZ = new Float32Array(N), SDX = new Float32Array(N), SDZ = new Float32Array(N), TGX = new Float32Array(N), TGZ = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1), p = curve.getPointAt(u), t = curve.getTangentAt(u);
    RPX[i] = p.x; RPZ[i] = p.z; TGX[i] = t.x; TGZ[i] = t.z;
    const l = Math.hypot(t.x, t.z) || 1; SDX[i] = -t.z / l; SDZ[i] = t.x / l;
  }
  function rs(u) {
    u = Math.min(1, Math.max(0, u)) * (N - 1);
    const i = Math.min(N - 2, Math.floor(u)), f = u - i;
    return { x: RPX[i] + (RPX[i + 1] - RPX[i]) * f, z: RPZ[i] + (RPZ[i + 1] - RPZ[i]) * f,
      sx: SDX[i] + (SDX[i + 1] - SDX[i]) * f, sz: SDZ[i] + (SDZ[i + 1] - SDZ[i]) * f,
      tx: TGX[i] + (TGX[i + 1] - TGX[i]) * f, tz: TGZ[i] + (TGZ[i + 1] - TGZ[i]) * f };
  }
  function roadDist(x, z) {
    let m = 1e12;
    for (let i = 0; i < N; i += 2) { const dx = x - RPX[i], dz = z - RPZ[i], d = dx * dx + dz * dz; if (d < m) m = d; }
    return Math.sqrt(m);
  }

  // Landmark sites beside the road: you're the customer, and each stop is the real thing at work
  // (reference/road/ holds the pictures each one is built from)
  const SITES = [
    { u: 0.035, side: 1, off: 16, focusY: 3.4, r: 14, yaw: 0.4, fx: 3.5 }, // Julian's studio, under the oak, turned to greet you
    { u: 0.205, side: -1, off: 14, focusY: 6.5, r: 9 },   // Get seen: the billboard plays the ad
    { u: 0.365, side: 1, off: 28, focusY: 4.6, focusYN: 3.4, r: 25, yaw: 0.7, fx: 9 }, // Get chosen: six giant phones show real sites
    { u: 0.515, side: -1, off: 15.5, focusY: 3.1, r: 22, lift: 1.6, yaw: -0.3, fx: -12 }, // Build it: Julian's app lab, four bays
    { u: 0.675, side: 1, off: 23, focusY: 3, r: 24, fx: 6 }, // Ops Audit: the shop at night, its calls ringing out
    { u: 0.825, side: -1, off: 17, focusY: 3, r: 24, backN: 12, liftN: 2 },    // Install: the shop re-clad and wired, scaffolding still up
    { u: 0.99, side: 1, off: 25, focusY: 3.4, r: 30, fx: 14.5, backN: 18, liftN: 3.5, fxN: 5 } // Partner: the shop grown, a new wing and a fleet
  ];
  for (const s of SITES) {
    const r = rs(s.u);
    s.x = r.x + r.sx * s.side * s.off; s.z = r.z + r.sz * s.side * s.off;
    s.facing = Math.atan2(r.x - s.x, r.z - s.z) + (s.yaw || 0);
  }
  // downtown (blender/city.py) sits at the end of the road: the drive runs on into its Main Street.
  // Its local origin; Main Street runs along local x = 0 from z = +100 (the south end, where the road
  // comes in) to z = -96, and its blocks fill x -66..66, z -152..100.
  const CITY = { x: 3, z: -378 };
  const CITY_BOX = { x0: CITY.x - 70, x1: CITY.x + 70, z0: CITY.z - 156, z1: CITY.z + 102 };
  function cityDist(x, z) {
    const dx = Math.max(CITY_BOX.x0 - x, 0, x - CITY_BOX.x1), dz = Math.max(CITY_BOX.z0 - z, 0, z - CITY_BOX.z1);
    return Math.hypot(dx, dz);
  }
  const FLAT = SITES.map(s => ({ x: s.x, z: s.z, r: s.r }));

  function terrainH(x, z) {
    const dR = Math.abs(x) > 95 ? 99 : roadDist(x, z);
    let s = smooth(5, 48, dR);
    for (const f of FLAT) { const d = Math.hypot(x - f.x, z - f.z); if (d < f.r + 20) s *= smooth(f.r, f.r + 20, d); }
    s *= smooth(0, 28, cityDist(x, z));
    if (s <= 0) return 0;
    const n = fbm(x * 0.011 + 3.1, z * 0.011 - 1.7), n2 = fbm(x * 0.0045 + 7, z * 0.0045);
    return s * (n * 34 + n2 * 26 - 9);
  }

  // ---------- Sky ----------
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { cFog: { value: new THREE.Color(FOG) }, cGlow: { value: new THREE.Color(0x3a2a1e) }, cTop: { value: new THREE.Color(0x0c0b0a) }, uClear: { value: 0 } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 cFog; uniform vec3 cGlow; uniform vec3 cTop; uniform float uClear; varying vec3 vDir;' +
      'void main(){ float y = vDir.y; vec3 glow = mix(cFog, cGlow, 0.45 + 0.55 * uClear);' +
      'vec3 col = mix(cFog, glow, smoothstep(-0.01, 0.07, y)); col = mix(col, cTop, smoothstep(0.07, 0.6, y));' +
      'gl_FragColor = vec4(col, 1.0); }'
  }));
  sky.renderOrder = -1;
  scene.add(sky);

  const starGeo = new THREE.BufferGeometry();
  { const a = new Float32Array(1600 * 3);
    for (let i = 0; i < 1600; i++) { const th = rand() * Math.PI * 2, y = 0.08 + Math.pow(rand(), 0.7) * 0.92, r = Math.sqrt(1 - y * y);
      a[i * 3] = Math.cos(th) * r * 900; a[i * 3 + 1] = y * 900; a[i * 3 + 2] = Math.sin(th) * r * 900; }
    starGeo.setAttribute('position', new THREE.BufferAttribute(a, 3)); }
  const starMat = new THREE.PointsMaterial({ color: COL.paper, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.5, fog: false, depthWrite: false });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Distant ridgelines (the Blue Ridge behind Greenville)
  function ridge(z, base, amp, sd, color) {
    const xs = [], step = 10;
    for (let x = -1100; x <= 1100; x += step) xs.push(x);
    const pos = new Float32Array(xs.length * 2 * 3), idx = [];
    xs.forEach((x, i) => {
      const y = base + amp * (fbm(x * 0.0035 + sd, sd * 1.7) * 1.4 - 0.2);
      pos.set([x, -20, z, x, y, z], i * 6);
      if (i < xs.length - 1) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
    return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
  }
  scene.add(ridge(-610, 30, 90, 11, 0x15110d), ridge(-770, 50, 140, 23, 0x1b1611), ridge(-950, 80, 190, 41, 0x231c15));

  // ---------- Lights ----------
  scene.add(new THREE.HemisphereLight(0x4a3c30, 0x0c0b0a, 0.85));
  const moon = new THREE.DirectionalLight(0xd6c6b0, 0.45); moon.position.set(-0.4, 0.6, -1); scene.add(moon);

  // ---------- Terrain ----------
  {
    const g = new THREE.PlaneGeometry(900, 900, 260, 260);
    g.rotateX(-Math.PI / 2); g.translate(0, 0, -110);
    const p = g.attributes.position, cols = new Float32Array(p.count * 3);
    const low = new THREE.Color(0x13110e), high = new THREE.Color(0x2b241e), meadow = new THREE.Color(0x171612), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), h = terrainH(x, z);
      p.setY(i, h);
      c.copy(low).lerp(high, smooth(0, 34, h)).lerp(meadow, h < 0.5 ? 0.6 : 0);
      const n = (vnoise(x * 0.3, z * 0.3) - 0.5) * 0.02;
      cols[i * 3] = c.r + n; cols[i * 3 + 1] = c.g + n; cols[i * 3 + 2] = c.b + n;
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true })));
  }

  // Pines
  {
    const geo = new THREE.ConeGeometry(1.2, 5, 7); geo.translate(0, 2.5, 0);
    const COUNT = 1300, m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0x111511 }), COUNT);
    const d = new THREE.Object3D(); let n = 0, tries = 0;
    while (n < COUNT && tries < 20000) {
      tries++;
      const x = (rand() - 0.5) * 560, z = -110 + (rand() - 0.5) * 560;
      if (Math.abs(x) < 95 && roadDist(x, z) < 8) continue;
      if (FLAT.some(f => Math.hypot(x - f.x, z - f.z) < f.r + 4)) continue;
      if (cityDist(x, z) < 5) continue;
      const s = 0.6 + rand() * 1.2;
      d.position.set(x, terrainH(x, z) - 0.3, z); d.scale.set(s, s * (0.8 + rand() * 0.6), s); d.rotation.y = rand() * 6.28;
      d.updateMatrix(); m.setMatrixAt(n++, d.matrix);
    }
    m.count = n; scene.add(m);
  }

  // ---------- Textures ----------
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d'); if (draw) draw(ctx, w, h); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return { c, ctx, tex: t }; }
  const glowTex = canvasTex(128, 128, (x, w) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); }).tex;
  const acrossTex = canvasTex(64, 4, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }).tex;
  const beamTex = canvasTex(4, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }).tex;
  function glow(color, scale, opacity) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: opacity == null ? 1 : opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.scale.setScalar(scale); return s;
  }
  function roundRect(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
  function spaced(x, px) { if ('letterSpacing' in x) x.letterSpacing = px + 'px'; }

  // ---------- Road surface and the green trail ----------
  function ribbon(width, y) {
    const pos = new Float32Array(N * 6), uv = new Float32Array(N * 4), idx = [];
    for (let i = 0; i < N; i++) {
      const hw = width / 2;
      pos.set([RPX[i] - SDX[i] * hw, y, RPZ[i] - SDZ[i] * hw, RPX[i] + SDX[i] * hw, y, RPZ[i] + SDZ[i] * hw], i * 6);
      uv.set([0, i / (N - 1), 1, i / (N - 1)], i * 4);
      if (i < N - 1) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  // wet asphalt: the stop lights glint off it
  scene.add(new THREE.Mesh(ribbon(5.2, 0.06), new THREE.MeshPhongMaterial({ color: 0x1f1a16, specular: 0x6a5640, shininess: 60, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })));
  const trailCore = new THREE.Mesh(ribbon(0.2, 0.1), new THREE.MeshBasicMaterial({ color: COL.green, side: THREE.DoubleSide }));
  const trailGlow = new THREE.Mesh(ribbon(2.6, 0.09), new THREE.MeshBasicMaterial({ map: acrossTex, color: COL.green, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  scene.add(trailGlow, trailCore);
  const trailHead = glow(COL.green, 3); scene.add(trailHead);

  // the last stretch: from the road's end into the foot of Main Street, widening to the street as it goes
  const CITY_ROAD = (() => {
    const e = rs(1), tl = Math.hypot(e.tx, e.tz) || 1;
    const P0 = new THREE.Vector3(e.x, 0, e.z), M = new THREE.Vector3(CITY.x, 0, CITY.z + 101);
    const L = P0.distanceTo(M);
    const curve = new THREE.CubicBezierCurve3(P0, P0.clone().add(new THREE.Vector3(e.tx / tl, 0, e.tz / tl).multiplyScalar(L * 0.4)),
      M.clone().add(new THREE.Vector3(0, 0, L * 0.4)), M);
    const n = 40, pos = new Float32Array(n * 6), idx = [];
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), p = curve.getPointAt(u), t = curve.getTangentAt(u), l = Math.hypot(t.x, t.z) || 1;
      const sx = -t.z / l, sz = t.x / l, hw = (5.2 + (11 - 5.2) * smooth(0.35, 1, u)) / 2;
      pos.set([p.x - sx * hw, 0.06, p.z - sz * hw, p.x + sx * hw, 0.06, p.z + sz * hw], i * 6);
      if (i < n - 1) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, new THREE.MeshPhongMaterial({ color: 0x1f1a16, specular: 0x6a5640, shininess: 60, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })));
    // streetlamps along the approach, so the way into town reads at night
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x15120f });
    [[0.22, 1], [0.5, -1], [0.78, 1]].forEach(([u, side]) => {
      const p = curve.getPointAt(u), t = curve.getTangentAt(u), l = Math.hypot(t.x, t.z) || 1;
      const hw = (5.2 + (11 - 5.2) * smooth(0.35, 1, u)) / 2 + 1.2, x = p.x - t.z / l * hw * side, z = p.z + t.x / l * hw * side;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 5.4, 6), poleMat); pole.position.set(x, 2.7, z); scene.add(pole);
      const g = glow(0xffd29a, 3.2, 0.9); g.position.set(x, 5.4, z); scene.add(g);
      const pool = glow(0xffc98a, 7, 0.22); pool.position.set(x, 0.3, z); scene.add(pool);
    });
    return curve;
  })();

  // ---------- Landmarks ----------
  const dark = new THREE.MeshLambertMaterial({ color: 0x1d1915 });
  const darker = new THREE.MeshLambertMaterial({ color: 0x110f0d });
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x5a5249 });
  function box(w, h, d, mat, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x || 0, y || 0, z || 0); return m; }
  function roof(w, h, d, mat) {
    const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2);
    return new THREE.Mesh(g, mat);
  }
  function plane(w, h, mat, x, y, z) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); return m; }
  const hitMeshes = [];

  // Blender models (blender/studio.py, blender/landmarks.py) load from models/.
  // Lighting is baked into their textures, so they draw unlit. Two-state models
  // carry a lights-off bake as well, and uFade fades between them.
  const BAKE_GAIN = new THREE.Color(1.35, 1.3, 1.3);
  function bakedFade(on, off) {
    const m = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { mapOn: { value: null }, mapOff: { value: null }, uFade: { value: 0 }, gain: { value: BAKE_GAIN } }]),
      vertexShader: [
        'varying vec2 vUv;', '#include <fog_pars_vertex>',
        'void main() { vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;', '#include <fog_vertex>', '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D mapOn; uniform sampler2D mapOff; uniform float uFade; uniform vec3 gain; varying vec2 vUv;', '#include <fog_pars_fragment>',
        'void main() { gl_FragColor = vec4(mix(texture2D(mapOff, vUv).rgb, texture2D(mapOn, vUv).rgb, uFade) * gain, 1.0);', '#include <fog_fragment>', '}'
      ].join('\n'),
      fog: true
    });
    m.uniforms.mapOn.value = on; m.uniforms.mapOff.value = off; m.uniforms.gain.value = BAKE_GAIN;
    return m;
  }
  const SWITCH_OFF = new THREE.Color(0x16120f);
  function loadModel(id, done, fail) {
    if (!THREE.GLTFLoader) { if (fail) fail(); return; }
    new THREE.GLTFLoader().load('models/' + id + '.model.json', gltf => {
        const out = { scene: gltf.scene, fades: [], switches: [] };
        gltf.scene.traverse(o => {
          if (!o.isMesh) return;
          const name = o.material.name || '', hex = /^(glow|switch)-([0-9a-f]{6})/i.exec(name);
          if (hex && hex[1] === 'switch') {
            o.material = new THREE.MeshBasicMaterial({ color: SWITCH_OFF.clone() });
            out.switches.push({ color: o.material.color, on: new THREE.Color('#' + hex[2]) });
          } else if (hex) {
            o.material = new THREE.MeshBasicMaterial({ color: new THREE.Color('#' + hex[2]) });
          } else if (/glow/i.test(name) || /glow/i.test(o.name)) {
            o.material = new THREE.MeshBasicMaterial({ color: COL.amber }); // the studio's windows
          } else if (o.material.emissiveMap) {
            const m = bakedFade(o.material.map, o.material.emissiveMap);
            out.fades.push(m.uniforms.uFade); o.material = m;
          } else {
            const map = o.material.map;
            if (map) map.encoding = THREE.LinearEncoding;
            o.material = new THREE.MeshBasicMaterial({ map, color: BAKE_GAIN });
          }
        });
        done(out);
    }, undefined, err => { console.warn(id + ' model did not load', err); if (fail) fail(err); });
  }
  // Stops past the first two load only as the drive nears them, so the first screen stays light on a phone.
  // near(i, fn) runs fn once the camera or the stop it is heading to is within one stop of stop i.
  const lazy = [];
  function near(i, fn) { lazy.push([i, fn]); }
  function pumpLazy() {
    if (!lazy.length) return;
    const a = nearestStop(p), b = nearestStop(target);
    for (let k = lazy.length - 1; k >= 0; k--) {
      const [i, fn] = lazy[k];
      if (Math.abs(i - a) <= 1 || Math.abs(i - b) <= 1) { lazy.splice(k, 1); fn(); }
    }
  }
  // swap a landmark's simple stand-in for its Blender model
  function swapIn(g, stand, id, after, gain) {
    loadModel(id, m => {
      // a brighter bake for the newer stops, to match the warm light in reference/road/
      if (gain) m.scene.traverse(o => { if (!o.isMesh) return; const u = o.material.uniforms; if (u) u.gain.value = BAKE_GAIN.clone().multiplyScalar(gain); else if (o.material.map) o.material.color.multiplyScalar(gain); });
      g.add(m.scene); g.remove(stand); if (after) after(m);
    });
  }
  function site(i, group, hit) {
    const s = SITES[i];
    group.position.set(s.x, 0, s.z); group.rotation.y = s.facing;
    const hb = new THREE.Mesh(new THREE.BoxGeometry(hit[0], hit[1], hit[2]), new THREE.MeshBasicMaterial({ visible: false }));
    hb.position.y = hit[1] / 2; hb.userData.stop = i; group.add(hb); hitMeshes.push(hb);
    scene.add(group);
    return group;
  }

  // 0. Julian's studio: the one place amber lives (reference/road/1-studio.png)
  {
    const g = new THREE.Group();
    // a simple stand-in, swapped for the Blender model once it loads
    const stand = new THREE.Group();
    stand.add(box(11, 4.2, 6, dark, 0, 2.6, 0));
    stand.add(plane(7.9, 3, new THREE.MeshBasicMaterial({ color: COL.amber }), -0.35, 2.65, 3.01));
    g.add(stand);
    const gl = glow(COL.amber, 12, 0.3); gl.position.set(-0.35, 2.4, 4); g.add(gl);
    const L = new THREE.PointLight(COL.amber, 1.4, 24); L.position.set(-0.35, 2, 6); g.add(L);
    site(0, g, [12, 6, 8]);
    swapIn(g, stand, 'studio');
    // the JP mark on the wood beside the window, unaltered
    fetch('models/studio.json').then(r => r.json()).then(meta => {
      const tex = new THREE.TextureLoader().load(document.getElementById('brand-mark').src);
      const w = meta.logoW, logo = plane(w, w * 0.45, new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.85 }), ...meta.logo);
      g.add(logo);
      // the oak's leaves: soft clumps, lit amber from the window underneath
      const lc = document.createElement('canvas'); lc.width = lc.height = 256;
      const x = lc.getContext('2d'), rnd = (() => { let a = 7; return () => (a = (a * 16807) % 2147483647) / 2147483647; })();
      for (let i = 0; i < 900; i++) {
        const an = rnd() * 6.283, rr = Math.sqrt(rnd()) * 112, px = 128 + Math.cos(an) * rr, py = 128 + Math.sin(an) * rr * 0.8;
        const lit = Math.max(0, (py - 128) / 128) * rnd();
        x.fillStyle = `rgb(${28 + lit * 80 | 0},${24 + lit * 46 | 0},${17 + lit * 16 | 0})`;
        x.beginPath(); x.ellipse(px, py, 3 + rnd() * 5, 1.5 + rnd() * 2.5, rnd() * 3, 0, 6.283); x.fill();
      }
      const leafMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(lc), alphaTest: 0.5, fog: true });
      for (const [lx, ly, lz, sz] of meta.leaves) {
        const sp = new THREE.Sprite(leafMat); sp.position.set(lx, ly, lz); sp.scale.set(sz, sz * 0.8, 1); g.add(sp);
      }
    });
  }

  // 1. Get seen: an outdoor screen playing a film
  const bb = canvasTex(1024, 512);
  {
    const g = new THREE.Group(), stand = new THREE.Group();
    stand.add(box(0.45, 5, 0.45, darker, -4.2, 2.5, 0), box(0.45, 5, 0.45, darker, 4.2, 2.5, 0));
    stand.add(box(11, 5.8, 0.4, darker, 0, 7.6, 0));
    g.add(stand);
    g.add(plane(10.4, 5.2, new THREE.MeshBasicMaterial({ map: bb.tex }), 0, 7.6, 0.21));
    const L = new THREE.PointLight(0xd8d0e0, 1.1, 26); L.position.set(0, 6, 5); g.add(L);
    const gl = glow(0xb9a9c4, 18, 0.18); gl.position.set(0, 7.6, 0.6); g.add(gl);
    site(1, g, [12, 11, 3]);
    near(1, () => swapIn(g, stand, 'billboard'));
  }
  const adVideo = document.createElement('video');
  Object.assign(adVideo, { muted: true, loop: true, playsInline: true, autoplay: true, preload: 'auto' });
  adVideo.setAttribute('playsinline', '');
  const adPoster = new Image();
  near(1, () => { adPoster.src = 'media/ad-poster.webp'; adVideo.src = 'media/ad-loop.mp4'; adVideo.play().catch(() => {}); });
  addEventListener('pointerdown', () => { if (adVideo.paused) adVideo.play().catch(() => {}); }, { once: true });
  function drawBillboard(t) {
    const x = bb.ctx, W = 1024, H = 512;
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#120f10'); g.addColorStop(0.62, '#2e1f29'); g.addColorStop(1, '#0d0b0a');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = '#0c0a09'; x.beginPath(); x.moveTo(0, H);
    for (let i = 0; i <= 64; i++) { const px = i / 64 * W; x.lineTo(px, 330 + Math.sin(i * 0.5 + 1) * 18 + Math.sin(i * 1.7) * 9); }
    x.lineTo(W, H); x.fill();
    // a road with a light trail inside the film
    const k = ((t * 0.18) % 1);
    x.strokeStyle = 'rgba(139,232,166,.9)'; x.lineWidth = 4; x.beginPath();
    for (let i = 0; i <= 40 * k; i++) { const s = i / 40; x.lineTo(W * 0.5 + Math.sin(s * 5) * 60 * (1 - s), H - 40 - s * 140); }
    x.stroke();
    // the ad itself, in a phone frame on the right
    const fw = 236, fh = 420, fx = W - fw - 70, fy = 34;
    x.fillStyle = '#0c0a09'; roundRect(x, fx - 10, fy - 10, fw + 20, fh + 20, 22); x.fill();
    const src = adVideo.readyState >= 2 ? adVideo : (adPoster.complete && adPoster.naturalWidth ? adPoster : null);
    if (src) x.drawImage(src, fx, fy, fw, fh);
    x.fillStyle = '#A79E90'; x.font = '600 15px "Hanken Grotesk", Arial, sans-serif'; spaced(x, 3); x.textAlign = 'center';
    x.fillText('SOUTHERN PAVERS · “3 MISTAKES”', fx + fw / 2, fy + fh + 30); spaced(x, 0);
    const cards = [['VIDEO STUDIO', 'Send the idea.', ''], ['VIDEO STUDIO', 'Get the film.', ''],
      ['ONE VIDEO, PLANNED, SHOT AND RUN', '58 conversations.', 'Meta figures through Sept 25, 2026'],
      ['AT', '$8.15 each.', 'Under $500 in total ad spend'], ['CAMPAIGNS', 'One idea. Pushed until it pays.', '']];
    const dur = 3.2, ci = Math.floor(t / dur) % cards.length, local = (t % dur) / dur, cx = 340;
    x.globalAlpha = Math.min(1, local * 6, (1 - local) * 6);
    x.fillStyle = '#A79E90'; x.font = '600 22px "Hanken Grotesk", Arial, sans-serif'; spaced(x, 5);
    x.fillText(cards[ci][0], cx, 150);
    spaced(x, 0);
    x.fillStyle = '#ECE6DA'; x.font = 'italic 300 ' + (cards[ci][1].length > 20 ? 50 : 74) + 'px Fraunces, Georgia, serif';
    x.fillText(cards[ci][1], cx, 240);
    if (cards[ci][2]) { x.fillStyle = '#A79E90'; x.font = '400 20px "Hanken Grotesk", Arial, sans-serif'; x.fillText(cards[ci][2], cx, 290); }
    x.globalAlpha = 1;
    x.fillStyle = 'rgba(236,230,218,.16)'; x.fillRect(60, H - 34, 560, 4);
    x.fillStyle = '#8BE8A6'; x.fillRect(60, H - 34, 560 * local, 4);
    bb.tex.needsUpdate = true;
  }

  // 2. Get chosen: six giant phones by the road, each scrolling a real site Julian built, captured at phone
  // width (reference/capture/), and a lit board that explains the website service (blender/landmarks.py phone())
  const SITESHOTS = [
    { img: 'media/sp-site.jpg', name: 'Southern Pavers', url: 'southernpaversscpro.com', tap: 994, tag: 'CLIENT SITE' },
    { img: 'media/b27-site.jpg', name: '27 Birds', url: '27birdsband.com', tap: 1099, tag: 'CLIENT SITE' },
    { img: 'media/apex-site.jpg', name: 'Apex', url: 'apextrophyexpeditions.com', tap: 886, tag: 'CLIENT SITE' },
    { img: 'media/dantonio-site.jpg', name: 'Anthony D’Antonio', url: 'anthonydantoniomusic.com', tap: null, tag: 'SITE I BUILT' },
    { img: 'media/batsreacts-site.jpg', name: 'Bats Reacts', url: 'batsreacts.com', tap: 704, tag: 'MY CHANNEL' },
    { img: 'media/jpax-site.jpg', name: 'JPAX Media', url: 'jpaxmedia.com', tap: null, tag: 'MY OWN SITE' }
  ].map(o => Object.assign(o, { shot: new Image(), ph: canvasTex(460, 1020) }));
  const CHOSEN = new THREE.Group();   // a phone screen is too narrow for all six at full size, so they shrink there
  const SERVICE = { c: null };
  {
    const g = CHOSEN, stand = new THREE.Group();
    stand.add(box(32, 8.4, 0.5, darker, 0.4, 4.4, 0));
    g.add(stand);
    near(2, () => fetch('models/phone.json').then(r => r.json()).then(meta => {
      SITESHOTS.forEach(o => { o.shot.src = o.img; });
      SITESHOTS.forEach((o, i) => {
        const [cx, cy, cz] = meta.screens[i], P = meta.plates[i];
        g.add(plane(meta.size[0], meta.size[1], new THREE.MeshBasicMaterial({ map: o.ph.tex, fog: false }), cx, cy, cz));
        const pc = canvasTex(1024, 128, (x, w, h) => drawPlate(x, w, h, o));
        g.add(plane(meta.plateSize[0], meta.plateSize[1], new THREE.MeshBasicMaterial({ map: pc.tex, fog: false }), ...P));
        if (document.fonts) document.fonts.ready.then(() => { drawPlate(pc.ctx, 1024, 128, o); pc.tex.needsUpdate = true; });
        const gl = glow(0xefe6d6, 11, 0.12); gl.position.set(cx, cy, 0.8); g.add(gl);
      });
      const B = meta.board;
      SERVICE.c = canvasTex(1024, Math.round(1024 * B.size[1] / B.size[0]), drawService);
      g.add(plane(B.size[0], B.size[1], new THREE.MeshBasicMaterial({ map: SERVICE.c.tex, fog: false }), ...B.pos));
      if (document.fonts) document.fonts.ready.then(() => { drawService(SERVICE.c.ctx, SERVICE.c.c.width, SERVICE.c.c.height); SERVICE.c.tex.needsUpdate = true; });
    }).catch(e => console.warn('phone layout did not load', e)));
    const L = new THREE.PointLight(0xefe6d6, 1.3, 30); L.position.set(0, 5, 6); g.add(L);
    site(2, g, [34, 9, 3]);
    near(2, () => swapIn(g, stand, 'phone', null, 1.2));
  }
  // the website service, on the board at the left end of the plinth
  function drawService(x, w, h) {
    const P = 84;
    x.fillStyle = '#161310'; x.fillRect(0, 0, w, h);
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillStyle = '#A79E90'; x.font = '600 30px ' + SANS; spaced(x, 6); x.fillText('BRAND STUDIO · WEBSITES', P, 130); spaced(x, 0);
    x.fillStyle = '#ECE6DA'; x.font = '300 84px ' + SERIF; x.fillText('People look', P, 250); x.fillText('you up.', P, 342);
    x.fillStyle = '#8BE8A6'; x.font = 'italic 300 84px ' + SERIF; x.fillText('Make them call.', P, 434);
    const pts = ['Built around the jobs you want more of', 'Fast on a phone', 'Easy to book from', 'Written to sound like you', 'Your domain, your accounts'];
    pts.forEach((t, i) => {
      const y = 560 + i * 92;
      x.fillStyle = '#2A2622'; x.fillRect(P, y - 58, w - 2 * P, 2);
      x.fillStyle = '#8BE8A6'; x.font = '600 32px ' + SANS; x.fillText(String(i + 1).padStart(2, '0'), P, y);
      x.fillStyle = '#ECE6DA'; x.font = '400 38px ' + SANS; x.fillText(t, P + 76, y, w - 2 * P - 76);
    });
    const y0 = h - 230;
    x.fillStyle = '#2A2622'; x.fillRect(P, y0 - 60, w - 2 * P, 2);
    x.fillStyle = '#ECE6DA'; x.font = '500 40px ' + SANS; x.fillText('Website creation', P, y0);
    x.textAlign = 'right'; x.fillText('from $3,500', w - P, y0); x.textAlign = 'left';
    x.fillStyle = '#A79E90'; x.font = '400 36px ' + SANS; x.fillText('Web management', P, y0 + 64);
    x.textAlign = 'right'; x.fillText('from $400/mo', w - P, y0 + 64); x.textAlign = 'left';
    x.fillStyle = '#6F675D'; x.font = '400 28px ' + SANS; x.fillText('Six sites I built, on the phones to the right.', P, h - 56);
  }
  function drawPlate(x, w, h, o) {
    x.fillStyle = '#161310'; x.fillRect(0, 0, w, h);
    x.textBaseline = 'middle'; x.textAlign = 'left';
    x.fillStyle = '#ECE6DA'; x.font = '400 60px Fraunces, Georgia, serif'; x.fillText(o.name, 36, h / 2 + 2, 620);
    x.fillStyle = '#8BE8A6'; x.font = '600 30px "Hanken Grotesk", sans-serif'; spaced(x, 4);
    x.textAlign = 'right'; x.fillText(o.tag, w - 36, h / 2 + 2); spaced(x, 0); x.textAlign = 'left';
  }
  function drawPhone(t) {
    SITESHOTS.forEach((o, i) => {
      const x = o.ph.ctx, W = 460, H = 1020, img = o.shot, BAR = 92;
      x.fillStyle = '#0b0a09'; x.fillRect(0, 0, W, H);
      x.save(); roundRect(x, 0, 0, W, H, 44); x.clip();
      if (img.complete && img.naturalWidth) {
        const s = W / img.naturalWidth, view = (H - BAR) / s, max = img.naturalHeight - view;
        // the top of the page and a tap on the main button, a slow scroll through, then back up;
        // each phone runs a third of a cycle behind the one before
        const c = (t + i * 16 / 6) % 16, k = c < 4 ? 0 : c < 12 ? smooth(4, 12, c) : 1 - smooth(12, 14, c);
        const y = k * max * 0.85;
        x.drawImage(img, 0, y, img.naturalWidth, view, 0, BAR, W, H - BAR);
        if (o.tap && c > 1.2 && c < 2.6) {
          const q = (c - 1.2) / 1.4, bx = W / 2, by = BAR + o.tap * s;
          x.strokeStyle = 'rgba(139,232,166,' + (1 - q) + ')'; x.lineWidth = 5;
          x.beginPath(); x.arc(bx, by, 12 + q * 80, 0, 6.283); x.stroke();
          x.fillStyle = 'rgba(236,230,218,' + (0.5 * (1 - q)) + ')'; x.beginPath(); x.arc(bx, by, 22, 0, 6.283); x.fill();
        }
      } else {
        const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b3a4d'); g.addColorStop(1, '#14100d');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
      }
      // the browser's address bar, so you can read whose site it is
      x.fillStyle = '#1c1917'; x.fillRect(0, 0, W, BAR);
      x.fillStyle = '#2e2a26'; roundRect(x, 24, 44, W - 48, 38, 19); x.fill();
      x.fillStyle = '#ECE6DA'; x.font = '600 21px "Hanken Grotesk", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(o.url, W / 2, 64); x.textAlign = 'left'; x.textBaseline = 'alphabetic';
      x.fillStyle = '#0b0a09'; x.beginPath(); x.arc(W / 2, 22, 9, 0, 6.283); x.fill();
      x.restore();
      o.ph.tex.needsUpdate = true;
    });
  }

  // 3. Build it: Julian's app lab (blender/landmarks.py buildshop()). Four bays, one section each:
  // the Southern Pavers patio visualizer, the Apex booking system, Jupiter, and the custom app service.
  // Each bay has a name sign, a big screen (a real walkthrough film, or the sketch-to-tool animation for
  // the service) and an explainer board. Samples and example data are labeled on the board.
  const SERIF = 'Fraunces, Georgia, serif', SANS = '"Hanken Grotesk", sans-serif';
  const BAYS = [
    { name: 'Patio visualizer', video: 'media/sp-explainer-loop.mp4', poster: 'media/sp-explainer-poster.webp',
      eyebrow: 'SOUTHERN PAVERS · A REAL APP', h: ['See the patio', 'before it’s dug.'],
      steps: ['A homeowner uploads a photo of their yard.', 'They pick a shape, the pavers and a style.', 'The new patio appears on their own yard.', 'Southern Pavers gets the plan and the contact.'],
      tag: 'LIVE ON SOUTHERNPAVERSSCPRO.COM · 54 PEOPLE HAVE OPENED IT', real: true },
    { name: 'Apex booking system', video: 'media/apex-portal-loop.mp4', poster: 'media/apex-portal-poster.webp',
      eyebrow: 'APEX TROPHY EXPEDITIONS · IN PROGRESS', h: ['Every booking,', 'one thread.'],
      steps: ['An inquiry lands on Apex’s admin board.', 'Quotes, dates and details move it toward a trip.', 'Each client follows their trip in their own portal.', 'The outfitter sees only the part they need.'],
      tag: 'BEING BUILT NOW · SHOWN ON SAMPLE DATA', real: false },
    { name: 'Jupiter', video: 'media/jupiter-tour-loop.mp4', poster: 'media/jupiter-tour-poster.webp',
      eyebrow: 'JPAX · THE SYSTEM I RUN ON', h: ['My whole business,', 'one cockpit.'],
      steps: ['Every client, job, invoice and date in one place.', 'Each client gets a portal scoped to their work.', 'Nova drafts the next step. I approve it first.', 'Every action is logged, start to finish.'],
      tag: 'REAL · SHOWN ON EXAMPLE DATA, PHANTOM CLIENTS', real: true },
    { name: 'Your app', video: null,
      eyebrow: 'BRAND STUDIO · CUSTOM APP BUILDS', h: ['Built around', 'how you work.'],
      steps: ['You show me how the business actually runs.', 'I scope what it must do for your crew and customers.', 'I build it, and you test it on real work.', 'It ships, and the code and accounts are yours.'],
      tag: 'FROM $8,000 · SCOPED FIRST, THEN BUILT', real: true, service: true }
  ];
  const BUILD = { bays: [], big: null };
  {
    const g = new THREE.Group(), stand = new THREE.Group();
    stand.add(box(25, 5.6, 7, dark, 0, 3.1, 0));
    g.add(stand);
    site(3, g, [26, 6.5, 9]);
    near(3, () => swapIn(g, stand, 'buildshop', null, 1.4));
    near(3, () => fetch('models/buildshop.json').then(r => r.json()).then(meta => {
      BUILD.big = canvasTex(1024, 512);
      meta.bays.forEach((b, i) => {
        const o = BAYS[i];
        const scr = canvasTex(1024, 576), info = canvasTex(2048, 614), head = canvasTex(2048, 205);
        g.add(plane(b.screen.size[0], b.screen.size[1], new THREE.MeshBasicMaterial({ map: scr.tex }), ...b.screen.pos));
        g.add(plane(b.info.size[0], b.info.size[1], new THREE.MeshBasicMaterial({ map: info.tex }), ...b.info.pos));
        g.add(plane(b.head.size[0], b.head.size[1], new THREE.MeshBasicMaterial({ map: head.tex }), ...b.head.pos));
        const bay = { o, scr, info, head, v: null, poster: null };
        if (o.video) {
          bay.v = document.createElement('video');
          Object.assign(bay.v, { muted: true, loop: true, playsInline: true, preload: 'none' });
          bay.v.setAttribute('playsinline', '');
          bay.poster = Object.assign(new Image(), { src: o.poster });
        }
        BUILD.bays.push(bay);
        const words = () => { drawBayInfo(bay); drawBayHead(bay); };
        words();
        if (document.fonts) document.fonts.ready.then(words);
      });
      drawBuild(0);
    }).catch(e => console.warn('build shop layout did not load', e)));
  }
  function drawBayHead(bay) {
    const x = bay.head.ctx, w = 2048, h = 205;
    x.fillStyle = '#161310'; x.fillRect(0, 0, w, h);
    x.textBaseline = 'middle'; x.textAlign = 'center';
    x.fillStyle = '#ECE6DA'; x.font = '400 120px ' + SERIF; x.fillText(bay.o.name, w / 2, h / 2 + 6);
    x.textAlign = 'left'; bay.head.tex.needsUpdate = true;
  }
  function drawBayInfo(bay) {
    const x = bay.info.ctx, w = 2048, h = 614, o = bay.o, P = 80;
    x.fillStyle = '#161310'; x.fillRect(0, 0, w, h);
    x.textBaseline = 'alphabetic'; x.textAlign = 'left';
    x.fillStyle = '#A79E90'; x.font = '600 34px ' + SANS; spaced(x, 6); x.fillText(o.eyebrow, P, 110); spaced(x, 0);
    x.fillStyle = '#ECE6DA'; x.font = '300 88px ' + SERIF; x.fillText(o.h[0], P, 232);
    x.fillStyle = '#8BE8A6'; x.font = 'italic 300 88px ' + SERIF; x.fillText(o.h[1], P, 332);
    // the four steps, numbered, on the right
    const X = 900;
    o.steps.forEach((s, i) => {
      const y = 104 + i * 104;
      x.fillStyle = '#2A2622'; x.fillRect(X, y - 62, w - X - P, 2);
      x.fillStyle = '#8BE8A6'; x.font = '600 38px ' + SANS; x.fillText(String(i + 1).padStart(2, '0'), X, y);
      x.fillStyle = '#ECE6DA'; x.font = '400 44px ' + SANS; x.fillText(s, X + 86, y, w - X - P - 86);
    });
    x.fillStyle = '#2A2622'; x.fillRect(P, h - 132, w - 2 * P, 2);
    x.fillStyle = o.real ? '#8BE8A6' : '#A79E90'; x.font = '600 34px ' + SANS; spaced(x, 5);
    x.fillText(o.tag, P, h - 66, w - 2 * P); spaced(x, 0);
    bay.info.tex.needsUpdate = true;
  }
  // the big screen: "how you work" sketched on paper, then the same steps as a working tool (an example)
  const FLOW = ['Call comes in', 'Site visit', 'Estimate', 'Follow-up'];
  function drawBig(t) {
    const x = BUILD.big.ctx, c = reduce ? 11.9 : t % 12;
    x.fillStyle = '#14110e'; x.fillRect(0, 0, 1024, 512);
    x.fillStyle = '#A79E90'; x.font = '600 22px ' + SANS; x.letterSpacing = '3px'; x.textBaseline = 'alphabetic';
    x.fillText('HOW YOU WORK', 48, 52); x.fillText('THE TOOL, BUILT AROUND IT', 576, 52); x.letterSpacing = '0px';
    // the sketch, drawn box by box
    x.save(); x.translate(48, 76); x.rotate(-0.015);
    x.fillStyle = '#ece6da'; x.fillRect(0, 0, 420, 400);
    x.strokeStyle = '#4a4037'; x.fillStyle = '#3a332b'; x.lineWidth = 3; x.font = 'italic 400 30px ' + SERIF;
    FLOW.forEach((f, i) => {
      const k = Math.max(0, Math.min(1, (c - i * 0.9) / 0.8)), y = 24 + i * 94;
      if (k <= 0) return;
      const pts = [[60, y], [360, y], [360, y + 62], [60, y + 62], [60, y]];
      let left = 2 * (300 + 62) * k;
      x.beginPath(); x.moveTo(60, y);
      for (let j = 1; j < pts.length && left > 0; j++) {
        const [ax, ay] = pts[j - 1], [bx, by] = pts[j], seg = Math.hypot(bx - ax, by - ay), u = Math.min(1, left / seg);
        x.lineTo(ax + (bx - ax) * u, ay + (by - ay) * u); left -= seg;
      }
      x.stroke();
      if (k > 0.6) { x.globalAlpha = (k - 0.6) / 0.4; x.fillText(f, 84, y + 42); x.globalAlpha = 1; }
      if (i < 3 && k >= 1) { x.beginPath(); x.moveTo(210, y + 66); x.lineTo(210, y + 90); x.moveTo(202, y + 82); x.lineTo(210, y + 90); x.lineTo(218, y + 82); x.stroke(); }
    });
    x.restore();
    // the hand-off, then the tool
    const a = Math.max(0, Math.min(1, c - 4));
    if (a > 0) {
      x.strokeStyle = '#8BE8A6'; x.lineWidth = 6; x.beginPath(); x.moveTo(486, 276); x.lineTo(486 + 70 * a, 276); x.stroke();
      if (a >= 1) { x.beginPath(); x.moveTo(542, 262); x.lineTo(558, 276); x.lineTo(542, 290); x.stroke(); }
    }
    if (c > 5) {
      x.fillStyle = '#1f1a16'; x.beginPath(); x.roundRect(576, 76, 400, 400, 16); x.fill();
      x.strokeStyle = '#2A2622'; x.lineWidth = 2; x.stroke();
      FLOW.forEach((f, i) => {
        const k = Math.max(0, Math.min(1, (c - 5.2 - i * 0.5) / 0.4)); if (k <= 0) return;
        const y = 100 + i * 90; x.globalAlpha = k;
        x.fillStyle = '#161310'; x.beginPath(); x.roundRect(596, y, 360, 72, 10); x.fill();
        x.fillStyle = '#ECE6DA'; x.font = '500 28px ' + SANS; x.fillText(f, 620, y + 46);
        x.globalAlpha = 1;
      });
      // one job moving down the steps
      if (c > 7.4) {
        const q = Math.min(3, (c - 7.4) / 1.1), done = Math.floor(q), y = 100 + q * 90;
        for (let j = 0; j < done; j++) { x.fillStyle = '#8BE8A6'; x.font = '700 28px ' + SANS; x.fillText('✓', 912, 100 + j * 90 + 46); }
        x.fillStyle = '#8BE8A6'; x.beginPath(); x.roundRect(870, y + 18, 66, 36, 18); x.fill();
        x.fillStyle = '#0C0B0A'; x.font = '700 20px ' + SANS; x.fillText('Job', 885, y + 43);
      }
      x.fillStyle = '#6F675D'; x.font = '500 20px ' + SANS; x.fillText('Example', 900, 500);
    }
    BUILD.big.tex.needsUpdate = true;
  }
  // the films only load once you're near the lab; each bay shows its poster until its film can play
  function builderNear(near) {
    if (reduce) return;
    for (const b of BUILD.bays) {
      const v = b.v; if (!v) continue;
      if (near && !v.src) v.src = b.o.video;
      if (near && v.paused) v.play().catch(() => {});
      if (!near && !v.paused) v.pause();
    }
  }
  addEventListener('pointerdown', () => { for (const b of BUILD.bays) if (b.v && b.v.src && b.v.paused && Math.abs(p - STOPS[3].t) < 0.09) b.v.play().catch(() => {}); });
  function drawBuild(t) {
    if (!BUILD.big) return;
    for (const b of BUILD.bays) {
      const x = b.scr.ctx;
      if (b.o.service) {
        drawBig(t);
        x.fillStyle = '#14110e'; x.fillRect(0, 0, 1024, 576);
        x.drawImage(BUILD.big.c, 0, 32);
      } else if (b.v && b.v.readyState >= 2) x.drawImage(b.v, 0, 0, 1024, 576);
      else if (b.poster && b.poster.complete && b.poster.naturalWidth) x.drawImage(b.poster, 0, 0, 1024, 576);
      else { x.fillStyle = '#14110e'; x.fillRect(0, 0, 1024, 576); }
      b.scr.tex.needsUpdate = true;
    }
  }
  // 4-6. One contractor's shop at three points in its story: a tired barn missing calls, the same barn
  // re-clad and wired with the scaffolding still up, then grown into a new wing, a paved lot and a fleet.
  // The calls come from the houses behind it (blender/landmarks.py shop()).
  const SHOP = { wired: null, lit: 0, before: null, after: null, pulse: null };
  function shopSite(i, id, after) {
    const g = new THREE.Group(), stand = new THREE.Group();
    stand.add(box(14, 4.2, 9, dark, 0, 2.1, 0));
    const r = roof(15, 2.9, 9.8, darker); r.position.y = 4.2; stand.add(r);
    g.add(stand);
    site(i, g, [16, 8, 12]);
    near(i, () => swapIn(g, stand, id, after, 1.35));
    return g;
  }
  const shopBefore = shopSite(4, 'shop');
  const shopWired = shopSite(5, 'shopwired', m => { SHOP.wired = m; });
  shopSite(6, 'shopbusy');
  near(6, () => { const go = () => window.JPAXCity ? window.JPAXCity.load() : setTimeout(go, 250); go(); });
  // a call line from a house to the roof: before the install it fades out partway, after it lands green
  function callLine(g, a, b, landed) {
    const c = a.clone().lerp(b, 0.5); c.y += 5;
    const curve = new THREE.QuadraticBezierCurve3(a, c, b), T = 40, R = 5;
    const geo = new THREE.TubeGeometry(curve, T, 0.09, R, false), col = new Float32Array(geo.attributes.position.count * 3);
    for (let i = 0; i <= T; i++) {
      const f = landed ? 1 : 0.4;
      for (let j = 0; j <= R; j++) col.set(landed ? [0.55, 0.91, 0.65] : [0.92 * f, 0.86 * f, 0.78 * f], (i * (R + 1) + j) * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.add(m);
    return { m, curve };
  }
  // a lit call-log sign out by the road: the audit writes down each call as it rings out,
  // and after the install the same sign logs them answered (an example night, labeled)
  // on a phone the panel covers the lower half of the screen, so there the sign hangs on the gable instead
  function callSign(g) {
    const c = canvasTex(1024, 560), frame = new THREE.MeshBasicMaterial({ color: 0x14110e });
    const s = new THREE.Group(), head = new THREE.Group(), legs = [];
    head.add(box(4.5, 2.6, 0.3, frame, 0, 1.75, -0.17));
    for (const lx of [-1.6, 1.6]) { const l = box(0.14, 1, 0.14, frame, lx, 0, -0.17); legs.push(l); s.add(l); }
    const face = new THREE.MeshBasicMaterial({ map: c.tex });
    head.add(plane(4.3, 2.35, face, 0, 1.75, 0));
    const spill = glow(0xf3e9d6, 7, 0.16); spill.position.set(0, 0.8, 1.2); head.add(spill);
    s.add(head);
    g.add(s);
    const sign = { c, rows: [], spill, face, head, legs, s, phone: null };
    placeSign(sign, false);
    return sign;
  }
  function placeSign(sign, phone) {
    if (sign.phone === phone) return;
    sign.phone = phone;
    if (phone) { sign.s.position.set(1.5, 0, 4.72); sign.s.rotation.y = 0; sign.s.scale.setScalar(0.85); sign.head.position.y = 4.6 / 0.85 - 1.75; }
    else { sign.s.position.set(1.5, 0, 11.6); sign.s.rotation.y = 0.5; sign.s.scale.setScalar(0.9); sign.head.position.y = 0; }
    sign.spill.visible = !phone;
    for (const l of sign.legs) { l.visible = !phone; l.scale.y = 0.45; l.position.y = 0.225; }
  }
  const CLOCK = { min: 21 * 60 + 38, next: 0 };
  function clockLabel(m) { const h = Math.floor(m / 60) % 24, mm = m % 60; return ((h + 11) % 12 + 1) + ':' + String(mm).padStart(2, '0') + (h < 12 ? ' AM' : ' PM'); }
  const MISSED = ['Rang out, no voicemail', 'Missed, after hours', 'Voicemail, never called back', 'Rang out, called someone else'];
  const ANSWERED = ['Answered, visit booked', 'Answered, estimate sent', 'Missed, texted back in 0:41', 'Answered, follow-up set'];
  function logCall(sign, after) {
    CLOCK.min += 6 + Math.floor(Math.random() * 14);
    const pool = (after ? ANSWERED : MISSED).filter(w => !sign.rows[0] || w !== sign.rows[0][1]);
    sign.rows.unshift([clockLabel(CLOCK.min), pool[Math.floor(Math.random() * pool.length)]]);
    sign.rows.length = Math.min(sign.rows.length, 2);
    sign.count = (sign.count || 0) + 1;
  }
  function drawSign(sign, after) {
    const x = sign.c.ctx, ink = after ? '#8BE8A6' : '#ECE6DA';
    x.fillStyle = '#161310'; x.fillRect(0, 0, 1024, 560);
    x.textBaseline = 'alphabetic'; x.textAlign = 'left';
    x.fillStyle = '#A79E90'; x.font = '600 32px ' + SANS; spaced(x, 5);
    x.fillText(after ? 'SYSTEM INSTALL · CALL LOG' : 'OPS AUDIT · CALL LOG', 52, 72);
    x.textAlign = 'right'; x.fillText(after ? 'EVERY CALL' : 'NIGHT 3 OF 14', 972, 72); spaced(x, 0); x.textAlign = 'left';
    x.fillStyle = '#2A2622'; x.fillRect(52, 96, 920, 2);
    sign.rows.forEach(([tm, what], k) => {
      const y = 188 + k * 120;
      x.globalAlpha = 1 - k * 0.35;
      x.fillStyle = '#A79E90'; x.font = '500 40px ' + SANS; x.fillText(tm, 52, y - 52);
      x.fillStyle = /^Answered|texted/.test(what) ? '#8BE8A6' : '#ECE6DA'; x.font = '600 58px ' + SANS; x.fillText(what, 52, y + 8, 920);
      x.globalAlpha = 1;
    });
    x.fillStyle = '#2A2622'; x.fillRect(52, 432, 920, 2);
    x.fillStyle = ink; x.font = '400 64px ' + SERIF;
    x.fillText(after ? 'Answered: ' + (sign.count || 0) + ' of ' + (sign.count || 0) : 'Missed tonight: ' + (sign.count || 0), 52, 512);
    x.fillStyle = '#6F675D'; x.font = '500 24px ' + SANS; x.textAlign = 'right'; x.fillText('Example night', 972, 508); x.textAlign = 'left';
    sign.c.tex.needsUpdate = true;
  }
  near(4, () => fetch('models/shop.json').then(r => r.json()).then(meta => {
    const roofPt = new THREE.Vector3(...meta.ridge);
    for (const [g, key, landed] of [[shopBefore, 'before', false], [shopWired, 'after', true]]) {
      const ring = glow(0xffd29a, 1.6, 0); ring.position.set(meta.phone[0], meta.phone[1], meta.phone[2] + 0.4); g.add(ring);
      SHOP[key] = { ring, lines: meta.houses.map(h => callLine(g, new THREE.Vector3(...h), roofPt, landed)), sign: callSign(g) };
      if (!landed) SHOP[key].sign.s.visible = false;   // the audit rig's laptop logs the calls at this stop
      for (const [k, l] of (meta.lamps || []).entries()) { const s = glow(0xffd6a6, k ? 1.6 : 2.6, 0.85); s.position.set(...l); g.add(s); }
      // the town on the hill behind, where the calls come from
      for (let k = 0; k < 9; k++) { const s = glow(0xffcf8f, 0.9 + (k % 3) * 0.3, 0.55); s.material.fog = false; s.position.set(-34 - k * 6, 5 + Math.sin(k * 1.7) * 1.6 + k * 0.5, -46 + (k % 2) * 5); g.add(s); }
      for (let k = 0; k < 4; k++) logCall(SHOP[key].sign, landed);
      drawSign(SHOP[key].sign, landed);
    }
    SHOP.pulse = glow(COL.green, 2.2, 0); shopWired.add(SHOP.pulse);
    SHOP.call = glow(0xf3e9d6, 1.8, 0); shopBefore.add(SHOP.call);
  }).catch(e => console.warn('shop layout did not load', e)));

  // 4. The Ops Audit, explained (blender/landmarks.py auditrig()): a giant phone wired to a giant laptop in front of
  // the dark shop. A 30-second loop in six chapters: the phone rings, the call runs down the cable, the laptop logs
  // it, two weeks add up, the after-hours mystery call, the estimates nobody chased, then the report card with the
  // visitor's own numbers. Everything but the visitor's estimate is labeled as an example.
  const RIG = { phone: null, laptop: null, curve: null, cable: null, pulses: [], shown: false, rang: -1 };
  const RIG_CH = [
    ['A call comes in.', 'Every call to your line gets logged, day and night.'],
    ['Nobody picks up.', 'Each miss gets a dollar figure.'],
    ['Two weeks, every call.', 'Answered, missed, after hours. All of it counted.'],
    ['After hours, I call you myself.', 'One mystery call from my phone, and I time the callback.'],
    ['The estimates nobody chased.', 'Already paid for, never followed up.'],
    ['Your report card.', 'The money math and a 90-day roadmap.']
  ];
  {
    const g = new THREE.Group();
    g.position.set(2.2, 0, 10.4); g.rotation.y = 0.12;
    shopBefore.add(g);
    near(4, () => loadModel('auditrig', m => {
      m.scene.traverse(o => { if (!o.isMesh) return; const u = o.material.uniforms; if (u) u.gain.value = BAKE_GAIN.clone().multiplyScalar(1.35); else if (o.material.map) o.material.color.multiplyScalar(1.35); });
      g.add(m.scene);
    }));
    near(4, () => fetch('models/auditrig.json').then(r => r.json()).then(meta => {
      const mk = (spec, cw, ch) => {
        const c = canvasTex(cw, ch), m = plane(spec.size[0], spec.size[1], new THREE.MeshBasicMaterial({ map: c.tex }), ...spec.pos);
        m.rotation.x = spec.rx; g.add(m); return c;
      };
      RIG.phone = mk(meta.phone, 512, Math.round(512 * meta.phone.size[1] / meta.phone.size[0]));
      RIG.laptop = mk(meta.laptop, 1600, Math.round(1600 * meta.laptop.size[1] / meta.laptop.size[0]));
      RIG.curve = new THREE.CatmullRomCurve3(meta.cable.map(q => new THREE.Vector3(...q)));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(RIG.curve, 48, 0.11, 8, false), new THREE.MeshBasicMaterial({ color: 0x1c1a18 })));
      for (let k = 0; k < 3; k++) { const s = glow(COL.green, 0.9, 0); g.add(s); RIG.pulses.push(s); }
      RIG.ring = glow(0xf3e9d6, 4.5, 0); RIG.ring.position.set(meta.phone.pos[0], meta.phone.pos[1] + 0.6, meta.phone.pos[2] + 0.3); g.add(RIG.ring);
      RIG.shown = true;
      drawRig(0);
    }).catch(e => console.warn('audit rig did not load', e)));
  }
  // the classic two-tone ring, made in Web Audio, only with sound on and only at this stop
  let ringCtx = null;
  function ringTone(secs, level) {
    if (!api.sound) return;
    try {
      ringCtx = ringCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = ringCtx.currentTime, g = ringCtx.createGain();
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(level, t0 + 0.04);
      g.gain.setValueAtTime(level, t0 + secs - 0.06); g.gain.linearRampToValueAtTime(0, t0 + secs);
      g.connect(ringCtx.destination);
      for (const f of [440, 480]) { const o = ringCtx.createOscillator(); o.frequency.value = f; o.connect(g); o.start(t0); o.stop(t0 + secs + 0.05); }
    } catch (e) {}
  }
  function rigClock(t) { const m = 21 * 60 + 47 + Math.floor(t / 30) * 13; return clockLabel(m); }
  // the phone's screen and the laptop's screen, drawn for any canvas: the road rig and the Ops Audit room share them
  function auditPhone(x, w, h, time) {
    const T = reduce ? 27 : time % 30, ch = Math.min(5, Math.floor(T / 5)), lt = T - ch * 5;
    const ringing = ch === 0 && lt > 0.5 && lt < 4.6 && ((lt - 0.5) % 2) < 1.5;
    {
      x.fillStyle = '#0c0b0a'; x.fillRect(0, 0, w, h);
      x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      x.fillStyle = '#A79E90'; x.font = '600 26px ' + SANS; x.fillText(rigClock(time), w / 2, 60);
      if (ch === 0) {
        x.fillStyle = '#A79E90'; x.font = '600 26px ' + SANS; spaced(x, 4); x.fillText('INCOMING CALL', w / 2, 240); spaced(x, 0);
        x.fillStyle = '#ECE6DA'; x.font = '400 60px ' + SERIF; x.fillText('Your business', w / 2, 320); x.fillText('line', w / 2, 384);
        for (let k = 0; k < 3; k++) {
          const q = ((lt * 0.8 + k / 3) % 1);
          x.strokeStyle = 'rgba(236,230,218,' + (ringing ? 0.5 * (1 - q) : 0) + ')'; x.lineWidth = 4;
          x.beginPath(); x.arc(w / 2, h * 0.62, 70 + q * 150, 0, 6.283); x.stroke();
        }
        x.fillStyle = '#ECE6DA'; x.beginPath(); x.arc(w / 2, h * 0.62, 66, 0, 6.283); x.fill();
        x.fillStyle = '#0c0b0a'; x.font = '600 30px ' + SANS; x.fillText('Ring', w / 2, h * 0.62 + 11);
        x.fillStyle = '#6F675D'; x.font = '500 24px ' + SANS; x.fillText('Nobody near the phone', w / 2, h - 80);
      } else if (ch === 1) {
        x.fillStyle = '#ECE6DA'; x.font = '600 26px ' + SANS; spaced(x, 4); x.fillText('MISSED CALL', w / 2, 240); spaced(x, 0);
        x.fillStyle = '#ECE6DA'; x.font = '400 60px ' + SERIF; x.fillText('No voicemail', w / 2, 330);
        x.fillStyle = '#A79E90'; x.font = '400 30px ' + SANS; x.fillText('They called someone else.', w / 2, 400);
      } else if (ch === 3) {
        x.fillStyle = '#D9A066'; x.font = '600 26px ' + SANS; spaced(x, 4); x.fillText('JULIAN · CALLING', w / 2, 240); spaced(x, 0);
        x.fillStyle = '#ECE6DA'; x.font = '400 60px ' + SERIF; x.fillText('Your business', w / 2, 320); x.fillText('line', w / 2, 384);
        x.fillStyle = '#A79E90'; x.font = '500 34px ' + SANS; x.fillText('0:' + String(Math.min(59, Math.floor(lt * 9))).padStart(2, '0'), w / 2, 460);
        x.fillStyle = '#6F675D'; x.font = '500 24px ' + SANS; x.fillText('After hours, a mystery call', w / 2, h - 80);
      } else {
        // the phone's recent calls, the way the owner would see them
        x.fillStyle = '#A79E90'; x.font = '600 24px ' + SANS; spaced(x, 4); x.fillText('RECENTS', w / 2, 140); spaced(x, 0);
        x.textAlign = 'left';
        const rows = [['Missed', '9:47 PM'], ['Missed', '8:12 PM'], ['Answered', '4:30 PM'], ['Missed', '12:05 PM'], ['Answered', '10:41 AM'], ['Missed', '7:58 AM']];
        rows.forEach(([k, tm], i) => {
          const y = 220 + i * 92;
          x.fillStyle = '#2A2622'; x.fillRect(40, y + 30, w - 80, 2);
          x.fillStyle = k === 'Missed' ? '#ECE6DA' : '#ECE6DA'; x.font = '500 34px ' + SANS; x.fillText(k, 40, y);
          x.fillStyle = '#A79E90'; x.font = '400 28px ' + SANS; x.textAlign = 'right'; x.fillText(tm, w - 40, y); x.textAlign = 'left';
        });
        x.fillStyle = '#6F675D'; x.font = '500 22px ' + SANS; x.textAlign = 'center'; x.fillText('Example calls', w / 2, h - 60);
      }
      x.textAlign = 'left';
    }
  }
  function auditLaptop(x, w, h, time) {
    const T = reduce ? 27 : time % 30, ch = Math.min(5, Math.floor(T / 5)), lt = T - ch * 5;
    const ringing = ch === 0 && lt > 0.5 && lt < 4.6 && ((lt - 0.5) % 2) < 1.5;
    const job = Math.round(nums.value * nums.rate / 100);
    {
      const P = 80;
      x.fillStyle = '#161310'; x.fillRect(0, 0, w, h);
      x.textAlign = 'left'; x.textBaseline = 'alphabetic';
      x.fillStyle = '#A79E90'; x.font = '600 28px ' + SANS; spaced(x, 5); x.fillText('OPS AUDIT · ' + String(ch + 1).padStart(2, '0') + ' / 06', P, 86);
      x.textAlign = 'right'; x.fillText('TWO WEEKS ON YOUR LINE', w - P, 86); x.textAlign = 'left'; spaced(x, 0);
      const fade = reduce ? 1 : Math.min(1, lt * 3, (5 - lt) * 3);
      x.globalAlpha = fade;
      x.fillStyle = '#ECE6DA'; x.font = '300 84px ' + SERIF; x.fillText(RIG_CH[ch][0], P, 200);
      x.fillStyle = '#A79E90'; x.font = '400 36px ' + SANS; x.fillText(RIG_CH[ch][1], P, 256);
      const top = 320, L = P, R = w - P;
      if (ch === 0 || ch === 1) {
        const rows = [[rigClock(time), ch === 0 ? (ringing ? 'Ringing…' : 'Ringing') : 'Missed · after hours', ch === 1 ? '−' + money(job) : ''],
          ['8:12 PM', 'Missed · rang out', '−' + money(job)], ['4:30 PM', 'Answered', ''], ['12:05 PM', 'Missed · voicemail, no callback', '−' + money(job)]];
        rows.forEach(([tm, what, cost], i) => {
          const y = top + 40 + i * 92;
          x.fillStyle = '#2A2622'; x.fillRect(L, y + 34, R - L, 2);
          x.fillStyle = '#A79E90'; x.font = '500 32px ' + SANS; x.fillText(tm, L, y);
          x.fillStyle = /^Missed/.test(what) ? '#ECE6DA' : /^Ring/.test(what) ? '#ECE6DA' : '#8BE8A6'; x.font = '600 38px ' + SANS; x.fillText(what, L + 230, y);
          if (cost) { x.fillStyle = '#ECE6DA'; x.font = '500 36px ' + SANS; x.textAlign = 'right'; x.fillText(cost, R, y); x.textAlign = 'left'; }
        });
        if (ch === 1) { x.fillStyle = '#6F675D'; x.font = '500 26px ' + SANS; x.fillText('Each miss: ' + money(nums.value) + ' job × ' + nums.rate + '% that would have booked = ' + money(job), L, h - 60); }
      } else if (ch === 2) {
        const days = 14, bw = (R - L) / days, k = reduce ? 1 : Math.min(1, lt / 3.4);
        for (let d = 0; d < days; d++) {
          if (d / days > k) break;
          const ans = 5 + ((d * 7) % 5), mis = 1 + ((d * 5) % 4) + (d % 7 > 4 ? 2 : 0), base = h - 120, u = 30;
          x.fillStyle = '#3a4a3f'; x.fillRect(L + d * bw + 8, base - ans * u, bw - 16, ans * u);
          x.fillStyle = '#ECE6DA'; x.fillRect(L + d * bw + 8, base - ans * u - mis * u, bw - 16, mis * u);
          x.fillStyle = '#6F675D'; x.font = '500 22px ' + SANS; x.textAlign = 'center'; x.fillText('D' + (d + 1), L + d * bw + bw / 2, base + 36); x.textAlign = 'left';
        }
        x.fillStyle = '#6F675D'; x.font = '500 24px ' + SANS; x.textAlign = 'right'; x.fillText('Answered · Missed · Example figures', R, h - 34); x.textAlign = 'left';
      } else if (ch === 3) {
        const rows = [['Day 3 · 9:52 PM', 'Mystery call placed'], ['Rang 6 times', 'No answer, no voicemail'], ['Callback', lt > 2.5 ? 'None by morning' : 'Waiting…']];
        rows.forEach(([a, b], i) => {
          const y = top + 60 + i * 110;
          x.fillStyle = '#2A2622'; x.fillRect(L, y + 40, R - L, 2);
          x.fillStyle = '#A79E90'; x.font = '500 34px ' + SANS; x.fillText(a, L, y);
          x.fillStyle = i === 2 && lt > 2.5 ? '#ECE6DA' : '#ECE6DA'; x.font = '600 40px ' + SANS; x.fillText(b, L + 420, y);
        });
        x.fillStyle = '#6F675D'; x.font = '500 24px ' + SANS; x.textAlign = 'right'; x.fillText('Example', R, h - 34); x.textAlign = 'left';
      } else if (ch === 4) {
        const rows = [['Patio, back yard', '41 days', 'No follow-up'], ['Driveway reseal', '33 days', 'No follow-up'], ['Retaining wall', '27 days', 'One text, then nothing'], ['Walkway', '19 days', 'No follow-up']];
        rows.forEach(([a, b, c], i) => {
          if (!reduce && lt < 0.4 + i * 0.5) return;
          const y = top + 40 + i * 92;
          x.fillStyle = '#2A2622'; x.fillRect(L, y + 34, R - L, 2);
          x.fillStyle = '#ECE6DA'; x.font = '500 36px ' + SANS; x.fillText(a, L, y);
          x.fillStyle = '#A79E90'; x.font = '500 32px ' + SANS; x.fillText(b, L + 560, y);
          x.fillStyle = '#ECE6DA'; x.font = '600 32px ' + SANS; x.textAlign = 'right'; x.fillText(c, R, y); x.textAlign = 'left';
        });
        x.fillStyle = '#6F675D'; x.font = '500 24px ' + SANS; x.textAlign = 'right'; x.fillText('Example estimates', R, h - 34); x.textAlign = 'left';
      } else {
        x.fillStyle = '#A79E90'; x.font = '600 26px ' + SANS; spaced(x, 4); x.fillText('TOTAL QUANTIFIED LOSS · YOUR ROUGH ESTIMATE', L, top + 40); spaced(x, 0);
        x.fillStyle = '#8BE8A6'; x.font = '300 132px ' + SERIF; x.fillText(money(loss()) + ' a year', L, top + 180);
        x.fillStyle = '#A79E90'; x.font = '400 30px ' + SANS; x.fillText(mathLine() + '. Rough estimate from your inputs; the audit measures the real number.', L, top + 240, R - L);
        const sc = [['Calls answered', 'Leaking', '#E07A5F'], ['Speed to lead', 'Watch', '#E3C06B'], ['Estimate follow-up', 'Leaking', '#E07A5F']];
        sc.forEach(([a, b, c], i) => {
          const X = L + i * (R - L) / 3, y = h - 110;
          x.fillStyle = c; x.beginPath(); x.arc(X + 12, y - 12, 11, 0, 6.283); x.fill();
          x.fillStyle = '#ECE6DA'; x.font = '500 32px ' + SANS; x.fillText(a, X + 36, y);
          x.fillStyle = c; x.font = '600 26px ' + SANS; x.fillText(b, X + 36, y + 40);
        });
      }
      x.globalAlpha = 1;
      // chapter progress along the bottom edge
      for (let k = 0; k < 6; k++) { x.fillStyle = k < ch ? '#8BE8A6' : k === ch ? 'rgba(139,232,166,.5)' : '#2A2622'; x.fillRect(P + k * (w - 2 * P) / 6 + 4, h - 14, (w - 2 * P) / 6 - 8, 6); }
    }
  }
  function drawRig(time) {
    if (!RIG.shown) return;
    const T = reduce ? 27 : time % 30, ch = Math.min(5, Math.floor(T / 5)), lt = T - ch * 5;
    const ringing = ch === 0 && lt > 0.5 && lt < 4.6 && ((lt - 0.5) % 2) < 1.5;
    const job = Math.round(nums.value * nums.rate / 100);
    auditPhone(RIG.phone.ctx, RIG.phone.c.width, RIG.phone.c.height, time); RIG.phone.tex.needsUpdate = true;
    auditLaptop(RIG.laptop.ctx, RIG.laptop.c.width, RIG.laptop.c.height, time); RIG.laptop.tex.needsUpdate = true;
    // ---- the cable: the call runs from the phone to the laptop while it rings ----
    RIG.pulses.forEach((s, k) => {
      const run = (ch === 0 && lt > 0.5) || ch === 3;
      const u = ((T * 0.55) + k / 3) % 1;
      if (run && !reduce) { RIG.curve.getPoint(u, s.position); s.material.opacity = 0.95 * Math.sin(u * Math.PI); }
      else s.material.opacity = 0;
    });
    RIG.ring.material.opacity = reduce ? 0 : ringing ? 0.35 + 0.35 * Math.abs(Math.sin(time * 14)) : 0;
    const burst = ch === 0 ? Math.floor((lt - 0.5) / 2) : -1;
    if (ringing && burst !== RIG.rang && Math.abs(p - STOPS[4].t) < 0.06) { RIG.rang = burst; ringTone(1.5, 0.05); }
    if (ch !== 0) RIG.rang = -1;
  }

  // ---------- Labels over each stop ----------
  const labels = [];
  function makeLabel(i, eyebrow, name, color, y) {
    const L = canvasTex(1024, 256);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: L.tex, transparent: true, depthWrite: false, fog: false }));
    s.scale.set(10, 2.5, 1);
    s.position.set(SITES[i].x, y, SITES[i].z);
    s.userData = { L, eyebrow, name, color };
    scene.add(s); labels.push(s);
  }
  function drawLabel(s) {
    const { L, eyebrow, name, color } = s.userData, x = L.ctx;
    x.clearRect(0, 0, 1024, 256); x.textAlign = 'center';
    x.shadowColor = 'rgba(12,11,10,.9)'; x.shadowBlur = 18;
    x.fillStyle = '#A79E90'; x.font = '600 34px "Hanken Grotesk", Arial, sans-serif'; spaced(x, 7);
    x.fillText(eyebrow, 512, 80); spaced(x, 0);
    x.fillStyle = color; x.font = 'italic 300 92px Fraunces, Georgia, serif';
    x.fillText(name, 512, 190);
    L.tex.needsUpdate = true;
  }
  makeLabel(0, 'GREENVILLE, SC', 'Julian’s studio', '#D9A066', 10.2);
  makeLabel(1, 'BRAND STUDIO', 'Get seen', '#ECE6DA', 13.4);
  makeLabel(2, 'BRAND STUDIO', 'Get chosen', '#ECE6DA', 13.6);
  makeLabel(3, 'BRAND STUDIO', 'Build it', '#ECE6DA', 7.5);
  makeLabel(4, 'SYSTEMS', 'Ops Audit', '#ECE6DA', 10.5);
  makeLabel(5, 'SYSTEMS', 'System Install', '#8BE8A6', 10.5);
  makeLabel(6, 'SYSTEMS', 'Operating Partner', '#ECE6DA', 10.5);

  function drawStatic() { labels.forEach(drawLabel); }
  drawStatic();
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('italic 300 92px Fraunces'), document.fonts.load('600 34px "Hanken Grotesk"')]).then(drawStatic, () => {});
  }

  // ---------- Calls on the road ----------
  const LN = 80;
  const leads = [];
  const lp = new Float32Array(LN * 3), la = new Float32Array(LN), lc = new Float32Array(LN * 3), lsz = new Float32Array(LN);
  const leadGeo = new THREE.BufferGeometry();
  leadGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  leadGeo.setAttribute('aAlpha', new THREE.BufferAttribute(la, 1));
  leadGeo.setAttribute('aColor', new THREE.BufferAttribute(lc, 3));
  leadGeo.setAttribute('aSize', new THREE.BufferAttribute(lsz, 1));
  const leadMat = new THREE.ShaderMaterial({
    uniforms: { uDensity: { value: 0.03 }, uPR: { value: renderer.getPixelRatio() } },
    vertexShader: 'attribute float aAlpha; attribute vec3 aColor; attribute float aSize; uniform float uDensity; uniform float uPR; varying float vA; varying vec3 vC;' +
      'void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); float d = -mv.z; float f = exp(-pow(uDensity * d * 0.75, 2.0));' +
      'vA = aAlpha * f; vC = aColor; gl_PointSize = aSize * uPR * (220.0 / max(d, 1.0)); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying float vA; varying vec3 vC; void main(){ float r = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, r); gl_FragColor = vec4(vC, a * a * vA); }',
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const leadPts = new THREE.Points(leadGeo, leadMat); leadPts.frustumCulled = false; scene.add(leadPts);
  function spawn(l, init) {
    l.s = init ? Math.random() * 0.95 : Math.random() * 0.05;
    l.v = 0.022 + Math.random() * 0.018; l.off = (Math.random() - 0.5) * 2.6;
    l.leaking = false; l.leak = 0; l.checked = init && l.s > 0.56; l.ph = Math.random() * 6.28; l.dir = Math.random() < 0.5 ? -1 : 1;
  }
  for (let i = 0; i < LN; i++) { const l = {}; spawn(l, true); leads.push(l); }
  const cPaper = new THREE.Color(0xe8dfd0), cGreen = new THREE.Color(COL.green);

  // ---------- Navigation state ----------
  let p = 0, target = 0, yawOff = 0, pitchOff = 0, lastInput = 0, snapped = true;
  function clampP(v) { return Math.min(PMAX, Math.max(0, v)); }
  function goTo(i) { i = Math.max(0, Math.min(STOPS.length - 1, i)); target = STOPS[i].t; snapped = true; lastInput = performance.now(); }
  window.goTo = goTo;
  function nearestStop(v) { let b = 0; for (let i = 1; i < STOPS.length; i++) if (Math.abs(STOPS[i].t - v) < Math.abs(STOPS[b].t - v)) b = i; return b; }
  function nudge(dv) { target = clampP(target + dv); snapped = false; lastInput = performance.now(); }
  // #stop=3 opens the road at that stop (for sharing a stop, and for checking one)
  { const m = /stop=(\d)/.exec(location.hash); if (m && STOPS[+m[1]]) p = target = STOPS[+m[1]].t; }
  pumpLazy();   // the opening stop's neighbours load behind the veil

  addEventListener('wheel', e => {
    if (api.walking || api.inside || (e.target.closest && e.target.closest('.panel'))) return;
    e.preventDefault();
    const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    nudge((e.deltaY + e.deltaX * 0.5) * k * 0.00032);
  }, { passive: false });

  addEventListener('keydown', e => {
    if (api.walking || api.inside || (e.target.closest && e.target.closest('input,textarea'))) return;
    const cur = nearestStop(target);
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && e.target === document.body)) {
      e.preventDefault();
      if (cur === STOPS.length - 1 && window.JPAXCity) window.JPAXCity.enter(); else goTo(cur + 1);
    }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(cur - 1); }
    else if (e.key === 'Home') goTo(0);
    else if (e.key === 'End') goTo(STOPS.length - 1);
  });

  // ---------- lower the text: the whole world, with no panel or card in the way ----------
  const lowerBtn = document.getElementById('lower-btn'), lowerBar = document.getElementById('lowerbar');
  function setLowered(on) {
    on = !!on; if (on === !!api.lowered) return;
    api.lowered = on;
    document.body.classList.toggle('lowered', on);
    if (lowerBtn) {
      lowerBtn.setAttribute('aria-pressed', String(on));
      lowerBtn.querySelector('.long').textContent = on ? 'Show text' : 'Lower text';
      lowerBtn.querySelector('.short').textContent = on ? 'Show' : 'Lower';
    }
    if (lowerBar) {
      lowerBar.hidden = !on;
      if (on && document.activeElement && document.activeElement.closest('.panel, .inside-card, .walk-card')) lowerBar.querySelector('[data-l="show"]').focus({ preventScroll: true });
    }
    emit('lowered', on);
  }
  if (lowerBtn) lowerBtn.addEventListener('click', () => setLowered(!api.lowered));
  if (lowerBar) lowerBar.addEventListener('click', e => {
    const b = e.target.closest('[data-l]'); if (!b) return;
    if (b.dataset.l === 'show') setLowered(false);
    else if (b.dataset.l === 'next' && nearestStop(target) === STOPS.length - 1 && window.JPAXCity) window.JPAXCity.enter();
    else goTo(nearestStop(target) + (b.dataset.l === 'next' ? 1 : -1));
  });
  addEventListener('keydown', e => {
    if ((e.key !== 'h' && e.key !== 'H') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input,textarea,select')) return;
    const tv = document.getElementById('textv'); if (tv && !tv.hidden) return;
    setLowered(!api.lowered);
  });

  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  let drag = null;
  canvas.addEventListener('pointerdown', e => {
    if (api.walking || api.inside) return;
    drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, touch: e.pointerType !== 'mouse', moved: false, axis: null };
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging');
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
    if (drag.touch) {
      if (!drag.axis && drag.moved) drag.axis = Math.abs(e.clientY - drag.sy) > Math.abs(e.clientX - drag.sx) ? 'y' : 'x';
      if (drag.axis === 'y') nudge(-dy * 0.0013);
      else if (drag.axis === 'x') yawOff += dx * 0.004;
    } else {
      yawOff += dx * 0.0035; pitchOff = Math.max(-0.6, Math.min(0.6, pitchOff + dy * 0.0028));
    }
    lastInput = performance.now();
  });
  function endDrag(e) {
    if (!drag) return;
    if (!drag.moved) {
      const r = canvas.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObjects(hitMeshes, false)[0];
      if (hit) goTo(hit.object.userData.stop);
    }
    drag = null; canvas.classList.remove('dragging');
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', () => { drag = null; canvas.classList.remove('dragging'); });
  canvas.addEventListener('pointerleave', e => { if (drag && !drag.touch && e.buttons === 0) endDrag(e); });

  if (matchMedia('(pointer: coarse)').matches) document.getElementById('hint').textContent = 'Swipe up to travel. Tap a landmark to go there.';

  // the walking city (js/city.js) borrows the scene and takes the camera while it runs
  const api = window.JPAXWorld = { THREE, scene, camera, renderer, canvas, loadModel, glow, canvasTex, COL, CITY, CITY_ROAD, terrainH,
    STOPS, walking: false, walkTick: null, inside: null, insideTick: null, resize: null, goTo: i => goTo(i), reduce,
    numbers: () => ({ ...nums, loss: loss(), math: mathLine(), entered }), money, calcHTML, bindCalc,
    on: (n, f) => (bus[n] = bus[n] || []).push(f), emit, lowered: false, setLowered: on => setLowered(on), audit: { phone: auditPhone, laptop: auditLaptop, ring: ringTone } };

  // ---------- Resize ----------
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = w < 600 ? 66 : 55;
    if (api.walking || api.inside) { camera.fov = w < 600 ? 72 : 62; camera.clearViewOffset(); camera.updateProjectionMatrix(); return; }
    applyOffset();
  }
  // keep the stop's landmark clear of the panel: right of it on wide screens, above it on narrow ones.
  // offK eases to 0 when the text is lowered, so the scene slides back to the middle
  let offK = 1;
  function applyOffset() {
    const w = innerWidth, h = innerHeight;
    if (offK < 0.002) camera.clearViewOffset();
    else if (w > 860) { const s = Math.min(240, w * 0.15) * offK; camera.setViewOffset(w + 2 * s, h, 0, 0, w, h); }
    else { const s = h * 0.17 * offK; camera.setViewOffset(w, h + 2 * s, 0, 2 * s, w, h); }
    camera.updateProjectionMatrix();
  }
  api.resize = resize;
  addEventListener('resize', resize); resize();

  // ---------- Frame loop ----------
  const camPos = new THREE.Vector3(), look = new THREE.Vector3(), lookSm = new THREE.Vector3(), tmp = new THREE.Vector3();
  // phones: aim at the middle of what's there (fxN along the landmark), and some stops step back (backN) and rise (liftN) to fit it in
  const FOCUS = SITES.map(s => new THREE.Vector3(s.x + Math.cos(s.facing) * (s.fxN || 0), s.focusYN || s.focusY, s.z - Math.sin(s.facing) * (s.fxN || 0)));
  // on wide screens the panel sits left, so some stops aim off-center (fx, along the landmark)
  const FOCUS_WIDE = SITES.map(s => new THREE.Vector3(s.x + Math.cos(s.facing) * (s.fx || 0), s.focusY, s.z - Math.sin(s.facing) * (s.fx || 0)));
  const legend = document.getElementById('legend'), legendText = document.getElementById('legend-text');
  let installedShown = null, numsShown = -1, sev = 1;
  let first = true, prev = performance.now(), frame = 0;
  const off = new THREE.Color(0x16120f), on = new THREE.Color(0xe8dcc2), wc = new THREE.Color();

  function tick(now) {
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now; frame++;
    const time = now / 1000;
    // inside a room (js/interiors.js), the room has the renderer to itself
    if (api.inside) { api.insideTick(dt, time); requestAnimationFrame(tick); return; }
    pumpLazy();

    // snap to the nearest stop once input settles
    if (!snapped && !drag && now - lastInput > 650) {
      const i = nearestStop(target);
      if (Math.abs(STOPS[i].t - target) < 0.09) target = STOPS[i].t;
      snapped = true;
    }
    p += (target - p) * (1 - Math.exp(-dt * (reduce ? 8 : 1.9)));
    if (Math.abs(target - p) < 1e-5) p = target;
    if (!drag) { yawOff *= Math.exp(-dt * 0.9); pitchOff *= Math.exp(-dt * 0.9); }

    const installed = p >= INSTALL_T - 0.025;
    const clear = smooth(0.58, 0.93, p);
    sev += (severity() - sev) * Math.min(1, dt * 2);
    scene.fog.density = 0.034 - 0.008 * smooth(0, 0.5, p) - 0.0205 * clear + 0.005 * (sev - 1) * (1 - clear);
    leadMat.uniforms.uDensity.value = scene.fog.density;
    sky.material.uniforms.uClear.value = clear;
    starMat.opacity = 0.35 + 0.5 * clear;

    if (api.walking) {
      scene.fog.density = api.walkFog != null ? api.walkFog : 0.011; sky.material.uniforms.uClear.value = 1; starMat.opacity = 0.85;
      api.walkTick(dt, time);
      sky.position.copy(camera.position); stars.position.copy(camera.position);
    } else {
    // camera along the road
    const r = rs(p), rise = smooth(0.84, PMAX, p) * 2.5;
    let best = 0, bw = 0;
    for (let i = 0; i < STOPS.length; i++) { const w = Math.exp(-Math.pow((p - STOPS[i].t) / 0.04, 2)); if (w > bw) { bw = w; best = i; } }
    // some landmarks lift the camera a little so you look down into them
    const wantOff = api.lowered ? 0 : 1;
    if (offK !== wantOff) { offK += (wantOff - offK) * Math.min(1, dt * (reduce ? 20 : 4)); if (Math.abs(offK - wantOff) < 0.002) offK = wantOff; applyOffset(); }
    const narrow = camera.aspect < 0.9, S = SITES[best], centred = narrow || api.lowered;
    camPos.set(r.x, 3.3 + rise + bw * ((S.lift || 0) + (narrow ? S.liftN || 0 : 0)), r.z);
    if (narrow && S.backN) { tmp.set(camPos.x - S.x, 0, camPos.z - S.z).normalize(); camPos.addScaledVector(tmp, bw * S.backN); }
    const a = rs(Math.min(p + 0.05, 1));
    look.set(a.x, 1.4 + rise * 0.35, a.z);
    // on a narrow phone screen, turn fully toward the stop so it isn't left out of frame
    // with the text lowered there's no panel to dodge, so wide screens aim at the middle of the landmark too
    look.lerp(centred ? FOCUS[best] : FOCUS_WIDE[best], bw * (narrow ? 0.95 : 0.62));
    if (first) { lookSm.copy(look); first = false; } else lookSm.lerp(look, 1 - Math.exp(-dt * (reduce ? 10 : 3.5)));
    tmp.subVectors(lookSm, camPos);
    const len = tmp.length(), yaw = Math.atan2(tmp.x, tmp.z) + yawOff, pit = Math.max(-1.2, Math.min(1.2, Math.asin(tmp.y / len) + pitchOff));
    camera.position.copy(camPos);
    camera.lookAt(camPos.x + Math.sin(yaw) * Math.cos(pit) * len, camPos.y + Math.sin(pit) * len, camPos.z + Math.cos(yaw) * Math.cos(pit) * len);
    sky.position.copy(camPos); stars.position.copy(camPos);
    }

    // the green trail grows with the drive
    const uEnd = Math.min(1, p + 0.045), segs = Math.floor(uEnd * (N - 1)) * 6;
    trailCore.geometry.setDrawRange(0, segs); trailGlow.geometry.setDrawRange(0, segs);
    const h = rs(uEnd); trailHead.position.set(h.x, 0.5, h.z);
    trailHead.scale.setScalar(2.6 + Math.sin(time * 3) * (reduce ? 0 : 0.5));

    // landmark animation
    if (frame % 2 === 0) drawBillboard(time);
    if (frame % 2 === 1) drawPhone(time);
    CHOSEN.scale.setScalar(camera.aspect < 0.9 ? 0.34 : 1);
    if (frame % 3 === 0) { builderNear(Math.abs(p - STOPS[3].t) < 0.09); drawBuild(time); }

    // the shop: before the install its phone rings out and the calls fade before they reach it;
    // at the install stop the same shop wires up, and every call lands
    SHOP.lit += ((installed ? 1 : 0) - SHOP.lit) * (1 - Math.exp(-dt * 1.6));
    if (SHOP.wired) {
      for (const u of SHOP.wired.fades) u.value = SHOP.lit;
      for (const sw of SHOP.wired.switches) sw.color.copy(SWITCH_OFF).lerp(sw.on, SHOP.lit);
    }
    const ring = (time % 3) < 1.2 ? Math.abs(Math.sin(time * 15)) : 0;
    if (SHOP.before) {
      // one call at a time: it runs the line to the shop, rings, nobody picks up, and it drifts off.
      // The sign logs it as it goes.
      const CY = 6, ct = reduce ? 2.5 : time % CY, n = Math.floor(time / CY), cl = SHOP.before.lines[n % SHOP.before.lines.length];
      const ringing = ct > 1.8 && ct < 3.6;
      SHOP.before.ring.material.opacity = reduce ? 0.5 : ringing ? Math.abs(Math.sin(time * 15)) * 0.95 : 0;
      SHOP.before.lines.forEach(l => { l.m.material.opacity = l === cl && !reduce ? 0.9 : 0.4; });
      if (ct < 1.8) { cl.curve.getPoint(ct / 1.8, SHOP.call.position); SHOP.call.material.opacity = 0.95; }
      else if (ct < 3.6) { cl.curve.getPoint(1, SHOP.call.position); SHOP.call.material.opacity = 0.6 + 0.35 * Math.abs(Math.sin(time * 15)); }
      else { const d = (ct - 3.6) / 1.6; cl.curve.getPoint(1, SHOP.call.position); SHOP.call.position.y += d * 3; SHOP.call.position.z += d * 2; SHOP.call.material.opacity = Math.max(0, 0.6 * (1 - d)); }
      if (reduce) SHOP.call.material.opacity = 0;
      if (!reduce && n !== SHOP.logged && ct > 3.6) {
        SHOP.logged = n;
        logCall(SHOP.before.sign, false); drawSign(SHOP.before.sign, false);
        if (installed) { logCall(SHOP.after.sign, true); drawSign(SHOP.after.sign, true); }
      }
      for (const k of ['before', 'after']) placeSign(SHOP[k].sign, camera.aspect < 0.9);
      if (frame % 2 === 0 && Math.abs(p - STOPS[4].t) < 0.12) drawRig(time);
      SHOP.after.sign.spill.material.opacity = 0.16 * SHOP.lit;
      SHOP.after.sign.face.color.setScalar(0.2 + 0.8 * SHOP.lit);
      SHOP.after.ring.material.opacity = (reduce ? 0.5 : ring * 0.9) * (1 - SHOP.lit);
      SHOP.after.lines.forEach(l => { l.m.material.opacity = SHOP.lit * 0.9; });
      // a text back to the caller, riding the line from the roof to a house
      const tp = (time % 2.4) / 2.4, line = SHOP.after.lines[Math.floor(time / 2.4) % SHOP.after.lines.length];
      line.curve.getPoint(1 - tp, SHOP.pulse.position);
      SHOP.pulse.material.opacity = SHOP.lit * Math.sin(tp * Math.PI) * 0.9;
    }

    // calls travelling the road
    for (let i = 0; i < LN; i++) {
      const l = leads[i];
      l.s += l.v * dt * (reduce ? 0.4 : 1);
      if (!l.checked && l.s > 0.56) { l.checked = true; if (!installed && Math.random() < Math.min(0.75, 0.42 * Math.pow(sev, 0.7))) l.leaking = true; }
      if (l.leaking) { l.leak += dt; l.s -= l.v * dt * 0.75; if (l.leak > 2.8) spawn(l, false); }
      if (l.s >= 1) spawn(l, false);
      const q = rs(l.s), lat = l.off + (l.leaking ? l.dir * l.leak * l.leak * 2.4 : 0);
      lp[i * 3] = q.x + q.sx * lat; lp[i * 3 + 1] = 0.9 + Math.sin(time * 2 + l.ph) * 0.15 + l.leak * 1.3; lp[i * 3 + 2] = q.z + q.sz * lat;
      la[i] = l.leaking ? Math.max(0, 1 - l.leak / 2.8) : smooth(0, 0.02, l.s);
      const c = (!l.leaking && l.s > SITES[5].u) ? cGreen : cPaper;
      lc[i * 3] = c.r; lc[i * 3 + 1] = c.g; lc[i * 3 + 2] = c.b;
      lsz[i] = l.leaking ? 1.6 : 2.1;
    }
    leadGeo.attributes.position.needsUpdate = true; leadGeo.attributes.aAlpha.needsUpdate = true;
    leadGeo.attributes.aColor.needsUpdate = true; leadGeo.attributes.aSize.needsUpdate = true;

    if (installed !== installedShown || numsVersion !== numsShown) {
      if (installed !== installedShown && installedShown !== null) emit('installed', installed);
      installedShown = installed; numsShown = numsVersion;
      legend.classList.toggle('caught', installed);
      legendText.textContent = installed ? 'Calls on the road. With the system in, every one gets answered.'
        : 'Calls on the road. At ' + (entered ? 'your' : 'typical') + ' numbers, about ' + money(loss()) + ' a year drifts off into the fog.';
    }

    // labels fade with distance
    labels.forEach((s, i) => {
      const d = s.position.distanceTo(camPos), here = Math.exp(-Math.pow((p - STOPS[i].t) / 0.05, 2));
      s.material.opacity = api.walking ? 0 : (1 - smooth(60, 100, d)) * smooth(15, 27, d) * (1 - here);
    });

    showStop(nearestStop(p));
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  drawBillboard(0); drawPhone(0);
  requestAnimationFrame(tick);
})();
