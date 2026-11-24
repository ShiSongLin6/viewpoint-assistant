# Claude Haiku 5.5

Platform: University of Birmingham bAI

Date: 2026-11-17 (Europe/London)

Displayed selection: Selected model: Anthropic Claude Haiku 5.5

Chat: https://ai.bham.ac.uk/chat/onechat/eef4c139-b02c-77a7-e73c-c29af0319ec9

Prompt: ../01_uniform_prompt.md (identical text; 13,956 characters)

Status: completed response captured and model/chat attribution checked; execution claims are the model's own declaration.

## Original response (rendered text)

Execution status: STATIC PREDICTION. JavaScript was not executed. Every result below is a hand trace of the supplied viewpoint.js, and I did not check the SHA-256 or repository HEAD. No tests were run.

ID	Exact input	Predicted kind	theta	phi	Matched terms	Reason in code	Suggested acceptable behaviour (my proposal)	Finding / uncertainty
1	a cat, top-down view	clear	null	90	top-down	'top-down' sets phi 90; theta is nulled because |phi| ≥ 80	clear, phi 90, theta null	Matches intent under the convention.
2	a cat seen from above	ambiguous	—	—	from above	No clear hit; vague cue 'from above' gives candidates (0,55), (325,40), (35,40)	Ask for an angle; no unique value is justified	Clarification is reasonable. The candidate set is the code's choice.
3	a cat looking up at the camera	ambiguous	—	—	looking up	Vague 'looking up' → below group; candidates (0,−45), (325,−25), (35,−25)	Clarify whether the camera is low or only the cat's gaze is meant	"Looking up at the camera" describes subject gaze, but the code maps it to camera height. Subject orientation and camera position are conflated.
4	a car door with a rear view mirror	clear	180	null	rear view	'rear view' matches theta 180; 'mirror' is not in the lexicon	none (object name, not camera position)	False match: the substring 'rear view' inside the object name 'rear view mirror'.
5	the cat turned away from the camera	none	—	—	[]	No lexicon term; 'from the camera' is not listed; no generic word present	Clarify whether the subject faces away (roughly back view) or the camera is behind	Vocabulary gap. The none result is consistent with the code.
6	shot from the camera behind the cat	ambiguous (generic)	—	—	shot from	'behind the' is not in the lexicon and 'from behind' does not match; generic 'shot from' → candidates (0,10), (45,30), (0,90)	Clarify; "behind the cat" suggests a rear-side camera but gives no unique angle	Vocabulary gap. The first candidate (theta 0, front) contradicts "behind".
7	an over the shoulder shot	ambiguous (vague)	—	—	over the shoulder	Vague group; candidates (160,25), (200,25), (180,40)	Clarify, or offer the candidates	Candidates are plausible, but no explicit angle is stated.
8	the camera at 30 degrees elevation	none	—	—	[]	'30' and 'elevation' are not parsed; no numeric handling exists	clear, phi 30, theta null (explicit number given)	Explicit number ignored; returns none.
9	the cat from three-quarters behind	none	—	—	[]	'three-quarter' is rejected by the boundary check because it is followed by 's'; 'from behind' does not match	Clarify which side; the angle is between back and side	Plural form blocked by the word-boundary rule. Vocabulary gap.
10	shot from the balcony above	ambiguous (vague)	—	—	from the balcony	Vague 'from the balcony' → above group; candidates (0,55), (325,40), (35,40)	Clarify the height	Consistent. 'above' is not used; the vague cue wins over generic 'shot from'.
11	a close-up of the cat's face	none	—	—	[]	No term matches	none (framing, not viewpoint)	Correct to ignore for viewpoint.
12	a cat, 45 degree angle	clear	null	45	45 degree	'45 degree' → phi 45, label '45° high angle'	clear phi 45 if elevation is meant; otherwise clarify	"Angle" could mean rotation. The 'high angle' label is an assumption.
13	slightly high angle	clear	null	50	high angle	'high angle' → phi 50; 'slightly' is not in the lexicon	clarify, or a slight elevation (plain() treats 10–29 as slightly high)	Modifier silently dropped. Output 50 is inconsistent with plain()'s "slightly high" band.
14	portrait	none	—	—	[]	No term matches	none (framing/format)	Correct to return none.
15	a three-quarter rear view	clear	135	null	three-quarter rear	Longest phrase 'three-quarter rear' (18 chars) matched first and blanked; 'rear view' no longer present	clear theta 135, phi null	Matches intent.
16	a 3/4 rear view	clear	180	null	rear view	'rear view' (9 chars) is sorted before '3/4 rear' (8 chars) across groups, so it consumes the text first; '3/4 rear' is then gone	clear theta 135, phi null	Implementation error: output 180 contradicts the 3/4-rear entry (135).
17	a rear view	clear	180	null	rear view	Direct match	clear theta 180, phi null	Matches intent.
18	a portrait facing the camera	none	—	—	[]	'facing the camera' is not in the lexicon	clarify (subject orientation vs camera position)	Subject orientation is not modelled.
19	a side-on view	none	—	—	[]	'side-on' fails 'side view' and 'side-view'	clarify which side (90 or 270)	Vocabulary gap. Separately, 'side view' silently maps to 90 (right).
20	the cat seen from below	ambiguous (vague)	—	—	from below	Vague 'from below' → below group; candidates (0,−45), (325,−25), (35,−25)	Clarify the height	Consistent. 'seen from' is not used.

