/*
 * viewpoint.js — the rule-based "intelligent behaviour" of the prototype.
 *
 * Pure functions, no DOM:
 *   parsePrompt(text)            -> what viewpoint the person asked for
 *   compareViewpoints(req, det)  -> match / mismatch
 *   plain(theta, phi)            -> plain-language angle description
 *
 * Angles: azimuth theta 0-360 (0 = camera in front of the subject, 90 = camera
 * on the viewer's right), elevation phi -90..+90 (+90 = directly above).
 *
 * Status: IMPLEMENTED (rules, not a language model). It only knows the words
 * in the lexicon below; anything else is reported as ambiguous or as having
 * no viewpoint, never guessed.
 */
(function (root) {
  'use strict';

  // Clear terms: each maps to an exact value on one or both axes.
  // Longer phrases are matched first, and matched text is consumed, so
  // "three-quarter rear view" is not also read as "rear view".
  var CLEAR_TERMS = [
    // The "... rear view" forms are listed so they win over the shorter "rear view" (longest phrase first).
    { words: ['three-quarter rear view', 'three quarter rear view', '3/4 rear view', 'three-quarter rear', 'three quarter rear', '3/4 rear', 'three-quarter back', 'three quarter back'], theta: 135, label: 'three-quarter rear view' },
    { words: ['three-quarter', 'three quarter', '3/4 view'], theta: 45, label: 'three-quarter front view' },
    { words: ["bird's-eye", "bird's eye", 'birds-eye', 'birds eye', 'top-down', 'top down', 'top view', 'top-view', 'overhead', 'directly above'], phi: 90, label: 'top-down' },
    { words: ["worm's-eye", "worm's eye", 'worms-eye', 'worms eye', 'directly below'], phi: -80, label: 'bottom-up' },
    { words: ['high angle', 'high-angle'], phi: 50, label: 'high angle' },
    { words: ['low angle', 'low-angle'], phi: -35, label: 'low angle' },
    { words: ['eye-level', 'eye level'], phi: 0, label: 'eye-level' },
    { words: ['45-degree', '45 degree', '45 degrees', '45-degrees', '45°'], phi: 45, label: '45° high angle' },
    { words: ['left side', 'from the left'], theta: 270, label: 'left side view' },
    { words: ['right side', 'from the right'], theta: 90, label: 'right side view' },
    { words: ['side view', 'side-view', 'profile view', 'in profile', 'from the side'], theta: 90, label: 'side view' },
    { words: ['rear view', 'back view', 'from behind', 'from the back'], theta: 180, label: 'back view' },
    { words: ['front view', 'frontal', 'from the front', 'head-on'], theta: 0, label: 'front view' }
  ];

  // Vague cues: a direction is hinted but no exact angle is stated.
  // They never produce an angle, only 2-3 candidate positions to point at.
  var VAGUE_CUES = [
    { words: ['looking down', 'look down', 'from above', 'from up high', 'from the stage', 'from the balcony'],
      label: 'somewhere above the subject',
      candidates: [{ theta: 0, phi: 55 }, { theta: 325, phi: 40 }, { theta: 35, phi: 40 }] },
    { words: ['looking up', 'look up', 'from below', 'from the ground', 'from the floor'],
      label: 'somewhere below the subject',
      candidates: [{ theta: 0, phi: -45 }, { theta: 325, phi: -25 }, { theta: 35, phi: -25 }] },
    { words: ['over the shoulder', 'over-the-shoulder'],
      label: 'behind and above the subject',
      candidates: [{ theta: 160, phi: 25 }, { theta: 200, phi: 25 }, { theta: 180, phi: 40 }] }
  ];

  // Generic viewpoint words: the person cares about the angle but gave no usable term.
  var GENERIC_WORDS = ['angle', 'viewpoint', 'perspective', 'point of view', 'shot from', 'seen from', 'view from'];
  var GENERIC_CANDIDATES = [{ theta: 0, phi: 10 }, { theta: 45, phi: 30 }, { theta: 0, phi: 90 }];

  var TOLERANCE = 20; // degrees per axis before a difference counts as a mismatch

  function norm(t) { t = t % 360; if (t < 0) t += 360; return t; }
  function clampPhi(p) { return Math.max(-90, Math.min(90, p)); }
  function azimuthDiff(a, b) { var d = Math.abs(norm(a) - norm(b)); return d > 180 ? 360 - d : d; }

  function plain(t, p) {
    var elev, a = Math.abs(p);
    if (a >= 80) elev = p > 0 ? 'top-down' : 'bottom-up';
    else if (a >= 30) elev = (p > 0 ? 'high' : 'low') + ' angle';
    else if (a >= 10) elev = (p > 0 ? 'slightly high' : 'slightly low') + ' angle';
    else elev = 'eye-level';
    if (a >= 80) return elev + ' view';
    var dir, t2 = norm(t);
    if (t2 <= 22.5 || t2 >= 337.5) dir = 'front';
    else if (t2 <= 67.5) dir = 'front-right';
    else if (t2 <= 112.5) dir = 'right side';
    else if (t2 <= 157.5) dir = 'back-right';
    else if (t2 <= 202.5) dir = 'back';
    else if (t2 <= 247.5) dir = 'back-left';
    else if (t2 <= 292.5) dir = 'left side';
    else dir = 'front-left';
    return elev + ', ' + dir + ' view';
  }

  // Position of `word` in `text` as a whole word/phrase (so "angle" does not
  // match inside "triangle"), or -1.
  function findWord(text, word, from) {
    var i = text.indexOf(word, from || 0);
    while (i !== -1) {
      var before = i === 0 ? ' ' : text.charAt(i - 1);
      var after = i + word.length >= text.length ? ' ' : text.charAt(i + word.length);
      if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return i;
      i = text.indexOf(word, i + 1);
    }
    return -1;
  }

  // Find every phrase from `groups` in `text`, longest phrase first, blanking
  // out what was matched so shorter phrases cannot match inside it.
  function scan(text, groups) {
    var flat = [];
    groups.forEach(function (g) { g.words.forEach(function (w) { flat.push({ word: w, group: g }); }); });
    flat.sort(function (a, b) { return b.word.length - a.word.length; });
    var hits = [];
    flat.forEach(function (f) {
      var i = findWord(text, f.word);
      while (i !== -1) {
        hits.push({ word: f.word, group: f.group, index: i });
        text = text.slice(0, i) + new Array(f.word.length + 1).join(' ') + text.slice(i + f.word.length);
        i = findWord(text, f.word);
      }
    });
    hits.sort(function (a, b) { return a.index - b.index; });
    return { hits: hits, rest: text };
  }

  /*
   * parsePrompt(text) returns
   *   { kind: 'clear', theta: number|null, phi: number|null, terms: [...], label }
   *   { kind: 'ambiguous', reason, terms: [...], candidates: [{theta, phi}, ...] }
   *   { kind: 'none', terms: [] }
   * theta/phi are null when the person did not specify that axis.
   */
  function parsePrompt(text) {
    var lower = String(text || '').toLowerCase().replace(/[‘’]/g, "'");
    var clear = scan(lower, CLEAR_TERMS);
    var vague = scan(clear.rest, VAGUE_CUES);
    var theta = null, phi = null, conflict = null, labels = [];

    clear.hits.forEach(function (h) {
      var g = h.group;
      if (g.theta !== undefined) {
        if (theta !== null && azimuthDiff(theta, g.theta) > 0) conflict = 'direction';
        theta = g.theta;
      }
      if (g.phi !== undefined) {
        if (phi !== null && phi !== g.phi) conflict = conflict || 'height';
        phi = g.phi;
      }
      if (labels.indexOf(g.label) === -1) labels.push(g.label);
    });

    var clearWords = clear.hits.map(function (h) { return h.word; });
    var vagueWords = vague.hits.map(function (h) { return h.word; });

    if (conflict) {
      return {
        kind: 'ambiguous',
        reason: 'The prompt contains viewpoint words that disagree on ' + conflict + ' (' + labels.join(' / ') + ').',
        terms: clearWords,
        candidates: candidatesFromClear(clear.hits)
      };
    }
    if (clear.hits.length) {
      // A vague cue ("looking up from the ground") next to clear words must not be silently dropped.
      // If it hints at a height that the clear words leave open, ask, keeping the direction already given.
      if (vague.hits.length && phi === null) {
        var vg = vague.hits[0].group;
        var keepTheta = theta;
        var cands = vg.candidates.map(function (c) { return { theta: keepTheta === null ? c.theta : keepTheta, phi: c.phi }; });
        return {
          kind: 'ambiguous',
          reason: 'The phrase "' + vague.hits[0].word + '" suggests ' + vg.label + ' but does not give one exact height' +
            (keepTheta === null ? '.' : ' (the direction from "' + clearWords.join('", "') + '" is kept).'),
          terms: clearWords.concat(vagueWords),
          candidates: cands
        };
      }
      if (phi !== null && Math.abs(phi) >= 80) theta = null; // straight above/below: direction has no meaning
      return { kind: 'clear', theta: theta, phi: phi, terms: clearWords, label: labels.join(', ') };
    }
    if (vague.hits.length) {
      var g = vague.hits[0].group;
      return {
        kind: 'ambiguous',
        reason: 'The phrase "' + vague.hits[0].word + '" suggests ' + g.label + ' but does not give one exact angle.',
        terms: vagueWords,
        candidates: g.candidates.slice()
      };
    }
    var generic = GENERIC_WORDS.filter(function (w) { return findWord(vague.rest, w) !== -1; });
    if (generic.length) {
      return {
        kind: 'ambiguous',
        reason: 'The prompt mentions "' + generic[0] + '" but no viewpoint word I can map to an angle.',
        terms: generic,
        candidates: GENERIC_CANDIDATES.slice()
      };
    }
    return { kind: 'none', terms: [] };
  }

  // When clear terms conflict, offer each stated option as a candidate instead of picking one.
  function candidatesFromClear(hits) {
    var out = [];
    hits.forEach(function (h) {
      var c = { theta: h.group.theta !== undefined ? h.group.theta : 0, phi: h.group.phi !== undefined ? h.group.phi : 10 };
      if (!out.some(function (o) { return o.theta === c.theta && o.phi === c.phi; })) out.push(c);
    });
    return out.slice(0, 3);
  }

  /*
   * compareViewpoints(requested, detected)
   * Only the axes the person specified are compared.
   * Returns { state: 'match'|'mismatch', dTheta, dPhi, proposal: {theta, phi} }.
   * The proposal keeps the detected value on any axis the person left open.
   */
  function compareViewpoints(requested, detected) {
    var dPhi = requested.phi === null || requested.phi === undefined ? null : Math.abs(requested.phi - detected.phi);
    var dTheta = requested.theta === null || requested.theta === undefined ? null : azimuthDiff(requested.theta, detected.theta);
    var bad = (dPhi !== null && dPhi > TOLERANCE) || (dTheta !== null && dTheta > TOLERANCE);
    return {
      state: bad ? 'mismatch' : 'match',
      dTheta: dTheta,
      dPhi: dPhi,
      proposal: {
        theta: dTheta === null ? norm(detected.theta) : norm(requested.theta),
        phi: dPhi === null ? detected.phi : requested.phi
      }
    };
  }

  var api = {
    parsePrompt: parsePrompt,
    compareViewpoints: compareViewpoints,
    plain: plain,
    norm: norm,
    clampPhi: clampPhi,
    azimuthDiff: azimuthDiff,
    TOLERANCE: TOLERANCE
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Viewpoint = api;
})(typeof window !== 'undefined' ? window : this);
