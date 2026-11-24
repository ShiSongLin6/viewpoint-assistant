# Viewpoint Parser Review

**Execution status:** EXECUTED  
**Environment:** Node.js v22.23.4, local sandbox  
**Command:** `node run_review.js` (loads `/tmp/viewpoint.js` via `require`)  
**Source:** `prototype/viewpoint.js` @ HEAD `bbe235984102cad72ef3ef11d6c18c87bbbc76ea`  
**Date reviewed:** 2026-11-17

---

## Results table

| ID | Exact input | kind | theta | phi | Matched terms | Reason in code | Suggested acceptable behaviour *(proposal only)* | Finding / uncertainty |
|---|---|---|---|---|---|---|---|---|
| 1 | a cat, top-down view | clear | null | 90 | `top-down` | CLEAR\_TERMS: `top-down` → phi 90. `\|phi\|` ≥ 80, so theta forced to null. | clear, theta null, phi 90 — overhead shot with no meaningful azimuth | None |
| 2 | a cat seen from above | ambiguous | — | — | `from above` | VAGUE\_CUES above-group. No CLEAR\_TERMS hit. `seen from` is blotted by the vague scan before GENERIC\_WORDS is reached. Candidates: {0,55}, {325,40}, {35,40}. | Ambiguous is defensible; a single elevated phi (e.g. 55) could also be argued. | Uncertainty: "seen from" (a GENERIC\_WORD) is never evaluated because "from above" blots that region. |
| 3 | a cat looking up at the camera | ambiguous | — | — | `looking up` | VAGUE\_CUES below-group. Candidates: {0,−45}, {325,−25}, {35,−25}. | Ambiguous is correct; subject-orientation language implies camera-below but no exact angle is stated. | Uncertainty: "looking up" describes the cat, not the camera. Subject orientation and camera position are distinct. |
| 4 | a car door with a rear view mirror | clear | 180 | null | `rear view` | CLEAR\_TERMS: `rear view` → theta 180. `findWord` boundary check passes (preceded and followed by non-alphanumeric chars). | none — "rear view mirror" is an object name, not a camera angle. | **False match.** The substring `rear view` triggers the camera-angle rule inside the object name `rear view mirror`. |
| 5 | the cat turned away from the camera | none | — | — | *(none)* | No CLEAR\_TERMS, VAGUE\_CUES, or GENERIC\_WORDS match. "away from" and "turned away" are absent from every lexicon. | Reasonable clarification — "turned away" implies theta ≈ 180 by subject orientation, but that is not camera-position language. | Uncertainty: subject orientation vs. camera position. The parser's none is strict; ambiguous could also be argued. |
| 6 | shot from the camera behind the cat | ambiguous | — | — | `shot from` | No CLEAR\_TERMS or VAGUE\_CUES hit. "shot from" found in GENERIC\_WORDS on vague.rest. "from behind" does not match because "from" and "behind" are separated by "the camera ". Candidates: {0,10}, {45,30}, {0,90}. | Could be clear(theta 180) if "behind" were a standalone CLEAR\_TERMS synonym. Generic GENERIC\_WORDS path loses the directional information already in the text. | Vocabulary gap: "behind" (standalone) is not in the lexicon; only "from behind" (contiguous phrase) is. |
| 7 | an over the shoulder shot | ambiguous | — | — | `over the shoulder` | VAGUE\_CUES over-the-shoulder group. Candidates: {160,25}, {200,25}, {180,40}. | Ambiguous is correct; exact azimuth and elevation are genuinely unspecified. | None |
| 8 | the camera at 30 degrees elevation | none | — | — | *(none)* | "30 degrees" is not in CLEAR\_TERMS (only "45 degree/degrees" is). "elevation" is not in any lexicon. | Ambiguous — the prompt clearly refers to a viewpoint angle; a numeric-angle parser would handle this, but is out of scope for the current lexicon. | Vocabulary gap: only the fixed value 45° is in CLEAR\_TERMS; arbitrary numeric degrees are not supported. |
| 9 | the cat from three-quarters behind | none | — | — | *(none)* | "three-quarters" (with trailing s) does not match "three-quarter" in CLEAR\_TERMS. "behind" (standalone) is not in CLEAR\_TERMS. No VAGUE\_CUES or GENERIC\_WORDS match. | clear, theta 135 — if the plural form and/or "behind" as a direction synonym were added. | Vocabulary gap: plural inflection "three-quarters" is absent. |
| 10 | shot from the balcony above | ambiguous | — | — | `from the balcony` | VAGUE\_CUES above-group. "from the balcony" (16 chars) is longer than "shot from" (9 chars), so it is scanned first; "shot from" is blotted and never reaches GENERIC\_WORDS. Candidates: {0,55}, {325,40}, {35,40}. | Ambiguous is defensible; "from the balcony" is a reasonable vague cue for above-subject camera. | None |
| 11 | a close-up of the cat's face | none | — | — | *(none)* | No terms match. "close-up" is not in any lexicon. | none — this is a framing/composition term, not a viewpoint angle. | None (by design) |
| 12 | a cat, 45 degree angle | clear | null | 45 | `45 degree` | CLEAR\_TERMS: `45 degree` → phi 45. clear.hits.length > 0; returned before GENERIC\_WORDS check sees the remaining "angle". | clear, theta null, phi 45 — phi-only specification is reasonable. | None |
| 13 | slightly high angle | clear | null | 50 | `high angle` | CLEAR\_TERMS: `high angle` → phi 50. "slightly" is in neither CLEAR\_TERMS nor any other lexicon; it is silently discarded. | Ambiguous or a lower phi (e.g. 20–30) — "slightly high" implies less elevation than plain "high angle". | **Semantic mismatch.** The adverb "slightly" modifies the angle downward in common usage but has no effect; result is identical to plain "high angle". |
| 14 | portrait | none | — | — | *(none)* | "portrait" is not in any lexicon. | none — portrait is a framing/aspect-ratio concept, not a camera angle. | None (by design) |
| 15 | a three-quarter rear view | clear | 135 | null | `three-quarter rear` | CLEAR\_TERMS: `three-quarter rear` → theta 135. Longer phrase consumed before shorter `rear view` could match. | clear, theta 135, phi null — correct. | None |
| 16 | a 3/4 rear view | clear | 180 | null | `rear view` | **Bug.** scan() sorts all phrases by string length descending globally. `rear view` (9 chars) > `3/4 rear` (8 chars), so `rear view` is scanned first, matches at index 6, and blots that span. When `3/4 rear` is later tried, its "rear" region is already spaces, so it cannot match. Result: theta 180 instead of 135. | clear, theta 135 — consistent with input 15; "3/4 rear" and "three-quarter rear" should map identically. | **Implementation error.** `3/4 rear` is effectively unreachable when followed by " view", because `rear view` wins the length sort. |
| 17 | a rear view | clear | 180 | null | `rear view` | CLEAR\_TERMS: `rear view` → theta 180. | clear, theta 180, phi null — correct. | None |
| 18 | a portrait facing the camera | none | — | — | *(none)* | "portrait", "facing the camera", "facing" are not in any lexicon. "front view", "frontal", "head-on", "from the front" do not appear verbatim. | Reasonable clarification — "facing the camera" implies theta 0, but the phrase is absent from CLEAR\_TERMS. | Vocabulary gap: "facing the camera" / "facing forward" are common expressions for theta 0. |
| 19 | a side-on view | none | — | — | *(none)* | "side-on view" is not in any lexicon. CLEAR\_TERMS contains "side view" and "side-view" but not "side-on". The hyphenated form "side-on" does not match either existing variant. | clear, theta 90 — "side-on" is a common synonym for a side/profile view. | Vocabulary gap: "side-on" is absent; "side view" and "side-view" do not cover this variant. |
| 20 | the cat seen from below | ambiguous | — | — | `from below` | VAGUE\_CUES below-group. Candidates: {0,−45}, {325,−25}, {35,−25}. | Ambiguous is correct; exact elevation below the subject is unspecified. | None |

