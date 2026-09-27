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
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitFine = form.querySelector('.actions .fine');
    var errorBox = document.getElementById('form-error');
    var copy = {
      'Ops Audit': ['Request my audit', '$2,000 flat, credited to the install.'],
      'Ad campaigns': ['Ask about ads', '$1,500 a month plus ad spend.'],
      'Not sure yet': ['Send it over', "I'll tell you where I'd start."]
    };
    var fromLink = { ads: 'Ad campaigns', audit: 'Ops Audit', unsure: 'Not sure yet' };
    function syncInterest() {
      var c = copy[interest.value] || copy['Ops Audit'];
      submitBtn.firstChild.nodeValue = c[0] + ' ';
      submitFine.textContent = c[1];
    }
    interest.addEventListener('change', syncInterest);
    document.querySelectorAll('[data-interest]').forEach(function (el) {
      el.addEventListener('click', function () { interest.value = el.getAttribute('data-interest'); syncInterest(); });
    });
    var asked = new URLSearchParams(location.search).get('interest');
    if (asked && fromLink[asked]) interest.value = fromLink[asked];
    syncInterest();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var first = String(data.get('name') || '').trim().split(' ')[0];
      data.set('subject', data.get('interest') + ' request: ' + String(data.get('business') || '').trim());
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

  /* ---- Thank-you page: greet by first name ---- */
  var doneName = document.getElementById('done-name');
  if (doneName) { try { var n = sessionStorage.getItem('jpax_first_name'); if (n) doneName.textContent = ', ' + n; } catch (err) {} }

})();
