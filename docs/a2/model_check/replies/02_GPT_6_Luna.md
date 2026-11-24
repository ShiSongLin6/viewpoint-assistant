# GPT-6 Luna

Platform: University of Birmingham bAI

Date: 2026-11-17 (Europe/London)

Displayed selection: Selected model: OpenAI GPT-6 Luna

Chat: https://ai.bham.ac.uk/chat/onechat/322e30ca-3b65-bae6-13d4-03e4b9f069ac

Prompt: ../01_uniform_prompt.md (identical text; 13,956 characters)

Status: response captured; model assertions not independently endorsed.

## Original response (rendered text)

STATIC PREDICTION — JavaScript was not executed; Node.js is unavailable in this environment.

ID	Exact input	Predicted or executed kind	theta	phi	Matched terms	Reason in code	Suggested acceptable behaviour (proposal, not ground truth)	Finding / uncertainty
1	a cat, top-down view	clear	null	90	top-down	Clear term sets phi to 90; for near-vertical views, theta is then set to null.	Accept top-down with azimuth unspecified.	The parser treats azimuth as irrelevant for a directly overhead view.
2	a cat seen from above	ambiguous	—	—	from above	Vague cue returns candidates (0, 55), (325, 40), (35, 40).	Ask for the desired azimuth and exact elevation.	“Above” does not specify one full viewpoint.
3	a cat looking up at the camera	ambiguous	—	—	looking up	Vague cue maps looking up to below-subject candidates: (0, -45), (325, -25), (35, -25).	Clarify the camera position; the phrase may describe the cat’s gaze, not the camera angle.	Semantic mismatch risk: subject orientation and camera position are distinct.
4	a car door with a rear view mirror	clear	180	null	rear view	The clear phrase rear view matches inside rear view mirror and sets theta to 180.	Treat as no viewpoint specified, or clarify whether a rear camera view was intended.	False match: rear view is part of the object name, not necessarily a camera instruction.
5	the cat turned away from the camera	none	—	—	[]	turned away is not a clear, vague, or generic term.	Clarify whether a camera viewpoint is requested; this may only describe the cat’s orientation.	Subject orientation alone does not determine camera position.
6	shot from the camera behind the cat	clear	180	null	from behind	Clear term sets theta to 180; phi is not specified.	Accept a rear camera position with elevation unspecified.	The wording explicitly places the camera behind the cat.
7	an over the shoulder shot	ambiguous	—	—	over the shoulder	Vague cue returns candidates (160, 25), (200, 25), (180, 40).	Ask for the intended camera position; the cue does not specify one exact angle.	The shoulder/subject reference and exact angle are not fixed.
8	the camera at 30 degrees elevation	none	—	—	[]	elevation and degrees are not recognized terms; angle is absent, so no generic cue matches either.	Assuming elevation is measured from horizontal, accept phi 30 and leave theta unspecified.	Clear-sounding numeric elevation is not covered by the lexicon.
9	the cat from three-quarters behind	none	—	—	[]	three-quarter does not match three-quarters because the trailing s breaks the whole-word boundary; from behind is not contiguous.	Clarify which rear quarter is intended and the desired angle.	Likely suggests an oblique rear view, but the parser has no matching phrase and the side is unspecified.
10	shot from the balcony above	ambiguous	—	—	from the balcony	Vague cue returns candidates (0, 55), (325, 40), (35, 40); above is not a separate matching phrase here.	Ask for the exact camera angle.	Balcony vantage does not uniquely determine azimuth or elevation.
11	a close-up of the cat's face	none	—	—	[]	Framing and subject words do not match any viewpoint terms.	Treat as a framing request, not a viewpoint; clarify if an angle is also wanted.	Close-up describes framing, not camera position.
12	a cat, 45 degree angle	clear	null	45	45 degree	Clear term maps any matched 45-degree phrase to phi 45; theta is not specified.	Ask which axis the 45° refers to; if elevation is intended, phi 45 is suitable.	The parser assumes elevation even though “angle” does not name an axis.
13	slightly high angle	clear	null	50	high angle	high angle matches; slightly is ignored, and the clear term sets phi to 50.	Preserve the qualitative “slightly high” intent, or ask for a numeric elevation if required.	The output may overstate the requested height.
14	portrait	none	—	—	[]	portrait is not a recognized viewpoint or generic term.	Treat as framing/orientation, not a viewpoint; clarify if camera angle is intended.	Portrait does not identify a camera angle.
15	a three-quarter rear view	clear	135	null	three-quarter rear	The longer three-quarter rear phrase matches and sets theta to 135. It consumes rear, so rear view cannot also match.	Preserve a three-quarter rear view but clarify which side, unless a fixed side convention is intended.	The phrase does not specify left versus right; the code selects 135.
16	a 3/4 rear view	clear	135	null	3/4 rear	The longer 3/4 rear phrase matches and sets theta to 135; it consumes 3/4, preventing 3/4 view from matching.	Preserve a three-quarter rear view but clarify which side, unless a fixed side convention is intended.	Same side ambiguity as row 15.
17	a rear view	clear	180	null	rear view	Clear term sets theta to 180; phi is not specified.	Accept a rear view with elevation unspecified.	Reasonable if “rear” is relative to the subject’s orientation.
18	a portrait facing the camera	none	—	—	[]	Neither portrait nor facing the camera matches a viewpoint term.	Clarify whether a frontal camera viewpoint is intended; the wording may describe the subject’s orientation.	Facing the camera suggests, but does not unambiguously encode, camera position.
19	a side-on view	none	—	—	[]	side-on does not match side view, side-view, or the other listed side phrases.	Clarify the desired side if a specific azimuth is required; “profile” alone may leave left/right open.	Vocabulary gap; the parser does not recognize this wording.
20	the cat seen from below	ambiguous	—	—	from below	Vague cue returns candidates (0, -45), (325, -25), (35, -25).	Ask for exact azimuth and elevation.	“Below” indicates a direction but not one exact viewpoint.

