(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header menu ---- */
  var bar = document.getElementById('bar');
  var menuBtn = document.getElementById('menu-btn');
  function closeMenu() {
    bar.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }
  menuBtn.addEventListener('click', function () {
    var open = bar.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.querySelectorAll('#menu a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  window.addEventListener('hashchange', closeMenu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && bar.classList.contains('open')) { closeMenu(); menuBtn.focus(); } });

  /* ---- Arriving from another page with #section: land on it once layout settles ---- */
  var landing = location.hash && document.getElementById(location.hash.slice(1));
  if (landing) {
    var userScrolled = false;
    ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, function () { userScrolled = true; }, { once: true, passive: true }); });
    var land = function () { if (!userScrolled) landing.scrollIntoView({ block: 'start', behavior: 'instant' }); };
    requestAnimationFrame(land);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(land);
    window.addEventListener('load', land);
  }

  /* ---- Scroll: progress bar, road journey, hero drift ---- */
  var progress = document.querySelector('.progress');
  var journey = document.getElementById('how');
  var stage = journey && journey.querySelector('.stage');
  var stops = journey ? journey.querySelectorAll('.stops span') : [];
  var heroImg = document.getElementById('hero-img');
  var ticking = false;
  function update() {
    ticking = false;
    var max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--sp', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    if (heroImg && !reduce && scrollY < innerHeight * 1.2) heroImg.style.setProperty('--py', (scrollY * .12).toFixed(1) + 'px');
    if (!journey) return;
    if (reduce) { stage.style.setProperty('--p', .5); return; }
    var rect = journey.getBoundingClientRect();
    var total = journey.offsetHeight - innerHeight;
    var p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
    stage.style.setProperty('--p', p.toFixed(4));
    var idx = p < .34 ? 0 : p < .67 ? 1 : 2;
    stops.forEach(function (s, i) { s.classList.toggle('on', rect.top < innerHeight * .5 && rect.bottom > innerHeight * .5 && i === idx); });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---- Leak calculator ---- */
  if (document.getElementById('c-calls')) (function () {
  var cCalls = document.getElementById('c-calls'), cJob = document.getElementById('c-job'), cRate = document.getElementById('c-rate');
  var oYear = document.getElementById('o-year'), shown = 49920, anim = null;
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function fillTrack(el) { el.style.setProperty('--fill', ((el.value - el.min) / (el.max - el.min) * 100) + '%'); }
  function calc() {
    var calls = +cCalls.value, job = +cJob.value, rate = +cRate.value;
    document.getElementById('o-calls').textContent = calls;
    document.getElementById('o-job').textContent = money(job);
    document.getElementById('o-rate').textContent = rate + '%';
    [cCalls, cJob, cRate].forEach(fillTrack);
    var year = calls * (rate / 100) * job * 52;
    document.getElementById('o-month').textContent = money(year / 12);
    document.getElementById('o-math').textContent = calls + ' calls × ' + rate + '% × ' + money(job) + ' × 52 weeks';
    cancelAnimationFrame(anim);
    if (reduce) { shown = year; oYear.textContent = money(year); return; }
    var from = shown, t0 = performance.now();
    (function tick(now) {
      var k = Math.min(1, (now - t0) / 450), e = 1 - Math.pow(1 - k, 3);
      shown = from + (year - from) * e; oYear.textContent = money(shown);
      if (k < 1) anim = requestAnimationFrame(tick);
    })(t0);
  }
  [cCalls, cJob, cRate].forEach(function (el) { el.addEventListener('input', calc); });
  calc();
  })();

  /* ---- Ad films ---- */
  document.querySelectorAll('.ad-film').forEach(function (fig) {
    var v = fig.querySelector('video'), b = fig.querySelector('.play');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); v.pause(); }
    if (b) b.addEventListener('click', function () {
      v.loop = false; v.muted = false; v.src = fig.getAttribute('data-full') || '/assets/site/ad-full.mp4'; v.controls = true;
      fig.classList.add('full'); v.play().catch(function () {});
    });
  });

  /* ---- Booking form (Netlify Forms: project-inquiry) ---- */
  var form = document.getElementById('audit-form');
  if (form) (function () {
    var interest = document.getElementById('f-interest');
    var laneInputs = form.querySelectorAll('input[name="lane"]');
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitFine = form.querySelector('.actions .fine');
    var errorBox = document.getElementById('form-error');
    var bookTitle = document.getElementById('book-title');
    var bookIntro = document.getElementById('book-intro');
    var bookSteps = document.querySelectorAll('#book-steps li');
    var notes = document.getElementById('f-notes');
    var copy = {
      'Ops Audit': ['Request my audit', '$2,000 flat, credited to the install.'],
      'System Install': ['Ask about an install', 'From $12,000. Every install starts with the audit.'],
      'Operating Partner': ['Ask about a partnership', 'From $1,500 a month.'],
      'Website creation': ['Ask about a website', 'Websites from $3,500.'],
      'Web management': ['Ask about web management', 'From $400 a month.'],
      'Custom app build': ['Tell me about the app', 'Custom apps from $8,000.'],
      'Content creation': ['Ask about content', 'From $1,200 a month.'],
      'Video Studio': ['Ask about a video', 'From $750 a video, or from $1,500 a month.'],
      'Ad campaigns': ['Ask about ads', '$1,500 a month plus ad spend.'],
      'Ad management': ['Ask about ad management', 'From $1,500 a month plus ad spend.'],
      'Not sure yet': ['Send it over', "I'll tell you where I'd start."]
    };
    // What the booking column says for each lane. The first interest is the default when a lane is picked.
    var laneCopy = {
      'Systems': {
        first: 'Ops Audit', title: 'Book your <em>Ops Audit.</em>', intro: 'Tell me about the business. I read every request myself.',
        steps: ['I reply within one business day.', 'We book a 30-minute kickoff call.', 'Two weeks later, you have the number.'],
        notes: "What's bugging you most: missed calls, estimates, reviews..."
      },
      'Studio': {
        first: 'Website creation', title: 'Start a <em>Studio project.</em>', intro: 'Tell me about the business and what you want people to see. I read every request myself.',
        steps: ['I reply within one business day.', 'We get on a call and talk through the work.', 'You see the scope and the price before anything starts.'],
        notes: 'What you have now, what you want, and any sites or brands you admire...'
      },
      'Not sure': {
        first: 'Not sure yet', title: 'Tell me <em>where it hurts.</em>', intro: "Tell me what's going on. I read every request myself.",
        steps: ['I reply within one business day.', 'We talk it through for 30 minutes.', "I tell you which lane I'd start with, and why."],
        notes: "What's frustrating you most right now..."
      }
    };
    var fromLink = {
      audit: 'Ops Audit', install: 'System Install', partner: 'Operating Partner',
      website: 'Website creation', webcare: 'Web management', app: 'Custom app build',
      content: 'Content creation', video: 'Video Studio', ads: 'Ad campaigns', admanagement: 'Ad management', unsure: 'Not sure yet'
    };
    var laneLink = { systems: 'Systems', studio: 'Studio', unsure: 'Not sure' };

    // The static HTML lists every option so Netlify sees them all; the menu only shows the picked lane's.
    var groups = {};
    interest.querySelectorAll('optgroup').forEach(function (g) { groups[g.getAttribute('data-lane')] = g; });
    var unsureOpt = interest.querySelector('option[value="Not sure yet"]');
    function laneOf(value) {
      for (var k in groups) if (groups[k].querySelector('option[value="' + value + '"]')) return k;
      return null;
    }
    function currentLane() {
      var c = form.querySelector('input[name="lane"]:checked');
      return c ? c.value : 'Systems';
    }
    function syncInterest() {
      var c = copy[interest.value] || copy['Ops Audit'];
      submitBtn.firstChild.nodeValue = c[0] + ' ';
      submitFine.textContent = c[1];
    }
    function setLane(lane, want) {
      var l = laneCopy[lane] || laneCopy['Systems'];
      laneInputs.forEach(function (r) { r.checked = r.value === lane; });
      // A requested interest (link or button) wins if it belongs here; a plain lane switch keeps the pick only if it fits.
      var fits = want !== undefined
        ? (!groups[lane] || want === 'Not sure yet' || laneOf(want) === lane)
        : laneOf(interest.value) === lane;
      var pick = want !== undefined ? want : interest.value;
      interest.textContent = '';
      (groups[lane] ? [groups[lane]] : [groups.Systems, groups.Studio]).forEach(function (g) { interest.appendChild(g); });
      interest.appendChild(unsureOpt);
      interest.value = fits ? pick : l.first;
      bookTitle.innerHTML = l.title;
      bookIntro.textContent = l.intro;
      bookSteps.forEach(function (li, i) { li.textContent = l.steps[i]; });
      notes.placeholder = l.notes;
      syncInterest();
    }
    laneInputs.forEach(function (r) { r.addEventListener('change', function () { setLane(r.value); }); });
    interest.addEventListener('change', syncInterest);
    document.querySelectorAll('[data-interest]').forEach(function (el) {
      el.addEventListener('click', function () {
        var v = el.getAttribute('data-interest');
        setLane(laneOf(v) || currentLane(), v);
      });
    });
    var params = new URLSearchParams(location.search);
    var askedInterest = fromLink[params.get('interest')];
    var askedLane = laneLink[params.get('lane')] || laneOf(askedInterest) || 'Systems';
    setLane(askedLane, askedInterest || laneCopy[askedLane].first);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var first = String(data.get('name') || '').trim().split(' ')[0];
      data.set('subject', '[' + data.get('lane') + '] ' + data.get('interest') + ' request: ' + String(data.get('business') || '').trim());
      submitBtn.disabled = true; errorBox.hidden = true;
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() })
        .then(function (res) {
          if (!res.ok) throw new Error('Form error ' + res.status);
          try { sessionStorage.setItem('jpax_first_name', first); } catch (err) {}
          location.assign('/thank-you');
        })
        .catch(function () { submitBtn.disabled = false; errorBox.hidden = false; });
    });
  })();

  /* ---- Studio route: one stop open at a time, the road lights up behind you ---- */
  var route = document.getElementById('route-list');
  if (route) (function () {
    var stops = Array.prototype.slice.call(route.querySelectorAll('.stop'));
    // scroll: 'always' (chooser, next stop), 'if-moved' (heading click), or 'never' (page load)
    function open(id, scroll) {
      var at = -1;
      stops.forEach(function (stop, i) {
        var on = stop.id === id && !stop.classList.contains('open');
        if (stop.id === id) at = on ? i : -1;
        stop.classList.toggle('open', on);
        stop.querySelector('.stop-head').setAttribute('aria-expanded', on ? 'true' : 'false');
        stop.querySelector('.stop-body').hidden = !on;
      });
      stops.forEach(function (stop, i) { stop.classList.toggle('passed', at > -1 && i < at); });
      var target = at > -1 && stops[at];
      if (!target || scroll === 'never') return;
      var top = target.getBoundingClientRect().top;
      // Closing a stop above shifts the page; bring the new chapter's heading into view if it slid away.
      if (scroll === 'always' || top < 0 || top > innerHeight * .6) target.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
    function show(id) {
      var stop = document.getElementById(id);
      if (stop && !stop.classList.contains('open')) open(id, 'always');
      else if (stop) stop.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
    stops.forEach(function (stop) {
      stop.querySelector('.stop-head').addEventListener('click', function () { open(stop.id, 'if-moved'); });
    });
    document.querySelectorAll('[data-open]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        show(el.getAttribute('data-open'));
        history.replaceState(null, '', '#' + el.getAttribute('data-open'));
      });
    });
    // Everything is open without JavaScript. With it, start on the stop in the link, or the first one.
    var hashed = location.hash && document.getElementById(location.hash.slice(1));
    route.classList.add('guided');
    open(hashed && hashed.classList.contains('stop') ? hashed.id : stops[0].id, 'never');
  })();

  /* ---- Thank-you page: greet by first name ---- */
  var doneName = document.getElementById('done-name');
  if (doneName) { try { var n = sessionStorage.getItem('jpax_first_name'); if (n) doneName.textContent = ', ' + n; } catch (err) {} }

})();
