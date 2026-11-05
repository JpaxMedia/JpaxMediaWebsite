(() => {
  // Step inside: baked rooms from blender/interiors.py (models/room-*.model.json, models/room-*.json).
  // Each room is its own small scene. While you're in one, world.js hands it the renderer and the camera.
  // You stand at a few set places, drag to look around, and click the green lights for the story.
  const W = window.JPAXWorld;
  const BOOK = 'https://jpaxmedia.com/ops-audit?lane=systems#book';
  const FILMS = [
    { id: 'brandfilm', name: 'Brand film', by: 'JPAX Video Studio' },
    { id: 'vs', name: 'Video Studio promo', by: 'JPAX' },
    { id: 'ad', name: '“3 Mistakes”', by: 'Southern Pavers' },
    { id: 'sp-edit', name: 'Edited from phone footage', by: 'Southern Pavers' },
    { id: 'sp-drone', name: 'Filmed on the job', by: 'Southern Pavers' },
    { id: 'sp-builder', name: 'The outdoor builder, walked through', by: 'Southern Pavers' },
    { id: 'sp-explainer', name: 'The patio visualizer, explained', by: 'Southern Pavers' },
    { id: 'b27', name: 'Now booking house parties', by: '27 Birds' },
    { id: 'b27-traintrain', name: '“Train Train,” live', by: '27 Birds' },
    { id: 'b27-harmonica', name: '“Train Train,” the harmonica', by: '27 Birds' },
    { id: 'b27-weight', name: '“The Weight,” on the dance floor', by: '27 Birds' },
    { id: 'b27-wicked', name: '“Wicked Game,” live', by: '27 Birds' },
    { id: 'b27-party', name: 'House parties, the campaign', by: '27 Birds' },
    { id: 'b27-federation', name: 'Live at the Federation', by: '27 Birds' },
    { id: 'b27-lostdog', name: 'The Lost Dog, unplugged', by: '27 Birds' },
    { id: 'apex-website', name: 'The website, walked through', by: 'Apex Trophy Expeditions', voice: true },
    { id: 'apex-portal', name: 'The booking system, as planned', by: 'Apex Trophy Expeditions', voice: true },
    { id: 'jupiter-tour', name: 'Jupiter, a tour', by: 'JPAX · on example data' },
    { id: 'ember', name: 'Ember Coffee', by: 'A sample, not a client' }
  ];

  // what each green light says. Every figure is from jpax-master section 9; samples are labeled.
  const ROOMS = {
    studio: {
      name: 'Julian’s studio',
      spots: {
        portrait: { label: 'Julian', julian: true, eyebrow: 'Julian Johnson · Founder', h: 'At my core, <em>I’m a creative.</em>',
          body: 'Graphic design, photography and video came first. Then websites, apps, and the systems behind them.' },
        note: { label: 'The note', julian: true, eyebrow: 'From Julian', h: 'Nothing leaves <em>until I’ve seen it.</em>',
          body: 'I direct every frame. AI does the heavy lifting underneath, never the judgment.' },
        monitors: { label: 'On the monitors', eyebrow: 'Brand Studio · Video Studio', h: 'Two films, <em>two shapes.</em>',
          body: 'On the left, the Video Studio’s own promo. On the right, a brand film. Each one leaves here twice: wide for screens, tall for phones.',
          offers: [['Edited', 'from $1,200'], ['Animated', 'from $2,500'], ['Filmed', 'from $3,500'], ['Monthly', 'from $2,500/mo']],
          link: ['See the Video Studio', 'https://jpaxmedia.com/video-studio'] },
        gear: { label: 'The gear', eyebrow: 'Brand Studio · Filmed', h: 'When the project <em>needs a shoot.</em>',
          body: 'Not every film needs one. Some are animated, some are cut from footage you already have. When a project calls for filming, I pack this up, film the work on site, then cut it at this desk.',
          offers: [['Video Studio, filmed', 'from $3,500 per video']] },
        band: { label: '27 Birds, live', eyebrow: 'Client work · 27 Birds', h: 'Shot from <em>the front of the room.</em>',
          body: 'I photograph 27 Birds at their shows: the band in the stage light, the way the room sees them. These frames are on the site I built for them.',
          link: ['Visit 27birdsband.com', 'https://27birdsband.com'] },
        tv: { label: 'On the TV', eyebrow: 'Client work · 27 Birds', h: 'Filmed live, <em>cut at this desk.</em>',
          body: '“Train Train,” “The Weight” and “Wicked Game,” shot at their shows. I also run the band’s “Now booking house parties” campaign, and the site and lead system it sends people to.',
          small: 'Results are kept private at the band’s request.', offers: [['Video Studio, filmed', 'from $3,500 per video']],
          link: ['Visit 27birdsband.com', 'https://27birdsband.com'] }
      }
    },
    cabin: {
      name: 'JPAX · Ops Audit',
      spots: {
        explainer: { label: 'The explainer', eyebrow: 'Ops Audit · How it works', h: 'Two weeks on your line, <em>in six steps.</em>',
          body: 'The big screen mirrors the laptop on the desk. A call comes in and nobody picks up. Two weeks of calls add up. I make one after-hours mystery call and time the callback. The estimates nobody chased turn up. Then your report card: the money math and a 90-day roadmap.',
          offers: [['Ops Audit', '$2,000 flat']], note: 'Credited toward the install if you move forward.',
          small: 'The calls and estimates on screen are examples. The report card uses your numbers.', primary: ['Book an Ops Audit', BOOK] },
        phone: { label: 'The phone', eyebrow: 'Ops Audit · What gets tracked', h: 'Every call to your line, <em>logged.</em>',
          body: 'For two weeks your business line runs through call tracking. The phone is wired to the laptop: when it rings, the call runs down the cable and lands in the log as answered, missed or after hours. Every miss gets a dollar figure.',
          small: 'The calls on the phone are an example night.' },
        report: { label: 'Your report card', eyebrow: 'Ops Audit · Report card', h: 'Your money math, <em>roughed in.</em>',
          body: 'The card on the board is built from your numbers. Change them here and watch it update.', calc: true,
          primary: ['Book an Ops Audit', BOOK] },
        schedule: { label: 'Two weeks', eyebrow: 'Ops Audit · How it runs', h: 'About an hour <em>of your time.</em>',
          body: 'The board has the days. Your part is the kickoff and the walkthrough, plus access to your phone line, Google profile and site. Everything in between runs without you.',
          offers: [['Ops Audit', '$2,000 flat']] },
        view: { label: 'The view', eyebrow: 'Out the window', h: 'Most owners don’t have a demand problem. <em>They have a handoff problem.</em>',
          body: 'Two weeks on one phone line shows it: where customers reach you, and where their calls slip off into the night.',
          primary: ['Book an Ops Audit', BOOK] }
      }
    },
    workshop: {
      name: 'JPAX · Custom apps',
      spots: {
        sp: { label: 'Patio visualizer', eyebrow: 'Southern Pavers · A real app', h: 'See the patio <em>before it’s dug.</em>',
          body: 'The live visualizer I built for Southern Pavers. A homeowner picks a patio, walkway or driveway, sizes it, chooses the stone, and turns it in 3D, at night, or from above. They can add a photo of their yard for a finished preview, then send the whole idea to Southern Pavers in one tap. 54 people have opened it so far.',
          small: 'On the screen: the live app, captured from southernpaversscpro.com/visualizer.', link: ['Try the visualizer', 'https://southernpaversscpro.com/visualizer'] },
        apex: { label: 'Apex booking system', eyebrow: 'Apex Trophy Expeditions · Being built', h: 'Every booking, <em>one thread.</em>',
          body: 'A trip takes months to plan, and it shouldn’t live in a hundred emails. I’m building Apex one system with three doors: a workspace where Apex sees every inquiry, quote and booking; a portal where each client follows their own trip; and a view for each outfitter with only what they need.',
          small: 'Being built now. The screen shows sample data, not real clients.', link: ['See the Apex website', 'https://apextrophyexpeditions.com'] },
        jupiter: { label: 'Jupiter', eyebrow: 'JPAX · The system I run on', h: 'My whole business, <em>one cockpit.</em>',
          body: 'Jupiter holds every client, job, invoice and date in one place. Each client gets a portal scoped to their own work. Nova, the agent inside it, drafts the next step, and nothing runs until I approve it. Every action is logged. The planetarium up the hill shows it properly.',
          small: 'Shown on example data and phantom clients.', link: ['See Jupiter', 'https://jpaxmedia.com/jupiter'] },
        service: { label: 'Your app', eyebrow: 'Brand Studio · Custom app builds', h: 'Built around <em>how you work.</em>',
          body: 'Quoting tools, customer portals, dashboards, visualizers. You show me how the business actually runs. I scope what the tool has to do for your crew and your customers, then build it and test it on real work. When it ships, the code and the accounts are yours.',
          offers: [['Custom app builds', 'from $8,000']], primary: ['Ask about an app', 'https://jpaxmedia.com/ops-audit?interest=app#book'] }
      }
    },
    storefront: {
      name: 'JPAX · Websites',
      spots: {
        'site-sp': { label: 'Southern Pavers', eyebrow: 'Client site', h: 'A patio company, <em>booked from a phone.</em>',
          body: 'Built around the jobs they want more of, with the patio visualizer and the tracking behind it. 1,706 visitors counted so far.',
          small: 'Visitors tracked with the JPAX pixel.', link: ['Visit southernpaversscpro.com', 'https://southernpaversscpro.com'] },
        'site-b27': { label: '27 Birds', eyebrow: 'Client site', h: 'A live band, <em>booking house parties.</em>',
          body: 'The site and the lead system behind their campaign. I built it, and I still run it.',
          small: 'Results are kept private at the band’s request.', link: ['Visit 27birdsband.com', 'https://27birdsband.com'] },
        'site-apex': { label: 'Apex', eyebrow: 'Client site', h: 'Trips worth <em>crossing the world for.</em>',
          body: 'Designed and built for a booking agency for hunting and big-game fishing, from West Greenland to the Gulf of Mexico.',
          link: ['Visit apextrophyexpeditions.com', 'https://apextrophyexpeditions.com'] },
        'site-dantonio': { label: 'Anthony D’Antonio', eyebrow: 'Site I built', h: 'A music hub, <em>all in one place.</em>',
          body: 'New releases, videos and the full catalog for Anthony D’Antonio.',
          link: ['Visit anthonydantoniomusic.com', 'https://anthonydantoniomusic.com'] },
        'site-bats': { label: 'Bats Reacts', eyebrow: 'My channel', h: 'Movie news, <em>actual takes.</em>',
          body: 'The home for Bats Reacts: the latest videos, reviews and fandom debates, linked out to YouTube and Facebook.',
          link: ['Visit batsreacts.com', 'https://batsreacts.com'] },
        'site-jpax': { label: 'JPAX Media', eyebrow: 'My own site', h: 'Bring them in. <em>Catch the money.</em>',
          body: 'The studio’s own site: the Brand Studio route, the Ops Audit, and the work.',
          link: ['Visit jpaxmedia.com', 'https://jpaxmedia.com'] },
        'web-service': { label: 'Website creation', eyebrow: 'Brand Studio · Websites', h: 'People look you up. <em>Make them call.</em>',
          body: 'A custom site built around the jobs you want more of. Fast on a phone, easy to book from, written to sound like you. Your domain, your accounts. After launch, one real person keeps it updated, secure and backed up.',
          offers: [['Website creation', 'from $3,500'], ['Web management', 'from $400/mo']], link: ['Walk the Studio route', 'https://jpaxmedia.com/studio'] },
        traffic: { label: '1,706 visitors', eyebrow: 'Client work · Southern Pavers', h: '1,706 visitors, <em>counted.</em>',
          body: 'Every visit gets counted, so the next decision runs on numbers instead of guesses. You can’t improve what you can’t see.',
          small: 'Tracked with the JPAX pixel.', link: ['Read the Southern Pavers story', 'https://jpaxmedia.com/work/southern-pavers'] }
      }
    },
    jupiter: {
      name: 'Jupiter · the planetarium',
      spots: {
        'jup-sky': { label: 'Look up', eyebrow: 'Jupiter', h: 'I run JPAX on <em>my own system.</em>',
          body: 'Jupiter in the middle, every client in orbit around it. The threads of light are the work moving: a client sends something in, Nova drafts the next step, I approve it, and it goes back out to their portal, logged.',
          small: 'The clients in orbit are phantoms, not real businesses.' },
        'jup-what': { label: 'What it is', eyebrow: 'Jupiter · What it is', h: 'My whole business, <em>one cockpit.</em>',
          body: 'Every client, job, invoice, file and date in one place, with Nova watching all of it. It’s what I open every morning, and every install I build runs on the same infrastructure.',
          small: 'The screens show example data.', link: ['See Jupiter', 'https://jpaxmedia.com/jupiter'] },
        'jup-how': { label: 'With clients', eyebrow: 'Jupiter · How it works with clients', h: 'Each client sees <em>only their own.</em>',
          body: 'Each client gets a portal scoped to their work: their project, files, messages and invoices. They send something in, it lands in my cockpit, and the answer goes back to their portal.',
          small: 'Phantom clients, not real businesses.' },
        'jup-nova': { label: 'Nova', eyebrow: 'Jupiter · Nova', h: 'Nova drafts. <em>I decide.</em>',
          body: 'Nova reads, drafts and recommends, then waits. Nothing that touches a client, money or a record runs until I confirm it, and every action is logged with who, what and when.',
          small: 'Example data.' },
        'jup-tour': { label: 'The tour', eyebrow: 'Jupiter · A tour', h: 'The system I run <em>JPAX on.</em>',
          body: 'A walk through Jupiter: the cockpit, messages, clients, the calendar and billing, with Nova watching all of it.',
          small: 'Recorded on phantom clients and example data. None of these businesses are real.', link: ['See Jupiter', 'https://jpaxmedia.com/jupiter'] }
      }
    },
    hall: {
      name: 'The handoff room',
      spots: {
        dashboard: { label: 'The dashboard', eyebrow: 'Systems · System Install', h: 'Every call, lead, job and review <em>on one screen.</em>',
          body: 'The one screen the install hands you. Calls, leads, jobs and reviews come in live, so the day reads at a glance.',
          offers: [['System Install', 'from $12,000']], small: 'The screen shows example figures.' },
        scorecard: { label: 'The scorecard', eyebrow: 'Systems · Operating Partner', h: 'Calls, leads, reviews, <em>every month.</em>',
          body: 'Plus the one change made to the system that month, and why, from real call transcripts.',
          offers: [['Operating Partner', 'from $1,500/mo']], small: 'Example figures.' },
        seat: { label: 'The seat', eyebrow: 'The seat', h: 'I don’t work for <em>your competitors.</em>',
          body: 'The seat follows your trucks: your real service area, not city lines. While it’s yours, nobody else in your trade gets a system from me there.' },
        table: { label: 'The handoff', eyebrow: 'The handoff', h: 'You own <em>everything we install.</em>',
          body: 'Your system, your numbers, your accounts, your website, your data. An hour of training for you and your office, then 30 days of tuning.',
          primary: ['Book an Ops Audit', BOOK] }
      }
    },
    pavers: {
      name: 'Southern Pavers · the showroom',
      spots: {
        explainer: { label: 'The explainer', eyebrow: 'Client work · Southern Pavers', h: 'See the patio <em>before it’s dug.</em>',
          body: 'The explainer for the patio visualizer I built: a homeowner starts with a photo of their yard, makes the patio theirs, and slides between before and after. Then Southern Pavers gets a clean plan. 54 people have opened it so far.',
          offers: [['Custom app builds', 'from $8,000'], ['Video Studio, animated', 'from $2,500']], link: ['Read the Southern Pavers story', 'https://jpaxmedia.com/work/southern-pavers'] },
        ad: { label: '“3 Mistakes”', eyebrow: 'Client work · Southern Pavers', h: 'One video. <em>58 conversations.</em>',
          body: '“3 Mistakes”: a video I planned, scripted, shot, and still run. $8.15 in ad spend per conversation, under $500 in total.',
          small: 'Meta figures through Sept 25, 2026. Customer outcomes reported by Southern Pavers.', link: ['Read the Southern Pavers story', 'https://jpaxmedia.com/work/southern-pavers'] },
        onjob: { label: 'On the job', eyebrow: 'Brand Studio · Video Studio', h: 'Edited and <em>filmed.</em>',
          body: 'Phone footage from their jobs, cut down and captioned, and my drone over the work.',
          offers: [['Video Studio, edited', 'from $1,200'], ['Video Studio, filmed', 'from $3,500']] },
        numbers: { label: 'The numbers', eyebrow: 'Client work · Southern Pavers', h: 'Counted, <em>not guessed.</em>',
          body: '58 customer conversations from “3 Mistakes” at $8.15 each, under $500 in ad spend. 1,706 visitors tracked by the system I built. 54 people have opened the visualizer.',
          small: 'Meta figures through Sept 25, 2026. Visitors tracked with the JPAX pixel.', link: ['Read the Southern Pavers story', 'https://jpaxmedia.com/work/southern-pavers'] },
        patio: { label: 'The patio', eyebrow: 'Client · Southern Pavers', h: 'Built for <em>a real yard.</em>',
          body: 'Southern Pavers builds patios in the Upstate. I work both lanes for them: the films, the site and the tracking behind it, and the visualizer.',
          link: ['Read the Southern Pavers story', 'https://jpaxmedia.com/work/southern-pavers'] }
      }
    },
    birds: {
      name: '27 Birds · the room',
      spots: {
        stage: { label: 'On stage', eyebrow: 'Client work · 27 Birds', h: 'Filmed from <em>the front of the room.</em>',
          body: '“Train Train,” “The Weight” and “Wicked Game,” shot at their shows and cut at my desk.',
          offers: [['Video Studio, filmed', 'from $3,500 per video']], link: ['Visit 27birdsband.com', 'https://27birdsband.com'] },
        photos: { label: 'The photos', eyebrow: 'Client work · 27 Birds', h: 'Shot in <em>the stage light.</em>',
          body: 'I photograph 27 Birds at their shows, the way the room sees them. These frames are on the site I built for them.', link: ['Visit 27birdsband.com', 'https://27birdsband.com'] },
        campaign: { label: 'House parties', eyebrow: 'Client work · 27 Birds', h: 'Now booking <em>house parties.</em>',
          body: 'A Facebook campaign I shot, cut, and run for the band. It sends people to a website and lead system I built and still manage. The leads turned into house party inquiries this year, with bookings for next year coming in.',
          small: 'Results reported by 27 Birds. Exact numbers kept private at the band’s request.', offers: [['Campaigns', 'from $1,500/mo plus ad spend']], link: ['Visit 27birdsband.com', 'https://27birdsband.com'] },
        federation: { label: 'The Federation', eyebrow: 'Client work · 27 Birds', h: 'A show, <em>promoted.</em>',
          body: 'An animated promo and the poster for their night at the Federation in Spindale, made for the band’s feeds.',
          offers: [['Video Studio, animated', 'from $2,500']] },
        bar: { label: 'The bar', eyebrow: '27 Birds', h: 'Your place. <em>Live band.</em>',
          body: 'The band plays your party. Book a date through the site I built for them.', link: ['Visit 27birdsband.com', 'https://27birdsband.com'] }
      }
    },
    apex: {
      name: 'Apex Trophy Expeditions · the lodge',
      spots: {
        site: { label: 'The system', eyebrow: 'In the works · Apex Trophy Expeditions', h: 'The desk where <em>Apex will run it.</em>',
          body: 'I’m building Apex a booking system with three doors: an admin workspace for every inquiry, quote, booking and payment, a portal where each client sees their own trip, and one where outfitters see only what Apex shares. It’s planned now and gets built in three phases.',
          small: 'Sample data. The system is in progress.', link: ['Visit apextrophyexpeditions.com', 'https://apextrophyexpeditions.com'] },
        home: { label: 'The pipeline', eyebrow: 'In the works · the admin workspace', h: 'Every inquiry, <em>one board.</em>',
          body: 'Website inquiries land on the board. Each one moves from the first conversation to a quote, a booking, a signed contract and payment, with notes and reminders along the way.',
          small: 'Sample data. The system is in progress.' },
        season: { label: 'The trip page', eyebrow: 'In the works · the client portal', h: 'Each client, <em>their trip.</em>',
          body: 'Clients sign in with a one-time email code and find it all in one place: the countdown, the signed contract, what’s paid and what’s next, traveler details, a packing list and messages with Apex.',
          small: 'Sample data. The system is in progress.' },
        map: { label: 'The map', eyebrow: 'Apex · How it works', h: 'Two destinations, <em>one point of contact.</em>',
          body: 'Apex arranges the licences, travel, lodging and the local team, then walks you to the outfitter’s door.', link: ['Visit apextrophyexpeditions.com', 'https://apextrophyexpeditions.com'] },
        loft: { label: 'The loft', eyebrow: 'Apex Trophy Expeditions · two films', h: 'Up in the loft, <em>both Apex films.</em>',
          body: 'The website I designed and built for Apex, walked through, then the booking system I’m building for them. Nova narrates both. With sound on, the voice plays while this card is open.',
          small: 'The booking system screens use sample data. The system is in progress.', tv: 'loft-tv',
          link: ['Visit apextrophyexpeditions.com', 'https://apextrophyexpeditions.com'] },
        fire: { label: 'The lodge', eyebrow: 'Client · Apex Trophy Expeditions', h: 'Pull up <em>a chair.</em>',
          body: 'Apex books hunts and fishing trips in West Greenland and the Gulf of Mexico. This whole street is theirs.', link: ['Visit apextrophyexpeditions.com', 'https://apextrophyexpeditions.com'] }
      }
    },
    cinema: {
      name: 'The Video Studio cinema',
      spots: {
        screen: { label: 'Pick a film', eyebrow: 'Brand Studio · Video Studio', h: 'Nineteen films. <em>Your pick.</em>',
          body: 'Five for Southern Pavers, seven for 27 Birds (their campaign ads, a show promo and four songs I filmed at their shows), the Apex Trophy Expeditions website walked through and the booking system I’m building for them, two from the Video Studio itself, a tour of Jupiter recorded on phantom clients, and Ember Coffee, a sample made to show what animation can do.', films: true,
          link: ['See the Video Studio', 'https://jpaxmedia.com/video-studio'] },
        booth: { label: 'Monthly', eyebrow: 'Video Studio · Monthly', h: 'One main film and <em>three short cuts</em> every month.',
          body: 'Animated, edited or filmed, mixed however the month needs. The short cuts come ready for your feeds.', offers: [['Video Studio, monthly', 'from $2,500/mo']] }
      }
    }
  };
  if (W && W.noGL) window.JPAXRooms = { ROOMS, FILMS };
  if (!W || W.noGL) return;
  const { THREE, camera, canvas, renderer, COL } = W;
  const el = id => document.getElementById(id);
  const canvasLabel = canvas.getAttribute('aria-label');
  const hud = { back: el('inside-back'), name: el('inside-name'), spots: el('inside-spots'), card: el('inside-card'),
    hint: el('inside-hint'), load: el('inside-load'), fade: el('fade'), stick: el('inside-stick') };
  if (!hud.back) return;
  hud.hint.textContent = matchMedia('(pointer: coarse)').matches ? 'Left thumb to walk · drag to look · tap a green light' : 'WASD to walk · drag to look · click a green light';

  // clicking a picture or a board opens its story too
  const HIT_SPOT = { portrait: 'portrait', 'julian-note': 'note', 'studio-left': 'monitors', 'studio-right': 'monitors',
    'studio-tv': 'tv', 'band-stage': 'band', 'band-acoustic': 'band', 'band-harmonica': 'band', 'band-keys': 'band',
    report: 'report', schedule: 'schedule', visualizer: 'visualizer', 'cinema-film': 'screen',
    phone: 'phone', traffic: 'traffic', dashboard: 'dashboard', scorecard: 'scorecard', seat: 'seat',
    explainer: 'explainer', ad: 'ad', onjob: 'onjob', 'sp-numbers': 'numbers', 'sp-logo': 'patio',
    stage: 'stage', campaign: 'campaign', federation: 'federation', poster: 'federation',
    site: 'site', home: 'home', season: 'season',
    'apex-map': 'map', 'apex-logo': 'fire', 'loft-tv': 'loft',
    'app-sp': 'sp', 'app-apex': 'apex', 'app-jupiter': 'jupiter', 'app-service': 'service',
    'site-sp': 'site-sp', 'site-b27': 'site-b27', 'site-apex': 'site-apex', 'site-dantonio': 'site-dantonio', 'site-bats': 'site-bats', 'site-jpax': 'site-jpax',
    'web-service': 'web-service', 'audit-wall': 'explainer', 'audit-laptop': 'explainer', 'audit-phone': 'phone',
    'jup-tour': 'jup-tour', 'jup-command': 'jup-what', 'jup-clients': 'jup-how', 'jup-nova': 'jup-nova', 'jup-calendar': 'jup-how',
    'jup-what': 'jup-what', 'jup-how': 'jup-how' };
  for (let k = 0; k < 8; k++) HIT_SPOT['photo-' + k] = 'photos';

  // ---------- canvas boards ----------
  function wrap(x, text, max) {
    const out = []; let line = '';
    for (const w of text.split(' ')) {
      const t = line ? line + ' ' + w : w;
      if (x.measureText(t).width > max && line) { out.push(line); line = w; } else line = t;
    }
    if (line) out.push(line);
    return out;
  }
  const spaced = (x, px) => { if ('letterSpacing' in x) x.letterSpacing = px + 'px'; };
  const DISPLAY = '"Fraunces", Georgia, serif', BODY = '"Hanken Grotesk", Arial, sans-serif';
  const ease = v => v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v);
  function rrect(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
  function tap(x, X, Y, p) { if (p <= 0 || p >= 1) return; x.strokeStyle = 'rgba(46,125,79,' + (1 - p) + ')'; x.lineWidth = 4; x.beginPath(); x.arc(X, Y, 10 + p * 46, 0, 6.283); x.stroke(); }
  const FEED = ['Missed call · texted back in 34 seconds', 'New lead from the website · booked Thu 10:00', 'Estimate follow-up · day 3 sent', 'New 5-star review on Google',
    'After-hours call · answered and booked', 'Estimate follow-up · day 7 sent', 'Missed call · texted back in 41 seconds', 'Estimate won · job scheduled'];
  const ANIMATED = new Set(['phone', 'dashboard']);
  const BOARD_PX = { phone: 512, dashboard: 1600, 'sp-numbers': 1200, 'apex-map': 1200 };
  const BOARDS = {
    // an example site, booking a visit in three taps (labeled under the phone)
    phone: (x, w, h, t) => {
      const T = (t || 0) % 11;
      x.fillStyle = '#F7F3EC'; x.fillRect(0, 0, w, h);
      const page = T < 3.8 ? 0 : T < 7.6 ? 1 : 2, into = page === 0 ? T : page === 1 ? T - 3.8 : T - 7.6;
      const slide = (1 - ease(into / 0.45)) * w * (page ? 1 : 0);
      x.save(); x.translate(slide, 0);
      const P = 36;
      if (page === 0) {
        x.fillStyle = '#2E7D4F'; rrect(x, P, 120, 54, 54, 12); x.fill();
        x.fillStyle = '#1C1917'; x.font = '600 26px ' + BODY; x.fillText('Your business', P + 72, 156);
        x.font = '300 58px ' + DISPLAY; ['Fast, honest', 'work in the', 'Upstate.'].forEach((l, i) => x.fillText(l, P, 280 + i * 66));
        x.fillStyle = '#78716C'; x.font = '400 25px ' + BODY;
        wrap(x, 'Licensed and insured. And we answer the phone.', w - 2 * P).forEach((l, i) => x.fillText(l, P, 500 + i * 36));
        x.fillStyle = '#9A6A36'; x.font = '500 24px ' + BODY; x.fillText('★★★★★  Google reviews', P, 610);
        x.fillStyle = '#E7E1D8'; rrect(x, P, 650, w - 2 * P, 150, 14); x.fill();
        x.fillStyle = '#78716C'; x.font = '500 22px ' + BODY; x.fillText('Next opening', P + 24, 700);
        x.fillStyle = '#1C1917'; x.font = '600 30px ' + BODY; x.fillText('Thursday morning', P + 24, 748);
        x.fillStyle = '#2E7D4F'; rrect(x, P, 840, w - 2 * P, 84, 14); x.fill();
        x.fillStyle = '#F7F3EC'; x.font = '600 30px ' + BODY; x.textAlign = 'center'; x.fillText('Book a visit', w / 2, 893); x.textAlign = 'left';
        tap(x, w / 2 + 40, 882, (T - 2.8) / 0.9);
      } else if (page === 1) {
        x.fillStyle = '#78716C'; x.font = '500 22px ' + BODY; x.fillText('BOOK A VISIT', P, 150);
        x.fillStyle = '#1C1917'; x.font = '300 52px ' + DISPLAY; x.fillText('Pick a time', P, 220);
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], dw = (w - 2 * P - 4 * 10) / 5, picked = into > 1.0;
        days.forEach((d, i) => {
          const on = picked && i === 3, X = P + i * (dw + 10);
          x.fillStyle = on ? '#2E7D4F' : '#E7E1D8'; rrect(x, X, 270, dw, 92, 12); x.fill();
          x.fillStyle = on ? '#F7F3EC' : '#1C1917'; x.font = '600 24px ' + BODY; x.textAlign = 'center'; x.fillText(d, X + dw / 2, 326); x.textAlign = 'left';
        });
        tap(x, P + 3 * (dw + 10) + dw / 2, 316, (into - 0.7) / 0.8);
        const times = ['8:00 AM', '10:00 AM', '1:00 PM', '3:30 PM'], tw = (w - 2 * P - 14) / 2, chose = into > 2.1;
        times.forEach((tm, i) => {
          const X = P + (i % 2) * (tw + 14), Y = 410 + Math.floor(i / 2) * 104, on = chose && i === 1;
          x.strokeStyle = on ? '#2E7D4F' : '#D8D0C4'; x.lineWidth = on ? 4 : 2; rrect(x, X, Y, tw, 86, 12); x.stroke();
          x.fillStyle = on ? '#2E7D4F' : '#1C1917'; x.font = '500 28px ' + BODY; x.textAlign = 'center'; x.fillText(tm, X + tw / 2, Y + 53); x.textAlign = 'left';
        });
        tap(x, P + tw + 14 + tw / 2, 453, (into - 1.8) / 0.8);
        x.fillStyle = '#78716C'; x.font = '400 24px ' + BODY; x.fillText('Your name and number on the next step.', P, 700);
        x.fillStyle = chose ? '#2E7D4F' : '#B8B0A4'; rrect(x, P, 840, w - 2 * P, 84, 14); x.fill();
        x.fillStyle = '#F7F3EC'; x.font = '600 30px ' + BODY; x.textAlign = 'center'; x.fillText('Confirm Thursday, 10:00', w / 2, 893); x.textAlign = 'left';
        tap(x, w / 2, 882, (into - 2.9) / 0.8);
      } else {
        const k = ease(into / 0.6);
        x.fillStyle = '#2E7D4F'; x.beginPath(); x.arc(w / 2, 330, 80 * k, 0, 6.283); x.fill();
        x.strokeStyle = '#F7F3EC'; x.lineWidth = 12; x.lineCap = 'round'; x.beginPath(); x.moveTo(w / 2 - 34, 332); x.lineTo(w / 2 - 8, 358); x.lineTo(w / 2 + 38, 304);
        if (k > 0.6) x.stroke();
        x.fillStyle = '#1C1917'; x.textAlign = 'center'; x.font = '300 58px ' + DISPLAY; x.fillText('You’re booked.', w / 2, 520);
        x.font = '600 30px ' + BODY; x.fillText('Thursday, 10:00 AM', w / 2, 590);
        x.fillStyle = '#78716C'; x.font = '400 25px ' + BODY;
        wrap(x, 'We’ll text you a reminder the day before.', w - 2 * P).forEach((l, i) => x.fillText(l, w / 2, 650 + i * 36));
        x.textAlign = 'left';
      }
      x.restore();
      x.fillStyle = '#1C1917'; x.fillRect(0, 0, w, 64);
      x.fillStyle = '#ECE6DA'; x.font = '600 22px ' + BODY; x.fillText('9:41', 28, 42);
      x.fillStyle = '#ECE6DA'; rrect(x, 150, 16, w - 200, 34, 17); x.globalAlpha = 0.14; x.fill(); x.globalAlpha = 1;
      x.font = '400 19px ' + BODY; x.textAlign = 'center'; x.fillText('yourbusiness.com', w / 2 + 25, 40); x.textAlign = 'left';
    },
    // Southern Pavers' real figures, as on the site. Every one is from jpax-master section 9.
    'sp-numbers': (x, w, h) => {
      const P = 60;
      x.fillStyle = '#13213a'; x.fillRect(0, 0, w, h);
      spaced(x, 5); x.fillStyle = '#A79E90'; x.font = '500 22px ' + BODY; x.fillText('SOUTHERN PAVERS · CLIENT WORK', P, 78); spaced(x, 0);
      const cells = [['58', 'customer conversations from “3 Mistakes”'], ['$8.15', 'ad spend per conversation'],
        ['1,706', 'site visitors, tracked'], ['54', 'people have opened the visualizer']];
      const cw = (w - 2 * P) / 2;
      cells.forEach(([n, l], i) => {
        const X = P + (i % 2) * cw, Y = 210 + Math.floor(i / 2) * 250;
        x.fillStyle = '#8BE8A6'; x.font = '300 120px ' + DISPLAY; x.fillText(n, X - 4, Y);
        x.fillStyle = '#ECE6DA'; x.font = '400 26px ' + BODY; wrap(x, l, cw - 40).forEach((ln, k) => x.fillText(ln, X, Y + 46 + k * 32));
      });
      x.fillStyle = '#8a93a6'; x.font = '400 21px ' + BODY;
      x.fillText('Meta figures through Sept 25, 2026. Under $500 total ad spend. Visitors counted with the JPAX pixel.', P, h - 40);
    },
    // where Apex goes: a dotted world in their colours, two gold pins
    'apex-map': (x, w, h) => {
      x.fillStyle = '#0d1716'; x.fillRect(0, 0, w, h);
      const toX = lon => (lon + 180) / 360 * w, toY = lat => (90 - lat) / 180 * h;
      x.strokeStyle = 'rgba(227,231,225,.08)'; x.lineWidth = 1;
      for (let lon = -180; lon <= 180; lon += 30) { x.beginPath(); x.moveTo(toX(lon), 0); x.lineTo(toX(lon), h); x.stroke(); }
      for (let lat = -60; lat <= 60; lat += 30) { x.beginPath(); x.moveTo(0, toY(lat)); x.lineTo(w, toY(lat)); x.stroke(); }
      // rough land masses as dot fields: the Americas, Greenland, Europe and Africa, Asia, Australia
      const land = [[-168, 72, -52, 50], [-130, 50, -60, 25], [-118, 25, -80, 8], [-80, 12, -35, -55], [-58, 83, -18, 60],
        [-10, 70, 40, 36], [-17, 36, 51, -35], [40, 75, 150, 10], [95, 25, 140, -8], [113, -12, 153, -39]];
      x.fillStyle = 'rgba(227,231,225,.28)';
      for (const [a, b, c, d] of land) for (let lon = a; lon <= c; lon += 3) for (let lat = d; lat <= b; lat += 3) {
        x.beginPath(); x.arc(toX(lon), toY(lat), 2.1, 0, 6.283); x.fill();
      }
      const pin = (lon, lat, name, sub, dy) => {
        const X = toX(lon), Y = toY(lat);
        x.fillStyle = 'rgba(212,166,79,.25)'; x.beginPath(); x.arc(X, Y, 22, 0, 6.283); x.fill();
        x.fillStyle = '#d4a64f'; x.beginPath(); x.arc(X, Y, 9, 0, 6.283); x.fill();
        x.fillStyle = '#e3e7e1'; x.font = '500 30px ' + DISPLAY; x.fillText(name, X + 30, Y + dy);
        x.fillStyle = '#d4a64f'; x.font = '500 18px ' + BODY; spaced(x, 3); x.fillText(sub, X + 30, Y + dy + 28); spaced(x, 0);
      };
      pin(-52, 66, 'West Greenland', '66° N · MUSKOX & CARIBOU', -8);
      pin(-90, 26, 'Gulf of Mexico', '26° N · TUNA & SWORDFISH', 8);
      spaced(x, 5); x.fillStyle = '#d4a64f'; x.font = '500 20px ' + BODY; x.fillText('THE APEX MAP', 50, h - 50); spaced(x, 0);
    },
    traffic: (x, w, h) => {
      const P = 64;
      x.fillStyle = '#161310'; x.fillRect(0, 0, w, h);
      spaced(x, 5); x.fillStyle = '#A79E90'; x.font = '500 24px ' + BODY; x.fillText('SOUTHERN PAVERS · CLIENT WORK', P, 92); spaced(x, 0);
      x.fillStyle = '#8BE8A6'; x.font = '300 230px ' + DISPLAY; x.fillText('1,706', P - 8, 330);
      x.fillStyle = '#ECE6DA'; x.font = '400 38px ' + BODY; x.fillText('visits to the Southern Pavers site, counted', P, 430);
      x.fillStyle = '#6F675D'; x.font = '400 26px ' + BODY; x.fillText('JPAX pixel', P, h - 70);
    },
    dashboard: (x, w, h, t) => {
      t = t || 0;
      x.fillStyle = '#0C0B0A'; x.fillRect(0, 0, w, h);
      spaced(x, 5); x.fillStyle = '#A79E90'; x.font = '500 22px ' + BODY; x.fillText('YOUR BUSINESS · ONE DASHBOARD · THIS MONTH', 60, 70); spaced(x, 0);
      x.strokeStyle = '#6F675D'; x.lineWidth = 2; rrect(x, w - 280, 40, 220, 44, 22); x.stroke();
      x.fillStyle = '#A79E90'; x.font = '500 20px ' + BODY; x.textAlign = 'center'; x.fillText('Example figures', w - 170, 69); x.textAlign = 'left';
      const tiles = [['Calls answered', '312', 'every one, day and night', '#8BE8A6'], ['Missed calls texted back', '41', 'average reply 38 seconds', '#ECE6DA'],
        ['Estimates followed up', '57', 'day 1, 3, 7 and 14', '#ECE6DA'], ['New reviews', '18', '4.9 average on Google', '#ECE6DA']];
      const tw = (w - 120 - 3 * 24) / 4;
      tiles.forEach(([l, n, sub, col], i) => {
        const X = 60 + i * (tw + 24);
        x.fillStyle = '#161310'; rrect(x, X, 115, tw, 230, 10); x.fill();
        x.fillStyle = '#A79E90'; x.font = '500 22px ' + BODY; x.fillText(l, X + 26, 160);
        x.fillStyle = col; x.font = '300 104px ' + DISPLAY; x.fillText(n, X + 22, 270);
        x.fillStyle = '#6F675D'; x.font = '400 20px ' + BODY; x.fillText(sub, X + 26, 318);
      });
      // the pipeline
      x.fillStyle = '#161310'; rrect(x, 60, 375, 920, 470, 10); x.fill();
      spaced(x, 5); x.fillStyle = '#A79E90'; x.font = '500 20px ' + BODY; x.fillText('ONE PIPELINE', 90, 420); spaced(x, 0);
      const stages = [['New lead', 24], ['Contacted', 22], ['Estimate sent', 17], ['Follow-up', 11], ['Won', 9]];
      stages.forEach(([l, n], i) => {
        const X = 100 + i * 172, bh = n / 24 * 280;
        x.fillStyle = i === 4 ? '#ECE6DA' : '#4a443d'; rrect(x, X, 760 - bh, 120, bh, 6); x.fill();
        x.fillStyle = '#ECE6DA'; x.font = '300 44px ' + DISPLAY; x.fillText(String(n), X, 740 - bh);
        x.fillStyle = '#A79E90'; x.font = '500 20px ' + BODY; x.fillText(l, X, 805);
      });
      // the live feed
      x.fillStyle = '#161310'; rrect(x, 1004, 375, w - 1064, 470, 10); x.fill();
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      x.fillStyle = 'rgba(139,232,166,' + (0.5 + pulse * 0.5) + ')'; x.beginPath(); x.arc(1040, 413, 9, 0, 6.283); x.fill();
      spaced(x, 5); x.fillStyle = '#A79E90'; x.font = '500 20px ' + BODY; x.fillText('LIVE', 1062, 420); spaced(x, 0);
      const step = Math.floor(t / 2.4), frac = ease((t % 2.4) / 0.5);
      x.save(); x.beginPath(); x.rect(1004, 440, w - 1064, 395); x.clip();
      for (let k = 0; k < 7; k++) {
        const Y = 470 + (k - 1 + frac) * 62, item = FEED[((step - k) % FEED.length + FEED.length) % FEED.length];
        x.globalAlpha = Math.max(0, 1 - k * 0.14) * (k === 0 ? frac : 1);
        x.fillStyle = '#ECE6DA'; x.font = '400 21px ' + BODY;
        wrap(x, item, w - 1110).slice(0, 1).forEach(l => x.fillText(l, 1034, Y));
        x.fillStyle = '#6F675D'; x.font = '400 17px ' + BODY; x.fillText(k === 0 ? 'just now' : (k * 4) + ' min ago', 1034, Y + 24);
      }
      x.restore(); x.globalAlpha = 1;
    },
    scorecard: (x, w, h) => {
      const P = 76;
      x.fillStyle = '#ECE6DA'; x.fillRect(0, 0, w, h);
      spaced(x, 5); x.fillStyle = '#78716C'; x.font = '500 24px ' + BODY; x.fillText('OPERATING PARTNER · MONTHLY SCORECARD', P, 104); spaced(x, 0);
      x.fillStyle = '#1C1917'; x.font = '300 74px ' + DISPLAY; x.fillText('This month', P, 200);
      [['Calls answered', '312'], ['Leads recovered', '41'], ['Reviews gained', '18']].forEach(([l, n], i) => {
        const Y = 300 + i * 190;
        x.fillStyle = '#E7E1D8'; x.fillRect(P, Y, w - 2 * P, 2);
        x.fillStyle = '#78716C'; x.font = '500 28px ' + BODY; x.fillText(l, P, Y + 60);
        x.fillStyle = i === 1 ? '#2E7D4F' : '#1C1917'; x.font = '300 110px ' + DISPLAY; x.textAlign = 'right'; x.fillText(n, w - P, Y + 140); x.textAlign = 'left';
      });
      x.fillStyle = '#E7E1D8'; x.fillRect(P, 870, w - 2 * P, 2);
      x.fillStyle = '#78716C'; x.font = '500 26px ' + BODY; x.fillText('This month’s improvement', P, 930);
      x.fillStyle = '#1C1917'; x.font = '400 32px ' + BODY;
      wrap(x, 'After-hours script retuned from real call transcripts.', w - 2 * P).forEach((l, i) => x.fillText(l, P, 985 + i * 42));
      x.fillStyle = '#78716C'; x.font = 'italic 400 24px ' + BODY; x.fillText('Example figures', P, h - 110);
      x.font = '400 24px ' + BODY; x.fillText('JPAX Media LLC · There’s a better way.', P, h - 70);
    },
    seat: (x, w, h) => {
      const P = 80;
      x.fillStyle = '#161310'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#2A2622'; x.lineWidth = 4; x.strokeRect(2, 2, w - 4, h - 4);
      spaced(x, 5); x.fillStyle = '#A79E90'; x.font = '500 26px ' + BODY; x.fillText('THE SEAT', P, 120); spaced(x, 0);
      x.fillStyle = '#ECE6DA'; x.font = '300 96px ' + DISPLAY; x.fillText('One shop', P, 270);
      x.fillStyle = '#8BE8A6'; x.font = 'italic 300 96px ' + DISPLAY; x.fillText('per trade,', P, 380);
      x.fillStyle = '#ECE6DA'; x.font = '300 96px ' + DISPLAY; x.fillText('per market.', P, 490);
      x.fillStyle = '#A79E90'; x.font = '400 36px ' + BODY;
      wrap(x, 'I don’t work for your competitors. The seat follows your trucks: your real service area, not city lines.', w - 2 * P)
        .forEach((l, i) => x.fillText(l, P, 640 + i * 52));
      x.fillStyle = '#6F675D'; x.font = '400 24px ' + BODY; x.fillText('JPAX Media LLC · There’s a better way.', P, h - 80);
    },
    'julian-note': (x, w, h) => {
      x.fillStyle = '#1a1612'; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(217,160,102,.35)'; x.lineWidth = 3; x.strokeRect(14, 14, w - 28, h - 28);
      spaced(x, 5); x.fillStyle = '#D9A066'; x.font = '500 24px ' + BODY; x.fillText('FROM JULIAN', 48, 84); spaced(x, 0);
      x.fillStyle = '#ECE6DA'; x.font = 'italic 300 44px ' + DISPLAY;
      wrap(x, 'I shoot it, write it, build it, and answer the phone. Same practice. Same standard.', w - 96)
        .forEach((l, i) => x.fillText(l, 48, 170 + i * 58));
      x.fillStyle = '#D9A066'; x.font = 'italic 300 48px ' + DISPLAY; x.fillText('Julian', 48, h - 70);
    },
    report: (x, w, h) => {
      const n = W.numbers(), P = 72;
      x.fillStyle = '#161310'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#2A2622'; x.lineWidth = 4; x.strokeRect(2, 2, w - 4, h - 4);
      spaced(x, 5); x.fillStyle = '#A79E90'; x.font = '500 24px ' + BODY; x.fillText('OPS AUDIT · REPORT CARD', P, 100); spaced(x, 0);
      x.fillStyle = '#ECE6DA'; x.font = '300 64px ' + DISPLAY; x.fillText('Your business', P, 186);
      x.fillStyle = '#6F675D'; x.font = '400 24px ' + BODY;
      x.fillText(n.entered ? 'An estimate from the numbers you entered' : 'An estimate at typical numbers. Enter yours.', P, 232);
      x.fillStyle = '#2A2622'; x.fillRect(P, 270, w - 2 * P, 2);
      spaced(x, 5); x.fillStyle = '#A79E90'; x.font = '500 22px ' + BODY; x.fillText('TOTAL QUANTIFIED LOSS · ESTIMATE', P, 330); spaced(x, 0);
      x.fillStyle = '#8BE8A6'; let size = 150; x.font = '300 ' + size + 'px ' + DISPLAY;
      const big = W.money(n.loss);
      while (x.measureText(big).width > w - 2 * P && size > 60) { size -= 6; x.font = '300 ' + size + 'px ' + DISPLAY; }
      x.fillText(big, P - 4, 330 + size * 0.95);
      x.fillStyle = '#ECE6DA'; x.font = '400 30px ' + BODY; x.fillText('a year slipping off the road', P, 540);
      x.fillStyle = '#A79E90'; x.font = '400 26px ' + BODY; x.fillText(n.math, P, 588);
      x.fillStyle = '#2A2622'; x.fillRect(P, 632, w - 2 * P, 2);
      spaced(x, 5); x.fillStyle = '#A79E90'; x.font = '500 22px ' + BODY; x.fillText('WHAT THE AUDIT MEASURES', P, 692); spaced(x, 0);
      const items = ['Call-answer rate', 'Speed-to-lead', 'Follow-up', 'Review engine', 'Web presence', 'Lead sources and cost', 'Dead estimate pile', 'Missed-call patterns', 'Competitor gap', 'The rollup'];
      items.forEach((it, i) => {
        const col = i < 5 ? 0 : 1, row = i % 5, X = P + col * (w - 2 * P) / 2, Y = 750 + row * 54;
        x.fillStyle = '#6F675D'; x.font = '500 22px ' + BODY; x.fillText(String(i + 1).padStart(2, '0'), X, Y);
        x.fillStyle = '#ECE6DA'; x.font = '400 26px ' + BODY; x.fillText(it, X + 46, Y);
      });
      x.fillStyle = '#6F675D'; x.font = '400 22px ' + BODY;
      x.fillText('JPAX Media LLC · There’s a better way.', P, h - 72);
    },
    schedule: (x, w, h) => {
      const P = 70;
      x.fillStyle = '#ECE6DA'; x.fillRect(0, 0, w, h);
      spaced(x, 5); x.fillStyle = '#78716C'; x.font = '500 24px ' + BODY; x.fillText('OPS AUDIT · THE SCHEDULE', P, 100); spaced(x, 0);
      x.fillStyle = '#1C1917'; x.font = '300 60px ' + DISPLAY; x.fillText('Two weeks,', P, 182);
      x.font = 'italic 300 60px ' + DISPLAY; x.fillStyle = '#2E7D4F'; x.fillText('start to finish.', P, 250);
      const rows = [['Day 1', 'Kickoff call, 30 minutes'], ['Days 2–9', 'Every call to your line tracked'], ['Day 3', 'After-hours mystery shop'],
        ['Day 5', 'Reviews and competitors pulled'], ['Days 10–12', 'Report card, money math, roadmap'], ['Day 13', 'Walkthrough call']];
      rows.forEach(([d, t], i) => {
        const Y = 350 + i * 128;
        x.fillStyle = '#E7E1D8'; x.fillRect(P, Y - 52, w - 2 * P, 2);
        x.fillStyle = '#2E7D4F'; x.font = '600 26px ' + BODY; x.fillText(d, P, Y);
        x.fillStyle = '#1C1917'; x.font = '400 32px ' + BODY;
        wrap(x, t, w - 2 * P).forEach((l, k) => x.fillText(l, P, Y + 44 + k * 38));
      });
      x.fillStyle = '#1C1917'; x.font = '600 30px ' + BODY; x.fillText('$2,000 flat', P, h - 104);
      x.fillStyle = '#78716C'; x.font = '400 26px ' + BODY; x.fillText('Credited toward the install', P, h - 64);
    }
  };

  // ---------- the custom apps, websites, audit and planetarium boards ----------
  const IMG = {};
  const pic = src => { if (!IMG[src]) { IMG[src] = new Image(); IMG[src].src = src; } return IMG[src].complete && IMG[src].naturalWidth ? IMG[src] : null; };
  const C = { night: '#0C0B0A', soil: '#161310', border: '#2A2622', paper: '#ECE6DA', stone: '#A79E90', dim: '#6F675D', green: '#8BE8A6', amber: '#D9A066' };
  // eyebrow + a Fraunces line with its italic phrase in green (or amber)
  function head(x, P, Y, eyebrow, plain, em, size, emCol) {
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillStyle = C.stone; x.font = '600 ' + Math.round(size * 0.3) + 'px ' + BODY; spaced(x, 4); x.fillText(eyebrow.toUpperCase(), P, Y); spaced(x, 0);
    x.fillStyle = C.paper; x.font = '300 ' + size + 'px ' + DISPLAY; x.fillText(plain, P, Y + size * 1.25);
    const wPlain = x.measureText(plain + ' ').width;
    x.fillStyle = emCol || C.green; x.font = 'italic 300 ' + size + 'px ' + DISPLAY; x.fillText(em, P + wPlain, Y + size * 1.25);
  }
  function foot(x, w, h, P, text) { x.fillStyle = C.dim; x.font = '500 22px ' + BODY; spaced(x, 2); x.textAlign = 'left'; x.fillText(text.toUpperCase(), P, h - 34); spaced(x, 0); }
  function chip(x, X, Y, text, on, col) {
    x.font = '600 24px ' + BODY; const tw = x.measureText(text).width + 40;
    x.fillStyle = on ? col || C.green : C.soil; rrect(x, X, Y, tw, 46, 23); x.fill();
    x.strokeStyle = on ? col || C.green : C.border; x.lineWidth = 2; x.stroke();
    x.fillStyle = on ? C.night : C.stone; x.textBaseline = 'middle'; x.fillText(text, X + 20, Y + 24); x.textBaseline = 'alphabetic';
    return tw;
  }
  // a still framed in browser chrome
  function browser(x, X, Y, W, H, url, img, alpha) {
    x.fillStyle = '#1d1a17'; rrect(x, X, Y, W, H, 18); x.fill();
    x.fillStyle = '#2a2622'; x.beginPath(); x.rect(X, Y, W, 54); x.fill();
    ['#4a443d', '#4a443d', '#4a443d'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(X + 30 + i * 26, Y + 27, 8, 0, 6.283); x.fill(); });
    x.fillStyle = '#161310'; rrect(x, X + 120, Y + 12, W - 240, 30, 15); x.fill();
    x.fillStyle = C.stone; x.font = '500 18px ' + BODY; x.textAlign = 'center'; x.fillText(url, X + W / 2, Y + 33); x.textAlign = 'left';
    if (img) { x.save(); x.globalAlpha = alpha == null ? 1 : alpha; x.beginPath(); x.rect(X, Y + 54, W, H - 54); x.clip(); x.drawImage(img, X, Y + 54, W, H - 54); x.restore(); }
  }
  const SP_STEPS = [['media/app-sp-walkway.webp', 'Pick a patio, walkway or driveway'], ['media/app-sp-driveway.webp', 'Size it and choose the stone'],
    ['media/app-sp-night.webp', 'See it at night'], ['media/app-sp-plan.webp', 'Check the layout from above']];
  const SITE_SHOTS = { 'site-sp': ['media/sp-site.jpg', 'southernpaversscpro.com'], 'site-b27': ['media/b27-site.jpg', '27birdsband.com'],
    'site-apex': ['media/apex-site.jpg', 'apextrophyexpeditions.com'], 'site-dantonio': ['media/dantonio-site.jpg', 'anthonydantoniomusic.com'],
    'site-bats': ['media/batsreacts-site.jpg', 'batsreacts.com'], 'site-jpax': ['media/jpax-site.jpg', 'jpaxmedia.com'] };
  function sitePhone(id) {
    return (x, w, h, t) => {
      const [src, url] = SITE_SHOTS[id], img = pic(src), BAR = 74;
      x.fillStyle = '#0b0a09'; x.fillRect(0, 0, w, h);
      if (img) {
        const s = w / img.naturalWidth, view = (h - BAR) / s, max = Math.max(0, img.naturalHeight - view);
        // scroll down slowly, rest, come back up; each phone runs on its own beat
        const off = Object.keys(SITE_SHOTS).indexOf(id) * 3.7, L = 26, T = ((t || 0) + off) % L;
        const u = T < 2 ? 0 : T < 14 ? ease((T - 2) / 12) : T < 17 ? 1 : T < 24 ? 1 - ease((T - 17) / 7) : 0;
        x.drawImage(img, 0, u * max, img.naturalWidth, view, 0, BAR, w, h - BAR);
      }
      x.fillStyle = '#161310'; x.fillRect(0, 0, w, BAR);
      x.fillStyle = '#2a2622'; rrect(x, 22, 18, w - 44, 40, 20); x.fill();
      x.fillStyle = C.paper; x.font = '500 22px ' + BODY; x.textAlign = 'center'; x.fillText(url, w / 2, 45); x.textAlign = 'left';
    };
  }
  Object.keys(SITE_SHOTS).forEach(id => { BOARDS[id] = sitePhone(id); });
  Object.assign(BOARDS, {
    // the Southern Pavers visualizer, the real app, step by step
    'app-sp': (x, w, h, t) => {
      const T = (t || 0) % 20, i = Math.floor(T / 5), lt = T - i * 5, P = 64;
      x.fillStyle = C.night; x.fillRect(0, 0, w, h);
      head(x, P, 86, 'Southern Pavers · patio visualizer', 'See the patio', 'before it’s dug.', 62);
      const X = 600, Y = 220, BW = w - X - P, BH = BW * 800 / 1280 + 54;
      browser(x, X, Y, BW, BH, 'southernpaversscpro.com/visualizer', pic(SP_STEPS[i][0]), 1);
      const nxt = pic(SP_STEPS[(i + 1) % 4][0]);
      if (lt > 4.4 && nxt) { x.save(); x.globalAlpha = (lt - 4.4) / 0.6; x.beginPath(); x.rect(X, Y + 54, BW, BH - 54); x.clip(); x.drawImage(nxt, X, Y + 54, BW, BH - 54); x.restore(); }
      x.fillStyle = C.green; rrect(x, X + BW - 130, Y - 58, 130, 38, 19); x.fill();
      x.fillStyle = C.night; x.font = '700 18px ' + BODY; spaced(x, 2); x.fillText('LIVE APP', X + BW - 109, Y - 32); spaced(x, 0);
      SP_STEPS.forEach((s, k) => {
        const y = Y + 20 + k * 150, on = k === i;
        x.fillStyle = on ? C.green : C.border; x.fillRect(P, y, 4, 110);
        x.fillStyle = on ? C.green : C.dim; x.font = '300 54px ' + DISPLAY; x.fillText(String(k + 1), P + 28, y + 56);
        x.fillStyle = on ? C.paper : C.stone; x.font = (on ? '600 ' : '500 ') + '28px ' + BODY;
        wrap(x, s[1], X - P - 130).forEach((l, j) => x.fillText(l, P + 90, y + 42 + j * 36));
      });
      foot(x, w, h, P, 'The live app · 54 people have opened it');
    },
    // Apex: one system, three doors (sample data)
    'app-apex': (x, w, h, t) => {
      const T = (t || 0) % 18, P = 64, door = Math.floor(T / 6), lt = T - door * 6;
      x.fillStyle = C.night; x.fillRect(0, 0, w, h);
      head(x, P, 86, 'Apex Trophy Expeditions · being built', 'One system.', 'Three doors.', 62);
      const doors = ['The workspace', 'The client portal', 'The outfitter view'];
      let cx = P; doors.forEach((d, k) => { cx += chip(x, cx, 196, d, k === door) + 14; });
      const X = P, Y = 270, BW = w - 2 * P, BH = h - Y - 90;
      x.fillStyle = C.soil; rrect(x, X, Y, BW, BH, 18); x.fill(); x.strokeStyle = C.border; x.lineWidth = 2; x.stroke();
      if (door === 0) {
        const cols = ['Inquiry', 'Quoted', 'Booked', 'Trip details', 'On the trip'], cw = (BW - 40) / 5;
        const cards = [['Mark T.', 'Greenland · musk ox'], ['Dana R.', 'Gulf · tuna'], ['Luis P.', 'Greenland · caribou'], ['Erin W.', 'Gulf · marlin']];
        cols.forEach((c, k) => {
          const x0 = X + 20 + k * cw;
          x.fillStyle = C.stone; x.font = '600 22px ' + BODY; spaced(x, 2); x.fillText(c.toUpperCase(), x0 + 8, Y + 50); spaced(x, 0);
        });
        cards.forEach((cd, k) => {
          let col = [0, 1, 2, 3][k], y = Y + 76 + (k % 2) * 140;
          const moving = k === 0, u = ease((lt - 1) / 2.5);
          let x0 = X + 20 + col * cw;
          if (moving) { x0 = X + 20 + (u * 2) * cw; y = Y + 76 + 300; }
          x.fillStyle = '#1f1b17'; rrect(x, x0 + 6, y, cw - 18, 118, 12); x.fill();
          x.strokeStyle = moving ? C.green : C.border; x.lineWidth = 2; x.stroke();
          x.fillStyle = C.paper; x.font = '600 26px ' + BODY; x.fillText(cd[0], x0 + 22, y + 44);
          x.fillStyle = C.stone; x.font = '400 21px ' + BODY; x.fillText(cd[1], x0 + 22, y + 82);
        });
      } else if (door === 1) {
        x.fillStyle = C.paper; x.font = '300 46px ' + DISPLAY; x.fillText('Dana’s trip', X + 40, Y + 76);
        x.fillStyle = C.stone; x.font = '400 26px ' + BODY; x.fillText('Gulf of Mexico · 112 days to go', X + 40, Y + 118);
        const items = ['Contract signed', 'Deposit paid', 'Traveler details', 'Licences', 'Packing list'];
        items.forEach((it, k) => {
          const done = k < 2 + Math.min(2, Math.floor(lt / 1.6)), y = Y + 180 + k * 62;
          x.strokeStyle = done ? C.green : C.border; x.lineWidth = 3; x.strokeRect(X + 40, y - 26, 32, 32);
          if (done) { x.strokeStyle = C.green; x.beginPath(); x.moveTo(X + 46, y - 10); x.lineTo(X + 54, y); x.lineTo(X + 68, y - 20); x.stroke(); }
          x.fillStyle = done ? C.paper : C.stone; x.font = '500 28px ' + BODY; x.fillText(it, X + 96, y);
        });
        x.fillStyle = C.dim; x.font = '400 24px ' + BODY; x.fillText('Signs in with a one-time email code.', X + BW / 2 + 40, Y + 190);
        x.fillText('Sees only their own trip.', X + BW / 2 + 40, Y + 228);
      } else {
        x.fillStyle = C.paper; x.font = '300 46px ' + DISPLAY; x.fillText('Next week’s arrivals', X + 40, Y + 76);
        [['Mon', 'Luis P. · 2 hunters', 'Licences ready'], ['Wed', 'Mark T. · 1 hunter', 'Flights in'], ['Sat', 'Erin W. · 3 anglers', 'Boat booked']].forEach((r, k) => {
          const y = Y + 150 + k * 92, on = Math.floor(lt / 2) === k;
          x.fillStyle = on ? '#1f1b17' : 'transparent'; if (on) { rrect(x, X + 24, y - 50, BW - 48, 80, 12); x.fill(); }
          x.fillStyle = C.green; x.font = '600 26px ' + BODY; x.fillText(r[0], X + 44, y);
          x.fillStyle = C.paper; x.font = '500 28px ' + BODY; x.fillText(r[1], X + 150, y);
          x.fillStyle = C.stone; x.font = '400 24px ' + BODY; x.textAlign = 'right'; x.fillText(r[2], X + BW - 44, y); x.textAlign = 'left';
        });
        x.fillStyle = C.dim; x.font = '400 24px ' + BODY; x.fillText('Each outfitter sees only what Apex shares.', X + 40, Y + BH - 34);
      }
      foot(x, w, h, P, 'Sample data · fictional clients · being built');
    },
    // Jupiter: the loop every request runs through
    'app-jupiter': (x, w, h, t) => {
      const T = (t || 0) % 8, P = 64;
      x.fillStyle = C.night; x.fillRect(0, 0, w, h);
      head(x, P, 86, 'Jupiter · the system I run on', 'My whole business,', 'one cockpit.', 62);
      const nodes = [['A client sends it in', 'From their own portal', C.paper], ['Nova drafts', 'The next step, ready', C.green], ['I approve', 'Nothing runs without me', C.amber], ['It runs, logged', 'Who, what and when', C.green]];
      const y = h * 0.56, gap = (w - 2 * P) / 4;
      x.strokeStyle = C.border; x.lineWidth = 4; x.beginPath(); x.moveTo(P + gap / 2, y); x.lineTo(w - P - gap / 2, y); x.stroke();
      const u = (T / 6) % 1, px = P + gap / 2 + u * gap * 3;
      if (T < 6) { const g = x.createRadialGradient(px, y, 0, px, y, 40); g.addColorStop(0, 'rgba(139,232,166,.9)'); g.addColorStop(1, 'rgba(139,232,166,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, y, 40, 0, 6.283); x.fill(); }
      nodes.forEach((n, k) => {
        const cx = P + gap / 2 + k * gap, lit = T < 6 ? u * 3 >= k - 0.05 : true;
        x.fillStyle = C.night; x.beginPath(); x.arc(cx, y, 26, 0, 6.283); x.fill();
        x.strokeStyle = lit ? n[2] : C.border; x.lineWidth = 5; x.stroke();
        if (lit) { x.fillStyle = n[2]; x.beginPath(); x.arc(cx, y, 11, 0, 6.283); x.fill(); }
        x.textAlign = 'center'; x.fillStyle = lit ? C.paper : C.stone; x.font = '600 30px ' + BODY; x.fillText(n[0], cx, y - 64);
        x.fillStyle = C.stone; x.font = '400 24px ' + BODY; x.fillText(n[1], cx, y + 72); x.textAlign = 'left';
      });
      x.fillStyle = C.stone; x.font = '400 28px ' + BODY; x.fillText('Each client sees only their own portal. The planetarium up the hill shows it properly.', P, h - 110);
      foot(x, w, h, P, 'Example data · phantom clients');
    },
    // the custom app service
    'app-service': (x, w, h, t) => {
      const T = (t || 0) % 12, on = Math.floor(T / 3), P = 64;
      x.fillStyle = C.night; x.fillRect(0, 0, w, h);
      head(x, P, 86, 'Brand Studio · custom app builds', 'Built around', 'how you work.', 62);
      let cx = P; ['Quoting tools', 'Customer portals', 'Dashboards', 'Visualizers'].forEach(c => { cx += chip(x, cx, 196, c, false) + 14; });
      const steps = [['Show me how it runs', 'Your crew, your customers, the real day.'], ['Scope it', 'What the tool has to do, and nothing extra.'],
        ['Build it, test it', 'On real jobs before anyone relies on it.'], ['Ship it. It’s yours.', 'The code and the accounts are yours.']];
      const sw = (w - 2 * P - 3 * 24) / 4;
      steps.forEach((s, k) => {
        const X = P + k * (sw + 24), Y = 300, lit = k === on;
        x.fillStyle = lit ? '#1f1b17' : C.soil; rrect(x, X, Y, sw, 380, 16); x.fill();
        x.strokeStyle = lit ? C.green : C.border; x.lineWidth = 2; x.stroke();
        x.fillStyle = lit ? C.green : C.dim; x.font = '300 80px ' + DISPLAY; x.fillText(String(k + 1), X + 28, Y + 104);
        x.fillStyle = C.paper; x.font = '600 30px ' + BODY; wrap(x, s[0], sw - 56).forEach((l, j) => x.fillText(l, X + 28, Y + 170 + j * 38));
        x.fillStyle = C.stone; x.font = '400 25px ' + BODY; wrap(x, s[1], sw - 56).forEach((l, j) => x.fillText(l, X + 28, Y + 260 + j * 33));
      });
      x.fillStyle = C.paper; x.font = '600 32px ' + BODY; x.fillText('Custom app builds', P, h - 110);
      x.fillStyle = C.green; x.font = '300 52px ' + DISPLAY; x.fillText('from $8,000', P + 330, h - 106);
      foot(x, w, h, P, 'Owned by you when it ships');
    },
    // the website service
    'web-service': (x, w, h) => {
      const P = 56;
      x.fillStyle = C.night; x.fillRect(0, 0, w, h);
      head(x, P, 80, 'Brand Studio · websites', 'People look you up.', '', 56);
      x.fillStyle = C.green; x.font = 'italic 300 56px ' + DISPLAY; x.fillText('Make them call.', P, 206);
      [['Built around the jobs you want more of'], ['Fast on a phone, easy to book from'], ['Written to sound like you'], ['Your domain, your accounts'], ['One real person keeps it running']].forEach((r, k) => {
        const y = 300 + k * 66;
        x.fillStyle = C.green; x.beginPath(); x.arc(P + 10, y - 10, 7, 0, 6.283); x.fill();
        x.fillStyle = C.paper; x.font = '500 32px ' + BODY; x.fillText(r[0], P + 36, y);
      });
      x.fillStyle = C.border; x.fillRect(P, h - 200, w - 2 * P, 2);
      x.fillStyle = C.stone; x.font = '500 28px ' + BODY; x.fillText('Website creation', P, h - 140); x.fillText('Web management', P, h - 84);
      x.fillStyle = C.paper; x.font = '600 30px ' + BODY; x.textAlign = 'right'; x.fillText('from $3,500', w - P, h - 140); x.fillText('from $400/mo', w - P, h - 84); x.textAlign = 'left';
    },
    // the audit: the wall mirrors the laptop, the phone rings
    'audit-wall': (x, w, h, t) => W.audit.laptop(x, w, h, t || 0),
    'audit-laptop': (x, w, h, t) => W.audit.laptop(x, w, h, t || 0),
    'audit-phone': (x, w, h, t) => W.audit.phone(x, w, h, t || 0),
    // the planetarium's two story panels
    'jup-what': (x, w, h) => {
      const P = 56;
      x.fillStyle = C.night; x.fillRect(0, 0, w, h);
      head(x, P, 80, 'Jupiter · what it is', 'My whole business,', '', 54);
      x.fillStyle = C.green; x.font = 'italic 300 54px ' + DISPLAY; x.fillText('one cockpit.', P, 200);
      let cx = P, row = 0;
      ['Clients', 'Jobs', 'Invoices', 'Files', 'Calendar', 'Messages', 'Nova'].forEach(c => {
        x.font = '600 24px ' + BODY; const tw = x.measureText(c).width + 40;
        if (cx + tw > w - P) { cx = P; row++; }
        cx += chip(x, cx, 260 + row * 62, c, c === 'Nova') + 14;
      });
      x.fillStyle = C.stone; x.font = '400 28px ' + BODY;
      wrap(x, 'What I open every morning. Every install I build runs on the same infrastructure.', w - 2 * P).forEach((l, j) => x.fillText(l, P, 450 + j * 40));
      foot(x, w, h, P, 'Example data');
    },
    'jup-how': (x, w, h, t) => {
      const P = 56, T = (t || 0) % 6;
      x.fillStyle = C.night; x.fillRect(0, 0, w, h);
      head(x, P, 80, 'Jupiter · with clients', 'Each client sees', '', 54);
      x.fillStyle = C.green; x.font = 'italic 300 54px ' + DISPLAY; x.fillText('only their own.', P, 200);
      const y = 380, xs = [P + 110, w / 2, w - P - 110], lab = [['Their portal', C.paper], ['My cockpit', C.amber], ['Back to them', C.paper]];
      x.strokeStyle = C.border; x.lineWidth = 3; x.beginPath(); x.moveTo(xs[0], y); x.lineTo(xs[2], y); x.stroke();
      const u = T / 6, px = xs[0] + (xs[2] - xs[0]) * u;
      const g = x.createRadialGradient(px, y, 0, px, y, 30); g.addColorStop(0, 'rgba(139,232,166,.95)'); g.addColorStop(1, 'rgba(139,232,166,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, y, 30, 0, 6.283); x.fill();
      xs.forEach((cx, k) => {
        x.fillStyle = C.night; x.beginPath(); x.arc(cx, y, 22, 0, 6.283); x.fill(); x.strokeStyle = lab[k][1]; x.lineWidth = 4; x.stroke();
        x.textAlign = 'center'; x.fillStyle = C.paper; x.font = '600 28px ' + BODY; x.fillText(lab[k][0], cx, y + 70); x.textAlign = 'left';
      });
      x.fillStyle = C.stone; x.font = '400 26px ' + BODY;
      wrap(x, 'Project, files, messages and invoices, scoped to each client. They send it in, I answer, it lands back in their portal.', w - 2 * P).forEach((l, j) => x.fillText(l, P, 540 + j * 36));
      foot(x, w, h, P, 'Phantom clients · example data');
    }
  });
  ['app-sp', 'app-apex', 'app-jupiter', 'app-service', 'audit-wall', 'audit-laptop', 'audit-phone', 'jup-how', ...Object.keys(SITE_SHOTS)].forEach(id => ANIMATED.add(id));
  Object.assign(BOARD_PX, { 'app-sp': 1600, 'app-apex': 1600, 'app-jupiter': 1600, 'app-service': 1600, 'audit-wall': 1600, 'audit-laptop': 1600,
    'audit-phone': 512, 'web-service': 1200, 'jup-what': 1200, 'jup-how': 1200 });
  Object.keys(SITE_SHOTS).forEach(id => { BOARD_PX[id] = 512; });

  // ---------- building a room ----------
  const texLoader = new THREE.TextureLoader();
  const rooms = {};
  let room = null, from = null;

  function load(id) {
    if (rooms[id]) return rooms[id].ready;
    const r = rooms[id] = { id, scene: new THREE.Scene(), screens: [], boards: {}, markers: [], hits: [], solid: [], meta: null };
    r.scene.background = new THREE.Color(0x120e10);
    r.ready = Promise.all([
      fetch('models/room-' + id + '.json').then(res => res.json()),
      new Promise((res, rej) => W.loadModel('room-' + id, m => { r.scene.add(m.scene); r.model = m.scene; res(); }, rej))
    ]).then(([meta]) => { r.meta = meta; build(r); solids(r); return r; });
    r.ready.catch(() => { delete rooms[id]; });
    return r.ready;
  }

  function plane(w, h, mat, pos, ry, r) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(pos[0], pos[1], pos[2]); m.rotation.y = ry; r.scene.add(m); return m;
  }
  function build(r) {
    const meta = r.meta;
    for (const s of meta.screens) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: !!s.alpha });
      const mesh = plane(s.size[0], s.size[1], mat, s.pos, s.ry, r);
      mesh.userData.hit = s.id; r.hits.push(mesh);
      const sc = { s, mesh, mat, v: null };
      const still = s.image || s.poster;
      if (still) texLoader.load(still, t => { if (!mat.map || !mat.map.isVideoTexture) { t.anisotropy = 4; mat.map = t; mat.needsUpdate = true; fit(sc, t.image.width, t.image.height); } });
      if (s.video) sc.v = video(s.video, mat, sc);
      // a screen with a playlist plays each clip through, then the next
      if (s.playlist) {
        let at = 0;
        sc.v.loop = false;
        sc.v.addEventListener('ended', () => { at = (at + 1) % s.playlist.length; sc.v.src = s.playlist[at]; sc.v.play().catch(() => {}); });
      }
      r.screens.push(sc);
      if (s.label) caption(r, s, Math.max(1.0, s.size[0] * 0.9), 0.1);
    }
    for (const b of meta.boards) {
      if (b.id === 'jp-mark') {
        const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.92, depthWrite: false });
        texLoader.load('media/jp-mark.png', t => { mat.map = t; mat.needsUpdate = true; });
        plane(b.size[0], b.size[1], mat, b.pos, b.ry, r);
        continue;
      }
      const px = BOARD_PX[b.id] || 1024, c = W.canvasTex(px, Math.round(px * b.size[1] / b.size[0]));
      const mesh = plane(b.size[0], b.size[1], new THREE.MeshBasicMaterial({ map: c.tex }), b.pos, b.ry, r);
      if (b.rx) { mesh.rotation.order = 'YXZ'; mesh.rotation.x = b.rx; }
      mesh.userData.hit = b.id; r.hits.push(mesh);
      r.boards[b.id] = c;
      drawBoard(r, b.id, 0);
      if (b.label) caption(r, b, Math.min(2.2, Math.max(0.6, b.size[0] * 0.9)), b.size[0] > 3 ? 0.14 : 0.07);
    }
    for (const sp of meta.spots) {
      const g = W.glow(COL.green, 0.32, 0.95);
      g.material.depthTest = false; g.renderOrder = 10;
      g.position.set(sp.pos[0], sp.pos[1], sp.pos[2]); r.scene.add(g);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.copy(g.position); hit.userData.spot = sp.id; r.scene.add(hit); r.hits.push(hit);
      r.markers.push({ g, sp, ph: Math.random() * 6 });
    }
    // the night outside the windows
    const starGeo = new THREE.BufferGeometry(), sp = [];
    for (let i = 0; i < 500; i++) {
      const a = Math.random() * Math.PI * 2, e = 0.05 + Math.random() * 1.2, R = 300;
      sp.push(Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    r.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: COL.paper, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.6 })));
    for (const n of meta.night || []) {
      for (let k = 0; k < (meta.high ? 14 : 5); k++) {
        const g = W.glow(Math.random() < 0.85 ? 0xf0d3a0 : COL.green, 0.6 + Math.random() * 1.2, 0.6);
        g.position.set(n[0] + (Math.random() - 0.5) * 30, n[1] + (meta.high ? Math.random() * 4 : Math.random() * 3), n[2] + (Math.random() - 0.5) * 30);
        r.scene.add(g);
      }
    }
    // the cinema: a faint projector beam from the booth to the screen
    if (meta.booth && meta.screenRect) {
      const [bx, by, bz] = meta.booth, s = meta.screenRect, hw = s.size[0] / 2, hh = s.size[1] / 2, [sx, sy, sz] = s.pos;
      const geo = new THREE.BufferGeometry();
      const v = [bx, by, bz, sx - hw, sy - hh, sz, sx + hw, sy - hh, sz, sx + hw, sy + hh, sz, sx - hw, sy + hh, sz];
      geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
      geo.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1]);
      r.beam = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xcfd8e8, transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      r.scene.add(r.beam);
    }
    if (ROOM_FX[r.id]) r.fx = ROOM_FX[r.id](r);
  }

  // ---------- living rooms: the audit cabin's wired desk, the planetarium's sky ----------
  const ROOM_FX = {
    cabin(r) {
      const lines = (r.meta.cables || []).map(pts => {
        const curve = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(q[0], q[1], q[2])));
        r.scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.008, 6, false), new THREE.MeshBasicMaterial({ color: 0x2b2722 })));
        const pulses = [0, 1, 2].map(() => { const g = W.glow(COL.green, 0.09, 0); g.material.depthTest = false; r.scene.add(g); return g; });
        return { curve, pulses };
      });
      const ph = r.meta.boards.find(b => b.id === 'audit-phone');
      const ring = W.glow(COL.green, 0.5, 0); if (ph) ring.position.set(ph.pos[0], ph.pos[1], ph.pos[2] + 0.04); r.scene.add(ring);
      let rang = -1;
      return time => {
        const T = W.reduce ? 27 : time % 30, ch = Math.min(5, Math.floor(T / 5)), lt = T - ch * 5;
        const ringing = ch === 0 && lt > 0.5 && lt < 4.6 && ((lt - 0.5) % 2) < 1.5;
        lines.forEach((L, n) => L.pulses.forEach((g, k) => {
          // the phone's cable carries the call while it rings; the screen cable runs all the time
          const run = n === 1 || (ch === 0 && lt > 0.5) || ch === 3, u = ((T * (n ? 0.3 : 0.55)) + k / 3) % 1;
          if (run && !W.reduce) { L.curve.getPoint(u, g.position); g.material.opacity = 0.9 * Math.sin(u * Math.PI); } else g.material.opacity = 0;
        }));
        ring.material.opacity = W.reduce ? 0 : ringing ? 0.3 + 0.3 * Math.abs(Math.sin(time * 14)) : 0;
        const burst = ch === 0 ? Math.floor((lt - 0.5) / 2) : -1;
        if (ringing && burst !== rang) { rang = burst; if (W.audit) W.audit.ring(1.5, 0.05); }
        if (ch !== 0) rang = -1;
      };
    },
    jupiter(r) {
      const P = r.meta.planetarium || { R: 9, wall: 2.9, planet: [0, 4.4, 0] }, R = P.R - 0.25, c = new THREE.Vector3(...P.planet);
      // stars across the dome
      const sky = new THREE.Group(); sky.position.set(0, P.wall, 0); r.scene.add(sky);
      const pts = [];
      for (let i = 0; i < 2200; i++) {
        const a = Math.random() * Math.PI * 2, e = Math.asin(Math.random() * 0.97 + 0.02);
        pts.push(Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R);
      }
      const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      sky.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xf2ece0, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false })));
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * 6.283, e = 0.2 + Math.random() * 1.2, g = W.glow(Math.random() < 0.8 ? 0xf2ece0 : 0xbfd9ff, 0.25 + Math.random() * 0.35, 0.7);
        g.position.set(Math.cos(a) * Math.cos(e) * R * 0.97, Math.sin(e) * R * 0.97, Math.sin(a) * Math.cos(e) * R * 0.97); sky.add(g);
      }
      // the planet: banded, turning, with a soft atmosphere
      const tex = W.canvasTex(1024, 512, (x, w, h) => {
        const bands = ['#d9c3a2', '#b98d62', '#e8dcc4', '#a8754d', '#dccdb0', '#c49a6c', '#efe5d2', '#9c6b45', '#d8c6a6', '#b8895d', '#e6d8bc'];
        let y = 0; while (y < h) { const bh = 14 + Math.random() * 46; x.fillStyle = bands[Math.floor(Math.random() * bands.length)]; x.fillRect(0, y, w, bh + 2); y += bh; }
        x.globalAlpha = 0.18; for (let i = 0; i < 260; i++) { x.fillStyle = Math.random() < 0.5 ? '#fff3dd' : '#7c5233'; const yy = Math.random() * h; x.fillRect(Math.random() * w, yy, 40 + Math.random() * 200, 2 + Math.random() * 4); }
        x.globalAlpha = 1; x.fillStyle = '#b4603f'; x.beginPath(); x.ellipse(w * 0.62, h * 0.66, 46, 26, 0, 0, 6.283); x.fill();
        x.fillStyle = 'rgba(255,230,200,.35)'; x.beginPath(); x.ellipse(w * 0.62, h * 0.66, 30, 15, 0, 0, 6.283); x.fill();
      });
      tex.tex.wrapS = THREE.RepeatWrapping;
      const planet = new THREE.Mesh(new THREE.SphereGeometry(1.25, 64, 40), new THREE.MeshLambertMaterial({ map: tex.tex, emissive: 0x2a1c12 }));
      // only the planet takes light in here: a low sun from one side so it reads as a sphere
      const sun = new THREE.DirectionalLight(0xfff1dc, 2.2); sun.position.set(c.x + 6, c.y + 2, c.z + 5); sun.target.position.copy(c);
      r.scene.add(sun, sun.target, new THREE.AmbientLight(0x404a60, 0.5));
      planet.position.copy(c); planet.rotation.z = 0.05; r.scene.add(planet);
      const atmo = W.glow(0xf3d9b0, 4.4, 0.22); atmo.position.copy(c); r.scene.add(atmo);
      // the clients in orbit, Nova close in, Julian holding still
      const orbits = [];
      [[2.4, 0.32, 0.18, COL.green, 'Nova', 0.9], [3.3, -0.22, 0.4, 0xece6da, 'Client', 0.5], [4.1, 0.14, -0.3, 0xece6da, 'Client', 0.36], [4.9, -0.1, 0.12, 0xece6da, 'Client', 0.27]].forEach(([rad, tx, tz, col, kind, sp], n) => {
        const g = new THREE.Group(); g.position.copy(c); g.rotation.set(tx, 0, tz); r.scene.add(g);
        const lp = []; for (let i = 0; i <= 128; i++) { const a = i / 128 * 6.283; lp.push(Math.cos(a) * rad, 0, Math.sin(a) * rad); }
        const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
        g.add(new THREE.Line(lg, new THREE.LineBasicMaterial({ color: n ? 0x6f675d : COL.green, transparent: true, opacity: n ? 0.45 : 0.6 })));
        const moons = (kind === 'Nova' ? [0] : [0, 2.1, 4.2]).map(a0 => {
          const m = new THREE.Mesh(new THREE.SphereGeometry(kind === 'Nova' ? 0.13 : 0.1, 20, 14), new THREE.MeshBasicMaterial({ color: col }));
          const halo = W.glow(col, kind === 'Nova' ? 0.9 : 0.5, kind === 'Nova' ? 0.6 : 0.35); m.add(halo); g.add(m);
          return { m, a0: a0 + n };
        });
        orbits.push({ g, rad, sp, moons });
      });
      // the tour, projected across the far side of the dome the way a planetarium shows a film. It shares the
      // wall screen's video, so it's one film playing, not two
      const tour = r.screens.find(x => x.s.id === 'jup-tour');
      if (tour) {
        const DR = R - 0.3, e0 = 15 * Math.PI / 180, e1 = 44 * Math.PI / 180, wide = 1.1;
        const geo = new THREE.SphereGeometry(DR, 48, 24, -Math.PI / 2 - wide / 2, wide, Math.PI / 2 - e1, e1 - e0);
        const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i)); // read the right way round from inside
        const edge = W.canvasTex(256, 256, (x, w, h) => {
          x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
          const E = 34;
          for (const [x0, y0, x1, y1, rx, ry, rw, rh] of [[0, 0, E, 0, 0, 0, E, h], [w, 0, w - E, 0, w - E, 0, E, h], [0, 0, 0, E, 0, 0, w, E], [0, h, 0, h - E, 0, h - E, w, E]]) {
            const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
            x.fillStyle = g; x.fillRect(rx, ry, rw, rh);
          }
        });
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, alphaMap: edge.tex, opacity: 0.96, depthWrite: false, toneMapped: false });
        texLoader.load('media/jupiter-tour-poster.webp', t => { if (!mat.map) { mat.map = t; mat.needsUpdate = true; } });
        mat.color.setScalar(1.35);
        const dome = new THREE.Mesh(geo, mat); dome.position.set(0, P.wall, 0); dome.renderOrder = 2; r.scene.add(dome);
        const show = () => { mat.map = tour.v.tex; mat.needsUpdate = true; };
        tour.v.addEventListener('playing', show);
        // a seat under it: back past the planet, looking up into the film
        const mid = (e0 + e1) / 2, ty = P.wall + DR * Math.sin(mid), tz = -DR * Math.cos(mid), at = [0, 1.65, -0.4];
        // fit: half the film's width as an angle from the seat, so a narrow phone can widen its lens to take it all in
        const dist = Math.hypot(ty - at[1], at[2] - tz), half = Math.atan2(DR * Math.cos(mid) * Math.sin(wide / 2), dist) + 0.04;
        r.meta.views.dome = { pos: at, yaw: 0, pitch: Math.atan2(ty - at[1], at[2] - tz), fit: half };
        const sp = r.meta.spots.find(x => x.id === 'jup-tour'); if (sp) sp.view = 'dome';
      }
      const julian = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), new THREE.MeshBasicMaterial({ color: 0xd9a066 }));
      julian.position.set(c.x, c.y + 2.6, c.z); julian.add(W.glow(0xd9a066, 0.9, 0.6)); r.scene.add(julian);
      // a thread of light: a client sends it in, Nova drafts, Julian approves, it goes back out
      const thread = [0, 1, 2, 3, 4].map(() => { const g = W.glow(COL.green, 0.22, 0); r.scene.add(g); return g; });
      const A = new THREE.Vector3(), B = new THREE.Vector3(), Q = new THREE.Vector3();
      const where = (o, k, v) => o.moons[k].m.getWorldPosition(v);
      return (time) => {
        const t = W.reduce ? 0 : time;
        sky.rotation.y = t * 0.012; planet.rotation.y = t * 0.12;
        orbits.forEach(o => o.moons.forEach(mo => { const a = mo.a0 + t * o.sp * 0.35; mo.m.position.set(Math.cos(a) * o.rad, 0, Math.sin(a) * o.rad); }));
        if (W.reduce) { thread.forEach(g => { g.material.opacity = 0; }); return; }
        const T = time % 10, leg = Math.floor(T / 2), u = ease((T % 2) / 2);
        const src = orbits[1 + Math.floor(time / 10) % 3], k = Math.floor(time / 30) % src.moons.length;
        const pts = [() => where(src, k, A), () => A.copy(c), () => where(orbits[0], 0, A), () => A.copy(julian.position), () => A.copy(c), () => where(src, k, A)];
        const a = pts[leg]().clone(), b = pts[leg + 1]().clone(); B.copy(b);
        thread.forEach((g, i) => { const v = Math.max(0, u - i * 0.04); Q.copy(a).lerp(B, v); g.position.copy(Q); g.material.opacity = (i ? 0.5 / i : 0.95) * (u < 1 ? 1 : 0); g.material.color.setHex(leg === 3 ? 0xd9a066 : COL.green); });
      };
    }
  };
  // ---------- walking: the room's own model is what you bump into ----------
  // every surface of the baked room, both faces, kept out of the scene and used only for rays
  const solidMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  function solids(r) {
    if (!r.model) return;
    r.model.updateMatrixWorld(true);
    r.model.traverse(o => {
      if (!o.isMesh) return;
      const m = new THREE.Mesh(o.geometry, solidMat);
      m.matrixAutoUpdate = false; m.matrix.copy(o.matrixWorld); m.matrixWorld.copy(o.matrixWorld);
      r.solid.push(m);
    });
    r.box = new THREE.Box3().setFromObject(r.model);
  }
  const EYE = 1.62, STEP = 0.42, BODY_R = 0.3, WALK_V = 1.8, RUN_V = 3.2;
  const probe = new THREE.Raycaster(), DOWN = new THREE.Vector3(0, -1, 0), O = new THREE.Vector3(), D = new THREE.Vector3();
  // the floor under a point: the first surface below `from`
  function floorAt(x, z, from) {
    O.set(x, from, z); probe.set(O, DOWN); probe.far = 6;
    const h = probe.intersectObjects(room.solid, false)[0];
    return h ? h.point.y : null;
  }
  // can you stand at x,z with your feet at `feet`? Returns the new floor height, or null
  function standAt(x, z, feet) {
    const b = room.box;
    if (b && (x < b.min.x + BODY_R || x > b.max.x - BODY_R || z < b.min.z + BODY_R || z > b.max.z - BODY_R)) return null;
    const y = floorAt(x, z, feet + 1.2);
    if (y == null || y > feet + STEP || y < feet - 0.7) return null;
    return y;
  }
  // nothing in the way between here and there, at knee and chest height
  function clear(x, z, dx, dz, feet) {
    const len = Math.hypot(dx, dz); if (!len) return true;
    D.set(dx / len, 0, dz / len); probe.far = len + BODY_R;
    for (const hgt of [0.55, 1.25]) {
      O.set(x, feet + hgt, z); probe.set(O, D);
      if (probe.intersectObjects(room.solid, false).length) return false;
    }
    return true;
  }
  const walker = { feet: null, bob: 0 };
  function tryMove(dx, dz) {
    if (walker.feet == null) {
      // first step from wherever a view left you: find the floor under your feet, below a seated eye
      const y = floorAt(cur.x, cur.z, cur.y - 1.0);
      walker.feet = y == null ? Math.max(0, cur.y - EYE) : y;
    }
    // stuck inside something (a view can put you over a desk)? let any step out
    const stuck = standAt(cur.x, cur.z, walker.feet) == null;
    for (const [mx, mz] of [[dx, dz], [dx, 0], [0, dz]]) {
      if (!mx && !mz) continue;
      const nx = cur.x + mx, nz = cur.z + mz;
      if (!clear(cur.x, cur.z, mx, mz, walker.feet)) continue;
      const y = standAt(nx, nz, walker.feet);
      if (y == null && !stuck) continue;
      cur.x = goal.x = nx; cur.z = goal.z = nz;
      if (y != null) walker.feet = y;
      goal.y = walker.feet + EYE;
      return Math.hypot(mx, mz);
    }
    return 0;
  }

  // a film blocked from starting on its own (a phone in low-power mode) starts on the next touch
  const waiting = new Set();
  function playV(v) { const p = v.play(); if (p && p.catch) p.catch(() => waiting.add(v)); }
  addEventListener('pointerdown', () => { waiting.forEach(v => { if (W.inside) v.play().then(() => waiting.delete(v), () => {}); }); }, true);

  // show a film or picture at its own shape, centred on the screen (vertical phone ads get dark sides)
  function fit(sc, w, h) {
    if (!w || !h) return;
    const [W0, H0] = sc.s.size, a = w / h, A = W0 / H0;
    sc.mesh.scale.set(a < A ? a / A : 1, a < A ? 1 : A / a, 1);
  }
  // a caption strip under a screen or board
  function caption(r, s, lw, gap) {
    const lab = W.canvasTex(512, 40, (x, w, h) => {
      x.fillStyle = 'rgba(12,11,10,.85)'; x.fillRect(0, 0, w, h);
      x.font = '600 20px ' + BODY; const fit = Math.min(20, Math.floor(20 * (w - 24) / x.measureText(s.label).width));
      x.fillStyle = '#ECE6DA'; x.font = '600 ' + fit + 'px ' + BODY; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s.label, w / 2, h / 2 + 1);
    });
    plane(lw, lw * 40 / 512, new THREE.MeshBasicMaterial({ map: lab.tex, transparent: true }),
      [s.pos[0] + Math.sin(s.ry) * 0.01, s.pos[1] - s.size[1] / 2 - gap, s.pos[2] + Math.cos(s.ry) * 0.01], s.ry, r);
  }
  function video(src, mat, sc) {
    const v = document.createElement('video');
    Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'none' });
    v.setAttribute('playsinline', ''); v.src = src;
    const tex = v.tex = new THREE.VideoTexture(v);
    v.addEventListener('playing', () => { mat.map = tex; mat.needsUpdate = true; if (sc) fit(sc, v.videoWidth, v.videoHeight); });
    return v;
  }
  function drawBoard(r, id, t) {
    const c = r.boards[id]; if (!c || !BOARDS[id]) return;
    c.ctx.clearRect(0, 0, c.c.width, c.c.height);
    BOARDS[id](c.ctx, c.c.width, c.c.height, t);
    c.tex.needsUpdate = true;
  }
  W.on('numbers', () => { if (rooms.cabin && rooms.cabin.meta) drawBoard(rooms.cabin, 'report'); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => Object.values(rooms).forEach(r => r.meta && Object.keys(r.boards).forEach(id => drawBoard(r, id))));

  // ---------- the cinema's film picker ----------
  let film = 'brandfilm';
  function playFilm(id) {
    const r = rooms.cinema; if (!r) return;
    const sc = r.screens.find(s => s.s.id === 'cinema-film'); if (!sc) return;
    film = id;
    if (sc.v) { sc.v.pause(); sc.v.removeAttribute('src'); sc.v.load(); }
    texLoader.load('media/' + id + '-poster.webp', t => { if (film === id && !(sc.mat.map && sc.mat.map.isVideoTexture && sc.v && !sc.v.paused)) { sc.mat.map = t; sc.mat.needsUpdate = true; fit(sc, t.image.width, t.image.height); } });
    sc.v = video('media/' + id + '-loop.mp4', sc.mat, sc);
    filmSound();
    playV(sc.v);
    hud.card.querySelectorAll('[data-film]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.film === id)));
    if (watching) watchLabel();
  }

  // the films with Nova's voice play it in the cinema when sound is on
  function filmSound() {
    const sc = rooms.cinema && rooms.cinema.screens.find(s => s.s.id === 'cinema-film');
    if (!sc || !sc.v) return;
    const f = FILMS.find(x => x.id === film);
    sc.v.muted = !(f && f.voice && W.sound && W.inside === 'cinema');
  }
  W.on('sound', filmSound);
  W.on('inside', filmSound);

  // ---------- sitting down to watch: no card, no buttons, the whole screen in view ----------
  let watching = false;
  const watchBar = document.createElement('div');
  watchBar.className = 'watch-bar'; watchBar.hidden = true;
  watchBar.innerHTML = '<button type="button" data-w="prev" aria-label="Previous film">‹</button>'
    + '<span class="watch-now" aria-live="polite"></span>'
    + '<button type="button" data-w="next" aria-label="Next film">›</button>'
    + '<button type="button" data-w="films">All films</button>'
    + '<button type="button" data-w="up">Stand up</button>';
  hud.spots.parentNode.appendChild(watchBar);
  function watchLabel() {
    const f = FILMS.find(x => x.id === film) || FILMS[0];
    watchBar.querySelector('.watch-now').innerHTML = '<small>Now showing</small>' + f.name + ' <em>· ' + f.by + '</em>';
  }
  function stepFilm(d) {
    const i = FILMS.findIndex(x => x.id === film);
    playFilm(FILMS[(i + d + FILMS.length) % FILMS.length].id);
  }
  function watch(on) {
    if (on === watching || !room || room.id !== 'cinema') return;
    watching = on;
    document.body.classList.toggle('watching', on);
    watchBar.hidden = !on;
    if (on) {
      closeCard(); watchLabel();
      const sc = room.screens.find(x => x.s.id === 'cinema-film');
      if (!sc || !sc.v || sc.v.paused) playFilm(film);
      watchBar.querySelector('[data-w="up"]').focus({ preventScroll: true });
    } else {
      W.resize();
      goView('seat');
    }
  }
  watchBar.addEventListener('click', e => {
    const b = e.target.closest('[data-w]'); if (!b) return;
    const w = b.dataset.w;
    if (w === 'prev' || w === 'next') stepFilm(w === 'prev' ? -1 : 1);
    else if (w === 'films') { watch(false); showSpot('screen'); }
    else watch(false);
  });
  // a seat in the middle of the room, as far forward as still fits the whole screen;
  // on a narrow phone even the back row can't, so the lens widens instead
  const rake = z => z <= -0.25 ? 1.62 + (z + 6.6) * 0.7 / 6.35 : 2.32 + (z + 0.25) * 1.54 / 8.95;
  function watchSeat() {
    const sr = room.meta.screenRect, [sw, sh] = sr.size, [, sy, sz] = sr.pos;
    const base = innerWidth < 600 ? 72 : 62, t = Math.tan(base * Math.PI / 360), a = camera.aspect;
    const need = Math.max(sw * 0.54 / (t * a), sh * 0.6 / t);
    const z = Math.min(8.2, Math.max(-4.5, sz + need)), y = rake(z), dist = z - sz;
    const fov = Math.min(112, Math.max(base, 2 * Math.atan(Math.max(sw * 0.54 / (dist * a), sh * 0.6 / dist)) * 180 / Math.PI));
    if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
    Object.assign(goal, { x: 0, y, z, yaw: 0, pitch: Math.atan2(sy - y, dist) });
  }

  // ---------- where you stand, where you look ----------
  const cur = { x: 0, y: 1.6, z: 0, yaw: 0, pitch: 0 }, goal = { ...cur };
  const coarse = matchMedia('(pointer: coarse)').matches, off = { x: 0, y: 0, set: false };
  let shownSpot = null, wideLens = 0;
  function goView(vid, snap) {
    const v = room.meta.views[vid]; if (!v) return;
    walker.feet = null; wideLens = v.fit || 0;
    Object.assign(goal, { x: v.pos[0], y: v.pos[1], z: v.pos[2], yaw: v.yaw, pitch: v.pitch });
    // turn the short way round
    while (goal.yaw - cur.yaw > Math.PI) goal.yaw -= Math.PI * 2;
    while (goal.yaw - cur.yaw < -Math.PI) goal.yaw += Math.PI * 2;
    if (snap || W.reduce) Object.assign(cur, goal);
  }
  function showSpot(id) {
    const sp = room.meta.spots.find(s => s.id === id), info = ROOMS[room.id].spots[id];
    if (!sp || !info) return;
    if (watching) watch(false);
    shownSpot = id;
    goView(sp.view);
    const c = hud.card;
    c.classList.toggle('julian', !!info.julian);
    c.innerHTML = '<div class="eyebrow">' + info.eyebrow + '</div><h2>' + info.h + '</h2><p>' + info.body + '</p>'
      + (info.calc ? W.calcHTML(true) : '')
      + (info.films ? '<button class="btn sit" type="button" data-watch>Sit down and watch</button>'
        + '<div class="films" role="group" aria-label="Films">' + FILMS.map(f => '<button type="button" data-film="' + f.id + '" aria-pressed="' + (f.id === film) + '"><span>' + f.name + '</span><small>' + f.by + '</small></button>').join('') + '</div>' : '')
      + (info.offers ? '<div class="offers">' + info.offers.map(o => '<div class="offer"><span>' + o[0] + '</span><span>' + o[1] + '</span></div>').join('') + '</div>' : '')
      + (info.note ? '<div class="note">' + info.note + '</div>' : '')
      + (info.tv ? '<button class="btn" type="button" data-tv>' + (tvPaused ? 'Play the film' : 'Pause the film') + '</button>' : '')
      + (info.small ? '<small>' + info.small + '</small>' : '')
      + ((info.primary || info.link) ? '<div class="actions">'
        + (info.primary ? '<a class="btn" href="' + info.primary[1] + '" target="_blank" rel="noopener">' + info.primary[0] + '</a>' : '')
        + (info.link ? '<a class="text-link" href="' + info.link[1] + '" target="_blank" rel="noopener">' + info.link[0] + '</a>' : '') + '</div>' : '')
      + '<button class="inside-close" type="button" aria-label="Close">×</button>';
    if (info.calc) W.bindCalc(c);
    c.querySelectorAll('[data-film]').forEach(b => b.addEventListener('click', () => playFilm(b.dataset.film)));
    c.querySelectorAll('[data-watch]').forEach(b => b.addEventListener('click', () => watch(true)));
    c.querySelector('.inside-close').addEventListener('click', closeCard);
    c.querySelectorAll('[data-tv]').forEach(b => b.addEventListener('click', () => {
      const sc = tvScreen(); if (!sc || !sc.v) return;
      tvPaused = !tvPaused;
      if (tvPaused) sc.v.pause(); else sc.v.play().catch(() => {});
      b.textContent = tvPaused ? 'Play the film' : 'Pause the film';
      tvSound();
    }));
    c.hidden = false; c.scrollTop = 0;
    hud.spots.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.spot === id)));
    hud.hint.style.opacity = 0;
    tvSound();
    W.emit('room-spot', room.id, id);
  }
  function closeCard() {
    hud.card.hidden = true; shownSpot = null;
    hud.spots.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    tvSound();
  }
  // the loft TV in the Apex lodge: Nova's voice plays only while its card is open, with sound on, and not paused
  let tvPaused = false, tvHeard = false;
  function tvScreen() { return rooms.apex && rooms.apex.screens.find(s => s.s.id === 'loft-tv'); }
  function tvSound() {
    const sc = tvScreen(); if (!sc || !sc.v) return;
    const on = !!(W.sound && W.inside === 'apex' && shownSpot === 'loft' && !tvPaused);
    sc.v.muted = !on;
    if (on !== tvHeard) { tvHeard = on; W.emit('filmvoice', on); }
  }
  W.on('sound', tvSound);
  W.on('inside', tvSound);
  function spotButtons() {
    const spots = ROOMS[room.id].spots;
    hud.spots.innerHTML = room.meta.spots.map(s => '<button type="button" data-spot="' + s.id + '" aria-pressed="false"><i></i>' + spots[s.id].label + '</button>').join('');
    hud.spots.querySelectorAll('button').forEach(b => b.addEventListener('click', () => showSpot(b.dataset.spot)));
    if (room.id === 'cinema') {
      hud.spots.insertAdjacentHTML('afterbegin', '<button type="button" class="sit" data-watch><i></i>Sit and watch</button>');
      hud.spots.querySelector('[data-watch]').addEventListener('click', () => watch(true));
    }
  }

  // ---------- input ----------
  let drag = null;
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  canvas.addEventListener('pointerdown', e => {
    if (!W.inside || !room) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const k = e.pointerType === 'mouse' ? 0.0032 : 0.005;
    cur.yaw += (e.clientX - drag.x) * k; cur.pitch = Math.max(-0.9, Math.min(0.8, cur.pitch + (e.clientY - drag.y) * k));
    goal.yaw = cur.yaw; goal.pitch = cur.pitch;
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const endDrag = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const click = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6;
    drag = null;
    if (!click || !room || e.type === 'pointercancel') return;
    const r = canvas.getBoundingClientRect();
    mouse.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(room.hits, false)[0];
    if (!hit) return;
    const id = hit.object.userData.spot || HIT_SPOT[hit.object.userData.hit];
    if (id) showSpot(id);
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  const held = new Set();
  addEventListener('keydown', e => {
    if (!W.inside) return;
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key === 'Escape') { if (watching) watch(false); else if (!hud.card.hidden) closeCard(); else exit(); return; }
    if (watching && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { stepFilm(e.key === 'ArrowLeft' ? -1 : 1); e.preventDefault(); return; }
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's', 'Shift'].includes(k)) { held.add(k); if (k !== 'Shift') e.preventDefault(); }
  });
  addEventListener('keyup', e => held.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));
  addEventListener('blur', () => held.clear());

  // left-thumb stick on touch screens
  const stick = { x: 0, y: 0, id: null };
  if (hud.stick) {
    const knob = hud.stick.querySelector('i');
    const move = e => {
      const b = hud.stick.getBoundingClientRect(), R = b.width / 2;
      let dx = e.clientX - (b.left + R), dy = e.clientY - (b.top + R);
      const d = Math.hypot(dx, dy), lim = R - 12;
      if (d > lim) { dx *= lim / d; dy *= lim / d; }
      stick.x = dx / lim; stick.y = dy / lim;
      knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    };
    const end = e => { if (e.pointerId !== stick.id) return; stick.id = null; stick.x = stick.y = 0; knob.style.transform = ''; };
    hud.stick.addEventListener('pointerdown', e => { stick.id = e.pointerId; hud.stick.setPointerCapture(e.pointerId); move(e); e.preventDefault(); });
    hud.stick.addEventListener('pointermove', e => { if (e.pointerId === stick.id) move(e); });
    hud.stick.addEventListener('pointerup', end);
    hud.stick.addEventListener('pointercancel', end);
  }

  let animN = 0;
  W.insideTick = (dt, time) => {
    if (!room || !room.meta) { renderer.render(room ? room.scene : W.scene, camera); return; }
    // arrows turn, WASD (or up/down, or the thumb stick) walks, Shift runs
    const turn = dt * 1.7;
    if (held.has('ArrowLeft')) { cur.yaw += turn; goal.yaw = cur.yaw; }
    if (held.has('ArrowRight')) { cur.yaw -= turn; goal.yaw = cur.yaw; }
    let f = 0, s = 0;
    if (held.has('w') || held.has('ArrowUp')) f += 1;
    if (held.has('s') || held.has('ArrowDown')) f -= 1;
    if (held.has('d')) s += 1;
    if (held.has('a')) s -= 1;
    f -= stick.y; s += stick.x;
    const mag = Math.hypot(f, s);
    if (mag > 1) { f /= mag; s /= mag; }
    if (!watching && mag > 0.08 && room.solid.length) {
      const v = (held.has('Shift') || Math.hypot(stick.x, stick.y) > 0.92 ? RUN_V : WALK_V) * dt;
      const sy = Math.sin(cur.yaw), cy = Math.cos(cur.yaw);
      // a step cancels any glide toward a view, and levels your gaze a little if a view had you looking down at a desk
      goal.yaw = cur.yaw; goal.pitch = cur.pitch = cur.pitch + (Math.max(-0.35, Math.min(0.5, cur.pitch)) - cur.pitch) * Math.min(1, dt * 2);
      const moved = tryMove((-sy * f + cy * s) * v, (-cy * f - sy * s) * v);
      if (moved) {
        wideLens = 0;
        const was = Math.floor(walker.bob / Math.PI);
        walker.bob += moved * 2.4;
        if (Math.floor(walker.bob / Math.PI) !== was) W.emit('step');
        hud.hint.style.opacity = 0;
      }
    }
    if (watching) watchSeat();
    else {
      // the room's normal lens, or wider while a view asks for it (the dome film on a phone held upright)
      const base = innerWidth < 600 ? 72 : 62;
      const want = wideLens ? Math.min(100, Math.max(base, 2 * Math.atan(Math.tan(wideLens) / camera.aspect) * 180 / Math.PI)) : base;
      if (Math.abs(camera.fov - want) > 0.05) { camera.fov += (want - camera.fov) * Math.min(1, dt * 3); camera.updateProjectionMatrix(); }
    }
    const k = 1 - Math.exp(-dt * 3.2);
    for (const key of ['x', 'y', 'z', 'yaw', 'pitch']) cur[key] += (goal[key] - cur[key]) * k;
    camera.position.set(cur.x, cur.y, cur.z);
    camera.rotation.set(cur.pitch, cur.yaw, 0, 'YXZ');
    // with a story card open, keep what you're looking at clear of it: right of it on wide screens, above or below on narrow ones
    const w = innerWidth, h = innerHeight, open = !hud.card.hidden && !W.lowered;
    const tx = open && !coarse && w > 860 ? Math.min(240, w * 0.16) : 0;
    const ty = open && !tx ? (coarse ? -h * 0.15 : h * 0.17) : 0;
    off.x += (tx - off.x) * k; off.y += (ty - off.y) * k;
    if (Math.abs(off.x) + Math.abs(off.y) > 0.5) {
      const ax = Math.abs(off.x), ay = Math.abs(off.y);
      camera.setViewOffset(w + 2 * ax, h + 2 * ay, 0, off.y > 0 ? 2 * ay : 0, w, h); off.set = true;
    } else if (off.set) { camera.clearViewOffset(); off.set = false; }
    for (const m of room.markers) {
      m.g.visible = !watching;
      const on = m.sp.id === shownSpot;
      m.g.scale.setScalar((on ? 0.14 : 0.2) + (W.reduce ? 0 : Math.sin(time * 2.4 + m.ph) * 0.035));
      m.g.material.opacity = on ? 0.35 : 0.95;
    }
    if ((animN = (animN + 1) % 3) === 0) for (const id in room.boards) if (ANIMATED.has(id)) drawBoard(room, id, W.reduce ? 4.5 : time);
    if (room.fx) room.fx(time);
    if (room.beam) room.beam.material.opacity = 0.03 + (W.reduce ? 0 : Math.sin(time * 7) * 0.004);
    renderer.render(room.scene, camera);
  };

  // ---------- in and out ----------
  function fade(fn) {
    hud.fade.classList.add('on');
    setTimeout(() => { fn(); requestAnimationFrame(() => hud.fade.classList.remove('on')); }, W.reduce ? 0 : 460);
  }
  function enter(id, opts) {
    if (W.inside || !ROOMS[id]) return;
    from = Object.assign({ stop: null, city: false }, opts);
    if (from.city && window.JPAXCity) { window.JPAXCity.stopScreens(); window.JPAXCity.keys.clear(); }
    fade(() => {
      W.inside = id;
      room = rooms[id] && rooms[id].meta ? rooms[id] : null;
      document.body.classList.add('in-room');
      hud.name.textContent = ROOMS[id].name;
      canvas.setAttribute('aria-label', ROOMS[id].name + ', a 3D room. Use the buttons to look at each part, or Escape to leave.');
      hud.card.hidden = true; shownSpot = null; hud.spots.innerHTML = ''; hud.hint.style.opacity = 1;
      camera.rotation.order = 'YXZ';
      off.x = off.y = 0; off.set = false;
      W.resize();
      const ready = r => {
        if (W.inside !== id) return;
        room = r; hud.load.hidden = true;
        goView(r.meta.views[from.view] ? from.view : r.meta.start, true);
        spotButtons();
        r.screens.forEach(sc => sc.v && !(sc.s.id === 'loft-tv' && tvPaused) && playV(sc.v));
      };
      if (room) ready(room);
      else {
        hud.load.hidden = false;
        load(id).then(ready, () => { hud.load.textContent = 'This room didn’t load. Try again in a moment.'; });
      }
      hud.back.textContent = from.city ? '← Back to the street' : '← Back to the road';
      hud.back.focus({ preventScroll: true });
      W.emit('inside', id);
    });
  }
  function exit() {
    if (!W.inside) return;
    fade(() => {
      const was = W.inside;
      if (rooms[was]) rooms[was].screens.forEach(sc => sc.v && sc.v.pause());
      if (watching) { watching = false; document.body.classList.remove('watching'); watchBar.hidden = true; }
      W.inside = null; room = null; drag = null; held.clear(); waiting.clear();
      document.body.classList.remove('in-room');
      canvas.setAttribute('aria-label', canvasLabel);
      hud.card.hidden = true; hud.load.hidden = true;
      if (from && from.city) { W.resize(); }
      else { camera.rotation.order = 'XYZ'; W.resize(); if (from && from.stop != null) W.goTo(from.stop); }
      W.emit('inside', null);
      // put keyboard focus back on what brought you in: the street's back button, or the stop's "Step into" link
      requestAnimationFrame(() => {
        const to = document.querySelector(from && from.city ? '#walk-back' : '#panel [data-room]');
        if (to) to.focus({ preventScroll: true });
      });
    });
  }
  hud.back.addEventListener('click', exit);

  // #room=studio (with &view=desk) opens a room straight away, for sharing a room and for checking one
  { const m = /room=(\w+)(?:&view=(\w+))?/.exec(location.hash);
    if (m && ROOMS[m[1]]) addEventListener('load', () => enter(m[1], { view: m[2] })); }

  window.JPAXRooms = { enter, exit, load, ROOMS, FILMS };
})();