Significant findings

Implementation / false match: Row 4 matches rear view inside rear view mirror, yielding theta 180 even though the phrase may only name an object.
Vocabulary coverage: Rows 8, 9, and 19 return none: the parser lacks the elevation wording in row 8, rejects three-quarters at the whole-word boundary in row 9, and lacks side-on in row 19.
Semantic ambiguity: Row 3 treats looking up as a camera-below cue, although it can describe the cat’s gaze. Rows 5 and 18 also describe subject orientation without unambiguously locating the camera.
Overprecision and overlap: Row 12 maps an unqualified 45° angle to phi 45; row 13 ignores slightly and maps high angle to phi 50. In rows 15–16, the longer rear-quarter phrase consumes its text first, so the shorter overlapping rear/three-quarter phrase cannot match.
Clarification and distribution: Clarification is reasonable for the ambiguous cases where no unique full angle is stated. Predicted distribution: 8 clear, 5 ambiguous, 7 none. This is an output count, not an accuracy measure; no reference labels were supplied.

## Table cells (captured from rendered response)

```json
[
  [
    [
      "ID",
      "Exact input",
      "Predicted or executed kind",
      "theta",
      "phi",
      "Matched terms",
      "Reason in code",
      "Suggested acceptable behaviour (proposal, not ground truth)",
      "Finding / uncertainty"
    ],
    [
      "1",
      "a cat, top-down view",
      "clear",
      "null",
      "90",
      "top-down",
      "Clear term sets phi to 90; for near-vertical views, theta is then set to null.",
      "Accept top-down with azimuth unspecified.",
      "The parser treats azimuth as irrelevant for a directly overhead view."
    ],
    [
      "2",
      "a cat seen from above",
      "ambiguous",
      "—",
      "—",
      "from above",
      "Vague cue returns candidates (0, 55), (325, 40), (35, 40).",
      "Ask for the desired azimuth and exact elevation.",
      "“Above” does not specify one full viewpoint."
    ],
    [
      "3",
      "a cat looking up at the camera",
      "ambiguous",
      "—",
      "—",
      "looking up",
      "Vague cue maps looking up to below-subject candidates: (0, -45), (325, -25), (35, -25).",
      "Clarify the camera position; the phrase may describe the cat’s gaze, not the camera angle.",
      "Semantic mismatch risk: subject orientation and camera position are distinct."
    ],
    [
      "4",
      "a car door with a rear view mirror",
      "clear",
      "180",
      "null",
      "rear view",
      "The clear phrase rear view matches inside rear view mirror and sets theta to 180.",
      "Treat as no viewpoint specified, or clarify whether a rear camera view was intended.",
      "False match: rear view is part of the object name, not necessarily a camera instruction."
    ],
    [
      "5",
      "the cat turned away from the camera",
      "none",
      "—",
      "—",
      "[]",
      "turned away is not a clear, vague, or generic term.",
      "Clarify whether a camera viewpoint is requested; this may only describe the cat’s orientation.",
      "Subject orientation alone does not determine camera position."
    ],
    [
      "6",
      "shot from the camera behind the cat",
      "clear",
      "180",
      "null",
      "from behind",
      "Clear term sets theta to 180; phi is not specified.",
      "Accept a rear camera position with elevation unspecified.",
      "The wording explicitly places the camera behind the cat."
    ],
    [
      "7",
      "an over the shoulder shot",
      "ambiguous",
      "—",
      "—",
      "over the shoulder",
      "Vague cue returns candidates (160, 25), (200, 25), (180, 40).",
      "Ask for the intended camera position; the cue does not specify one exact angle.",
      "The shoulder/subject reference and exact angle are not fixed."
    ],
    [
      "8",
      "the camera at 30 degrees elevation",
      "none",
      "—",
      "—",
      "[]",
      "elevation and degrees are not recognized terms; angle is absent, so no generic cue matches either.",
      "Assuming elevation is measured from horizontal, accept phi 30 and leave theta unspecified.",
      "Clear-sounding numeric elevation is not covered by the lexicon."
    ],
    [
      "9",
      "the cat from three-quarters behind",
      "none",
      "—",
      "—",
      "[]",
      "three-quarter does not match three-quarters because the trailing s breaks the whole-word boundary; from behind is not contiguous.",
      "Clarify which rear quarter is intended and the desired angle.",
      "Likely suggests an oblique rear view, but the parser has no matching phrase and the side is unspecified."
    ],
    [
      "10",
      "shot from the balcony above",
      "ambiguous",
      "—",
      "—",
      "from the balcony",
      "Vague cue returns candidates (0, 55), (325, 40), (35, 40); above is not a separate matching phrase here.",
      "Ask for the exact camera angle.",
      "Balcony vantage does not uniquely determine azimuth or elevation."
    ],
    [
      "11",
      "a close-up of the cat's face",
      "none",
      "—",
      "—",
      "[]",
      "Framing and subject words do not match any viewpoint terms.",
      "Treat as a framing request, not a viewpoint; clarify if an angle is also wanted.",
      "Close-up describes framing, not camera position."
    ],
    [
      "12",
      "a cat, 45 degree angle",
      "clear",
      "null",
      "45",
      "45 degree",
      "Clear term maps any matched 45-degree phrase to phi 45; theta is not specified.",
      "Ask which axis the 45° refers to; if elevation is intended, phi 45 is suitable.",
      "The parser assumes elevation even though “angle” does not name an axis."
    ],
    [
      "13",
      "slightly high angle",
      "clear",
      "null",
      "50",
      "high angle",
      "high angle matches; slightly is ignored, and the clear term sets phi to 50.",
      "Preserve the qualitative “slightly high” intent, or ask for a numeric elevation if required.",
      "The output may overstate the requested height."
    ],
    [
      "14",
      "portrait",
      "none",
      "—",
      "—",
      "[]",
      "portrait is not a recognized viewpoint or generic term.",
      "Treat as framing/orientation, not a viewpoint; clarify if camera angle is intended.",
      "Portrait does not identify a camera angle."
    ],
    [
      "15",
      "a three-quarter rear view",
      "clear",
      "135",
      "null",
      "three-quarter rear",
      "The longer three-quarter rear phrase matches and sets theta to 135. It consumes rear, so rear view cannot also match.",
      "Preserve a three-quarter rear view but clarify which side, unless a fixed side convention is intended.",
      "The phrase does not specify left versus right; the code selects 135."
    ],
    [
      "16",
      "a 3/4 rear view",
      "clear",
      "135",
      "null",
      "3/4 rear",
      "The longer 3/4 rear phrase matches and sets theta to 135; it consumes 3/4, preventing 3/4 view from matching.",
      "Preserve a three-quarter rear view but clarify which side, unless a fixed side convention is intended.",
      "Same side ambiguity as row 15."
    ],
    [
      "17",
      "a rear view",
      "clear",
      "180",
      "null",
      "rear view",
      "Clear term sets theta to 180; phi is not specified.",
      "Accept a rear view with elevation unspecified.",
      "Reasonable if “rear” is relative to the subject’s orientation."
    ],
    [
      "18",
      "a portrait facing the camera",
      "none",
      "—",
      "—",
      "[]",
      "Neither portrait nor facing the camera matches a viewpoint term.",
      "Clarify whether a frontal camera viewpoint is intended; the wording may describe the subject’s orientation.",
      "Facing the camera suggests, but does not unambiguously encode, camera position."
    ],
    [
      "19",
      "a side-on view",
      "none",
      "—",
      "—",
      "[]",
      "side-on does not match side view, side-view, or the other listed side phrases.",
      "Clarify the desired side if a specific azimuth is required; “profile” alone may leave left/right open.",
      "Vocabulary gap; the parser does not recognize this wording."
    ],
    [
      "20",
      "the cat seen from below",
      "ambiguous",
      "—",
      "—",
      "from below",
      "Vague cue returns candidates (0, -45), (325, -25), (35, -25).",
      "Ask for exact azimuth and elevation.",
      "“Below” indicates a direction but not one exact viewpoint."
    ]
  ]
]
```
