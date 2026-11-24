import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../../');
const sourcePath = resolve(repoRoot, 'prototype/viewpoint.js');
const require = createRequire(import.meta.url);
const { parsePrompt } = require(sourcePath);

const inputs = [
  'a cat, top-down view',
  'a cat seen from above',
  'a cat looking up at the camera',
  'a car door with a rear view mirror',
  'the cat turned away from the camera',
  'shot from the camera behind the cat',
  'an over the shoulder shot',
  'the camera at 30 degrees elevation',
  'the cat from three-quarters behind',
  'shot from the balcony above',
  "a close-up of the cat's face",
  'a cat, 45 degree angle',
  'slightly high angle',
  'portrait',
  'a three-quarter rear view',
  'a 3/4 rear view',
  'a rear view',
  'a portrait facing the camera',
  'a side-on view',
  'the cat seen from below',
];

const source = readFileSync(sourcePath);
const sha256 = createHash('sha256').update(source).digest('hex');
const expectedSha256 = '47c06d79c6a8a06848c28570131ab3cd5160e350a3df65551464368bc86c5645';
const results = inputs.map((input, index) => ({
  id: index + 1,
  input,
  ...parsePrompt(input),
}));

console.log(JSON.stringify({
  execution: {
    status: 'EXECUTED',
    node: process.version,
    cwd: process.cwd(),
    command: 'node docs/a2/model_check/exec/run-20-inputs.mjs',
    source: 'prototype/viewpoint.js',
    sha256,
    matchesReferenceSnapshot: sha256 === expectedSha256,
  },
  resultCount: results.length,
  results,
}, null, 2));
