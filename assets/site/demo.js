  /* ---- Interactive owner view demo (all names and numbers are made up) ---- */
  (function () {
    var root = document.getElementById('demo'); if (!root) return;
    var reduceM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var $ = function (id) { return document.getElementById(id); };
    var SRC = { call: '☎', form: '✉', text: '✎' };
    var ST = { new: 'New', texted: 'Texted back', booked: 'Booked' };
    var slots = ['SAT 9:00', 'SAT 11:30', 'MON 8:00', 'MON 1:00', 'TUE 10:00'];
    var inq = [
      { id: 1, name: 'Dana R.', src: 'call', time: '6:12 PM', what: 'Upstairs AC blowing warm air', status: 'texted',
        tl: [['6:12 PM', 'Call missed. Crew was on a job.', ''], ['6:13 PM', 'Text-back sent: "Sorry we missed you! What’s going on?"', 'sys'], ['6:15 PM', 'Dana: "Upstairs unit is blowing warm air."', 'cust']] },
      { id: 2, name: 'Marcus T.', src: 'form', time: '5:48 PM', what: 'Quote for a new system', status: 'new',
        tl: [['5:48 PM', 'Web form: 2,400 sq ft home, 15-year-old unit.', 'cust'], ['5:48 PM', 'Instant text sent and a callback queued.', 'sys']] },
      { id: 3, name: 'Lisa P.', src: 'text', time: '4:30 PM', what: 'Asking about a maintenance plan', status: 'new',
        tl: [['4:30 PM', 'Lisa: "Do you do yearly maintenance plans?"', 'cust'], ['4:30 PM', 'Auto reply with plan options sent.', 'sys']] }
    ];
    var week = [['SAT', '8:00 · Furnace tune-up · Okafor'], ['MON', '10:30 · Estimate visit · Hendricks']];
    var calls = [
      ['Dana R.', '6:12 PM', 'saved', 'Missed, texted back in 41s'],
      ['Okafor', '5:55 PM', 'ok', 'Answered, booked Saturday'],
      ['(864) 555-0139', '5:20 PM', 'ok', 'Answered after hours, message taken'],
      ['Hendricks', '3:05 PM', 'ok', 'Answered, estimate visit booked'],
      ['Spam caller', '2:41 PM', 'bad', 'Screened out']
    ];
    var STEPS = ['Day 1', 'Day 3', 'Day 7', 'Day 14'];
    var ests = [
      { name: 'Hendricks residence', amt: '$8,400', sent: 'Sent Monday', step: 2 },
      { name: 'Alvarez duplex', amt: '$3,150', sent: 'Sent Wednesday', step: 1 },
      { name: 'Pine St. rental', amt: '$1,900', sent: 'Sent 2 weeks ago', step: 4 }
    ];
    var revs = [
      { name: 'Okafor', job: 'AC repair · Thursday', rating: 5, state: 'ready' },
      { name: 'Brennan', job: 'Duct cleaning · Wednesday', rating: 2, state: 'ready' },
      { name: 'Castillo', job: 'New thermostat · Tuesday', rating: 5, state: 'ready' }
    ];
    var callers = [
      { num: '(864) 555-0147', name: 'Jordan W.', what: 'Water heater leaking in the garage' },
      { num: '(864) 555-0162', name: 'Priya S.', what: 'No heat, two kids at home' },
      { num: '(864) 555-0118', name: 'Tom B.', what: 'AC making a grinding noise' }
    ];
    var sel = 1, simN = 0, busy = false, nextId = 10;

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function toast(msg, sub, warn) {
      var t = document.createElement('div');
      t.className = 'd-toast' + (warn ? ' warn' : '');
      t.innerHTML = '<i></i><div>' + esc(msg) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>';
      var box = $('d-toasts'); box.appendChild(t);
      while (box.children.length > 2) box.removeChild(box.firstChild);
      setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 450); }, 3000);
    }
    function bump(id, d) {
      var el = $(id); el.textContent = (+el.textContent + d);
      el.classList.add('bump'); setTimeout(function () { el.classList.remove('bump'); }, 1400);
    }

    function renderInq(freshId) {
      $('d-inq-count').textContent = inq.length;
      $('d-inq').innerHTML = inq.map(function (q) {
        return '<li><button type="button" class="d-card' + (q.id === freshId ? ' fresh' : '') + '" data-q="' + q.id + '" aria-pressed="' + (q.id === sel) + '">' +
          '<span class="src" aria-hidden="true">' + SRC[q.src] + '</span><b>' + esc(q.name) + '</b>' +
          '<span class="st ' + q.status + '">' + ST[q.status] + '</span>' +
          '<small>' + esc(q.what) + '</small><span class="t">' + q.time + '</span></button></li>';
      }).join('');
    }
    function renderDetail(newLine) {
      var q = inq.filter(function (x) { return x.id === sel; })[0];
      if (!q) { $('d-detail').innerHTML = '<p class="d-empty">Pick an inquiry to see what happened.</p>'; return; }
      var tl = q.tl.map(function (l, i) {
        return '<li class="' + l[2] + (newLine && i === q.tl.length - 1 ? ' new-line' : '') + '"><time>' + l[0] + '</time>' + esc(l[1]) + '</li>';
      }).join('');
      var acts = q.status === 'booked'
        ? '<button type="button" class="d-btn" disabled>Booked for ' + esc(q.slot) + '</button>'
        : '<button type="button" class="d-btn primary" data-act="book">Book ' + esc(slots[0]) + '</button>' +
          '<button type="button" class="d-btn" data-act="call"' + (q.called ? ' disabled' : '') + '>' + (q.called ? 'Called back' : 'Call back') + '</button>';
      $('d-detail').innerHTML = '<p class="d-colhead">' + (q.src === 'call' ? 'Phone call' : q.src === 'form' ? 'Web form' : 'Text message') + ' · ' + q.time + '</p>' +
        '<h4>' + esc(q.name) + '</h4><p class="what">' + esc(q.what) + '</p><ul class="d-tl">' + tl + '</ul><div class="d-acts">' + acts + '</div>';
    }
    function renderWeek(fresh) {
      $('d-week').innerHTML = week.map(function (w, i) {
        return '<li class="' + (fresh && i === week.length - 1 ? 'fresh' : '') + '"><span>' + w[0] + '</span>' + esc(w[1]) + '</li>';
      }).join('');
    }
    function renderCalls(fresh) {
      var tag = { ok: ['ok', 'Answered'], saved: ['saved', 'Missed · saved'], bad: ['bad', 'Screened'] };
      $('d-calls').innerHTML = calls.map(function (c, i) {
        return '<li class="' + (fresh && i === 0 ? 'flash' : '') + '"><div><b>' + esc(c[0]) + '</b><small>' + c[1] + '</small></div><span class="muted" style="font-size:13px">' + esc(c[3]) + '</span><span class="d-pill ' + tag[c[2]][0] + '">' + tag[c[2]][1] + '</span></li>';
      }).join('');
    }
    function renderEsts(flashI) {
      $('d-ests').innerHTML = ests.map(function (e, i) {
        var steps = STEPS.map(function (s, k) { return '<span class="' + (k < e.step ? 'done' : k === e.step ? 'now' : '') + '">' + s + '</span>'; }).join('');
        var btn = e.won ? '<span class="d-pill ok">Won · job booked</span>'
          : e.step < 4 ? '<button type="button" class="d-btn" data-est="' + i + '">Send ' + STEPS[e.step] + ' touch now</button>'
          : '<button type="button" class="d-btn primary" data-won="' + i + '">Mark won</button>';
        return '<li class="' + (i === flashI ? 'flash' : '') + '"><div><b>' + esc(e.name) + '</b> · ' + e.amt + '<small>' + e.sent + '</small></div><div class="d-steps">' + steps + '</div>' + btn + '</li>';
      }).join('');
    }
    function renderRevs(flashI) {
      $('d-revs').innerHTML = revs.map(function (r, i) {
        var right = r.state === 'ready' ? '<button type="button" class="d-btn" data-rev="' + i + '">Ask for a review</button>'
          : r.state === 'wait' ? '<span class="d-pill saved">Request sent…</span>'
          : r.state === 'happy' ? '<span class="d-pill ok">★★★★★ Posted to Google</span>'
          : '<span class="d-pill bad">Sent to you privately</span>';
        var note = r.state === 'private' ? '<small class="d-outcome">"Tech showed up an hour late." You can fix it before it goes public.</small>' : '<small>' + esc(r.job) + '</small>';
        return '<li class="' + (i === flashI ? 'flash' : '') + '"><div><b>' + esc(r.name) + '</b>' + note + '</div><span class="muted" style="font-size:13px">' + (r.state === 'happy' ? 'Happy customer' : r.state === 'private' ? 'Unhappy customer' : 'Finished job') + '</span>' + right + '</li>';
      }).join('');
    }

    function view(v) {
      root.querySelectorAll('.d-side button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === v ? 'true' : 'false'); });
      root.querySelectorAll('.d-view').forEach(function (el) { el.hidden = el.getAttribute('data-view') !== v; });
      $('d-title').textContent = { overview: 'Here’s the shop right now.', calls: 'Every call, answered or saved.', estimates: 'No estimate goes cold.', reviews: 'Finished jobs become proof.' }[v];
    }

    root.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !root.contains(b)) return;
      if (b.hasAttribute('data-v')) { view(b.getAttribute('data-v')); return; }
      if (b.hasAttribute('data-q')) { sel = +b.getAttribute('data-q'); renderInq(); renderDetail(); return; }
      var act = b.getAttribute('data-act');
      var q = inq.filter(function (x) { return x.id === sel; })[0];
      if (act === 'book' && q) {
        var slot = slots.shift() || 'WED 9:00'; q.slot = slot; q.status = 'booked';
        q.tl.push(['NOW', 'Booked for ' + slot + '. Confirmation text sent to the customer.', 'sys']);
        week.push([slot.split(' ')[0], slot.split(' ')[1] + ' · ' + q.what + ' · ' + q.name]);
        renderInq(); renderDetail(true); renderWeek(true);
        toast('Booked: ' + q.name + ', ' + slot, 'Confirmation text sent. It’s on this week’s schedule.');
        return;
      }
      if (act === 'call' && q) {
        q.called = true; q.tl.push(['NOW', 'You called back. Talked for 3 minutes.', '']);
        renderDetail(true); return;
      }
      if (b.hasAttribute('data-est')) {
        var i = +b.getAttribute('data-est'); var est = ests[i];
        toast(STEPS[est.step] + ' follow-up sent', est.name + ' · ' + est.amt);
        est.step++; renderEsts(i); return;
      }
      if (b.hasAttribute('data-won')) {
        var w = +b.getAttribute('data-won'); ests[w].won = true; bump('k-est', -1);
        toast('Won: ' + ests[w].name, 'Follow-up turned an old estimate into a booked job.');
        renderEsts(w); return;
      }
      if (b.hasAttribute('data-rev')) {
        var r = +b.getAttribute('data-rev'); var rv = revs[r]; rv.state = 'wait'; renderRevs(r);
        setTimeout(function () {
          rv.state = rv.rating >= 4 ? 'happy' : 'private'; renderRevs(r);
          if (rv.state === 'happy') { bump('k-rev', 1); toast('New 5-star review on Google', rv.name + ' · ' + rv.job); }
          else toast('Unhappy reply routed to you', 'It didn’t go to Google. You can make it right first.', true);
        }, reduceM ? 0 : 1100);
        return;
      }
    });

    function simulate() {
      if (busy) return; busy = true;
      var c = callers[simN % callers.length]; simN++;
      var sim = $('d-sim'); sim.disabled = true;
      var live = root.querySelector('.d-live');
      view('overview');
      $('d-clock').textContent = 'FRIDAY · 6:4' + (1 + simN) + ' PM';
      live.classList.add('alert'); $('d-live-text').textContent = 'Incoming call · crew is on a job';
      toast('Missed call · ' + c.num, 'Everyone’s on a job. Nobody picks up.', true);
      setTimeout(function () {
        live.classList.remove('alert'); $('d-live-text').textContent = 'System on · answering 24/7';
        var id = nextId++;
        inq.unshift({ id: id, name: c.num, src: 'call', time: '6:4' + (1 + simN) + ' PM', what: 'New caller', status: 'texted',
          tl: [['6:4' + (1 + simN) + ' PM', 'Call missed. Crew was on a job.', ''], ['+38 SEC', 'Text-back sent: "Sorry we missed you! What can we help with?"', 'sys']] });
        sel = id; renderInq(id); renderDetail(true);
        bump('k-saved', 1);
        calls.unshift([c.num, '6:4' + (1 + simN) + ' PM', 'saved', 'Missed, texted back in 38s']); renderCalls(true);
        toast('Text-back sent in 38 seconds', '"Sorry we missed you! What can we help with?"');
        setTimeout(function () {
          var q = inq[0]; q.name = c.name; q.what = c.what;
          q.tl.push(['+2 MIN', c.name + ': "' + c.what + '."', 'cust']);
          renderInq(); renderDetail(true);
          toast('New reply from ' + c.name, 'The lead is still yours. Book it in one click.');
          busy = false; sim.disabled = false; sim.innerHTML = '<span>▶</span> Simulate another call';
        }, reduceM ? 0 : 2400);
      }, reduceM ? 0 : 1700);
    }
    $('d-sim').addEventListener('click', simulate);

    renderInq(); renderDetail(); renderWeek(); renderCalls(); renderEsts(); renderRevs();

    // Play the missed-call moment once, the first time the demo comes into view
    if (!reduceM && 'IntersectionObserver' in window) {
      var played = false;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting && !played) { played = true; io.disconnect(); setTimeout(function () { if (simN === 0) simulate(); }, 1600); }
        });
      }, { threshold: .55 });
      io.observe(root);
    }
  })();
