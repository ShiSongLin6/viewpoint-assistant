# Claude Opus 5

Platform: University of Birmingham bAI

Date: 2026-11-17 (Europe/London)

Displayed selection: Selected model: Anthropic Claude Opus 5

Chat: https://ai.bham.ac.uk/chat/onechat/52282e36-d1ba-e5c2-d711-ed8da3a301c6

Prompt: ../01_uniform_prompt.md (identical text; 13,956 characters)

Status: completed response captured and model/chat attribution checked; execution claims are the model's own declaration.

## Original response (rendered text)

EXECUTED.

Environment: Node.js v22.23.4 in the sandbox (no network). File written to /tmp/viewpoint.js from the source snapshot, loaded via require, then parsePrompt called on each of the 20 inputs with node /tmp/run.js.
Integrity: sha256sum /tmp/viewpoint.js → 47c06d79c6a8a06848c28570131ab3cd5160e350a3df65551464368bc86c5645, byte-identical to the SHA-256 you supplied (10,814 bytes). So the executed code is the snapshot, not a retyped approximation.
"Suggested acceptable behaviour" below is my proposal for your review, not ground truth.
All 20 rows (executed)
ID	Exact input	Executed kind	theta	phi	Matched terms	Reason in code	Suggested acceptable behaviour (my proposal)	Finding / uncertainty
1	a cat, top-down view	clear	null	90	top-down	top-down → phi 90; then `	phi	>=80` nulls theta
2	a cat seen from above	ambiguous	—	—	from above	from above is a VAGUE cue → 3 candidates	ambiguous, ask for height	Defensible: "above" fixes sign of phi but not magnitude or azimuth. Note seen from (generic) never evaluated — vague branch returns first.
3	a cat looking up at the camera	ambiguous	—	—	looking up	looking up → "somewhere below the subject"	ambiguous — but for the wrong reason	Semantic error. "The cat looking up" is subject orientation, not camera position. The lexicon treats it as "camera below". Right kind, wrong justification; candidates would mislead the interface.
4	a car door with a rear view mirror	clear	180	null	rear view	rear view → theta 180	none (no viewpoint requested)	False match. Substring rear view inside the object name "rear view mirror". findWord boundary test passes because "mirror" is a separate token. Confidently wrong — worse than asking.
5	the cat turned away from the camera	none	—	—	(none)	no clear/vague/generic hit	ambiguous (subject-orientation cue, camera unspecified)	"turned away" is subject orientation, genuinely not a camera angle, so none is arguably right; but the user clearly intends a viewpoint-ish change, so clarification would serve better.
6	shot from the camera behind the cat	ambiguous	—	—	shot from (generic)	from behind not present as a phrase ("camera behind"); generic shot from fires	clear theta 180, or ambiguous on phi only	Vocabulary gap. Bare behind is not in the lexicon; only from behind. Result degrades to the generic bucket whose candidates include {0,90} (top-down) — the opposite of what was asked.
7	an over the shoulder shot	ambiguous	—	—	over the shoulder	VAGUE cue → candidates 160/200/25, 180/40	ambiguous	Reasonable clarification. OTS is genuinely under-determined (which shoulder, how close). Candidates sensibly straddle 180.
8	the camera at 30 degrees elevation	none	—	—	(none)	45 degree* is literal; 30 degrees has no rule; elevation not in GENERIC_WORDS; no angle	clear, phi 30, theta null	Implementation gap. This is the least ambiguous input in the set — an explicit numeric elevation — and is the only route to none. No numeric parsing exists; degrees are hard-coded strings.
9	the cat from three-quarters behind	none	—	—	(none)	three-quarter rejected: next char is s (findWord boundary)	clear theta 135	Plural blind spot. Only the s prevents the match; behind alone also unknown. Two independent gaps produce none where ID 15 produces 135.
10	shot from the balcony above	ambiguous	—	—	from the balcony	VAGUE cue "somewhere above"	ambiguous	Correct kind. Note it matched the place phrase, not from above — from the balcony (16 chars) sorts before from above (10) and consumes "from the balcony", leaving a stranded "above" that no rule reads. Same candidate set either way, so no visible difference here.
11	a close-up of the cat's face	none	—	—	(none)	no hit	none	Correct. Framing, not viewpoint — exactly the distinction you asked the parser to keep.
12	a cat, 45 degree angle	clear	null	45	45 degree	45 degree → phi 45 (elevation)	ambiguous (axis unstated)	Unjustified axis choice. "45 degree angle" does not say elevation; a 3/4 azimuth (theta 45) is at least as common in practice. angle (generic) is never reached because a clear hit exists. One number, two plausible axes.
13	slightly high angle	clear	null	50	high angle	high angle → phi 50	clear with a lower phi (~25–30), or ambiguous	Modifier ignored. "slightly" is discarded, yet plain() itself defines "slightly high" as 10–30°. The parser outputs 50, which plain() would render "high angle" — internally inconsistent vocabulary.
14	portrait	none	—	—	(none)	portrait not in any list	none, or clarify (orientation vs. genre)	Correct and honest. "Portrait" is aspect ratio or genre, not an angle.
15	a three-quarter rear view	clear	135	null	three-quarter rear	18-char phrase matched first, consumed, so rear view cannot fire	clear theta 135	Works exactly as the comment claims. Baseline for ID 16.
16	a 3/4 rear view	clear	180	null	rear view	Longest-first sort: rear view (9) > 3/4 rear (8), so rear view consumes the text first; 3/4 rear and 3/4 view can no longer match	clear theta 135 (same as ID 15)	Implementation error — the most serious one. Length-based priority is the wrong proxy for specificity. "3/4" is silently dropped and the result is a confident 135° azimuth error, with no flag to the user.
17	a rear view	clear	180	null	rear view	rear view → theta 180	clear theta 180	Correct. Genuine ambiguity about elevation is correctly left as phi: null.
18	a portrait facing the camera	none	—	—	(none)	neither portrait nor facing in lexicon; frontal/head-on/front view absent	clear theta 0 (or ambiguous)	Vocabulary gap. "Facing the camera" is an unambiguous front view in ordinary usage; the front-view group lacks it. Also conflates subject orientation with camera position — here they coincide.
19	a side-on view	none	—	—	(none)	side view/side-view/from the side present; side-on is not	clear theta 90, flagged left/right-unresolved	Vocabulary gap, one hyphenated variant away from ID-17-style success. Note a real ambiguity lurks: side view → 90 (right) arbitrarily, ignoring 270.
20	the cat seen from below	ambiguous	—	—	from below	VAGUE cue "somewhere below"	ambiguous	Defensible. Contrast with ID 1: top-down is "clear" at 90 but from below is vague, while directly below would be clear at −80 (note: −80, not −90, an asymmetry with +90).

