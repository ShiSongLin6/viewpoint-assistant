# DeepSeek V4.1 Flash (Deep interface, called through the Doubao app)

Source: I pasted this reply from the Doubao app, where I used its Deep interface; the exact back-end model version was not confirmed.

## Original reply

[Translated from Chinese] I have read the file and actually ran the 20 inputs with the same `viewpoint.js` from the repository (SHA-256 matches the snapshot). My full reply follows.

---

**Model under test: Doubao (desktop app)**

## Execution status

**EXECUTED** — Node.js v22.23.2 on Windows (PowerShell 7.6.4), `require`-ing the repository file directly, unmodified:

```
node docs/a2/model_check/exec/run-20-inputs.mjs
FILE   <repo>/prototype/viewpoint.js
SHA-256 47c06d79c6a8a06848c28570131ab3cd5160e350a3df65551464368bc86c5645   (matches snapshot)
```

Outputs below are observed. The "suggested acceptable behaviour" column is my proposal for your review, not ground truth.

## Results for the 20 fixed inputs

| ID | Exact input | Kind | theta | phi | Matched terms | Reason in code | Suggested acceptable behaviour | Finding / uncertainty |
|---|---|---|---|---|---|---|---|---|
| 1 | a cat, top-down view | clear | null | 90 | top-down | `CLEAR_TERMS` row 3 (phi 90); "top-down" sorts before the equal-length "top view"; term carries no theta | clear, phi +90, theta null | None significant; null theta at the pole is defensible |
| 2 | a cat seen from above | ambiguous | — | — | from above | No clear hit; `VAGUE_CUES` group 1 ("somewhere above") returns three hardcoded candidates at phi 40–55 | Clarify; if a single value is demanded, phi near +90 rather than 40–55 | Candidates never approach top-down; "from above" vs "directly above" is a deliberate but user-invisible distinction |
| 3 | a cat looking up at the camera | ambiguous | — | — | looking up | `VAGUE_CUES` group 2 ("somewhere below"), candidates phi −45 / −25 | Acceptable clarification | Reads the subject's gaze as camera position; reasonable, but the inference is not stated in code |
| 4 | a car door with a rear view mirror | clear | 180 | null | rear view | `CLEAR_TERMS` "rear view" (theta 180) matched inside the noun; `findWord` boundary test passes because the next character is a space | none (the phrase names an object part, not a viewpoint), or ask | **False match**: substring "rear view" inside "rear view mirror" |
| 5 | the cat turned away from the camera | none | — | — | (none) | No lexicon entry for "turned away"; no clear, vague or generic hit, so it falls through to `kind: 'none'` | clear theta 180 (camera behind the subject) | Vocabulary coverage gap; the angle is determinable, so "none" is under-reporting |
| 6 | shot from the camera behind the cat | ambiguous | — | — | shot from | 'from behind' needs adjacency ("from the camera behind" fails), bare "behind" is absent, so `GENERIC_WORDS` 'shot from' fires and returns `GENERIC_CANDIDATES` theta 0/45, phi 10–90 | clear theta 180, or ambiguous with 180 among the candidates | Directional evidence discarded and replaced by candidates pointing the opposite way |
| 7 | an over the shoulder shot | ambiguous | — | — | over the shoulder | `VAGUE_CUES` OTS group, candidates (160,25) / (200,25) / (180,40) | Acceptable clarification | Cleanest case in the set: OTS is a family of positions, not one angle |
| 8 | the camera at 30 degrees elevation | none | — | — | (none) | The only numeric rule is the literal '45 degree(s)'; "elevation" is not a term; no generic word present | clear phi +30, theta null | Quantity is not parsed at all; only one hardcoded number exists |
| 9 | the cat from three-quarters behind | none | — | — | (none) | "three-quarter" is rejected because the following character is "s" ([a-z0-9]); no "three-quarter back/behind" variant exists | clear theta 135 | Morphological brittleness (plural), not genuine semantic ambiguity |
| 10 | shot from the balcony above | ambiguous | — | — | from the balcony | `VAGUE_CUES` group 1 matched "from the balcony"; "above" alone is not a term ('directly above' requires "directly") | Acceptable: balcony height is unknown | The "above" hint contributes no exact value; hardcoded candidates again |
| 11 | a close-up of the cat's face | none | — | — | (none) | "close-up" absent; correct by design, framing is not a viewpoint | none (framing only), interface queries the angle | Correct behaviour |
| 12 | a cat, 45 degree angle | clear | null | 45 | 45 degree | '45 degree' → phi 45; the generic word "angle" is never examined because clear hits exist | ambiguous: 45° of camera elevation or 45° of azimuth/object rotation | One number is forced onto one axis; label "45° high angle" asserts elevation without justification |
| 13 | slightly high angle | clear | null | 50 | high angle | 'high angle' (phi 50) matched first; "slightly" is not modelled at all | ambiguous, or phi ≈ +15 to +25 if a single value is required | Output is "clear" but qualitatively wrong: the modifier inverts the magnitude |
| 14 | portrait | none | — | — | (none) | "portrait" absent; correct by design (frame orientation, not angle) | none | Correct behaviour |
| 15 | a three-quarter rear view | clear | 135 | null | three-quarter rear | Longest phrase 'three-quarter rear' (17 chars) matched first and its span was blanked, so "rear view" cannot re-match | clear theta 135, with the side convention (135 vs 225) documented | Mapping defensible; which side is three-quarter rear is an undocumented convention |
| 16 | a 3/4 rear view | clear | 180 | null | rear view | 'rear view' (9 chars) is sorted before '3/4 rear' (8 chars), matches at index 6 and consumes the region; '3/4 rear' can then no longer match | clear theta 135 | **Precedence bug**: the generic phrase is longer than the specific modifier-bearing one, so longest-first does not protect the specific term |
| 17 | a rear view | clear | 180 | null | rear view | 'rear view' term, theta 180 | clear theta 180 | Correct as parsed; but `plain(theta, null)` gives `Math.abs(null) = 0`, so any display would invent "eye-level" |
| 18 | a portrait facing the camera | none | — | — | (none) | "facing the camera" is absent; "portrait" is not a clear term either | clear theta 0 | Determinable direction missed |
| 19 | a side-on view | none | — | — | (none) | "side-on" is absent; 'side view' / 'from the side' require the exact forms | clear theta 90, consistent with the existing "side view" mapping | One hyphenated variant breaks an entire class |
| 20 | the cat seen from below | ambiguous | — | — | from below | `VAGUE_CUES` group 2; 'directly below' would need "directly", so only the vague cue fires | Acceptable clarification | Correct behaviour for the lexicon, but the below / directly-below gap is again user-invisible |

