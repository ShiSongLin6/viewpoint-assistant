# Claude Opus 5.5

Platform: University of Birmingham bAI

Date: 2026-11-17 (Europe/London)

Displayed selection: Selected model: Anthropic Claude Opus 5.5

Chat: https://ai.bham.ac.uk/chat/onechat/54dfb2eb-9ede-a76c-1fc1-2c9b29f223df

Prompt: ../01_uniform_prompt.md (identical text; 13,956 characters)

Status: completed response captured and model/chat attribution checked; execution claims are the model's own declaration.

## Original response (rendered text)

EXECUTED. I ran parsePrompt only, using Node.js v22.23.4 on a Linux x86_64 sandbox. I copied the source snapshot exactly to viewpoint.js. sha256sum viewpoint.js gave 47c06d79c6a8a06848c28570131ab3cd5160e350a3df65551464368bc86c5645, which matches the hash you supplied. The command was node run.js; the script called require('./viewpoint.js') and printed JSON.stringify(V.parsePrompt(s)) for each of the 20 inputs, and nothing else.

Neither compareViewpoints nor the interface was run. The output columns come from the execution. The "Suggested acceptable behaviour" column is my proposal for your review, not ground truth.

ID	Exact input	Executed kind	theta	phi	Matched terms	Reason in code	Suggested acceptable behaviour (proposal)	Finding / uncertainty
1	a cat, top-down view	clear	null	90	top-down	Clear term phi 90; theta set to null because |phi| ≥ 80	clear, theta null, phi 90	Suitable.
2	a cat seen from above	ambiguous	—	—	from above	Vague cue "above"; candidates (0,55), (325,40), (35,40)	ambiguous / ask; the height is not stated	Suitable. seen from (generic) is never reached because the vague cue returns first.
3	a cat looking up at the camera	ambiguous	—	—	looking up	Vague cue "below"; candidates phi −45, −25, −25	Camera is above the cat (phi > 0, exact value not stated) and roughly in front. Ambiguous with above-side candidates, or ask	Wrong direction. looking up describes where the cat is looking (subject orientation), but the code reads it as the camera being below. Every candidate has the wrong sign.
4	a car door with a rear view mirror	clear	180	null	rear view	Clear term "back view"	none (the phrase names an object)	False match. The substring rear view inside the object name "rear view mirror" was read as a viewpoint.
5	the cat turned away from the camera	none	—	—	—	No lexicon or generic words	Probably theta ≈ 180, phi null. "Turned away" may be partial, so asking is also acceptable	Not covered by the vocabulary. The phrase gives subject orientation relative to the camera, which implies a camera direction.
6	shot from the camera behind the cat	ambiguous	—	—	shot from	Generic fallback; candidates (0,10), (45,30), (0,90)	theta 180, phi null; or ask with back-side candidates	behind on its own is not in the lexicon (only from behind). None of the generic candidates is near the stated direction (180).
7	an over the shoulder shot	ambiguous	—	—	over the shoulder	Vague cue; candidates (160,25), (200,25), (180,40)	ambiguous / ask	Suitable. It is unclear which shoulder, whose shoulder, and what height.
8	the camera at 30 degrees elevation	none	—	—	—	No numeric parsing; only "45 …" is in the lexicon	clear, theta null, phi 30	Not covered by the vocabulary. An explicit numeric elevation is dropped.
9	the cat from three-quarters behind	none	—	—	—	three-quarter is rejected because the following s fails the word-boundary check in findWord; behind is not preceded by from	Rear three-quarter view, phi null. Theta could be 135 or 225, so ask	Not covered by the vocabulary (plural form, word order). Left/right is uncertain.
10	shot from the balcony above	ambiguous	—	—	from the balcony	Vague cue "above"; same candidates as row 2	ambiguous / ask	Suitable. above and shot from are not used because the vague cue returns first.
11	a close-up of the cat's face	none	—	—	—	No lexicon words	none (this is framing)	Suitable. "Face" might hint at a frontal view, but that is not enough to justify an angle.
12	a cat, 45 degree angle	clear	null	45	45 degree	Clear term labelled "45° high angle"	Ask: 45° could be elevation or azimuth (a three-quarter view)	Ambiguous meaning. The lexicon assumes elevation; the prompt does not say which axis.
13	slightly high angle	clear	null	50	high angle	high angle matched; slightly ignored	High side, but lower than 50. Either a clear lower value or ask	Inconsistent with the code's own descriptions. plain() would describe 50 as "high angle" and 10–29 as "slightly high". The modifier is lost.
14	portrait	none	—	—	—	No lexicon words	none (framing or orientation, not a viewpoint)	Suitable.
15	a three-quarter rear view	clear	135	null	three-quarter rear	18-character phrase matched before rear view (9) and consumes it	Rear three-quarter view; theta could be 135 or 225	The overlap is handled correctly here. Choosing the right-hand side (135) is a convention, not something the prompt states.
16	a 3/4 rear view	clear	180	null	rear view	rear view (9 characters) is matched before 3/4 rear (8) and consumes "rear"; 3/4 rear and 3/4 view can no longer match	Same as row 15	Implementation error. It returns a straight back view and contradicts the code comment saying a three-quarter rear view is not also read as a rear view.
17	a rear view	clear	180	null	rear view	Clear term "back view"	clear, theta 180, phi null	Suitable.
18	a portrait facing the camera	none	—	—	—	facing is not in the lexicon; portrait is not handled	theta ≈ 0, phi null; or ask	Not covered by the vocabulary. "Facing the camera" is subject orientation that implies a frontal camera position. "Portrait" is framing.
19	a side-on view	none	—	—	—	side view does not match "side-on view"	Ask: side view, theta 90 or 270	Not covered by the vocabulary. Even if it matched, the lexicon maps the unqualified "side" to 90 (right), which is a convention.
20	the cat seen from below	ambiguous	—	—	from below	Vague cue "below"; candidates phi −45, −25, −25	ambiguous / ask	Suitable.
Significant findings