Distribution: clear 7 (1, 4, 12, 13, 15, 16, 17), ambiguous 6 (2, 3, 6, 7, 10, 20), none 7 (5, 8, 9, 11, 14, 18, 19).

Five significant findings

1. Implementation error — longest-string matching is not specificity (ID 16). scan() sorts the flattened phrase list by b.word.length - a.word.length. 'rear view' is 9 characters, '3/4 rear' is 8, so the generic phrase consumes the text before the specific one can be tested. The header comment's own example ("three-quarter rear view") survives only because that spelling happens to be 18 characters. The 3/4 spelling, listed deliberately in the same group, fails. This is a silent 45° azimuth error delivered as clear — no ambiguity flag, no trace of the dropped token. ID 15 and ID 16 should be identical and are not.

2. Implementation error — false match on an object name (ID 4). The causing substring is rear view within "a car door with a rear view mirror". findWord's guard only rejects alphanumeric characters immediately adjacent to the phrase; "mirror" is preceded by a space, so the guard passes. The parser has no notion that a matched phrase might be part of a noun phrase naming an object rather than describing the camera. This is the one case where a wrong clear is strictly worse than none or ambiguous, because the interface will not ask.

3. Vocabulary coverage — the gaps are narrow and arbitrary, not principled (IDs 6, 8, 9, 18, 19). Five of the seven none results fail on a single missing surface form: bare behind (6), any numeral other than 45 (8), the plural three-quarters (9), facing the camera (18), side-on (19). ID 8 is the clearest case — an explicit "30 degrees elevation" is the least ambiguous input in the whole set and is the only input that states a number on a named axis, yet it returns none because degree handling is string literals rather than a numeric rule. The lexicon is not under-specified in concept, only in enumeration, so the failures look random to a user: "a rear view" works, "a side-on view" does not.

4. Semantic ambiguity — subject orientation, camera position and single-number axes are conflated (IDs 3, 5, 12). looking up is listed as evidence the camera is below (3), but it describes the cat's gaze; a cat looking up at a camera most often implies the camera is above, i.e. the mapping may be inverted relative to intent. turned away (5) is pure subject orientation with no camera claim and correctly yields none, which exposes the asymmetry: one orientation phrase is read as a camera cue, the other is not in the lexicon at all. Separately, ID 12 resolves a bare "45 degree angle" to elevation with no textual warrant; azimuth is equally available, and your own lexicon uses 45 as a theta value for three-quarter views. These need a deliberate decision from you, not a code change — the parser is picking a reading it cannot justify.

