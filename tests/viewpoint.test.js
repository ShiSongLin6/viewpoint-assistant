// Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const { parsePrompt, compareViewpoints, plain, azimuthDiff } = require('../prototype/viewpoint.js');

test('Test A: a clear viewpoint word maps to an angle', () => {
  const r = parsePrompt('Generate a photorealistic portrait of a cat, top-down view.');
  assert.strictEqual(r.kind, 'clear');
  assert.strictEqual(r.phi, 90);
  assert.strictEqual(r.theta, null); // direction has no meaning straight above
});

test('Test B: a metaphor is ambiguous and is never mapped to top-down', () => {
  const r = parsePrompt("make it look like you're looking down at it from the stage");
  assert.strictEqual(r.kind, 'ambiguous');
  assert.ok(r.candidates.length >= 2 && r.candidates.length <= 3);
  r.candidates.forEach(c => assert.ok(c.phi > 0 && c.phi < 80, 'candidates are above, not top-down'));
});

test('height and direction words combine', () => {
  const r = parsePrompt('a sports car, low angle, three-quarter rear view');
  assert.strictEqual(r.kind, 'clear');
  assert.strictEqual(r.phi, -35);
  assert.strictEqual(r.theta, 135);
});

test('longer phrases win: "three-quarter rear view" is not read as "rear view"', () => {
  assert.strictEqual(parsePrompt('three-quarter rear view of a chair').theta, 135);
  assert.strictEqual(parsePrompt('rear view of a chair').theta, 180);
});

test('only one axis specified leaves the other open', () => {
  const r = parsePrompt('a teapot, side view');
  assert.strictEqual(r.kind, 'clear');
  assert.strictEqual(r.theta, 90);
  assert.strictEqual(r.phi, null);
});

test('conflicting words are ambiguous, each option offered as a candidate', () => {
  const r = parsePrompt('a cat, top-down, low angle');
  assert.strictEqual(r.kind, 'ambiguous');
  assert.ok(r.candidates.some(c => c.phi === 90));
  assert.ok(r.candidates.some(c => c.phi === -35));
});

test('a generic viewpoint word without a usable term is ambiguous', () => {
  assert.strictEqual(parsePrompt('a cat from a dramatic angle').kind, 'ambiguous');
});

test('whole words only: "triangle" and "camera" as a subject are not viewpoint words', () => {
  assert.strictEqual(parsePrompt('a red triangle on a table').kind, 'none');
  assert.strictEqual(parsePrompt('a vintage camera on a desk').kind, 'none');
});

test('a vague cue next to a clear word is not silently dropped', () => {
  const r = parsePrompt('looking up at the cat from the ground, side view');
  assert.strictEqual(r.kind, 'ambiguous');
  r.candidates.forEach(c => { assert.strictEqual(c.theta, 90, 'keeps the stated direction'); assert.ok(c.phi < 0, 'below the subject'); });
});

test('a vague cue is ignored when the clear words already fix the height', () => {
  assert.strictEqual(parsePrompt('looking down at the cat, top-down view').kind, 'clear');
});

test('common spellings: "45 degrees", "top view"', () => {
  assert.strictEqual(parsePrompt('a cat at 45 degrees').phi, 45);
  assert.strictEqual(parsePrompt('top view of a house').phi, 90);
});

test('no viewpoint word at all', () => {
  assert.strictEqual(parsePrompt('a cat sitting on a carpet').kind, 'none');
  assert.strictEqual(parsePrompt('').kind, 'none');
});

test('curly apostrophes are handled', () => {
  assert.strictEqual(parsePrompt('bird’s-eye view of a city').phi, 90);
});

test('compare: mismatch on height proposes the requested height and keeps the detected direction', () => {
  const c = compareViewpoints({ theta: null, phi: 90 }, { theta: 30, phi: 5 });
  assert.strictEqual(c.state, 'mismatch');
  assert.deepStrictEqual(c.proposal, { theta: 30, phi: 90 });
});

test('compare: within tolerance is a match', () => {
  assert.strictEqual(compareViewpoints({ theta: 90, phi: null }, { theta: 100, phi: 40 }).state, 'match');
  assert.strictEqual(compareViewpoints({ theta: 0, phi: 0 }, { theta: 350, phi: 12 }).state, 'match');
});

test('compare: azimuth wraps around 360', () => {
  assert.strictEqual(azimuthDiff(350, 10), 20);
  assert.strictEqual(compareViewpoints({ theta: 0, phi: null }, { theta: 180, phi: 0 }).state, 'mismatch');
});

test('plain-language description', () => {
  assert.strictEqual(plain(0, 0), 'eye-level, front view');
  assert.strictEqual(plain(135, -35), 'low angle, back-right view');
  assert.strictEqual(plain(45, 20), 'slightly high angle, front-right view');
  assert.strictEqual(plain(200, 90), 'top-down view');
});
