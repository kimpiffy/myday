/* =========================================================
   MY DAY — script
   1. CONTENT   (edit skills + the timeline of events here)
   2. DOODLES   (tiny inline SVG icons)
   3. RENDER    (builds the cards)
   4. LINE      (builds the wandering SVG path + draws it on scroll)
   5. EXTRAS    (reveal on scroll, googly eyes, counters)
   ========================================================= */
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  /* ---------------------------------------------------------
     1a. SKILLS — text shown on each card.
     kind: 'soft' (floats left / above) or 'hard' (sits right / below)
     doodle: 'eye', 'arrow'/'dot', or anything else (e.g. 'star') for a generated cut-paper star
     --------------------------------------------------------- */
  const SKILLS = {
    // ---- soft ----
    adapt:     { kind: 'soft', doodle: 'star',   text: 'Adaptability, caregiving & patience' },
    play:      { kind: 'soft', doodle: 'star',   text: 'Creative engagement & teaching through play' },
    multitask: { kind: 'soft', doodle: 'star',  text: 'Multitasking & time management' },
    delegate:  { kind: 'soft', doodle: 'star',   text: 'Task Delegation & creating an inclusive, participatory activity' },
    negotiate: { kind: 'soft', doodle: 'arrow',  text: 'Compromise & negotiation' },
    empathy:   { kind: 'soft', doodle: 'star',   text: 'Emotional regulation, empathy & tailored communication' },
    initiative:{ kind: 'soft', doodle: 'star',   text: 'Planning, initiative & spatial reasoning' },
    problem:   { kind: 'soft', doodle: 'star',   text: 'Problem-solving, critical evaluation & organisation' },
    collab:    { kind: 'soft', doodle: 'arrow',  text: 'Collaboration & facilitation' },
    selfmgmt:  { kind: 'soft', doodle: 'eye',    text: 'Self-care & recognising cognitive limits' },
    // ---- hard ----
    drawing:   { kind: 'hard', doodle: 'star', text: 'Observational drawing & illustration' },
    budget:    { kind: 'hard', doodle: 'star', text: 'Budgeting, resource prioritisation & management' },
    admin:     { kind: 'hard', doodle: 'star', text: 'Professional communication, scheduling & workload planning' },
    client:    { kind: 'hard', doodle: 'star', text: 'Client communication & administration' },
    infodesign:{ kind: 'hard', doodle: 'star', text: 'Information design' },
    tech:      { kind: 'hard', doodle: 'star', text: 'Web development, interaction design & visual communication' },
  };

  /* ---------------------------------------------------------
     1b. STOPS — the day, in order.
     time/ampm : shown on the little tag on the line
     text      : the event headline
     soft/hard : { id: key from SKILLS, quip: optional witty line } (either may be omitted)
     move      : how the line behaves after this point:
                 'wander' | 'zigzag' | 'curve' (bends toward the card) | 'loop' | 'spiral'
     doodle    : decorative icon in the empty space beside the cards
     To add a stop, copy one object. Hard/soft totals on the last card update automatically.
     --------------------------------------------------------- */
  const STOPS = [
    { time: '7ish', ampm: 'AM', text: 'Woken up by toddler. Immediately required to become a functioning human.',
      soft: { id: 'adapt' },
      move: 'wander', doodle: 'star' },

    { time: '7:30', ampm: 'AM', text: 'Drew a lion together on the whiteboard, from reference.',
      soft: { id: 'play' },
      hard: { id: 'drawing' },
      move: 'curve', doodle: 'star' },

    { time: '8ish', ampm: 'AM', text: 'Breakfast deployed whilst I get dressed.',
      soft: { id: 'multitask' },
      move: 'zigzag', doodle: 'star' },

    { time: '8:30', ampm: 'AM', text: 'Toddler helped put dry clothes away; laundry went on.',
      soft: { id: 'delegate' },
      move: 'loop', doodle: 'star' },

    { time: '9ish', ampm: 'AM', text: 'Nursery drive. Negotiations over the soundtrack led to us listening to Toddler Techno.',
      soft: { id: 'negotiate' },
      move: 'wander', doodle: 'arrow' },

    { time: '9:15', ampm: 'AM', text: 'Daughter did not want to go into nursery. I helped her through the transition.',
      soft: { id: 'empathy' },
      move: 'spiral', doodle: 'star' },

    { time: '9:45', ampm: 'AM', text: 'Home. Immediately moved a bookcase because I had already decided what needed doing.',
      soft: { id: 'initiative' },
      move: 'curve', doodle: 'star' },

    { time: '10–11', ampm: 'AM', text: 'Hoovering, sorting, reorganising my studio. Tasks that were pre-requisites to solving my storage problem.',
      soft: { id: 'problem' },
      move: 'zigzag', doodle: 'star' },

    { time: '11ish', ampm: 'AM', text: 'Researched and ordered shelving and IKEA drawers, within what I can spend.',
      hard: { id: 'budget' },
      move: 'loop', doodle: 'star' },

    { time: '11:30', ampm: 'AM', text: 'Replied to a job offer and started scheduling Digital Ambassador work around my University schedule and everything else.',
      hard: { id: 'admin' },
      move: 'wander', doodle: 'star' },

    { time: '12ish', ampm: 'PM', text: 'Replied to clients and emails.',
      hard: { id: 'client' },
      move: 'curve', doodle: 'star' },

    { time: '12:30', ampm: 'PM', text: 'Worked on the Collaboration Whiteboard: reorganised the information into a table and told the group.',
      soft: { id: 'collab' },
      hard: { id: 'infodesign' },
      move: 'zigzag', doodle: 'star' },

    { time: '1ish', ampm: 'PM', text: 'Started coding this website!',
      hard: { id: 'tech' },
      move: 'loop', doodle: 'star' },

    { time: '2ish', ampm: 'PM', text: 'Realised my brain had basically left the building. Lunch and a break.',
      soft: { id: 'selfmgmt' },
      move: 'wander', doodle: 'eye' },
  ];
  // The final 6:37 PM stop (spiral + tally + note) is plain HTML in index.html.

  /* Card colours & wonky angles cycle through these lists */
  const SOFT_BG = ['#3f84f7', '#5b97f8', '#3f84f7', '#79aaf9'];
  const HARD_BG = ['#ff4a1c', '#ff6a3d', '#ff4a1c', '#ff5c2e'];
  const DECO_COLORS = ['#ff4a1c', '#3f84f7', '#ffe3d6', '#ff4a1c'];
  const ANGLES = [-3.5, 2.5, -1.5, 4, -2.5, 3, -4.5, 1.5, -2, 3.5];

  /* ---------------------------------------------------------
     2. DOODLES — the eye is hand-set; arrows become collage dots and stars are cut-paper shapes.
     --------------------------------------------------------- */
  const DOODLES = {
    eye:   '<path d="M3 24 C12 10 36 10 45 24 C36 38 12 38 3 24Z"/><circle cx="24" cy="24" r="7"/><circle class="pupil" cx="24" cy="24" r="2.8" fill="currentColor"/>',
  };

  // Seeded random so every star is different but the page looks the same on each load
  let seed = 11;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const r1 = n => Math.round(n * 10) / 10;

  // Loose, uneven rays with a narrow middle keep the stars closer to simple paper cut-outs.
  function starSVG(cls) {
    const spikes = 4 + Math.floor(rand() * 3);
    const size = Math.round(58 + rand() * 42);
    const pts = [];
    for (let i = 0; i < spikes * 2; i++) {
      const outer = i % 2 === 0;
      const a = (i / (spikes * 2)) * Math.PI * 2 + (rand() - .5) * .3;
      const r = outer ? 18 + rand() * 8 : 2 + rand() * 4;
      pts.push(`${r1(24 + r * Math.cos(a))},${r1(24 + r * Math.sin(a))}`);
    }
    return `<svg class="${cls} star" style="width:${size}%;height:${size}%" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><polygon points="${pts.join(' ')}"/></svg>`;
  }
  function dotSVG(cls) {
    const rotation = Math.round(rand() * 40 - 20);
    return `<svg class="${cls} collage-dot" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path transform="rotate(${rotation} 24 24)" d="M23 4 C34 3 43 10 44 21 C45 32 38 43 27 44 C16 45 6 38 4 28 C2 17 11 6 23 4Z"/></svg>`;
  }
  const icon = (name, cls = '') => name === 'arrow' || name === 'dot'
    ? dotSVG(cls)
    : DOODLES[name]
      ? `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${DOODLES[name]}</svg>`
      : starSVG(cls);

  // Fill any <span data-doodle="name"> in the HTML
  document.querySelectorAll('[data-doodle]').forEach(el => { el.innerHTML = icon(el.dataset.doodle); });

  // Scatter cut-outs across the whole timeline: one per vertical band, random x, so they never form a column
  const collage = document.querySelector('.journey .edge-collage');
  const MARK_COLORS = ['var(--coral)', 'var(--cream)', 'var(--teal)', 'var(--yellow)'];
  const MARKS = 18;
  for (let i = 0; i < MARKS; i++) {
    const mark = document.createElement('span');
    const size = Math.round(16 + rand() * 40);
    mark.className = 'edge-mark';
    mark.style.cssText =
      `top:${r1((i + rand() * .9) / MARKS * 96)}%;left:${r1(2 + rand() * 92)}%;` +
      `width:${size}px;height:${size}px;rotate:${Math.round(rand() * 360)}deg;` +
      `color:${MARK_COLORS[Math.floor(rand() * MARK_COLORS.length)]}`;
    mark.innerHTML = icon(rand() < .35 ? 'dot' : 'star');
    collage.appendChild(mark);
  }

  // Hero scatter: stars, dots and eyes in a jittered grid, kept clear of the "MY DAY" title.
  // Each mark gets a fixed list of candidate spots; the first one that misses the title is used.
  const heroCollage = document.querySelector('.hero-collage');
  const heroTitle = document.querySelector('.hero h1');
  const COLS = 5, ROWS = 4, KINDS = ['star', 'star', 'dot', 'eye'];
  const heroMarks = [];
  // Hand-tuned size multipliers for individual marks, keyed by their index in the scatter
  const SCALE = { 10: .5 };
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const kind = KINDS[Math.floor(rand() * KINDS.length)];
      const size = Math.round((18 + rand() * 54) * (kind === 'eye' ? 1.2 : 1) * (SCALE[heroMarks.length] || 1));
      const mark = document.createElement('span');
      mark.className = 'edge-mark';
      mark.style.cssText =
        `width:${size}px;height:${size}px;` +
        // eyes stay almost level; stars and dots can spin freely
        `rotate:${kind === 'eye' ? Math.round(rand() * 14 - 7) : Math.round(rand() * 360)}deg;` +
        `color:${MARK_COLORS[Math.floor(rand() * MARK_COLORS.length)]}`;
      mark.innerHTML = icon(kind);
      heroCollage.appendChild(mark);
      const spots = [[(col + .1 + rand() * .8) / COLS, (row + .1 + rand() * .8) / ROWS]];
      for (let k = 0; k < 40; k++) spots.push([rand(), rand()]);
      heroMarks.push({ mark, size, spots });
    }
  }

  // Hand-tuned nudges [x, y] in px for individual marks, keyed by their index in the scatter
  const NUDGE = { 10: [130, -140], 14: [70, 60] };

  function placeHeroMarks() {
    const hr = heroCollage.getBoundingClientRect();
    const tr = heroTitle.getBoundingClientRect();
    const pad = 16;
    const jr = document.getElementById('journey').getBoundingClientRect();
    const box = { l: Math.min(tr.left, jr.left) - hr.left - pad, r: Math.max(tr.right, jr.right) - hr.left + pad, t: -1e4, b: 1e4 };
    heroMarks.forEach(({ mark, size, spots }, i) => {
      const [nx, ny] = NUDGE[i] || [0, 0];
      const fits = ([fx, fy]) => {
        const x = fx * (hr.width - size) + nx, y = fy * (hr.height - size) + ny;
        return x + size < box.l || x > box.r || y + size < box.t || y > box.b ? [x, y] : null;
      };
      let pos = null;
      for (const s of spots) { pos = fits(s); if (pos) break; }
      mark.style.display = pos ? '' : 'none';
      if (pos) { mark.style.left = `${r1(pos[0])}px`; mark.style.top = `${r1(pos[1])}px`; }
    });
  }
  placeHeroMarks();
  window.addEventListener('resize', placeHeroMarks);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeHeroMarks);

  // Side sprinkle: stars, dots and eyes across the page margins and the empty gaps beside the timeline.
  // Uses its own seed so it doesn't shift the shapes already placed above or the ones rendered below.
  const keepSeed = seed;
  seed = 4242;
  const sideCollage = document.createElement('div');
  sideCollage.className = 'side-collage';
  sideCollage.setAttribute('aria-hidden', 'true');
  document.getElementById('journey').prepend(sideCollage);
  const SIDE_MARKS = 90, SIDE_KINDS = ['star', 'star', 'star', 'dot', 'dot', 'eye'];
  const sideMarks = [];
  for (let i = 0; i < SIDE_MARKS; i++) {
    const kind = SIDE_KINDS[Math.floor(rand() * SIDE_KINDS.length)];
    const size = Math.round((12 + rand() * 40) * (kind === 'eye' ? 1.3 : 1));
    const mark = document.createElement('span');
    mark.className = 'edge-mark';
    mark.style.cssText =
      `width:${size}px;height:${size}px;` +
      `rotate:${kind === 'eye' ? Math.round(rand() * 14 - 7) : Math.round(rand() * 360)}deg;` +
      `color:${MARK_COLORS[Math.floor(rand() * MARK_COLORS.length)]}`;
    mark.innerHTML = icon(kind);
    sideCollage.appendChild(mark);
    // Each shape owns a vertical band; candidate [x fraction, y wobble in px] spots are tried in order.
    const band = (i + rand() * .8) / SIDE_MARKS;
    const spots = [];
    // x follows a golden-ratio sequence so shapes cover the full width evenly; later spots widen the search
    const baseX = (i * 0.618034 + rand() * .05) % 1;
    for (let k = 0; k < 60; k++) {
      const spread = k < 20 ? .05 : k < 40 ? .15 : 1;
      const fx = spread === 1 ? rand() : Math.max(0, Math.min(1, baseX + (rand() - .5) * 2 * spread));
      spots.push([fx, (rand() - .5) * 80]);
    }
    sideMarks.push({ mark, size, band, spots });
  }
  seed = keepSeed;

  // Put each shape in the first candidate spot that doesn't sit under a card, heading, tag or other content.
  function placeSideMarks() {
    const cr = sideCollage.getBoundingClientRect();
    const pad = 14;
    const blocks = [...document.querySelectorAll('.stop .card, .stop .event, .stop .deco, .marker, .finale-body')]
      .map(el => el.getBoundingClientRect())
      .map(r => ({ l: r.left - cr.left - pad, r: r.right - cr.left + pad, t: r.top - cr.top - pad, b: r.bottom - cr.top + pad }));
    const jr = journey.getBoundingClientRect();
    blocks.push({ l: jr.left - cr.left, r: jr.right - cr.left, t: -1e4, b: 1e4 });
    // keep clear of the squiggle: sample its path into small boxes
    const lineEl = document.getElementById('ghost'), sr = document.getElementById('line').getBoundingClientRect();
    const len = lineEl.getTotalLength ? lineEl.getTotalLength() : 0, lp = 22;
    for (let l = 0; l <= len; l += 8) {
      const p = lineEl.getPointAtLength(l), x = p.x + sr.left - cr.left, y = p.y + sr.top - cr.top;
      blocks.push({ l: x - lp, r: x + lp, t: y - lp, b: y + lp });
    }
    sideMarks.forEach(({ mark, size, band, spots }) => {
      let pos = null;
      for (const [fx, dy] of spots) {
        const x = fx * (cr.width - size), y = Math.max(0, Math.min(cr.height - size, band * cr.height + dy));
        if (!blocks.some(b => x + size > b.l && x < b.r && y + size > b.t && y < b.b)) { pos = [x, y]; break; }
      }
      mark.style.display = pos ? '' : 'none';
      if (pos) { mark.style.left = `${r1(pos[0])}px`; mark.style.top = `${r1(pos[1])}px`; }
    });
  }

  /* ---------------------------------------------------------
     3. RENDER — build one <li> per stop
     --------------------------------------------------------- */
  const stopsList = document.getElementById('stops');
  const finale = stopsList.querySelector('.finale');
  let cardCount = 0;

  // Returns '' for loose times like '7ish' or '10–11', which then get no datetime attribute
  const to24h = (t, ampm) => {
    if (!/^\d{1,2}(:\d{2})?$/.test(t)) return '';
    let [h, m = 0] = t.split(':').map(Number);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  function cardHTML(ref, i) {
    const s = SKILLS[ref.id];
    const label = s.kind === 'soft' ? '☁ Soft skill' : '✦ Hard skill';
    const palette = s.kind === 'soft' ? SOFT_BG : HARD_BG;
    const angle = ANGLES[cardCount++ % ANGLES.length];
    return `
      <article class="card ${s.kind}" tabindex="0" style="--bg:${palette[i % palette.length]};--r:${angle}deg">
        ${icon(s.doodle, 'doodle')}
        <span class="kind">${label}</span>
        <p>${s.text}</p>
        ${ref.quip ? `<p class="quip">${ref.quip}</p>` : ''}
      </article>`;
  }

  STOPS.forEach((st, i) => {
    const li = document.createElement('li');
    const layout = st.soft && st.hard ? 'both' : st.soft ? 'soft-only' : 'hard-only';
    li.className = `stop ${layout}`;
    li.dataset.move = st.move || 'wander';
    // direction the line leans: toward the soft side (-1 = left) or hard side (+1 = right)
    li.dataset.dir = st.soft && st.hard ? (i % 2 ? 1 : -1) : st.hard ? 1 : -1;
    li.innerHTML = `
      <div class="marker" style="--r:${ANGLES[(i + 3) % ANGLES.length] / 1.5}deg">
        <time${to24h(st.time, st.ampm) ? ` datetime="${to24h(st.time, st.ampm)}"` : ''}>${st.time}<small>${st.ampm}</small></time>
      </div>
      <h2 class="event">${st.text}</h2>
      ${st.soft ? cardHTML(st.soft, i) : ''}
      ${st.hard ? cardHTML(st.hard, i) : ''}
      <div class="deco" style="--r:${ANGLES[(i + 5) % ANGLES.length] * 2}deg;--c:${DECO_COLORS[i % DECO_COLORS.length]};--size:${Math.round(58 + rand() * 42)}px;--dx:${Math.round(rand() * 280) * (st.hard && !st.soft ? -1 : 1)}px">${icon(st.doodle)}</div>`;
    stopsList.insertBefore(li, finale);
  });

  // Counters on the final card (distinct skills actually used)
  const used = { hard: new Set(), soft: new Set() };
  STOPS.forEach(st => ['soft', 'hard'].forEach(k => st[k] && used[k].add(st[k].id)));
  document.querySelectorAll('[data-count]').forEach(el => { el.textContent = used[el.dataset.count].size; });

  /* ---------------------------------------------------------
     4. LINE — one long Bezier through every time tag
     --------------------------------------------------------- */
  const journey = document.getElementById('journey');
  const svg = document.getElementById('line');
  const ghost = document.getElementById('ghost');
  const drawn = document.getElementById('drawn');
  const tip = document.getElementById('tip');
  const stopEls = [...stopsList.children];
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MARKER_TOP = 34;                                // keep in sync with --marker-top in CSS
  const WOBBLE = [0, -24, 20, -14, 24, -22, 14, -18];   // sideways drift of each time tag
  const f = n => Math.round(n * 10) / 10;

  /* Extra points the line passes through AFTER each time tag.
     x,y = the tag; h = distance to the next tag; d = ±1 lean direction; s = scale (small, to suit the narrow column) */
  const MOVES = {
    wander: (x, y, h, d, s) => [[x + d * 42 * s, y + h * .35], [x - d * 34 * s, y + h * .68]],
    zigzag: (x, y, h, d, s) => [[x + d * 40 * s, y + h * .2], [x - d * 40 * s, y + h * .38], [x + d * 40 * s, y + h * .56], [x - d * 34 * s, y + h * .74]],
    curve:  (x, y, h, d, s) => [[x + d * 66 * s, y + h * .42], [x + d * 16 * s, y + h * .78]],
    // a small loop-the-loop hanging below the tag
    loop: (x, y, h, d, s) => {
      const r = Math.max(10, Math.min(28, (h - 80) / 2.4)) * Math.max(s, .55);
      const p = [];
      for (let k = 1; k <= 7; k++) {
        const a = (-90 + k * 45) * Math.PI / 180;
        p.push([x + d * r * Math.cos(a), y + r + r * Math.sin(a)]);
      }
      return p;
    },
    // a spiral that winds outward from just under the tag
    spiral: (x, y, h, d, s) => {
      const R = Math.max(12, Math.min(30, (h - 80) / 2)) * Math.max(s, .55);
      const cy = y + R + 8, p = [[x, cy]];
      for (let k = 1; k <= 8; k++) {
        const a = (k * 45) * Math.PI / 180, r = 4 + (R - 4) * k / 8;
        p.push([x + d * r * Math.sin(a), cy - r * Math.cos(a)]);
      }
      return p;
    },
  };

  // Catmull-Rom → cubic Bezier: a smooth curve through every point
  function smooth(p) {
    let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      d += ` C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`;
    }
    return d;
  }

  let total = 0, samples = [], cur = 0, target = 0, raf = 0;
  const STEP = 5;

  function layout() {
    const spiralR = 55;
    finale.style.paddingTop = `${MARKER_TOP + spiralR * 2 + 36}px`;   // room for the closing spiral

    const jr = journey.getBoundingClientRect();
    const W = jr.width, H = jr.height;
    const cx = 30;                      // the line lives at the left edge of the central column
    const s = .4;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const ys = stopEls.map(el => el.getBoundingClientRect().top - jr.top + MARKER_TOP);
    const pts = [[cx, 0], [cx + 30 * s, ys[0] * .5]];

    stopEls.forEach((el, i) => {
      const last = i === stopEls.length - 1;
      const x = last ? W / 2 : cx + WOBBLE[i % WOBBLE.length] * s;
      const y = ys[i];
      el.querySelector('.marker').style.left = `${f(x)}px`;
      pts.push([x, y]);

      if (last) {
        // closing spiral: winds inward, three turns
        const cy = y + spiralR, K = 36;
        for (let k = 1; k <= K; k++) {
          const a = (-90 + k * 30) * Math.PI / 180, r = spiralR * (1 - .93 * k / K);
          pts.push([x + r * Math.cos(a), cy + r * Math.sin(a)]);
        }
      } else {
        const move = MOVES[el.dataset.move] || MOVES.wander;
        pts.push(...move(x, y, ys[i + 1] - y, +el.dataset.dir || 1, s));
      }
    });

    const d = smooth(pts);

    // The line (dotted guide and solid trace) starts just under "scroll to begin" and leads down into the timeline
    const cue = document.querySelector('.cue span');
    let ghostD = d;
    if (cue) {
      const cr = cue.getBoundingClientRect();
      const sx = cr.left + cr.width / 2 - jr.left, sy = cr.bottom - jr.top + 10;
      ghostD = smooth([[sx, sy], [sx + (cx - sx) * .15 + 18, sy * .6], [sx + (cx - sx) * .6 - 14, sy * .25], ...pts]);
    }
    ghost.setAttribute('d', ghostD);
    drawn.setAttribute('d', ghostD);
    total = drawn.getTotalLength();
    drawn.style.strokeDasharray = `${total} ${total}`;

    // lookup table: path length → furthest y reached so far (loops go backwards, so use a running max)
    samples = [];
    let maxY = -Infinity;
    for (let l = 0; l <= total + STEP; l += STEP) {
      maxY = Math.max(maxY, drawn.getPointAtLength(Math.min(l, total)).y);
      samples.push(maxY);
    }
    cur = reduceMQ.matches ? total : Math.min(cur, total);
    onScroll();
  }

  // Which length of the line should be visible for the current scroll position?
  function targetLength() {
    if (reduceMQ.matches) return total;
    const y = window.innerHeight * .6 - journey.getBoundingClientRect().top;   // reading line = 60% down the screen
    if (y <= samples[0]) return 0;
    let lo = 0, hi = samples.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; samples[mid] >= y ? hi = mid : lo = mid + 1; }
    return samples[lo] >= y ? Math.min(total, lo * STEP) : total;
  }

  function draw() {
    drawn.style.strokeDashoffset = total - cur;
    if (reduceMQ.matches || cur <= 0) { tip.style.display = 'none'; return; }
    const p = drawn.getPointAtLength(cur);
    tip.style.display = '';
    tip.setAttribute('transform', `translate(${p.x} ${p.y})`);
  }

  function frame() {
    cur += (target - cur) * .16;                       // ease toward the target so it feels like a pencil
    if (Math.abs(target - cur) < .5 || reduceMQ.matches) cur = target;
    draw();
    raf = cur !== target ? requestAnimationFrame(frame) : 0;
  }
  function onScroll() {
    target = targetLength();
    if (!raf) raf = requestAnimationFrame(frame);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  new ResizeObserver(layout).observe(journey);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layout(); placeSideMarks(); });
  layout();
  placeSideMarks();
  new ResizeObserver(placeSideMarks).observe(journey);

  /* ---------------------------------------------------------
     5. EXTRAS
     --------------------------------------------------------- */
  // Stick each stop onto the page as it nears the middle of the screen
  if (reduceMQ.matches || !('IntersectionObserver' in window)) {
    stopEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -22% 0px', threshold: 0.12 });
    stopEls.forEach(el => io.observe(el));
  }

  // Tiny surprise: every doodled eye follows the cursor
  const pupils = [...document.querySelectorAll('.pupil')];
  if (!reduceMQ.matches) {
    let pending = null;
    window.addEventListener('pointermove', e => {
      pending = e;
      if (pending && !pupils._busy) {
        pupils._busy = true;
        requestAnimationFrame(() => {
          pupils.forEach(p => {
            const r = p.ownerSVGElement.getBoundingClientRect();
            const dx = pending.clientX - (r.left + r.width / 2), dy = pending.clientY - (r.top + r.height / 2);
            const len = Math.hypot(dx, dy) || 1, k = Math.min(1, len / 200) * 5;
            p.style.transform = `translate(${(dx / len) * k}px, ${(dy / len) * k}px)`;
          });
          pupils._busy = false;
        });
      }
    }, { passive: true });
  }
})();
