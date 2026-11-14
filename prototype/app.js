/*
 * app.js — interface for the Viewpoint Assistant prototype.
 *
 * IMPLEMENTED here: the interaction loop (prompt -> interpretation -> comparison
 * -> sphere -> confirm -> result -> versions), the 360° sphere and Undo.
 * SIMULATED here: image generation and viewpoint detection (see "Simulated
 * components" below). No AI model or network request is used.
 */
(function () {
  'use strict';
  var V = window.Viewpoint;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function deg(n) { return Math.round(n) + '°'; }
  function angleText(a) { return V.plain(a.theta, a.phi) + ' (θ ' + deg(V.norm(a.theta)) + ', φ ' + deg(a.phi) + ')'; }

  // ------------------------------------------------------------------
  // Simulated components
  // ------------------------------------------------------------------
  var SIM = { textModelFollowsWords: false, defaultAngle: { theta: 25, phi: 8 } };

  // SIMULATED text-to-image model, text only. By default it ignores viewpoint
  // words and returns its default angle, which is the failure this project addresses.
  function simGenerateFromText(parsed) {
    if (!SIM.textModelFollowsWords) return { theta: SIM.defaultAngle.theta, phi: SIM.defaultAngle.phi };
    return {
      theta: parsed.theta === null ? SIM.defaultAngle.theta : parsed.theta,
      phi: parsed.phi === null ? SIM.defaultAngle.phi : parsed.phi
    };
  }
  // SIMULATED camera-controllable model: renders exactly the confirmed angle.
  function simGenerateFromCamera(theta, phi) { return { theta: theta, phi: phi }; }
  // SIMULATED viewpoint detector: reads the angle of the placeholder render.
  function simDetect(image) { return { theta: image.theta, phi: image.phi }; }

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  var state = {
    theta: 25, phi: 8,      // camera marker on the sphere
    moves: [],              // marker history for Undo
    candidates: [],         // suggested positions for an ambiguous request
    versions: [],           // every generated image
    stale: false,           // true while the image on screen belongs to an earlier request
    current: -1             // index of the version on screen
  };

  // ------------------------------------------------------------------
  // Placeholder 3D render (stands in for a generated image)
  // ------------------------------------------------------------------
  var CENTRE = [0, 1.05, 0.15], CAM_D = 12;
  var LIGHT = (function () { var l = [0.35, 0.8, 0.5], n = Math.hypot(l[0], l[1], l[2]); return [l[0] / n, l[1] / n, l[2] / n]; })();
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function basis(theta, phi) {
    var t = theta * Math.PI / 180, p = phi * Math.PI / 180;
    return {
      dir: [Math.cos(p) * Math.sin(t), Math.sin(p), Math.cos(p) * Math.cos(t)],
      right: [Math.cos(t), 0, -Math.sin(t)],
      up: [-Math.sin(p) * Math.sin(t), Math.cos(p), -Math.sin(p) * Math.cos(t)]
    };
  }
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function c(v) { return Math.max(0, Math.min(255, Math.round(v * k))); }
    return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')';
  }
  // The subject: a blocky cat facing +z. [x0,x1,y0,y1,z0,z1,colour]
  var BOXES = [
    { b: [-0.5, 0.5, 0.6, 1.4, -1.0, 0.8], c: '#e8a257' },                       // body
    { b: [-0.45, 0.45, 1.1, 1.9, 0.8, 1.6], c: '#f0b46d', head: true },          // head
    { b: [-0.45, -0.2, 1.9, 2.2, 1.05, 1.3], c: '#d98c3f' },                     // ears
    { b: [0.2, 0.45, 1.9, 2.2, 1.05, 1.3], c: '#d98c3f' },
    { b: [-0.5, -0.2, 0, 0.6, 0.45, 0.75], c: '#d98c3f' },                       // front legs
    { b: [0.2, 0.5, 0, 0.6, 0.45, 0.75], c: '#d98c3f' },
    { b: [-0.5, -0.2, 0, 0.6, -0.95, -0.65], c: '#d98c3f' },                     // back legs
    { b: [0.2, 0.5, 0, 0.6, -0.95, -0.65], c: '#d98c3f' },
    { b: [-0.1, 0.1, 1.2, 2.1, -1.2, -1.0], c: '#c97a2e' }                       // tail
  ];
  // Face details, drawn on the head's front face (z = 1.6) when it is visible.
  var DECALS = [
    { q: [[-0.3, 1.55], [-0.12, 1.55], [-0.12, 1.72], [-0.3, 1.72]], c: '#2b2b2b' },
    { q: [[0.12, 1.55], [0.3, 1.55], [0.3, 1.72], [0.12, 1.72]], c: '#2b2b2b' },
    { q: [[-0.07, 1.36], [0.07, 1.36], [0.07, 1.46], [-0.07, 1.46]], c: '#e57f8f' }
  ];
  function boxFaces(b) {
    var x0 = b[0], x1 = b[1], y0 = b[2], y1 = b[3], z0 = b[4], z1 = b[5];
    return [
      { n: [0, 0, 1], v: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], front: true },
      { n: [0, 0, -1], v: [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]] },
      { n: [1, 0, 0], v: [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]] },
      { n: [-1, 0, 0], v: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]] },
      { n: [0, 1, 0], v: [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]] },
      { n: [0, -1, 0], v: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]] }
    ];
  }
  function renderScene(canvas, theta, phi, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    var B = basis(theta, phi), base = Math.min(w, h) / 6.2;
    var cam = [CENTRE[0] + B.dir[0] * CAM_D, CENTRE[1] + B.dir[1] * CAM_D, CENTRE[2] + B.dir[2] * CAM_D];
    function proj(P) {
      var q = [P[0] - CENTRE[0], P[1] - CENTRE[1], P[2] - CENTRE[2]];
      var d = dot(q, B.dir), s = base * CAM_D / (CAM_D - d);
      return { x: w / 2 + dot(q, B.right) * s, y: h / 2 - dot(q, B.up) * s, d: d };
    }
    function poly(points, fill, stroke) {
      ctx.beginPath();
      points.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
    }
    function floor(alpha) {
      var S = 3.2, i;
      ctx.save(); ctx.globalAlpha = alpha; ctx.lineWidth = Math.max(1, w / 640);
      poly([[-S, 0, -S], [S, 0, -S], [S, 0, S], [-S, 0, S]].map(proj), phi > 0 ? '#e9edf2' : null, '#cfd6de');
      ctx.strokeStyle = '#d9dfe6';
      for (i = -3; i <= 3; i++) {
        var a = proj([i * 0.8 * 1.3, 0, -S]), b = proj([i * 0.8 * 1.3, 0, S]), c = proj([-S, 0, i * 0.8 * 1.3]), d = proj([S, 0, i * 0.8 * 1.3]);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
      }
      if (phi > 0) { // soft contact shadow
        var pts = [];
        for (i = 0; i < 28; i++) { var ang = i / 28 * Math.PI * 2; pts.push(proj([Math.cos(ang) * 0.95, 0, -0.1 + Math.sin(ang) * 1.6])); }
        poly(pts, 'rgba(40,50,70,0.10)');
      }
      ctx.restore();
    }

    var bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#fbfbfd'); bg.addColorStop(1, '#eef0f4');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.lineJoin = 'round';

    if (phi >= 0) floor(1);
    BOXES.map(function (box) {
      var b = box.b, centre = [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2];
      return { box: box, d: proj(centre).d };
    }).sort(function (a, b) { return a.d - b.d; }).forEach(function (item) {
      boxFaces(item.box.b).forEach(function (f) {
        var c = [(f.v[0][0] + f.v[2][0]) / 2, (f.v[0][1] + f.v[2][1]) / 2, (f.v[0][2] + f.v[2][2]) / 2];
        if (dot(f.n, [cam[0] - c[0], cam[1] - c[1], cam[2] - c[2]]) <= 0) return; // facing away
        var k = 0.62 + 0.38 * Math.max(0, dot(f.n, LIGHT));
        ctx.lineWidth = Math.max(0.6, w / 900);
        poly(f.v.map(proj), shade(item.box.c, k), shade(item.box.c, k * 0.82));
        if (item.box.head && f.front) {
          DECALS.forEach(function (dc) { poly(dc.q.map(function (p) { return proj([p[0], p[1], 1.6]); }), dc.c); });
        }
      });
    });
    if (phi < 0) floor(0.55); // seen from below: floor drawn as a see-through grid

    if (opts.watermark !== false) {
      var fs = Math.max(9, Math.round(w / 52));
      ctx.font = '600 ' + fs + 'px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = 'rgba(138,90,12,0.9)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(opts.short ? 'SIMULATED' : 'SIMULATED OUTPUT · placeholder render, not a generated image', fs * 0.8, h - fs * 0.8);
    }
  }
  function renderEmpty(canvas) {
    var ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#f7f8fb'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#9aa2ab'; ctx.font = '16px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('No image yet', w / 2, h / 2);
  }

  // ------------------------------------------------------------------
  // "What the assistant understood" panel
  // ------------------------------------------------------------------
  var BADGE_TEXT = { idle: 'waiting', match: 'match', mismatch: 'mismatch', ambiguous: 'unclear — asking you', none: 'no angle given — asking you' };
  function setUnderstood(u) {
    $('uAsked').innerHTML = u.asked || '—';
    $('uShows').innerHTML = u.shows || '—';
    var b = $('uBadge'); b.className = 'badge ' + u.kind; b.textContent = u.badge || BADGE_TEXT[u.kind];
    var m = $('uMsg'); m.className = 'msg ' + (u.kind === 'idle' ? '' : u.kind); m.innerHTML = u.msg;
    var box = $('uActions'); box.innerHTML = '';
    (u.actions || []).forEach(function (a) {
      var btn = document.createElement('button');
      btn.textContent = a.label; if (a.primary) btn.className = 'primary';
      btn.addEventListener('click', a.run); box.appendChild(btn);
    });
    $('sphereCard').classList.toggle('attention', !!u.needsSphere);
  }
  function askedFromParse(p) {
    var words = p.terms.map(function (t) { return '“' + esc(t) + '”'; }).join(', ');
    if (p.kind === 'clear') {
      var parts = [];
      if (p.phi !== null) parts.push('height φ ' + deg(p.phi));
      if (p.theta !== null) parts.push('direction θ ' + deg(p.theta));
      return esc(p.label) + ' <span class="why">from the words ' + words + ' → ' + parts.join(', ') +
        (p.theta === null && Math.abs(p.phi) < 80 ? '; direction left open' : '') + (p.phi === null ? '; height left open' : '') + '</span>';
    }
    if (p.kind === 'ambiguous') return 'an angle I cannot pin down <span class="why">' + esc(p.reason) + '</span>';
    return 'no camera angle <span class="why">I found no viewpoint word in the prompt.</span>';
  }

  // ------------------------------------------------------------------
  // Versions and result
  // ------------------------------------------------------------------
  function addVersion(image, source, prompt, askedHtml, cmp) {
    var detected = simDetect(image);
    state.versions.push({ n: state.versions.length + 1, theta: image.theta, phi: image.phi, detected: detected, source: source, prompt: prompt, asked: askedHtml, state: cmp.state });
    state.current = state.versions.length - 1; state.stale = false;
    renderResult(); renderThumbs();
    return state.versions[state.current];
  }
  function renderResult() {
    var v = state.versions[state.current], canvas = $('result');
    if (!v) { renderEmpty(canvas); $('detectedPill').hidden = true; $('matchPill').hidden = true; $('resultCaption').textContent = 'No image yet.'; return; }
    renderScene(canvas, v.theta, v.phi);
    canvas.style.opacity = state.stale ? '0.45' : '1';
    $('detectedPill').hidden = false; $('detectedPill').innerHTML = 'Detected: <b>' + esc(V.plain(v.detected.theta, v.detected.phi)) + '</b>';
    $('matchPill').hidden = false; $('matchPill').innerHTML = state.stale ? '<b>earlier image · nothing new generated yet</b>' : v.state === 'match' ? '<b style="color:var(--green)">✓ matches request</b>' : '<b style="color:var(--red)">✕ not the angle asked for</b>';
    $('resultCaption').textContent = (state.stale ? 'Still showing the earlier image. ' : '') + 'Version ' + v.n + ' of ' + state.versions.length + ' · generated from ' + (v.source === 'text' ? 'the text prompt only' : 'the angle confirmed on the sphere') +
      ' · θ ' + deg(V.norm(v.theta)) + ', φ ' + deg(v.phi);
  }
  function renderThumbs() {
    var box = $('thumbs'); box.innerHTML = '';
    state.versions.forEach(function (v, i) {
      var b = document.createElement('button');
      b.className = 'thumb' + (i === state.current ? ' current' : '');
      b.setAttribute('aria-label', 'Show version ' + v.n);
      var c = document.createElement('canvas'); c.width = 280; c.height = 210;
      renderScene(c, v.theta, v.phi, { short: true });
      b.appendChild(c);
      var t1 = document.createElement('div'); t1.className = 't1';
      t1.textContent = 'v' + v.n + ' · ' + (v.state === 'match' ? '✓ match' : '✕ mismatch');
      var t2 = document.createElement('div'); t2.className = 't2';
      t2.textContent = V.plain(v.theta, v.phi) + ' · ' + (v.source === 'text' ? 'from text' : 'from sphere');
      b.appendChild(t1); b.appendChild(t2);
      b.addEventListener('click', function () { showVersion(i); });
      box.appendChild(b);
    });
    if (!state.versions.length) box.innerHTML = '<span class="small">Each generation is kept here so you can compare angles and go back.</span>';
    box.scrollLeft = box.scrollWidth;
  }
  function showVersion(i) {
    var v = state.versions[i]; if (!v) return;
    state.current = i; state.candidates = []; state.stale = false;
    pushMove(); state.theta = V.norm(v.theta); state.phi = v.phi; drawSphere();
    renderResult(); renderThumbs();
    setUnderstood({
      kind: v.state, asked: v.asked, shows: esc(angleText(v.detected)) + ' <span class="tag sim">simulated detector</span>',
      msg: 'Showing <b>version ' + v.n + '</b> (' + esc(V.plain(v.theta, v.phi)) + '). The camera marker is back at this version’s angle; adjust it and confirm to make a new version from here.'
    });
  }

  // ------------------------------------------------------------------
  // The loop
  // ------------------------------------------------------------------
  function onGenerate() {
    var prompt = $('prompt').value.trim();
    if (!prompt) { setUnderstood({ kind: 'idle', badge: 'waiting for a prompt', msg: 'Please type a prompt first.' }); $('prompt').focus(); return; }
    var p = V.parsePrompt(prompt), asked = askedFromParse(p);
    state.candidates = [];

    if (p.kind === 'ambiguous') {
      state.candidates = p.candidates.slice(); drawSphere();
      state.stale = true; renderResult();
      setUnderstood({
        kind: 'ambiguous', asked: asked, shows: 'nothing yet <span class="why">I did not generate an image from an unclear angle.</span>', needsSphere: true,
        msg: '<b>I can’t map that phrase to one exact angle, so I have not generated anything.</b> ' + esc(p.reason) +
          ' Please point to the camera position on the sphere: tap one of the ' + p.candidates.length + ' amber suggestions or drag the marker, then press <b>Confirm angle → generate</b>.'
      });
      $('sphereHint').textContent = 'Amber rings are suggestions near the likely angle. Tap one, or drag the marker anywhere.';
      return;
    }
    if (p.kind === 'none') {
      drawSphere();
      state.stale = true; renderResult();
      setUnderstood({
        kind: 'none', asked: asked, shows: 'nothing yet <span class="why">I did not pick an angle for you.</span>', needsSphere: true,
        msg: '<b>Which camera angle do you want?</b> Your prompt has no viewpoint word, and I won’t guess one. Set the angle on the sphere (or add a word such as “top-down” or “side view” to the prompt), then press <b>Confirm angle → generate</b>.'
      });
      return;
    }

    // Clear request: generate from text, detect, compare.
    var image = simGenerateFromText(p);
    var cmp = V.compareViewpoints({ theta: p.theta, phi: p.phi }, simDetect(image));
    var v = addVersion(image, 'text', prompt, asked, cmp);
    var shows = esc(angleText(v.detected)) + ' <span class="tag sim">simulated detector</span>';
    if (cmp.state === 'match') {
      pushMove(); state.theta = V.norm(v.theta); state.phi = v.phi; drawSphere();
      setUnderstood({ kind: 'match', asked: asked, shows: shows, msg: '<b>The image matches the angle you asked for.</b> You can still fine-tune on the sphere and confirm to make another version.' });
      return;
    }
    // Mismatch: move the marker to the requested angle, but do not regenerate until confirmed.
    pushMove(); state.theta = cmp.proposal.theta; state.phi = cmp.proposal.phi; drawSphere();
    setUnderstood({
      kind: 'mismatch', asked: asked, shows: shows, needsSphere: true,
      msg: '<b>The image is not at the angle you asked for.</b> It shows ' + esc(V.plain(v.detected.theta, v.detected.phi)) + ', you asked for ' + esc(p.label) +
        '. I moved the camera marker to <b>' + esc(V.plain(cmp.proposal.theta, cmp.proposal.phi)) + '</b> on the sphere. Check it, adjust if you like, then confirm. Nothing is regenerated until you do.',
      actions: [
        { label: 'Confirm angle → regenerate', primary: true, run: onConfirm },
        { label: 'Keep this image', run: function () {
            setUnderstood({ kind: 'mismatch', asked: asked, shows: shows, msg: 'Kept version ' + v.n + ' as it is. The sphere is still available if you change your mind.' });
          } }
      ]
    });
  }

  function onConfirm() {
    var prompt = $('prompt').value.trim();
    if (!prompt) { setUnderstood({ kind: 'idle', badge: 'waiting for a prompt', msg: 'Please type a prompt first; the angle is added to it when you confirm.' }); $('prompt').focus(); return; }
    var t = Math.round(V.norm(state.theta)) % 360, p = Math.round(state.phi);
    var image = simGenerateFromCamera(t, p);
    var cmp = V.compareViewpoints({ theta: Math.abs(p) >= 80 ? null : t, phi: p }, simDetect(image));
    var asked = esc(V.plain(t, p)) + ' <span class="why">confirmed on the sphere → direction θ ' + deg(t) + ', height φ ' + deg(p) + '</span>';
    state.candidates = [];
    var v = addVersion(image, 'camera', prompt, asked, cmp);
    drawSphere();
    $('sphereHint').textContent = 'Drag the camera marker, use the sliders, or pick a shortcut. The subject sits at the centre, facing you.';
    setUnderstood({
      kind: cmp.state, asked: asked, shows: esc(angleText(v.detected)) + ' <span class="tag sim">simulated detector</span>',
      msg: '<b>Generated version ' + v.n + ' at the confirmed angle.</b> The camera parameters were sent with the prompt <span class="tag sim">simulated model</span>. Earlier versions stay in the list below; pick one to go back.'
    });
  }

  // ------------------------------------------------------------------
  // 360° sphere (from the Lab 3 prototype)
  // ------------------------------------------------------------------
  var sphere = $('sphere'), sctx = sphere.getContext('2d');
  var W = 460, H = 460, CX = 230, CY = 228, R = 168;
  function toXYZ(t, p) {
    var tr = t * Math.PI / 180, pr = p * Math.PI / 180;
    return { x: R * Math.cos(pr) * Math.sin(tr), y: R * Math.sin(pr), z: R * Math.cos(pr) * Math.cos(tr) };
  }
  function pushMove() { state.moves.push({ theta: state.theta, phi: state.phi }); if (state.moves.length > 40) state.moves.shift(); }
  function drawSphere() {
    var ctx = sctx;
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = '#c9d1d9'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#e6e9ee'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(CX, CY, R, R * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(CX, CY, R * 0.55, R, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(CX, CY, R * 0.15, R, 0, 0, Math.PI * 2); ctx.stroke();
    [45, -45].forEach(function (pr) {
      var y = R * Math.sin(pr * Math.PI / 180), rr = R * Math.cos(pr * Math.PI / 180);
      ctx.beginPath(); ctx.ellipse(CX, CY - y, rr, rr * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.fillStyle = '#b6bcc4';
    ctx.beginPath(); ctx.arc(CX, CY - R, 3, 0, Math.PI * 2); ctx.fill();
    ctx.font = '11px "Segoe UI", Arial'; ctx.fillStyle = '#8b939c';
    ctx.fillText('above (φ = +90°)', CX + 8, CY - R - 6);
    ctx.fillText('below (φ = −90°)', CX + 8, CY + R + 16);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '30px serif'; ctx.fillText('🐱', CX, CY);
    ctx.font = '11px "Segoe UI", Arial'; ctx.fillStyle = '#8b939c';
    ctx.fillText('subject', CX, CY + 26);

    state.candidates.forEach(function (c, i) {
      var q = toXYZ(c.theta, c.phi), sx = CX + q.x, sy = CY - q.y;
      ctx.strokeStyle = '#e0a93b'; ctx.setLineDash([4, 3]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(sx, sy, 15, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#8a5a0c'; ctx.font = '700 11px "Segoe UI", Arial';
      ctx.fillText(String(i + 1), sx + 21, sy - 12);
    });

    var p = toXYZ(state.theta, state.phi), sx = CX + p.x, sy = CY - p.y, front = p.z >= 0;
    ctx.strokeStyle = front ? '#d9ccf2' : '#ece6f7'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(sx, sy); ctx.stroke();
    var depth = (p.z + R) / (2 * R), rad = 8 + depth * 6;
    if (Math.hypot(sx - CX, sy - CY) < 26) {
      ctx.fillStyle = front ? '#6b46c1' : '#a08fc9'; ctx.font = '11px "Segoe UI", Arial';
      ctx.fillText(front ? 'camera in front of the subject' : 'camera behind the subject', CX, CY - 44);
    }
    ctx.fillStyle = front ? '#6b46c1' : '#c9b8e8';
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx, sy, rad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = Math.round(rad * 1.1) + 'px serif';
    ctx.fillText('📷', sx, sy);

    var t = Math.round(V.norm(state.theta)) % 360, ph = Math.round(state.phi);
    $('thetaVal').textContent = t + '°'; $('phiVal').textContent = ph + '°';
    $('plainAngle').textContent = V.plain(state.theta, state.phi);
    $('thetaSlide').value = t; $('phiSlide').value = ph;
    $('thetaSlideVal').textContent = t + '°'; $('phiSlideVal').textContent = ph + '°';
  }
  function setAngle(t, p) { pushMove(); state.theta = V.norm(t); state.phi = V.clampPhi(p); drawSphere(); }
  function undoMove() {
    if (!state.moves.length) { $('sphereHint').textContent = 'Nothing to undo.'; return; }
    var m = state.moves.pop(); state.theta = m.theta; state.phi = m.phi; drawSphere();
    $('sphereHint').textContent = 'Undone: camera back at ' + V.plain(state.theta, state.phi) + '.';
  }

  // Drag: horizontal = direction, vertical = height. A tap on a suggestion selects it.
  var dragging = false, lastX = 0, lastY = 0, travelled = 0;
  function pos(e) {
    var r = sphere.getBoundingClientRect(), pt = e.touches ? e.touches[0] : e;
    return { x: (pt.clientX - r.left) * W / r.width, y: (pt.clientY - r.top) * H / r.height };
  }
  function down(e) { dragging = true; travelled = 0; sphere.classList.add('dragging'); var q = pos(e); lastX = q.x; lastY = q.y; pushMove(); e.preventDefault(); }
  function move(e) {
    if (!dragging) return;
    var q = pos(e), dx = q.x - lastX, dy = q.y - lastY; lastX = q.x; lastY = q.y; travelled += Math.abs(dx) + Math.abs(dy);
    state.theta = V.norm(state.theta + dx * 0.45); state.phi = V.clampPhi(state.phi - dy * 0.45); drawSphere(); e.preventDefault();
  }
  function up() {
    if (!dragging) return;
    dragging = false; sphere.classList.remove('dragging');
    if (travelled < 5) {
      var hit = null;
      state.candidates.forEach(function (c) { var q = toXYZ(c.theta, c.phi); if (Math.hypot(CX + q.x - lastX, CY - q.y - lastY) <= 20) hit = c; });
      if (hit) {
        state.theta = V.norm(hit.theta); state.phi = hit.phi; drawSphere();
        $('sphereHint').textContent = 'Suggestion selected: ' + V.plain(hit.theta, hit.phi) + '. Confirm to generate, or keep adjusting.';
      } else { state.moves.pop(); } // a click that changed nothing should not cost an Undo step
    }
  }
  sphere.addEventListener('mousedown', down); window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
  sphere.addEventListener('touchstart', down, { passive: false }); window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', up);

  // Sliders: live update, one Undo step per completed drag.
  var slideStart = null;
  [$('thetaSlide'), $('phiSlide')].forEach(function (s) {
    s.addEventListener('pointerdown', function () { slideStart = { theta: state.theta, phi: state.phi }; });
    s.addEventListener('keydown', function () { if (!slideStart) slideStart = { theta: state.theta, phi: state.phi }; });
    s.addEventListener('input', function () {
      state.theta = V.norm(parseFloat($('thetaSlide').value)); state.phi = V.clampPhi(parseFloat($('phiSlide').value)); drawSphere();
    });
    s.addEventListener('change', function () { if (slideStart) { state.moves.push(slideStart); slideStart = null; } });
  });

  // ------------------------------------------------------------------
  // Wiring
  // ------------------------------------------------------------------
  $('btnGenerate').addEventListener('click', onGenerate);
  $('btnConfirm').addEventListener('click', onConfirm);
  $('btnUndo').addEventListener('click', undoMove);
  $('prompt').addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onGenerate(); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-example]'), function (b) {
    b.addEventListener('click', function () { $('prompt').value = b.getAttribute('data-example'); onGenerate(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('#presets button'), function (b) {
    b.addEventListener('click', function () {
      setAngle(parseFloat(b.getAttribute('data-t')), parseFloat(b.getAttribute('data-p')));
      $('sphereHint').textContent = 'Shortcut: ' + V.plain(state.theta, state.phi) + '. Confirm to generate, or fine-tune first.';
    });
  });
  $('simMode').addEventListener('change', function () { SIM.textModelFollowsWords = this.value === 'follow'; });

  renderEmpty($('result'));
  drawSphere();
})();