1. Implementation error: phrase priority uses string length, so a shorter overlapping phrase can lose (row 16). scan sorts candidate phrases by character length. In "a 3/4 rear view", rear view (9 characters) is matched before 3/4 rear (8). It blanks out "rear", so neither 3/4 rear nor 3/4 view can match afterwards. The spelled-out form in row 15 works only because three-quarter rear (18 characters) happens to be longer than rear view. The ordering does not prefer the match that covers the most text.

2. Context errors: an object name and a subject's gaze are read as camera viewpoint (rows 4 and 3).

Row 4: the substring rear view in "rear view mirror" is a false positive, and it comes out as clear.
Row 3: looking up is the cat's gaze, but the code reads it as "camera below". The candidates point the opposite way to what the prompt implies. This is more harmful than returning none, because the interface would offer the user only wrong-side options.

3. Vocabulary gaps (rows 5, 6, 8, 9, 18, 19).

Numeric angles other than 45 are not recognised (row 8).
The plural "three-quarters" fails the boundary check (row 9).
"Side-on" is not covered (row 19).
"Behind" only works when preceded by "from" (row 6).
Orientation relative to the camera ("turned away", "facing") is not covered (rows 5, 18).

In rows 5, 8, 9, 18 and 19 the interface would still ask for an angle, so the user is not given a wrong angle. But the information already in the prompt is thrown away. In row 6 the generic candidates leave out the stated rear direction.

4. Unclear meaning settled with a single number (rows 12, 13, 15).

Row 12: "45 degree angle" could refer to either axis; the code fixes it as elevation.
Row 13: the word "slightly" is ignored, giving 50. That contradicts the code's own plain() description bands.
Row 15: "three-quarter rear" is fixed at 135 (right side), although 225 is equally consistent with the prompt.

Each of these returns clear where asking the user could be justified.

5. Reasonable clarification, and output distribution versus accuracy.

Distribution: 7 clear (1, 4, 12, 13, 15, 16, 17), 6 ambiguous (2, 3, 6, 7, 10, 20), and 7 none (5, 8, 9, 11, 14, 18, 19).
Clear results: this mix says nothing about accuracy. By my proposed criteria, only rows 1 and 17 are clear and plainly right. Row 15 is right apart from the left/right convention. Rows 4 and 16 are wrong, and rows 12 and 13 are debatable.
Ambiguous results: rows 2, 7, 10 and 20 ask the user when the height or side really is missing, which is reasonable. Row 3 is ambiguous but points the wrong way, and row 6 asks with unrelated candidates.
None results: rows 11 and 14 are appropriate because they describe framing only. The other none rows (5, 8, 9, 18, 19) are vocabulary gaps.