Findings

Implementation error (row 16). scan sorts all phrases by length across groups. 'rear view' (9) is consumed before '3/4 rear' (8), so the output is theta 180 where the lexicon intends 135. Static prediction only.
False match and conflation. Row 4: the substring 'rear view' inside 'rear view mirror' gives theta 180. Row 3: 'looking up' describes the subject's gaze but is mapped to camera elevation. Row 18 has the same subject-versus-camera issue.
Vocabulary gaps and silently dropped words. Row 8 ('30 degrees elevation') returns none despite an explicit number. Row 13 drops 'slightly'. Row 9 fails on 'three-quarters' because of the boundary check. Row 19 misses 'side-on'. Row 6 ('behind the cat') falls to generic candidates that include front.
Semantic ambiguity. 'side view' is fixed to 90 (right) although it could mean either side. 'high angle' is fixed to 50, while plain() treats 30–79 as a high angle. Row 12 assumes '45 degree angle' means elevation.
Distribution is not accuracy. The output is 7 clear, 6 ambiguous and 7 none. Of the 7 clear results, row 16 is wrong (implementation), row 4 is a false match, and row 13 drops a modifier. The clear-result count says nothing about correctness.

## Table cells (captured from rendered response)

```json
[
  [
    [
      "ID",
      "Exact input",
      "Predicted kind",
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
      "'top-down' sets phi 90; theta is nulled because |phi| ≥ 80",
      "clear, phi 90, theta null",
      "Matches intent under the convention."
    ],
    [
      "2",
      "a cat seen from above",
      "ambiguous",
      "—",
      "—",
      "from above",
      "No clear hit; vague cue 'from above' gives candidates (0,55), (325,40), (35,40)",
      "Ask for an angle; no unique value is justified",
      "Clarification is reasonable. The candidate set is the code's choice."
    ],
    [
      "3",
      "a cat looking up at the camera",
      "ambiguous",
      "—",
      "—",
      "looking up",
      "Vague 'looking up' → below group; candidates (0,−45), (325,−25), (35,−25)",
      "Clarify whether the camera is low or only the cat's gaze is meant",
      "\"Looking up at the camera\" describes subject gaze, but the code maps it to camera height. Subject orientation and camera position are conflated."
    ],
    [
      "4",
      "a car door with a rear view mirror",
      "clear",
      "180",
      "null",
      "rear view",
      "'rear view' matches theta 180; 'mirror' is not in the lexicon",
      "none (object name, not camera position)",
      "False match: the substring 'rear view' inside the object name 'rear view mirror'."
    ],
    [
      "5",
      "the cat turned away from the camera",
      "none",
      "—",
      "—",
      "[]",
      "No lexicon term; 'from the camera' is not listed; no generic word present",
      "Clarify whether the subject faces away (roughly back view) or the camera is behind",
      "Vocabulary gap. The none result is consistent with the code."
    ],
    [
      "6",
      "shot from the camera behind the cat",
      "ambiguous (generic)",
      "—",
      "—",
      "shot from",
      "'behind the' is not in the lexicon and 'from behind' does not match; generic 'shot from' → candidates (0,10), (45,30), (0,90)",
      "Clarify; \"behind the cat\" suggests a rear-side camera but gives no unique angle",
      "Vocabulary gap. The first candidate (theta 0, front) contradicts \"behind\"."
    ],
    [
      "7",
      "an over the shoulder shot",
      "ambiguous (vague)",
      "—",
      "—",
      "over the shoulder",
      "Vague group; candidates (160,25), (200,25), (180,40)",
      "Clarify, or offer the candidates",
      "Candidates are plausible, but no explicit angle is stated."
    ],
    [
      "8",
      "the camera at 30 degrees elevation",
      "none",
      "—",
      "—",
      "[]",
      "'30' and 'elevation' are not parsed; no numeric handling exists",
      "clear, phi 30, theta null (explicit number given)",
      "Explicit number ignored; returns none."
    ],
    [
      "9",
      "the cat from three-quarters behind",
      "none",
      "—",
      "—",
      "[]",
      "'three-quarter' is rejected by the boundary check because it is followed by 's'; 'from behind' does not match",
      "Clarify which side; the angle is between back and side",
      "Plural form blocked by the word-boundary rule. Vocabulary gap."
    ],
    [
      "10",
      "shot from the balcony above",
      "ambiguous (vague)",
      "—",
      "—",
      "from the balcony",
      "Vague 'from the balcony' → above group; candidates (0,55), (325,40), (35,40)",
      "Clarify the height",
      "Consistent. 'above' is not used; the vague cue wins over generic 'shot from'."
    ],
    [
      "11",
      "a close-up of the cat's face",
      "none",
      "—",
      "—",
      "[]",
      "No term matches",
      "none (framing, not viewpoint)",
      "Correct to ignore for viewpoint."
    ],
    [
      "12",
      "a cat, 45 degree angle",
      "clear",
      "null",
      "45",
      "45 degree",
      "'45 degree' → phi 45, label '45° high angle'",
      "clear phi 45 if elevation is meant; otherwise clarify",
      "\"Angle\" could mean rotation. The 'high angle' label is an assumption."
    ],
    [
      "13",
      "slightly high angle",
      "clear",
      "null",
      "50",
      "high angle",
      "'high angle' → phi 50; 'slightly' is not in the lexicon",
      "clarify, or a slight elevation (plain() treats 10–29 as slightly high)",
      "Modifier silently dropped. Output 50 is inconsistent with plain()'s \"slightly high\" band."
    ],
    [
      "14",
      "portrait",
      "none",
      "—",
      "—",
      "[]",
      "No term matches",
      "none (framing/format)",
      "Correct to return none."
    ],
    [
      "15",
      "a three-quarter rear view",
      "clear",
      "135",
      "null",
      "three-quarter rear",
      "Longest phrase 'three-quarter rear' (18 chars) matched first and blanked; 'rear view' no longer present",
      "clear theta 135, phi null",
      "Matches intent."
    ],
    [
      "16",
      "a 3/4 rear view",
      "clear",
      "180",
      "null",
      "rear view",
      "'rear view' (9 chars) is sorted before '3/4 rear' (8 chars) across groups, so it consumes the text first; '3/4 rear' is then gone",
      "clear theta 135, phi null",
      "Implementation error: output 180 contradicts the 3/4-rear entry (135)."
    ],
    [
      "17",
      "a rear view",
      "clear",
      "180",
      "null",
      "rear view",
      "Direct match",
      "clear theta 180, phi null",
      "Matches intent."
    ],
    [
      "18",
      "a portrait facing the camera",
      "none",
      "—",
      "—",
      "[]",
      "'facing the camera' is not in the lexicon",
      "clarify (subject orientation vs camera position)",
      "Subject orientation is not modelled."
    ],
    [
      "19",
      "a side-on view",
      "none",
      "—",
      "—",
      "[]",
      "'side-on' fails 'side view' and 'side-view'",
      "clarify which side (90 or 270)",
      "Vocabulary gap. Separately, 'side view' silently maps to 90 (right)."
    ],
    [
      "20",
      "the cat seen from below",
      "ambiguous (vague)",
      "—",
      "—",
      "from below",
      "Vague 'from below' → below group; candidates (0,−45), (325,−25), (35,−25)",
      "Clarify the height",
      "Consistent. 'seen from' is not used."
    ]
  ]
]
```