---

## Five significant findings

### F1 — Implementation error: `3/4 rear` unreachable when followed by " view" (Input 16)

`scan()` builds a flat list of all phrases across all CLEAR\_TERMS entries and sorts them by **string length descending** globally. `rear view` is 9 characters; `3/4 rear` is 8. For the input `"a 3/4 rear view"`, `rear view` appears at index 6, matches successfully, and its span is blotted with spaces. By the time `3/4 rear` is tried, the characters at that position are spaces, so `findWord` returns −1. The parser returns `theta 180` (back view) rather than `theta 135` (three-quarter rear). The lexeme `3/4 rear` is a dead entry for this construction. Input 15 (`"a three-quarter rear view"`) works correctly because `three-quarter rear` (18 chars) is longer than `rear view`.

### F2 — False match: `rear view` in the object name `rear view mirror` (Input 4)

`findWord` guards against matches *inside* alphanumeric tokens (e.g. "angle" inside "triangle") by checking that the character before and after the matched span is not `[a-z0-9]`. In `"a car door with a rear view mirror"`, the substring `rear view` is bounded by a space on each side, so both boundary checks pass. The parser returns `clear, theta 180`. The phrase is an automotive object name; the subject is a car part, not a camera angle. The boundary check cannot distinguish subject description from camera-angle vocabulary when both use the same words.

