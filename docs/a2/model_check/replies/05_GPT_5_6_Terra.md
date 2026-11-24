# GPT-5.6 Terra

Platform: University of Birmingham bAI

Date: 2026-11-17 (Europe/London)

Displayed selection: Selected model: OpenAI GPT-5.6 Terra

Chat: https://ai.bham.ac.uk/chat/onechat/9bb0e9ec-a115-810f-7460-22bde480c5a8

Prompt: ../01_uniform_prompt.md (identical text; 13,956 characters)

Status: response captured; model assertions not independently endorsed.

## Original response (rendered text)

STATIC PREDICTION — JavaScript execution was unavailable in this environment (node is not installed). The results below are derived from the supplied source only; no tests were run.

ID	Exact input	Predicted or executed kind	theta	phi	Matched terms	Reason in code	Suggested acceptable behaviour	Finding / uncertainty
1	a cat, top-down view	Predicted clear	null	90	top-down	Clear term sets phi: 90; code clears theta for 
∣
𝜙
∣
≥
80
∣ϕ∣≥80.	Proposal: clear top-down elevation; azimuth is irrelevant.	No issue apparent.
2	a cat seen from above	Predicted ambiguous	—	—	from above	Vague cue returns its three above-subject candidates.	Proposal: ask for a height/angle; “from above” does not justify one exact elevation.	Reasonable clarification.
3	a cat looking up at the camera	Predicted ambiguous	—	—	looking up	Vague cue treats looking up as a camera-below-subject cue.	Proposal: do not infer camera position from the cat’s gaze; return none or ask whether camera viewpoint is intended.	Semantic error: substring/phrase looking up describes subject orientation here, not necessarily viewpoint.
4	a car door with a rear view mirror	Predicted clear	180	null	rear view	Clear phrase rear view matches inside rear view mirror.	Proposal: none: this names an object, not a requested camera angle.	False match: rear view in rear view mirror.
5	the cat turned away from the camera	Predicted none	—	—	—	No clear, vague, or generic phrase matches.	Proposal: none or clarification; subject orientation does not by itself specify camera position.	Reasonable strict behaviour.
6	shot from the camera behind the cat	Predicted ambiguous	—	—	shot from	No contiguous from behind; generic phrase shot from produces generic candidates.	Proposal: interpret/clarify camera-behind-subject as rear view, 
𝜃
=
180
θ=180, if that wording is deliberately supported.	Vocabulary/phrase-structure gap: only contiguous from behind is recognised.
7	an over the shoulder shot	Predicted ambiguous	—	—	over the shoulder	Vague cue returns behind-and-above candidates.	Proposal: ask for the desired side and elevation.	Reasonable clarification; over-the-shoulder does not uniquely set an angle.
8	the camera at 30 degrees elevation	Predicted none	—	—	—	Numeric elevations are not parsed; no generic word matches.	Proposal: clear with theta: null, phi: 30, assuming “elevation” has its defined angular meaning.	Vocabulary/number-parsing coverage gap.
9	the cat from three-quarters behind	Predicted none	—	—	—	three-quarters behind is not a listed phrase; from behind is not contiguous.	Proposal: clarify left-versus-right rear-quarter, rather than assign one azimuth.	Coverage gap; even if recognised, “three-quarters behind” can leave lateral side unspecified.
10	shot from the balcony above	Predicted ambiguous	—	—	shot from	from the balcony is not present because the input omits the; generic shot from is then used.	Proposal: ambiguity for an elevated camera; request an elevation if exact positioning is required.	Vocabulary sensitivity: from the balcony would match, but from balcony does not.
11	a close-up of the cat's face	Predicted none	—	—	—	No listed viewpoint term occurs.	Proposal: none; close-up and face are framing/object information, not a camera angle.	Appropriate separation of framing from viewpoint.
12	a cat, 45 degree angle	Predicted clear	null	45	45 degree	Clear phrase maps every 45 degree occurrence to phi: 45.	Proposal: ask whether 45 degrees means elevation, azimuth, or another composition instruction.	Semantic ambiguity: the numerical angle has no stated axis, but implementation assumes elevation.
13	slightly high angle	Predicted clear	null	50	high angle	high angle matches as a phrase within the input and sets phi: 50.	Proposal: clarify or preserve it as an approximate high elevation; “slightly” does not support exactly 50 degrees.	False/over-broad partial match: high angle consumes the latter part of slightly high angle, discarding the modifier.
14	portrait	Predicted none	—	—	—	No term matches.	Proposal: none; portrait is a format/framing description, not a viewpoint.	Appropriate strict behaviour.
15	a three-quarter rear view	Predicted clear	135	null	three-quarter rear	Longer clear phrase matches before rear view, consuming three-quarter rear.	Proposal: clarify/declare a handedness convention; a rear three-quarter view can be left- or right-rear.	Overlap handling is intentional: three-quarter rear is consumed first, so rear view cannot also match. Semantic lateral-side ambiguity remains.
16	a 3/4 rear view	Predicted clear	135	null	3/4 rear	Listed clear variant matches and is consumed before rear view.	Proposal: same as row 15: clarify/declare lateral-side convention.	Same overlap behaviour and lateral-side ambiguity as row 15.
17	a rear view	Predicted clear	180	null	rear view	Clear phrase maps to theta: 180.	Proposal: clear rear azimuth, with elevation unspecified.	No issue apparent under the supplied azimuth convention.
18	a portrait facing the camera	Predicted none	—	—	—	No listed phrase covers facing the camera; portrait is not generic.	Proposal: none or clarification: subject-facing direction and camera position are distinct inputs.	Reasonable strict handling; mapping this automatically to front view would conflate subject orientation with viewpoint.
19	a side-on view	Predicted none	—	—	—	side view does not match through -on; plain view is not generic.	Proposal: clarify left versus right side; if the system supports an unhanded side view, retain ambiguity rather than choose 90.	Vocabulary gap: side-on view is unsupported.
20	the cat seen from below	Predicted ambiguous	—	—	from below	Vague cue returns its three below-subject candidates.	Proposal: ask for a height/angle; “from below” is not exact.	Reasonable clarification.
Significant findings

