# Re-check after the fix (23 Nov 2026)

The check files (`01`–`04`) are kept as they were before the fix. This file records only the local re-check after the fix; the models were not asked again.

## What changed and why

- Finding: in the 17 Nov check, all seven models that differed from the executed output predicted θ 135 for #16 `a 3/4 rear view`; the parser printed θ 180.
- Cause: the parser matches the longest phrase first. The lexicon had `3/4 rear` but not the full phrase `3/4 rear view`, so `rear view` (9 characters) was longer than `3/4 rear` (8 characters) and won.
- My decision (23 Nov): fix the rule rather than list it as a limit.
- Change: added `3/4 rear view`, `three-quarter rear view` and `three quarter rear view` to the three-quarter-rear rule. They are longer than `rear view`, so they now match first.
- Commit: 21771c80bedc9c142db83e26bcb174ef5e58be63

## How I checked it

- Unit tests: all 18 pass (one added: `a 3/4 rear view` and `a three quarter rear view` give θ 135; `a rear view` still gives θ 180).
- I re-ran the same 20 inputs through the local parser and compared each output with the earlier run:

| ID | Input | Before | After |
|---|---|---|---|
| 15 | a three-quarter rear view | clear, θ 135 (matched `three-quarter rear`) | clear, θ 135 (matched `three-quarter rear view`); angle unchanged |
| 16 | a 3/4 rear view | clear, θ 180 (matched `rear view`) | clear, θ 135 (matched `3/4 rear view`) |

The other 18 outputs are identical.

## Versions

- `prototype/viewpoint.js` SHA-256 before: 47c06d79c6a8a06848c28570131ab3cd5160e350a3df65551464368bc86c5645 (same as the check snapshot)
- After: f7e96a5ab236f6cd54cb64cf57b998a8350070f0e38bfd33ac81666759456655
- Node.js v22.16.0

## Not changed

The other differences in the model check, such as #4 (`rear view mirror` read as a back view) and #5 (a subject turning versus the camera moving), are known limits of word-matching rules. I kept them and listed them under Known limits in the README.