Results for these fixed inputs match the executed output. Whether each result is suitable is my judgement for you to assess.

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
      "Suggested acceptable behaviour (proposal)",
      "Finding / uncertainty"
    ],
    [
      "1",
      "a cat, top-down view",
      "clear",
      "null",
      "90",
      "top-down",
      "Clear term phi 90; theta set to null because |phi| ≥ 80",
      "clear, theta null, phi 90",
      "Suitable."
    ],
    [
      "2",
      "a cat seen from above",
      "ambiguous",
      "—",
      "—",
      "from above",
      "Vague cue \"above\"; candidates (0,55), (325,40), (35,40)",
      "ambiguous / ask; the height is not stated",
      "Suitable. seen from (generic) is never reached because the vague cue returns first."
    ],
    [
      "3",
      "a cat looking up at the camera",
      "ambiguous",
      "—",
      "—",
      "looking up",
      "Vague cue \"below\"; candidates phi −45, −25, −25",
      "Camera is above the cat (phi > 0, exact value not stated) and roughly in front. Ambiguous with above-side candidates, or ask",
      "Wrong direction. looking up describes where the cat is looking (subject orientation), but the code reads it as the camera being below. Every candidate has the wrong sign."
    ],
    [
      "4",
      "a car door with a rear view mirror",
      "clear",
      "180",
      "null",
      "rear view",
      "Clear term \"back view\"",
      "none (the phrase names an object)",
      "False match. The substring rear view inside the object name \"rear view mirror\" was read as a viewpoint."
    ],
    [
      "5",
      "the cat turned away from the camera",
      "none",
      "—",
      "—",
      "—",
      "No lexicon or generic words",
      "Probably theta ≈ 180, phi null. \"Turned away\" may be partial, so asking is also acceptable",
      "Not covered by the vocabulary. The phrase gives subject orientation relative to the camera, which implies a camera direction."
    ],
    [
      "6",
      "shot from the camera behind the cat",
      "ambiguous",
      "—",
      "—",
      "shot from",
      "Generic fallback; candidates (0,10), (45,30), (0,90)",
      "theta 180, phi null; or ask with back-side candidates",
      "behind on its own is not in the lexicon (only from behind). None of the generic candidates is near the stated direction (180)."
    ],
    [
      "7",
      "an over the shoulder shot",
      "ambiguous",
      "—",
      "—",
      "over the shoulder",
      "Vague cue; candidates (160,25), (200,25), (180,40)",
      "ambiguous / ask",
      "Suitable. It is unclear which shoulder, whose shoulder, and what height."
    ],
    [
      "8",
      "the camera at 30 degrees elevation",
      "none",
      "—",
      "—",
      "—",
      "No numeric parsing; only \"45 …\" is in the lexicon",
      "clear, theta null, phi 30",
      "Not covered by the vocabulary. An explicit numeric elevation is dropped."
    ],
    [
      "9",
      "the cat from three-quarters behind",
      "none",
      "—",
      "—",
      "—",
      "three-quarter is rejected because the following s fails the word-boundary check in findWord; behind is not preceded by from",
      "Rear three-quarter view, phi null. Theta could be 135 or 225, so ask",
      "Not covered by the vocabulary (plural form, word order). Left/right is uncertain."
    ],
    [
      "10",
      "shot from the balcony above",
      "ambiguous",
      "—",
      "—",
      "from the balcony",
      "Vague cue \"above\"; same candidates as row 2",
      "ambiguous / ask",
      "Suitable. above and shot from are not used because the vague cue returns first."
    ],
    [
      "11",
      "a close-up of the cat's face",
      "none",
      "—",
      "—",
      "—",
      "No lexicon words",
      "none (this is framing)",
      "Suitable. \"Face\" might hint at a frontal view, but that is not enough to justify an angle."
    ],
    [
      "12",
      "a cat, 45 degree angle",
      "clear",
      "null",
      "45",
      "45 degree",
      "Clear term labelled \"45° high angle\"",
      "Ask: 45° could be elevation or azimuth (a three-quarter view)",
      "Ambiguous meaning. The lexicon assumes elevation; the prompt does not say which axis."
    ],
    [
      "13",
      "slightly high angle",
      "clear",
      "null",
      "50",
      "high angle",
      "high angle matched; slightly ignored",
      "High side, but lower than 50. Either a clear lower value or ask",
      "Inconsistent with the code's own descriptions. plain() would describe 50 as \"high angle\" and 10–29 as \"slightly high\". The modifier is lost."
    ],
    [
      "14",
      "portrait",
      "none",
      "—",
      "—",
      "—",
      "No lexicon words",
      "none (framing or orientation, not a viewpoint)",
      "Suitable."
    ],
    [
      "15",
      "a three-quarter rear view",
      "clear",
      "135",
      "null",
      "three-quarter rear",
      "18-character phrase matched before rear view (9) and consumes it",
      "Rear three-quarter view; theta could be 135 or 225",
      "The overlap is handled correctly here. Choosing the right-hand side (135) is a convention, not something the prompt states."
    ],
    [
      "16",
      "a 3/4 rear view",
      "clear",
      "180",
      "null",
      "rear view",
      "rear view (9 characters) is matched before 3/4 rear (8) and consumes \"rear\"; 3/4 rear and 3/4 view can no longer match",
      "Same as row 15",
      "Implementation error. It returns a straight back view and contradicts the code comment saying a three-quarter rear view is not also read as a rear view."
    ],
    [
      "17",
      "a rear view",
      "clear",
      "180",
      "null",
      "rear view",
      "Clear term \"back view\"",
      "clear, theta 180, phi null",
      "Suitable."
    ],
    [
      "18",
      "a portrait facing the camera",
      "none",
      "—",
      "—",
      "—",
      "facing is not in the lexicon; portrait is not handled",
      "theta ≈ 0, phi null; or ask",
      "Not covered by the vocabulary. \"Facing the camera\" is subject orientation that implies a frontal camera position. \"Portrait\" is framing."
    ],
    [
      "19",
      "a side-on view",
      "none",
      "—",
      "—",
      "—",
      "side view does not match \"side-on view\"",
      "Ask: side view, theta 90 or 270",
      "Not covered by the vocabulary. Even if it matched, the lexicon maps the unqualified \"side\" to 90 (right), which is a convention."
    ],
    [
      "20",
      "the cat seen from below",
      "ambiguous",
      "—",
      "—",
      "from below",
      "Vague cue \"below\"; candidates phi −45, −25, −25",
      "ambiguous / ask",
      "Suitable."
    ]
  ]
]
```