Implementation errors / false matches

rear view in row 4 is interpreted as 
𝜃
=
180
θ=180 even though it occurs in the object name “rear view mirror.”
looking up in row 3 is interpreted as a camera-below cue, although it describes the cat’s orientation/gaze in this input.
high angle in row 13 is matched inside “slightly high angle,” causing the modifier “slightly” to be ignored.

Vocabulary and syntactic coverage

Explicit numeric elevation in row 8 (30 degrees elevation) is unsupported.
Row 6 supports contiguous from behind, but not from the camera behind.
Row 10 supports from the balcony, but not from balcony.
Row 19 does not recognise side-on view.
Row 9 does not recognise plural three-quarters behind.

Semantic ambiguity

Row 12 maps 45 degree directly to 
𝜙
=
45
ϕ=45 even though the input does not state whether the number is elevation or azimuth.
Rows 15–16 assign 
𝜃
=
135
θ=135 to rear three-quarter wording. The wording does not itself state whether the camera is rear-right or rear-left, unless the application explicitly defines an asymmetric convention.

Overlapping phrase handling

In rows 15–16, three-quarter rear / 3/4 rear is longer than rear view, so it is scanned and blanked first. rear view therefore cannot subsequently match. This produces a single clear term rather than a direction conflict.

Output distribution is not accuracy