### F3 — Semantic mismatch: adverb `slightly` silently discarded (Input 13)

`"slightly high angle"` returns `clear, phi 50` — identical to `"high angle"` alone. The word `"slightly"` is not in any lexicon and leaves no trace in the output. No conflict, ambiguity, or reduced-confidence signal is emitted. By ordinary usage, `"slightly high"` implies a lesser elevation than `"high angle"`. This is not an error in the matching logic, but the result is indistinguishable from the unmodified phrase.

### F4 — Vocabulary coverage: plural inflection and `side-on` variant absent (Inputs 9 and 19)

- Input 9: the lexicon contains `three-quarter rear` but not `three-quarters rear` (trailing *s*). `findWord` does an exact substring match; there is no stemming or inflection normalisation. Result: `none`.
- Input 19: the lexicon contains `side view` and `side-view` but not `side-on` or `side-on view`. Result: `none`.

Both are common formulations that differ from lexicon entries only by a suffix or a linking particle.

### F5 — Vocabulary coverage / semantic ambiguity: subject-orientation phrases not mapped to camera angles (Inputs 5, 6, 18)

Three inputs describe the subject's or camera's relationship using vocabulary the lexicon does not cover:

- **Input 5** (`"the cat turned away from the camera"`): subject-orientation phrase; implies theta ≈ 180 but describes the cat, not the camera. Returns `none`; `ambiguous` could also be argued.
- **Input 6** (`"shot from the camera behind the cat"`): `behind` standalone is absent from CLEAR\_TERMS; only the contiguous phrase `from behind` is listed. Because `"from"` and `"behind"` are separated by `"the camera "`, `from behind` does not match. The GENERIC\_WORD `shot from` fires instead, losing the directional information. Returns `ambiguous` with generic candidates rather than theta 180.
- **Input 18** (`"a portrait facing the camera"`): `facing the camera` and `facing forward` are absent; none of `front view`, `frontal`, `head-on`, or `from the front` appear verbatim. Returns `none`.

These three cases share a common pattern: camera-position intent is expressed through subject-relative or relational phrasing that the lexicon does not cover. Whether they should map to `clear`, `ambiguous`, or remain `none` is a design decision rather than an implementation error.

---

*Output distribution for reference: 10 × clear, 7 × ambiguous, 3 × none.*