## Significant findings

**1. Implementation error — phrase precedence is decided by length alone (#16).** 'rear view' (9 characters) outranks '3/4 rear' (8 characters) and is matched first at index 6 of "a 3/4 rear view"; the matched span is blanked, so the specific term can never match. The comment on line 76 ("Longer phrases are matched first, and matched text is consumed, so 'three-quarter rear view' is not also read as 'rear view'") holds only when the specific phrase is the longer string. Result: theta 180 instead of 135.

**2. Implementation error — false match on a noun compound (#4).** The substring "rear view" sits inside "rear view mirror". `findWord` only checks character boundaries, so the phrase boundary still looks clean and no context rule rejects it. Output is `clear` with theta 180, which would then be compared against a detected angle and produce a mismatch against a request that never asked for an angle.

**3. Implementation error — the generic bucket overrides directional evidence (#6).** "from behind" requires adjacency, so "from the camera behind the cat" contains no matchable direction, and control reaches `GENERIC_WORDS` ('shot from'), whose `GENERIC_CANDIDATES` are theta 0, 45, 0 with phi 10–90 — all front-ish, i.e. the opposite of what the sentence says. The more specific the user's wording, the less useful the output becomes.

**4. Vocabulary coverage — 7 `none` results, but only 2 are correct behaviour.** #11 and #14 are correct (framing is not a viewpoint). #5, #8, #9, #18, #19 are near-misses: "turned away", "30 degrees elevation", "three-quarters" (plural blocked by the `[a-z0-9]` boundary test), "facing the camera", "side-on". The distribution 7 clear / 6 ambiguous / 7 none therefore says nothing about accuracy; it partly measures how many inflections happen to be spelled in the lexicon.

**5. Semantic ambiguity handled by assignment rather than by clarification (#12, #13).** #12 maps "45 degree" onto phi 45 and labels it "45° high angle", although 45° could equally be an azimuth or an object rotation. #13 returns a confident `clear` at phi 50 after "slightly" is discarded; `plain` then renders it "high angle", so the qualifier is lost twice. Both are cases where the code's single reading is the least justifiable one, while genuinely ambiguous inputs (#2, #3, #7, #10, #20) do get a clarification path.

**Scope note.** Of the 7 `clear` rows, #1, #15 and #17 are defensible (#12 only with a caveat); #4, #13 and #16 are wrong in substance. All observations above are executed outputs; the judgements in the last two columns are my proposals for your review.

---

[Translated from Chinese] My note: the runner script and output are in `.../model_check/exec/run-20-inputs.mjs`; `prototype/viewpoint.js` was not changed.