Predicted distribution: 7 clear, 5 ambiguous, 8 none.
That distribution alone does not establish correctness: rows 3, 4, 12, and 13 show that a clear or ambiguous result can still be semantically unsuitable for the user’s actual request.

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
      "Suggested acceptable behaviour",
      "Finding / uncertainty"
    ],
    [
      "1",
      "a cat, top-down view",
      "Predicted clear",
      "null",
      "90",
      "top-down",
      "Clear term sets phi: 90; code clears theta for \n∣\n𝜙\n∣\n≥\n80\n∣ϕ∣≥80.",
      "Proposal: clear top-down elevation; azimuth is irrelevant.",
      "No issue apparent."
    ],
    [
      "2",
      "a cat seen from above",
      "Predicted ambiguous",
      "—",
      "—",
      "from above",
      "Vague cue returns its three above-subject candidates.",
      "Proposal: ask for a height/angle; “from above” does not justify one exact elevation.",
      "Reasonable clarification."
    ],
    [
      "3",
      "a cat looking up at the camera",
      "Predicted ambiguous",
      "—",
      "—",
      "looking up",
      "Vague cue treats looking up as a camera-below-subject cue.",
      "Proposal: do not infer camera position from the cat’s gaze; return none or ask whether camera viewpoint is intended.",
      "Semantic error: substring/phrase looking up describes subject orientation here, not necessarily viewpoint."
    ],
    [
      "4",
      "a car door with a rear view mirror",
      "Predicted clear",
      "180",
      "null",
      "rear view",
      "Clear phrase rear view matches inside rear view mirror.",
      "Proposal: none: this names an object, not a requested camera angle.",
      "False match: rear view in rear view mirror."
    ],
    [
      "5",
      "the cat turned away from the camera",
      "Predicted none",
      "—",
      "—",
      "—",
      "No clear, vague, or generic phrase matches.",
      "Proposal: none or clarification; subject orientation does not by itself specify camera position.",
      "Reasonable strict behaviour."
    ],
    [
      "6",
      "shot from the camera behind the cat",
      "Predicted ambiguous",
      "—",
      "—",
      "shot from",
      "No contiguous from behind; generic phrase shot from produces generic candidates.",
      "Proposal: interpret/clarify camera-behind-subject as rear view, \n𝜃\n=\n180\nθ=180, if that wording is deliberately supported.",
      "Vocabulary/phrase-structure gap: only contiguous from behind is recognised."
    ],
    [
      "7",
      "an over the shoulder shot",
      "Predicted ambiguous",
      "—",
      "—",
      "over the shoulder",
      "Vague cue returns behind-and-above candidates.",
      "Proposal: ask for the desired side and elevation.",
      "Reasonable clarification; over-the-shoulder does not uniquely set an angle."
    ],
    [
      "8",
      "the camera at 30 degrees elevation",
      "Predicted none",
      "—",
      "—",
      "—",
      "Numeric elevations are not parsed; no generic word matches.",
      "Proposal: clear with theta: null, phi: 30, assuming “elevation” has its defined angular meaning.",
      "Vocabulary/number-parsing coverage gap."
    ],
    [
      "9",
      "the cat from three-quarters behind",
      "Predicted none",
      "—",
      "—",
      "—",
      "three-quarters behind is not a listed phrase; from behind is not contiguous.",
      "Proposal: clarify left-versus-right rear-quarter, rather than assign one azimuth.",
      "Coverage gap; even if recognised, “three-quarters behind” can leave lateral side unspecified."
    ],
    [
      "10",
      "shot from the balcony above",
      "Predicted ambiguous",
      "—",
      "—",
      "shot from",
      "from the balcony is not present because the input omits the; generic shot from is then used.",
      "Proposal: ambiguity for an elevated camera; request an elevation if exact positioning is required.",
      "Vocabulary sensitivity: from the balcony would match, but from balcony does not."
    ],
    [
      "11",
      "a close-up of the cat's face",
      "Predicted none",
      "—",
      "—",
      "—",
      "No listed viewpoint term occurs.",
      "Proposal: none; close-up and face are framing/object information, not a camera angle.",
      "Appropriate separation of framing from viewpoint."
    ],
    [
      "12",
      "a cat, 45 degree angle",
      "Predicted clear",
      "null",
      "45",
      "45 degree",
      "Clear phrase maps every 45 degree occurrence to phi: 45.",
      "Proposal: ask whether 45 degrees means elevation, azimuth, or another composition instruction.",
      "Semantic ambiguity: the numerical angle has no stated axis, but implementation assumes elevation."
    ],
    [
      "13",
      "slightly high angle",
      "Predicted clear",
      "null",
      "50",
      "high angle",
      "high angle matches as a phrase within the input and sets phi: 50.",
      "Proposal: clarify or preserve it as an approximate high elevation; “slightly” does not support exactly 50 degrees.",
      "False/over-broad partial match: high angle consumes the latter part of slightly high angle, discarding the modifier."
    ],
    [
      "14",
      "portrait",
      "Predicted none",
      "—",
      "—",
      "—",
      "No term matches.",
      "Proposal: none; portrait is a format/framing description, not a viewpoint.",
      "Appropriate strict behaviour."
    ],
    [
      "15",
      "a three-quarter rear view",
      "Predicted clear",
      "135",
      "null",
      "three-quarter rear",
      "Longer clear phrase matches before rear view, consuming three-quarter rear.",
      "Proposal: clarify/declare a handedness convention; a rear three-quarter view can be left- or right-rear.",
      "Overlap handling is intentional: three-quarter rear is consumed first, so rear view cannot also match. Semantic lateral-side ambiguity remains."
    ],
    [
      "16",
      "a 3/4 rear view",
      "Predicted clear",
      "135",
      "null",
      "3/4 rear",
      "Listed clear variant matches and is consumed before rear view.",
      "Proposal: same as row 15: clarify/declare lateral-side convention.",
      "Same overlap behaviour and lateral-side ambiguity as row 15."
    ],
    [
      "17",
      "a rear view",
      "Predicted clear",
      "180",
      "null",
      "rear view",
      "Clear phrase maps to theta: 180.",
      "Proposal: clear rear azimuth, with elevation unspecified.",
      "No issue apparent under the supplied azimuth convention."
    ],
    [
      "18",
      "a portrait facing the camera",
      "Predicted none",
      "—",
      "—",
      "—",
      "No listed phrase covers facing the camera; portrait is not generic.",
      "Proposal: none or clarification: subject-facing direction and camera position are distinct inputs.",
      "Reasonable strict handling; mapping this automatically to front view would conflate subject orientation with viewpoint."
    ],
    [
      "19",
      "a side-on view",
      "Predicted none",
      "—",
      "—",
      "—",
      "side view does not match through -on; plain view is not generic.",
      "Proposal: clarify left versus right side; if the system supports an unhanded side view, retain ambiguity rather than choose 90.",
      "Vocabulary gap: side-on view is unsupported."
    ],
    [
      "20",
      "the cat seen from below",
      "Predicted ambiguous",
      "—",
      "—",
      "from below",
      "Vague cue returns its three below-subject candidates.",
      "Proposal: ask for a height/angle; “from below” is not exact.",
      "Reasonable clarification."
    ]
  ]
]
```
