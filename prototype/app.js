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
  var lightTheta = 315, lightPhi = 45, previewZoom = 1, zoomAnimation = 0, lightHandle = null, previewTarget = 'camera', nightMode = false, userZoom = 1;
  var LIGHT = (function () { var l = [-0.5, Math.SQRT1_2, 0.5], n = Math.hypot(l[0], l[1], l[2]); return [l[0] / n, l[1] / n, l[2] / n]; })();
  function sphericalPoint(theta, phi, radius) {
    var t=theta*Math.PI/180, p=phi*Math.PI/180;
    return {x:radius*Math.cos(p)*Math.sin(t), y:radius*Math.sin(p), z:radius*Math.cos(p)*Math.cos(t)};
  }
  function globeLineColor(major, family, coordinate) {
    var strong=coordinate%30===0;
    return major ? '#9370db' : family==='longitude'
      ? (strong ? '#68a4e8' : '#a1c7f0')
      : (strong ? '#e995bd' : '#f2bdd6');
  }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function basis(theta, phi) {
    var t = theta * Math.PI / 180, p = phi * Math.PI / 180;
    return {
      dir: [Math.cos(p) * Math.sin(t), Math.sin(p), Math.cos(p) * Math.cos(t)],
      right: [Math.cos(t), 0, -Math.sin(t)],
      up: [-Math.sin(p) * Math.sin(t), Math.cos(p), -Math.sin(p) * Math.cos(t)]
    };
  }
  // Continuous trackball rotations. Angle readouts are derived from the frame,
  // never used as a constrained accumulator during a drag.
  var cameraFrameCache=null, globeFrameCache=null;
  function copyFrame(f) { return {right:f.right.slice(),up:f.up.slice(),dir:f.dir.slice()}; }
  function anglesOf(vector, fallbackTheta) {
    var n=Math.hypot(vector[0],vector[1],vector[2]);
    return {theta:Math.hypot(vector[0],vector[2])<1e-9 ? fallbackTheta : V.norm(Math.atan2(vector[0],vector[2])*180/Math.PI),
      phi:Math.asin(Math.max(-1,Math.min(1,vector[1]/n)))*180/Math.PI};
  }
  function cachedFrame(cache,t,p) {
    return cache && Math.abs(cache.theta-t)<1e-7 && Math.abs(cache.phi-p)<1e-7 ? cache.frame : basis(t,p);
  }
  function cameraFrame() { return cachedFrame(cameraFrameCache,state.theta,state.phi); }
  function globeFrame() { return cachedFrame(globeFrameCache,viewYaw,viewPitch); }
  function rotationFor(frame,dx,dy,sign) {
    var length=Math.hypot(dx,dy); if(length<1e-10)return [0,0,0,1];
    var angle=length*0.4*Math.PI/180, scale=Math.sin(angle/2)*sign/length;
    return [(frame.up[0]*dx+frame.right[0]*dy)*scale,
      (frame.up[1]*dx+frame.right[1]*dy)*scale,
      (frame.up[2]*dx+frame.right[2]*dy)*scale,Math.cos(angle/2)];
  }
  function rotateVector(v,q) {
    var x=q[0],y=q[1],z=q[2],w=q[3];
    var tx=2*(y*v[2]-z*v[1]),ty=2*(z*v[0]-x*v[2]),tz=2*(x*v[1]-y*v[0]);
    return [v[0]+w*tx+y*tz-z*ty,v[1]+w*ty+z*tx-x*tz,v[2]+w*tz+x*ty-y*tx];
  }
  function rotateFrame(frame,q) {
    return {right:rotateVector(frame.right,q),up:rotateVector(frame.up,q),dir:rotateVector(frame.dir,q)};
  }
  function saveCameraFrame(frame) {
    var a=anglesOf(frame.dir,state.theta);state.theta=a.theta;state.phi=a.phi;
    cameraFrameCache={theta:a.theta,phi:a.phi,frame:frame};
  }
  function dragGlobe(dx,dy) {
    var frame=globeFrame(), next=rotateFrame(frame,rotationFor(frame,dx,dy,-1));
    var a=anglesOf(next.dir,viewYaw);viewYaw=a.theta;viewPitch=a.phi;
    globeFrameCache={theta:a.theta,phi:a.phi,frame:next};
  }
  function dragLight(frame,dx,dy) {
    var vector=rotateVector(LIGHT,rotationFor(frame,dx,dy,1)),a=anglesOf(vector,lightTheta);
    setLight(a.theta,a.phi);
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
    var B = opts.frame || (opts.preview ? cameraFrame() : basis(theta, phi)), base = Math.min(w, h) / (opts.preview ? 4.5 / (previewZoom * userZoom) : 6.2);
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
      poly([[-S, 0, -S], [S, 0, -S], [S, 0, S], [-S, 0, S]].map(proj), phi > 0 ? (nightMode ? '#171b2a' : '#e9edf2') : null, nightMode ? '#343b53' : '#cfd6de');
      ctx.strokeStyle = nightMode ? '#30394e' : '#d9dfe6';
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

    function lightSphereGrid(rearPass) {
      if (!opts.preview || !(interactionMode === 'light' || (interactionMode === 'auto' && previewTarget === 'light'))) return;
      ctx.save();
      function line(points, family, angle) {
        var major = family === 'latitude' ? angle === 0 : angle%90 === 0;
        ctx.strokeStyle=globeLineColor(major,family,angle);
        ctx.lineWidth=major ? 1.4 : 0.75;
        ctx.globalAlpha=rearPass ? 0.28 : 0.62;
        ctx.setLineDash(rearPass ? [3,5] : []);
        for(var i=1;i<points.length;i++) {
          var a=points[i-1], b=points[i];
          if (((a.depth+b.depth)<0) !== rearPass) continue;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
      function shellPoint(t,p) {
        var q=sphericalPoint(t,p,3.8), v=proj([CENTRE[0]+q.x,CENTRE[1]+q.y,CENTRE[2]+q.z]);
        // Perspective silhouette: normal dotted with the vector towards the camera.
        v.depth=CAM_D*(q.x*B.dir[0]+q.y*B.dir[1]+q.z*B.dir[2])-3.8*3.8;
        return v;
      }
      for(var lat=-75;lat<=75;lat+=15) {
        var ring=[];for(var t=0;t<=360;t+=3)ring.push(shellPoint(t,lat));line(ring,'latitude',lat);
      }
      for(var lon=0;lon<360;lon+=15) {
        var ring=[];for(var p=-90;p<=90;p+=3)ring.push(shellPoint(lon,p));line(ring,'longitude',lon);
      }
      ctx.restore();
    }

    var bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, nightMode ? '#0b0e19' : '#fbfbfd'); bg.addColorStop(1, nightMode ? '#20263a' : '#eef0f4');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.lineJoin = 'round';

    if (phi >= 0) floor(1);
    // Visible light haze supplements surface illumination, making the lamp readable.
    if (opts.preview && (interactionMode === 'light' || interactionMode === 'auto')) {
      var glowSource=proj([CENTRE[0]+LIGHT[0]*3.8,CENTRE[1]+LIGHT[1]*3.8,CENTRE[2]+LIGHT[2]*3.8]);
      var gx=Math.max(38,Math.min(w-38,glowSource.x)), gy=Math.max(38,Math.min(h-64,glowSource.y));
      ctx.save();
      var beam=ctx.createLinearGradient(gx,gy,w/2,h/2);
      beam.addColorStop(0,nightMode ? 'rgba(255,223,151,.30)' : 'rgba(255,207,111,.18)');
      beam.addColorStop(1,'rgba(255,223,151,0)');
      var vx=w/2-gx, vy=h/2-gy, length=Math.hypot(vx,vy)||1, sideX=-vy/length, sideY=vx/length;
      ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(gx+sideX*7,gy+sideY*7);ctx.lineTo(w/2+sideX*100,h/2+sideY*100);ctx.lineTo(w/2-sideX*100,h/2-sideY*100);ctx.lineTo(gx-sideX*7,gy-sideY*7);ctx.closePath();ctx.fill();
      var haze=ctx.createRadialGradient(gx,gy,0,gx,gy,nightMode ? 125 : 85);
      haze.addColorStop(0,nightMode ? 'rgba(255,230,166,.55)' : 'rgba(255,216,138,.35)');haze.addColorStop(0.3,'rgba(255,217,143,.14)');haze.addColorStop(1,'rgba(255,217,143,0)');
      ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);ctx.restore();
    }
    lightSphereGrid(true);
    BOXES.map(function (box) {
      var b = box.b, centre = [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2];
      return { box: box, d: proj(centre).d };
    }).sort(function (a, b) { return a.d - b.d; }).forEach(function (item) {
      boxFaces(item.box.b).forEach(function (f) {
        var c = [(f.v[0][0] + f.v[2][0]) / 2, (f.v[0][1] + f.v[2][1]) / 2, (f.v[0][2] + f.v[2][2]) / 2];
        if (dot(f.n, [cam[0] - c[0], cam[1] - c[1], cam[2] - c[2]]) <= 0) return; // facing away
        var lighting = opts.light || LIGHT;
        var lv = [CENTRE[0]+lighting[0]*3.8-c[0], CENTRE[1]+lighting[1]*3.8-c[1], CENTRE[2]+lighting[2]*3.8-c[2]];
        var ln = Math.hypot(lv[0],lv[1],lv[2]);
        var k = (nightMode ? 0.1 : 0.36) + (nightMode ? 1.05 : 0.64) * Math.max(0, dot(f.n, lv)/ln);
        ctx.lineWidth = Math.max(0.6, w / 900);
        poly(f.v.map(proj), shade(item.box.c, k), shade(item.box.c, k * 0.82));
        if (item.box.head && f.front) {
          DECALS.forEach(function (dc) { poly(dc.q.map(function (p) { return proj([p[0], p[1], 1.6]); }), dc.c); });
        }
      });
    });
    if (phi < 0) floor(0.55); // seen from below: floor drawn as a see-through grid

    lightSphereGrid(false);
    if (opts.preview && (interactionMode === 'light' || interactionMode === 'auto')) {
      var lightPoint = proj([CENTRE[0]+LIGHT[0]*3.8, CENTRE[1]+LIGHT[1]*3.8, CENTRE[2]+LIGHT[2]*3.8]);
      // Keep the light reachable at the frame edge when the cat is zoomed in.
      lightPoint.x = Math.max(38,Math.min(w-38,lightPoint.x));
      lightPoint.y = Math.max(38,Math.min(h-64,lightPoint.y));
      lightHandle = {x:lightPoint.x, y:lightPoint.y};
      ctx.save();
      ctx.strokeStyle = '#c5b3dc'; ctx.lineWidth = 1; ctx.setLineDash([4,5]);
      ctx.beginPath(); ctx.moveTo(w/2,h/2); ctx.lineTo(lightPoint.x,lightPoint.y); ctx.stroke(); ctx.setLineDash([]);
      var glow = ctx.createRadialGradient(lightPoint.x,lightPoint.y,2,lightPoint.x,lightPoint.y,30);
      glow.addColorStop(0,'rgba(255,225,142,.85)'); glow.addColorStop(1,'rgba(255,225,142,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(lightPoint.x,lightPoint.y,30,0,Math.PI*2);ctx.fill();
      ctx.shadowColor='#ffd477';ctx.shadowBlur=nightMode ? 35 : 18;
      ctx.fillStyle='#fffff1';ctx.strokeStyle='#ffe2a0';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(lightPoint.x,lightPoint.y,11,0,Math.PI*2);ctx.fill();ctx.stroke();
      for(var ray=0;ray<8;ray++) {var a=ray*Math.PI/4;ctx.beginPath();ctx.moveTo(lightPoint.x+Math.cos(a)*16,lightPoint.y+Math.sin(a)*16);ctx.lineTo(lightPoint.x+Math.cos(a)*22,lightPoint.y+Math.sin(a)*22);ctx.stroke();}
      ctx.shadowBlur=0;
      ctx.font='14px "Segoe UI", Arial';ctx.fillStyle=nightMode ? '#ffe5ae' : '#765722';ctx.textAlign='center';
      ctx.fillText('Point light · drag on sphere',lightPoint.x,lightPoint.y+42);
      ctx.restore();
    } else if(opts.preview) lightHandle=null;

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
    state.versions.push({ n: state.versions.length + 1, theta: image.theta, phi: image.phi, detected: detected, source: source, prompt: prompt, asked: askedHtml, state: cmp.state, light: LIGHT.slice(), lightTheta: lightTheta, lightPhi: lightPhi, frame: copyFrame(source === 'camera' ? cameraFrame() : basis(image.theta,image.phi)) });
    state.current = state.versions.length - 1; state.stale = false;
    renderResult(); renderThumbs();
    return state.versions[state.current];
  }
  function renderResult() {
    var v = state.versions[state.current], canvas = $('result');
    if (!v) { renderEmpty(canvas); $('detectedPill').hidden = true; $('matchPill').hidden = true; $('resultCaption').textContent = 'No image yet.'; return; }
    renderScene(canvas, v.theta, v.phi, {light: v.light, frame: v.frame});
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
      renderScene(c, v.theta, v.phi, { short: true, light: v.light, frame: v.frame });
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
    if (v.light) { LIGHT = v.light.slice(); lightTheta = v.lightTheta; lightPhi = v.lightPhi; }
    pushMove(); state.theta = V.norm(v.theta); state.phi = v.phi;
    if(v.frame)cameraFrameCache={theta:state.theta,phi:state.phi,frame:copyFrame(v.frame)};
    drawSphere();
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
          ' Please choose one of the ' + p.candidates.length + ' numbered suggestions below the preview (they are also marked on the sphere), or drag the cat in the preview, then press <b>Confirm angle → generate</b>.'
      });
      $('sphereHint').textContent = 'Choose Suggestion 1, 2 or 3 below the preview, or drag the cat in the preview. Then confirm the angle.';
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
      pushMove(); state.theta = V.norm(v.theta); state.phi = v.phi;
    if(v.frame)cameraFrameCache={theta:state.theta,phi:state.phi,frame:copyFrame(v.frame)};
    drawSphere();
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
  // Viewing rotation is independent of the chosen camera angle.
  var sphereMode = 'rotate', interactionMode = 'auto', viewYaw = 0, viewPitch = 0;
  function toXYZ(t, p) {
    var q=sphericalPoint(t,p,R),vector=[q.x,q.y,q.z],frame=globeFrame();
    return {x:dot(vector,frame.right),y:dot(vector,frame.up),z:dot(vector,frame.dir)};
  }
  function pickSphere(q) {
    var x=(q.x-CX)/R,y=(CY-q.y)/R,d=x*x+y*y;
    if(d>1) { var length=Math.sqrt(d);x/=length;y/=length;d=1; }
    var z=Math.sqrt(Math.max(0,1-d)),frame=globeFrame();
    var vector=[0,1,2].map(function(i){return x*frame.right[i]+y*frame.up[i]+z*frame.dir[i];});
    var a=anglesOf(vector,state.theta);
    if(sphereMode==='light')setLight(a.theta,a.phi);
    else {state.theta=a.theta;state.phi=a.phi;cameraFrameCache=null;}
    drawSphere();
  }
  // Render the globe in depth passes: rear grid, central subject, front grid.
  function gridLine(points, rearPass, major, family, coordinate) {
    // Separate direction families by hue; alternate depth of colour every 30°.
    var strong = coordinate % 30 === 0;
    sctx.strokeStyle = globeLineColor(major, family, coordinate);
    sctx.globalAlpha = rearPass ? 0.3 : 0.88;
    sctx.lineWidth = major ? 1.9 : strong ? 1.15 : 0.8;
    sctx.setLineDash(rearPass ? [2, 3] : []);
    for (var i = 1; i < points.length; i++) {
      var a = points[i-1], b = points[i], back = (a.z + b.z) < 0;
      if (back !== rearPass) continue;
      sctx.beginPath(); sctx.moveTo(CX+a.x, CY-a.y); sctx.lineTo(CX+b.x, CY-b.y); sctx.stroke();
    }
    sctx.setLineDash([]);
    sctx.globalAlpha = 1;
  }
  function drawGlobeGrid(rearPass) {
    for (var latitude = -75; latitude <= 75; latitude += 15) {
      var pts = [];
      for (var t = 0; t <= 360; t += 3) pts.push(toXYZ(t, latitude));
      gridLine(pts, rearPass, latitude === 0, 'latitude', latitude);
    }
    for (var longitude = 0; longitude < 360; longitude += 15) {
      var pts = [];
      for (var p = -90; p <= 90; p += 3) pts.push(toXYZ(longitude, p));
      gridLine(pts, rearPass, longitude % 90 === 0, 'longitude', longitude);
    }
  }
  // Point light in subject/world coordinates, projected through the same view as the globe.
  function setLight(theta, phi) {
    lightTheta = V.norm(theta); lightPhi = V.clampPhi(phi);
    var t = lightTheta*Math.PI/180, p = lightPhi*Math.PI/180;
    LIGHT = [Math.cos(p)*Math.sin(t), Math.sin(p), Math.cos(p)*Math.cos(t)];
  }
  function lightPosition() {
    var q = toXYZ(lightTheta, lightPhi);
    return { x: q.x * 2.4, y: q.y * 2.4, z: q.z * 2.4 };
  }
  function shadeSphere(ctx) {
    var size = R * 2 + 2, image = ctx.createImageData(size, size), light = lightPosition();
    for (var j = 0; j < size; j++) for (var i = 0; i < size; i++) {
      var x = i - R - 1, y = R + 1 - j, r2 = x*x + y*y;
      if (r2 > R*R) continue;
      var z = Math.sqrt(R*R-r2), lx = light.x-x, ly = light.y-y, lz = light.z-z;
      var distance = Math.hypot(lx,ly,lz); lx/=distance; ly/=distance; lz/=distance;
      var diffuse = Math.max(0, (x*lx+y*ly+z*lz)/R);
      var hx = lx, hy = ly, hz = lz+1, hl = Math.hypot(hx,hy,hz);
      var specular = diffuse > 0 ? Math.pow(Math.max(0,(x*hx+y*hy+z*hz)/(R*hl)),40)*22 : 0;
      var brightness = 0.63 + 0.37*diffuse, k = (j*size+i)*4;
      image.data[k] = Math.min(255,244*brightness+specular);
      image.data[k+1] = Math.min(255,242*brightness+specular);
      image.data[k+2] = Math.min(255,251*brightness+specular);
      image.data[k+3] = 255;
    }
    ctx.putImageData(image, CX-R-1, CY-R-1);
  }
  function pushMove() { state.moves.push({ theta: state.theta, phi: state.phi, frame: copyFrame(cameraFrame()) }); if (state.moves.length > 40) state.moves.shift(); }
  function renderCandidateChoices() {
    var choices=$('candidateChoices'); choices.innerHTML='';
    choices.hidden = state.candidates.length === 0;
    $('candidateLegend').hidden = choices.hidden;
    state.candidates.forEach(function(c,i) {
      var button=document.createElement('button');button.type='button';
      button.textContent='Suggestion '+(i+1)+' · θ '+Math.round(c.theta)+'°, φ '+Math.round(c.phi)+'°';
      button.setAttribute('aria-pressed',String(V.azimuthDiff(state.theta,c.theta)<0.1 && Math.abs(state.phi-c.phi)<0.1));
      button.addEventListener('click',function() {
        viewYaw=V.norm(c.theta-30); viewPitch=-c.phi*0.5;
        setAngle(c.theta,c.phi);
        $('sphereHint').textContent='Suggestion selected: '+V.plain(c.theta,c.phi)+'. Confirm to generate, or keep adjusting.';
      });
      choices.appendChild(button);
    });
  }
  function drawSphere() {
    var ctx = sctx;
    ctx.clearRect(0, 0, W, H);
    shadeSphere(ctx);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    drawGlobeGrid(true);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '30px serif'; ctx.fillText('🐱', CX, CY);
    drawGlobeGrid(false);
    ctx.strokeStyle = '#c6b9e2'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '11px "Segoe UI", Arial'; ctx.textAlign = 'center';
    [[0, 0, 'FRONT'], [180, 0, 'BACK'], [90, 0, 'RIGHT'], [270, 0, 'LEFT'], [0, 90, 'ABOVE']].forEach(function (label) {
      var q = toXYZ(label[0], label[1]);
      if (q.z >= -0.01) { ctx.fillStyle = '#536174'; ctx.fillText(label[2], CX+q.x, CY-q.y-12); }
    });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '11px "Segoe UI", Arial'; ctx.fillStyle = '#8b939c';
    ctx.fillText('subject', CX, CY + R + 22);

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
      ctx.fillText('selected camera: ' + V.plain(state.theta, state.phi), CX, CY - 44);
    }
    ctx.fillStyle = front ? '#6b46c1' : '#c9b8e8';
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx, sy, rad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = Math.round(rad * 1.1) + 'px serif';
    ctx.fillText('📷', sx, sy);

    // The light marker shares the same spherical coordinates as the actual point light.
    var lp = toXYZ(lightTheta, lightPhi);
    var lightX = CX + lp.x, lightY = CY - lp.y;
    ctx.save();
    ctx.strokeStyle = '#b89450'; ctx.fillStyle = '#fff1c7'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(lightX, lightY, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (var ray = 0; ray < 8; ray++) {
      var a = ray * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(lightX + Math.cos(a)*12, lightY + Math.sin(a)*12);
      ctx.lineTo(lightX + Math.cos(a)*16, lightY + Math.sin(a)*16); ctx.stroke();
    }
    ctx.fillStyle = '#806c49'; ctx.font = '11px "Segoe UI", Arial';
    ctx.textAlign = lightX > CX ? 'right' : 'left';
    ctx.fillText('Light', lightX + (lightX > CX ? -23 : 23), lightY + 4);

    ctx.restore();
    var t = Math.round(V.norm(state.theta)) % 360, ph = Math.round(state.phi);
    $('thetaVal').textContent = t + '°'; $('phiVal').textContent = ph + '°';
    $('plainAngle').textContent = V.plain(state.theta, state.phi);
    $('thetaSlide').value = t; $('phiSlide').value = ph;
    $('thetaSlideVal').textContent = t + '°'; $('phiSlideVal').textContent = ph + '°';
    $('lightTheta').value = Math.round(lightTheta); $('lightPhi').value = Math.round(lightPhi);
    $('lightReadout').textContent = 'θ ' + Math.round(lightTheta) + '°, φ ' + Math.round(lightPhi) + '°';
    renderScene($('cameraPreview'), state.theta, state.phi, {preview: true, watermark: false});
    renderCandidateChoices();
  }
  function setAngle(t, p) { pushMove(); state.theta = V.norm(t); state.phi = V.clampPhi(p); drawSphere(); }
  function undoMove() {
    if (!state.moves.length) { $('sphereHint').textContent = 'Nothing to undo.'; return; }
    var m = state.moves.pop(); state.theta = m.theta; state.phi = m.phi;
    cameraFrameCache=m.frame ? {theta:m.theta,phi:m.phi,frame:copyFrame(m.frame)} : null;drawSphere();
    $('sphereHint').textContent = 'Undone: camera back at ' + V.plain(state.theta, state.phi) + '.';
  }

  // Drag: horizontal = direction, vertical = height. A tap on a suggestion selects it.
  var dragging = false, lastX = 0, lastY = 0, travelled = 0;
  var dragSurface = null, dragPointerId = null, mainSurface = 'preview';
  function pos(e) {
    var r = sphere.getBoundingClientRect(), pt = e.touches ? e.touches[0] : e;
    return { x: (pt.clientX - r.left) * W / r.width, y: (pt.clientY - r.top) * H / r.height };
  }
  function down(e) {
    var q = pos(e), camera = toXYZ(state.theta, state.phi);
    var lightPoint = toXYZ(lightTheta, lightPhi);
    sphereMode = interactionMode === 'auto'
      ? (Math.hypot(q.x-CX-lightPoint.x,q.y-CY+lightPoint.y) < 20 ? 'light' : Math.hypot(q.x-CX-camera.x, q.y-CY+camera.y) < 24 ? 'camera' : 'rotate')
      : interactionMode;
    dragging = true; travelled = 0; sphere.classList.add('dragging');
    lastX = q.x; lastY = q.y;
    if (sphereMode === 'camera') pushMove();
    e.preventDefault();
  }
  function move(e) {
    if (!dragging) return;
    var q = pos(e), dx = q.x - lastX, dy = q.y - lastY; lastX = q.x; lastY = q.y; travelled += Math.abs(dx) + Math.abs(dy);
    if (sphereMode === 'rotate') dragGlobe(dx,dy);
    else if(sphereMode === 'light') dragLight(globeFrame(),dx,dy);
    else saveCameraFrame(rotateFrame(cameraFrame(),rotationFor(globeFrame(),dx,dy,1)));
    drawSphere();
    e.preventDefault();
  }
  function up() {
    if (!dragging) return;
    dragging = false; sphere.classList.remove('dragging');
    if (sphereMode === 'rotate' && (interactionMode === 'rotate' || travelled >= 5)) return;
    if (sphereMode === 'light') { if (travelled < 5) pickSphere({x:lastX,y:lastY}); return; }
    if (travelled < 5) {
      if (sphereMode === 'rotate') pushMove();
      var hit = null;
      state.candidates.forEach(function (c) { var q = toXYZ(c.theta, c.phi); if (q.z >= 0 && Math.hypot(CX + q.x - lastX, CY - q.y - lastY) <= 34) hit = c; });
      if (hit) {
        state.theta = V.norm(hit.theta); state.phi = hit.phi; drawSphere();
        $('sphereHint').textContent = 'Suggestion selected: ' + V.plain(hit.theta, hit.phi) + '. Confirm to generate, or keep adjusting.';
      } else { pickSphere({ x: lastX, y: lastY }); }
    }
  }
  // Pointer capture keeps a gesture on its starting canvas, even over the inset.
  sphere.addEventListener('pointerdown', function (e) {
    if (mainSurface !== 'sphere' || dragSurface || (e.button !== undefined && e.button !== 0)) return;
    dragSurface = 'sphere'; dragPointerId = e.pointerId;
    sphere.setPointerCapture(e.pointerId);
    down(e); e.stopPropagation();
  });
  sphere.addEventListener('pointermove', function (e) {
    if (dragSurface !== 'sphere' || e.pointerId !== dragPointerId) return;
    move(e); e.stopPropagation();
  });
  sphere.addEventListener('pointerup', function (e) {
    if (dragSurface !== 'sphere' || e.pointerId !== dragPointerId) return;
    up(); dragSurface = null; dragPointerId = null; e.stopPropagation();
  });
  function cancelSpherePointer(e) {
    if (dragSurface !== 'sphere' || e.pointerId !== dragPointerId) return;
    dragging = false; sphere.classList.remove('dragging');
    dragSurface = null; dragPointerId = null;
  }
  sphere.addEventListener('pointercancel', cancelSpherePointer);
  sphere.addEventListener('lostpointercapture', cancelSpherePointer);

  function animatePreviewZoom(target) {
    if (zoomAnimation) cancelAnimationFrame(zoomAnimation);
    var start = performance.now(), from = previewZoom;
    function step(now) {
      var progress = Math.min(1, (now-start)/260), eased = 1-Math.pow(1-progress,3);
      previewZoom = from+(target-from)*eased;
      renderScene($('cameraPreview'),state.theta,state.phi,{preview:true,watermark:false});
      zoomAnimation = progress < 1 ? requestAnimationFrame(step) : 0;
    }
    zoomAnimation=requestAnimationFrame(step);
  }
  function setInteractionMode(mode) {
    // Explicit mode selection cancels any in-progress gesture.
    dragging = false; previewDrag = null; dragSurface = null; dragPointerId = null;
    sphere.classList.remove('dragging');
    interactionMode = mode;
    previewTarget = mode === 'light' ? 'light' : 'camera';
    $('previewModeLabel').textContent = mode === 'light' ? 'Drag the light around the sphere' : 'Live camera preview';
    $('lightControls').open = mode === 'light';
    animatePreviewZoom(mode === 'light' ? 0.38 : 1);
    [['btnAutoMode', 'auto'], ['btnRotateMode', 'rotate'], ['btnCameraMode', 'camera'], ['btnLightMode', 'light']].forEach(function (entry) {
      $(entry[0]).setAttribute('aria-pressed', String(mode === entry[1]));
    });
    $('sphereHint').textContent = mode === 'auto'
      ? 'Drag the globe to rotate it; drag the camera icon to adjust its position. Click the globe to select a point. Arrow keys rotate the view.'
      : mode === 'light' ? 'Drag the point light in the large preview, drag its marker in the inset, or use the light sliders for full 360° placement.' : mode === 'rotate'
        ? 'Rotate mode: dragging only rotates the globe. Your selected camera angle stays fixed.'
        : 'Camera mode: click or drag on the visible globe to adjust the camera. The globe view stays fixed.';
  }
  $('btnNightMode').addEventListener('click', function () {
    nightMode = !nightMode;
    this.setAttribute('aria-pressed', String(nightMode));
    this.setAttribute('aria-label', nightMode ? 'Switch to day mode' : 'Switch to night mode');
    this.innerHTML = nightMode
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4L19 5"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.5 13.2A8.5 8.5 0 0 1 10.8 3.5a8.5 8.5 0 1 0 9.7 9.7Z"/></svg>';
    drawSphere(); renderResult(); renderThumbs();
  });
  $('btnAutoMode').addEventListener('click', function () { setInteractionMode('auto'); });
  $('btnRotateMode').addEventListener('click', function () { setInteractionMode('rotate'); });
  $('btnCameraMode').addEventListener('click', function () { setInteractionMode('camera'); });
  $('btnLightMode').addEventListener('click', function () { setInteractionMode('light'); });
  [$('lightTheta'), $('lightPhi')].forEach(function (slider) {
    slider.addEventListener('input', function () { setLight(Number($('lightTheta').value), Number($('lightPhi').value)); drawSphere(); });
  });
  $('btnResetSphere').addEventListener('click', function () {
    // Reset the displayed main view, including its continuous rotation frame.
    var captured = dragSurface === 'sphere' ? sphere : $('cameraPreview');
    var pointerId = dragPointerId;
    dragging = false; previewDrag = null; dragSurface = null; dragPointerId = null;
    sphere.classList.remove('dragging');
    if (pointerId !== null && captured.hasPointerCapture(pointerId)) captured.releasePointerCapture(pointerId);
    if (zoomAnimation) { cancelAnimationFrame(zoomAnimation); zoomAnimation = 0; }
    if (mainSurface === 'preview') {
      pushMove();
      state.theta = 25; state.phi = 8; cameraFrameCache = null;
      userZoom = 1;
      previewZoom = interactionMode === 'light' || (interactionMode === 'auto' && previewTarget === 'light') ? 0.38 : 1;
      $('zoomLevel').textContent = '100%';
      $('btnZoomIn').disabled = false; $('btnZoomOut').disabled = false;
      $('sphereHint').textContent = 'Camera view reset. Light position is unchanged.';
    } else {
      $('sphereHint').textContent = 'Sphere view reset. Camera and light positions are unchanged.';
    }
    viewYaw = 0; viewPitch = 0; globeFrameCache = null;
    drawSphere();
  });
  sphere.addEventListener('keydown', function (e) {
    if (mainSurface !== 'sphere') return;
    var delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];
    if (!delta) return;
    if(interactionMode==='light')dragLight(globeFrame(),delta[0],delta[1]);
    else if(interactionMode==='camera') {
      pushMove();saveCameraFrame(rotateFrame(cameraFrame(),rotationFor(globeFrame(),delta[0],delta[1],1)));
    } else dragGlobe(delta[0],delta[1]);
    e.preventDefault();drawSphere();
  });

  function setPreviewZoom(value) {
    userZoom = Math.max(0.4, Math.min(3, value));
    $('zoomLevel').textContent = Math.round(userZoom * 100) + '%';
    $('btnZoomIn').disabled = userZoom >= 3;
    $('btnZoomOut').disabled = userZoom <= 0.4;
    renderScene($('cameraPreview'), state.theta, state.phi, {preview:true, watermark:false});
  }
  $('btnZoomIn').addEventListener('click', function () { setPreviewZoom(userZoom * 1.2); });
  $('btnZoomOut').addEventListener('click', function () { setPreviewZoom(userZoom / 1.2); });
  $('btnZoomReset').addEventListener('click', function () { setPreviewZoom(1); });
  $('cameraPreview').addEventListener('wheel', function (e) {
    e.preventDefault();
    if (mainSurface !== 'preview' || dragSurface) return;
    var amount = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 600 : 1);
    setPreviewZoom(userZoom * Math.exp(-Math.max(-200, Math.min(200, amount))*0.002));
  }, {passive:false});
  $('cameraPreview').addEventListener('keydown', function (e) {
    if (mainSurface !== 'preview') return;
    if(e.key === '+' || e.key === '=') { e.preventDefault();setPreviewZoom(userZoom*1.2); }
    else if(e.key === '-') { e.preventDefault();setPreviewZoom(userZoom/1.2); }
    else if(e.key === '0') { e.preventDefault();setPreviewZoom(1); }
  });

  $('btnSwapView').addEventListener('click', function () {
    if (dragSurface) return;
    var stage=$('cameraStage'), inset=$('viewInset');
    var big=mainSurface==='preview' ? $('cameraPreview') : sphere;
    var small=mainSurface==='preview' ? sphere : $('cameraPreview');
    stage.insertBefore(small,inset); inset.appendChild(big);
    mainSurface=mainSurface==='preview' ? 'sphere' : 'preview';
    stage.classList.toggle('sphere-main',mainSurface==='sphere');
    $('zoomLevel').parentElement.hidden=mainSurface==='sphere';
    $('previewModeLabel').textContent=mainSurface==='sphere' ? 'Camera sphere · drag or select a point' : 'Live camera preview';
    small.tabIndex=0;big.tabIndex=-1;
    small.focus({preventScroll:true});
    drawSphere();
  });

  // The large view and inset share one selected camera pose.
  var preview = $('cameraPreview'), previewDrag = null;
  function syncPreviewOrbit(dx, dy) {
    var target = interactionMode === 'auto'
      ? (previewDrag ? previewDrag.target : previewTarget)
      : interactionMode;
    if(target==='light')dragLight(cameraFrame(),dx,dy);
    else if(target==='rotate')dragGlobe(dx,dy);
    else saveCameraFrame(rotateFrame(cameraFrame(),rotationFor(cameraFrame(),dx,dy,-1)));
    drawSphere();
  }
  preview.addEventListener('pointerdown', function (e) {
    if (mainSurface !== 'preview' || dragSurface) return;
    if (e.button !== undefined && e.button !== 0) return;
    var rect=preview.getBoundingClientRect();
    var px=(e.clientX-rect.left)*preview.width/rect.width, py=(e.clientY-rect.top)*preview.height/rect.height;
    var hitLight=lightHandle && Math.hypot(px-lightHandle.x,py-lightHandle.y)<=36;
    var target = interactionMode === 'auto' ? (hitLight ? 'light' : 'camera') : interactionMode;
    if (target === 'camera') pushMove();
    if (interactionMode === 'auto' && previewTarget !== target) {
      previewTarget=target;
      animatePreviewZoom(target === 'light' ? 0.38 : 1);
      $('previewModeLabel').textContent=target==='light' ? 'Drag the light around the sphere' : 'Live camera preview';
    }
    previewDrag = {x:e.clientX, y:e.clientY, target:target};
    dragSurface = 'preview'; dragPointerId = e.pointerId;
    preview.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation();
  });
  preview.addEventListener('pointermove', function (e) {
    if (!previewDrag || dragSurface !== 'preview' || e.pointerId !== dragPointerId) return;
    var scale = 960 / preview.getBoundingClientRect().width;
    syncPreviewOrbit((e.clientX-previewDrag.x)*scale, (e.clientY-previewDrag.y)*scale);
    previewDrag = {x:e.clientX,y:e.clientY,target:previewDrag.target};
  });
  function endPreviewOrbit(e) {
    if (dragSurface !== 'preview' || e.pointerId !== dragPointerId) return;
    previewDrag = null; dragSurface = null; dragPointerId = null;
  }
  preview.addEventListener('pointerup', endPreviewOrbit);
  preview.addEventListener('pointercancel', endPreviewOrbit);
  preview.addEventListener('lostpointercapture', endPreviewOrbit);
  preview.addEventListener('keydown', function (e) {
    if (mainSurface !== 'preview') return;
    var delta = {ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];
    if (!delta) return;
    if (interactionMode === 'camera' || (interactionMode === 'auto' && previewTarget === 'camera')) pushMove();
    syncPreviewOrbit(delta[0],delta[1]); e.preventDefault();
  });

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

  document.addEventListener('viewpoint-language-change', function () {
    drawSphere(); renderResult(); renderThumbs();
  });
  renderEmpty($('result'));
  drawSphere();
})();