5. Reasonable clarification, and why distribution ≠ accuracy. IDs 2, 7, 10, 17 and 20 are the system working as designed: a direction is constrained, a magnitude is not, and the parser refuses to invent one while leaving the unspecified axis null (ID 17's phi: null is exactly right). The headline numbers look balanced — 7 clear / 6 ambiguous / 7 none, which reads like a calibrated spread. Accuracy is weaker than that spread suggests: of the 7 clear results, ID 4 is a false positive, ID 16 is a wrong angle, ID 13 discards "slightly" (and contradicts plain(), which reserves 10–30° for "slightly high" while high angle emits 50), and ID 12 guesses the axis — leaving 1, 15 and 17 as unreservedly defensible. Meanwhile 2 of the 7 none results (8, 18) and 1 more (9) are inputs a user would consider well-specified. Judging this parser by how often it says "clear" would overstate it by roughly a factor of two.

Minor, below the threshold of the five: directly below maps to −80 while directly above maps to +90, so the pole-nulling rule |phi| >= 80 catches both but the two directions are not symmetric; side view → 90 silently resolves a genuine left/right ambiguity in favour of right; and in ID 10 from the balcony consumes the text before from above, leaving the word "above" unread (no behavioural difference here, since both cues share a candidate set, but the precedence is length-driven rather than meaning-driven, same root cause as finding 1).

## Table cells (captured from rendered response)

```json
[
  [
    [
      "ID",
      "Exact input",
      "Executed kind",
      "theta",
      "phi",
      "Matched terms",
      "Reason in code",
      "Suggested acceptable behaviour (my proposal)",
      "Finding / uncertainty"
    ],
    [
      "1",
      "a cat, top-down view",
      "clear",
      "null",
      "90",
      "top-down",
      "top-down → phi 90; then `",
      "phi",
      ">=80` nulls theta"
    ],
    [
      "2",
      "a cat seen from above",
      "ambiguous",
      "—",
      "—",
      "from above",
      "from above is a VAGUE cue → 3 candidates",
      "ambiguous, ask for height",
      "Defensible: \"above\" fixes sign of phi but not magnitude or azimuth. Note seen from (generic) never evaluated — vague branch returns first."
    ],
    [
      "3",
      "a cat looking up at the camera",
      "ambiguous",
      "—",
      "—",
      "looking up",
      "looking up → \"somewhere below the subject\"",
      "ambiguous — but for the wrong reason",
      "Semantic error. \"The cat looking up\" is subject orientation, not camera position. The lexicon treats it as \"camera below\". Right kind, wrong justification; candidates would mislead the interface."
    ],
    [
      "4",
      "a car door with a rear view mirror",
      "clear",
      "180",
      "null",
      "rear view",
      "rear view → theta 180",
      "none (no viewpoint requested)",
      "False match. Substring rear view inside the object name \"rear view mirror\". findWord boundary test passes because \"mirror\" is a separate token. Confidently wrong — worse than asking."
    ],
    [
      "5",
      "the cat turned away from the camera",
      "none",
      "—",
      "—",
      "(none)",
      "no clear/vague/generic hit",
      "ambiguous (subject-orientation cue, camera unspecified)",
      "\"turned away\" is subject orientation, genuinely not a camera angle, so none is arguably right; but the user clearly intends a viewpoint-ish change, so clarification would serve better."
    ],
    [
      "6",
      "shot from the camera behind the cat",
      "ambiguous",
      "—",
      "—",
      "shot from (generic)",
      "from behind not present as a phrase (\"camera behind\"); generic shot from fires",
      "clear theta 180, or ambiguous on phi only",
      "Vocabulary gap. Bare behind is not in the lexicon; only from behind. Result degrades to the generic bucket whose candidates include {0,90} (top-down) — the opposite of what was asked."
    ],
    [
      "7",
      "an over the shoulder shot",
      "ambiguous",
      "—",
      "—",
      "over the shoulder",
      "VAGUE cue → candidates 160/200/25, 180/40",
      "ambiguous",
      "Reasonable clarification. OTS is genuinely under-determined (which shoulder, how close). Candidates sensibly straddle 180."
    ],
    [
      "8",
      "the camera at 30 degrees elevation",
      "none",
      "—",
      "—",
      "(none)",
      "45 degree* is literal; 30 degrees has no rule; elevation not in GENERIC_WORDS; no angle",
      "clear, phi 30, theta null",
      "Implementation gap. This is the least ambiguous input in the set — an explicit numeric elevation — and is the only route to none. No numeric parsing exists; degrees are hard-coded strings."
    ],
    [
      "9",
      "the cat from three-quarters behind",
      "none",
      "—",
      "—",
      "(none)",
      "three-quarter rejected: next char is s (findWord boundary)",
      "clear theta 135",
      "Plural blind spot. Only the s prevents the match; behind alone also unknown. Two independent gaps produce none where ID 15 produces 135."
    ],
    [
      "10",
      "shot from the balcony above",
      "ambiguous",
      "—",
      "—",
      "from the balcony",
      "VAGUE cue \"somewhere above\"",
      "ambiguous",
      "Correct kind. Note it matched the place phrase, not from above — from the balcony (16 chars) sorts before from above (10) and consumes \"from the balcony\", leaving a stranded \"above\" that no rule reads. Same candidate set either way, so no visible difference here."
    ],
    [
      "11",
      "a close-up of the cat's face",
      "none",
      "—",
      "—",
      "(none)",
      "no hit",
      "none",
      "Correct. Framing, not viewpoint — exactly the distinction you asked the parser to keep."
    ],
    [
      "12",
      "a cat, 45 degree angle",
      "clear",
      "null",
      "45",
      "45 degree",
      "45 degree → phi 45 (elevation)",
      "ambiguous (axis unstated)",
      "Unjustified axis choice. \"45 degree angle\" does not say elevation; a 3/4 azimuth (theta 45) is at least as common in practice. angle (generic) is never reached because a clear hit exists. One number, two plausible axes."
    ],
    [
      "13",
      "slightly high angle",
      "clear",
      "null",
      "50",
      "high angle",
      "high angle → phi 50",
      "clear with a lower phi (~25–30), or ambiguous",
      "Modifier ignored. \"slightly\" is discarded, yet plain() itself defines \"slightly high\" as 10–30°. The parser outputs 50, which plain() would render \"high angle\" — internally inconsistent vocabulary."
    ],
    [
      "14",
      "portrait",
      "none",
      "—",
      "—",
      "(none)",
      "portrait not in any list",
      "none, or clarify (orientation vs. genre)",
      "Correct and honest. \"Portrait\" is aspect ratio or genre, not an angle."
    ],
    [
      "15",
      "a three-quarter rear view",
      "clear",
      "135",
      "null",
      "three-quarter rear",
      "18-char phrase matched first, consumed, so rear view cannot fire",
      "clear theta 135",
      "Works exactly as the comment claims. Baseline for ID 16."
    ],
    [
      "16",
      "a 3/4 rear view",
      "clear",
      "180",
      "null",
      "rear view",
      "Longest-first sort: rear view (9) > 3/4 rear (8), so rear view consumes the text first; 3/4 rear and 3/4 view can no longer match",
      "clear theta 135 (same as ID 15)",
      "Implementation error — the most serious one. Length-based priority is the wrong proxy for specificity. \"3/4\" is silently dropped and the result is a confident 135° azimuth error, with no flag to the user."
    ],
    [
      "17",
      "a rear view",
      "clear",
      "180",
      "null",
      "rear view",
      "rear view → theta 180",
      "clear theta 180",
      "Correct. Genuine ambiguity about elevation is correctly left as phi: null."
    ],
    [
      "18",
      "a portrait facing the camera",
      "none",
      "—",
      "—",
      "(none)",
      "neither portrait nor facing in lexicon; frontal/head-on/front view absent",
      "clear theta 0 (or ambiguous)",
      "Vocabulary gap. \"Facing the camera\" is an unambiguous front view in ordinary usage; the front-view group lacks it. Also conflates subject orientation with camera position — here they coincide."
    ],
    [
      "19",
      "a side-on view",
      "none",
      "—",
      "—",
      "(none)",
      "side view/side-view/from the side present; side-on is not",
      "clear theta 90, flagged left/right-unresolved",
      "Vocabulary gap, one hyphenated variant away from ID-17-style success. Note a real ambiguity lurks: side view → 90 (right) arbitrarily, ignoring 270."
    ],
    [
      "20",
      "the cat seen from below",
      "ambiguous",
      "—",
      "—",
      "from below",
      "VAGUE cue \"somewhere below\"",
      "ambiguous",
      "Defensible. Contrast with ID 1: top-down is \"clear\" at 90 but from below is vague, while directly below would be clear at −80 (note: −80, not −90, an asymmetry with +90)."
    ]
  ]
]
```
