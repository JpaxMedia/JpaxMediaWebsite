(() => {
  // Sound for the JPAX-verse: ambience, a music bed, small effects, and Nova's voice guiding each stop.
  // Off until the visitor turns it on. Files live in audio/ (Nova, Julian's ElevenLabs voice, read slow; script approved by Julian Nov 2, 2026;
  // his own earlier takes are kept in audio-julian/, unpublished).
  const W = window.JPAXWorld;
  const btn = document.getElementById('sound');
  if (!btn) return;
  if (!W || W.noGL) { btn.hidden = true; return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { btn.hidden = true; return; }

  const VOICE = {
    stop: ['v01-welcome.mp4', 'v02-get-seen', 'v03-get-chosen', 'v04-build-it', 'v05-ops-audit', 'v06-install', 'v07-partner'],
    city: 'v08-downtown', close: 'v14-close', numbers: 'v13-report-card',
    inside: { road: 'v15-inside-road', street: 'v15-inside-street' },
    spot: { 'cinema-screen': 'v09-cinema', 'yard-ad': 'v10-paver-yard', 'venue-window': 'v11-27-birds', jupiter: 'v12-jupiter' }
  };
  const PREF = 'jpax-world-sound';

  let ctx = null, master, musicGain, ambRoad, ambCity, voiceGain;
  const buffers = {}, loading = {};
  let on = false, voiceSrc = null, queue = [];
  const heard = new Set();

  function load(name) {
    if (buffers[name]) return Promise.resolve(buffers[name]);
    if (!loading[name]) {
      loading[name] = fetch('audio/' + name + (name.includes('.') ? '' : '.mp3')).then(r => r.arrayBuffer())
        .then(b => new Promise((res, rej) => ctx.decodeAudioData(b, res, rej)))
        .then(buf => (buffers[name] = buf))
        .catch(e => { console.warn('sound did not load: ' + name, e); delete loading[name]; return null; });
    }
    return loading[name];
  }
  function loop(name, gain) {
    load(name).then(buf => {
      if (!buf) return;
      const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(gain); s.start();
    });
  }
  function bus(level) { const g = ctx.createGain(); g.gain.value = level; g.connect(master); return g; }
  function fadeTo(g, v, secs) {
    const t = ctx.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(v, t + (secs || 0.6));
  }

  function start() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    musicGain = bus(0.16); ambRoad = bus(0); ambCity = bus(0); voiceGain = bus(1);
    loop('music-bed', musicGain); loop('amb-road', ambRoad); loop('amb-city', ambCity);
    ['step', 'whoosh', 'chime', 'tap'].forEach(load);
  }

  function setOn(v, fromClick) {
    on = v;
    W.sound = on; W.emit('sound', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.querySelector('span').textContent = on ? 'Sound on' : 'Sound off';
    try { localStorage.setItem(PREF, on ? '1' : '0'); } catch (e) {}
    if (!on) { if (ctx) { fadeTo(master, 0, 0.4); stopVoice(); } return; }
    if (!ctx) start();
    if (ctx.state === 'suspended') ctx.resume();
    fadeTo(master, 0.9, 0.8);
    setScene(W.walking);
    if (fromClick && !W.walking) say(VOICE.stop[currentStop], 'stop' + currentStop);
  }
  btn.addEventListener('click', () => setOn(!on, true));

  function setScene(walking) {
    if (!ctx) return;
    // indoors, the street is only a murmur through the walls
    const inside = !!W.inside;
    fadeTo(ambRoad, walking || inside ? 0 : 0.5, 1.2);
    fadeTo(ambCity, inside ? 0.07 : walking ? 0.55 : 0, 1.2);
  }

  // ---------- voice: one line at a time, music ducks under it ----------
  function stopVoice() { queue = []; if (voiceSrc) { try { voiceSrc.stop(); } catch (e) {} voiceSrc = null; } }
  function say(name, key, after) {
    if (!on || !name || heard.has(key)) return;
    heard.add(key);
    stopVoice();
    queue = after ? [after] : [];
    play(name);
  }
  function play(name) {
    load(name).then(buf => {
      if (!buf || !on) return;
      const s = ctx.createBufferSource(); s.buffer = buf; s.connect(voiceGain);
      fadeTo(musicGain, 0.06, 0.4);
      s.onended = () => {
        if (voiceSrc !== s) return;
        voiceSrc = null;
        const next = queue.shift();
        if (next) setTimeout(() => { if (on && !voiceSrc) play(next); }, 500);
        else fadeTo(musicGain, filmNear ? 0.04 : 0.16, 1.2);
      };
      voiceSrc = s; s.start();
    });
  }
  function fx(name, level, rate) {
    if (!on || !buffers[name]) return;
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buffers[name]; s.playbackRate.value = rate || 1; g.gain.value = level; s.connect(g); g.connect(master); s.start();
  }

  // ---------- following the world ----------
  let currentStop = 0, stopTimer = 0;
  W.on('stop', i => {
    currentStop = i; clearTimeout(stopTimer);
    // speak once the drive settles on a stop
    stopTimer = setTimeout(() => { if (currentStop === i && !W.walking) say(VOICE.stop[i], 'stop' + i, i === 6 ? VOICE.close : null); }, 900);
  });
  W.on('installed', v => { if (v) fx('chime', 0.55); });
  let numTimer = 0;
  W.on('numbers', () => { clearTimeout(numTimer); numTimer = setTimeout(() => say(VOICE.numbers, 'numbers'), 2200); });
  W.on('city', walking => {
    fx('whoosh', 0.5); setScene(walking);
    if (walking) setTimeout(() => say(VOICE.city, 'city'), 900); else stopVoice();
  });
  let insideTimer = 0;
  W.on('inside', id => {
    fx('whoosh', 0.4); setScene(W.walking); clearTimeout(insideTimer);
    // the first room of the visit gets a short how-to; walking means you came in off the street
    if (id) insideTimer = setTimeout(() => { if (W.inside === id) say(VOICE.inside[W.walking ? 'street' : 'road'], 'inside'); }, 1200);
  });
  W.on('spot', id => say(VOICE.spot[id], 'spot-' + id));
  // a voiced film on a street screen: the music steps back while you're close enough to hear it
  let filmNear = false;
  W.on('filmvoice', near => {
    if (near === filmNear || !ctx) return;
    filmNear = near;
    if (!voiceSrc) fadeTo(musicGain, near ? 0.04 : 0.16, 1.0);
  });
  W.on('step', () => fx('step', 0.32, 0.9 + Math.random() * 0.2));
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('.rail-btn, .nav-btn, .btn, .walk-back, .inside-spots button, .films button')) fx('tap', 0.35);
  }, true);

  // a visitor who turned sound on before gets the button lit, but browsers need a tap before audio can start
  let wanted = false;
  try { wanted = localStorage.getItem(PREF) === '1'; } catch (e) {}
  if (wanted) {
    const resume = e => { if (e.target && e.target.closest && e.target.closest('#sound')) return; removeEventListener('pointerdown', resume, true); removeEventListener('keydown', resume, true); if (!on) setOn(true, false); };
    addEventListener('pointerdown', resume, true); addEventListener('keydown', resume, true);
  }
})();
