# GPT-5.6 Luna

Platform: University of Birmingham bAI

Date: 2026-11-17 (Europe/London)

Displayed selection: Selected model: OpenAI GPT-5.6 Luna

Chat: https://ai.bham.ac.uk/chat/onechat/2990790c-ba09-d71e-35ef-b4419889fa99

Prompt: ../01_uniform_prompt.md (identical text; 13,956 characters)

Status: response captured; model assertions not independently endorsed.

## Original response (rendered text)

STATIC PREDICTION — JavaScript was not executed, so no tests were run.

ID	Exact input	Predicted or executed kind	theta	phi	Matched terms	Reason in code	Suggested acceptable behaviour	Finding / uncertainty
1	a cat, top-down view	Predicted clear	null	90	top-down	Clear term sets phi = 90; vertical view then forces theta = null.	Proposal: clear top-down view with no azimuth.	Implementation behaves consistently with the vertical-view rule.
2	a cat seen from above	Predicted ambiguous	—	—	from above	Vague cue produces candidates (0,55), (325,40), (35,40).	Proposal: ask for a specific angle or present these candidate positions.	“From above” does not determine one azimuth or elevation.
3	a cat looking up at the camera	Predicted ambiguous	—	—	looking up	Vague cue is interpreted as “somewhere below the subject”; candidates ((0,-45), (325,-25), (35,-25)).	Proposal: distinguish subject orientation from camera position; ask whether the camera is below the cat.	Semantic ambiguity: “cat looking up” describes the subject, not necessarily the camera.
4	a car door with a rear view mirror	Predicted clear	180	null	rear view	The clear scanner matches the substring rear view inside “rear view mirror”.	Proposal: avoid treating an object name such as “rear view mirror” as a viewpoint request.	False match caused by the substring rear view; likely implementation/vocabulary boundary issue.
5	the cat turned away from the camera	Predicted none	—	—	—	No clear term, vague cue, or generic viewpoint word matches.	Proposal: treat “turned away” as subject orientation, or ask whether a rear camera view is intended.	Semantic ambiguity; no viewpoint is justified from the wording alone.
6	shot from the camera behind the cat	Predicted ambiguous	—	—	shot from	from behind does not match because “camera” occurs between from and behind; generic shot from produces candidates ((0,10), (45,30), (0,90)).	Proposal: recognise the intended camera-behind relation, while clarifying left/right three-quarter position if needed.	Vocabulary/phrase coverage gap; the available phrase is not contiguous.
7	an over the shoulder shot	Predicted ambiguous	—	—	over the shoulder	Vague cue produces candidates ((160,25), (200,25), (180,40)).	Proposal: retain ambiguity and ask for the intended shoulder/angle.	Reasonable clarification; over-the-shoulder does not specify one exact azimuth.
8	the camera at 30 degrees elevation	Predicted none	—	—	—	The lexicon supports 45 degrees but not 30 degrees or elevation; no generic viewpoint term matches.	Proposal: parse the explicit elevation as phi = 30, with unspecified theta.	Vocabulary coverage gap; the numeric elevation is clear to a human but unsupported here.
9	the cat from three-quarters behind	Predicted none	—	—	—	three-quarter rear and three-quarter do not match plural three-quarters; from behind is not present.	Proposal: clarify or support the intended rear three-quarter view, noting that left/right remains unspecified.	Vocabulary coverage gap plus genuine left/right uncertainty.
10	shot from the balcony above	Predicted ambiguous	—	—	from the balcony	Vague cue produces candidates ((0,55), (325,40), (35,40)).	Proposal: interpret as an elevated camera and ask for the desired angle if precision matters.	The matched phrase is from the balcony; above itself is not separately matched.
11	a close-up of the cat's face	Predicted none	—	—	—	close-up, face, and framing terms are not in the viewpoint lexicon.	Proposal: represent close-up as framing metadata, not as theta/phi.	Framing and object description are distinct from viewpoint; none is reasonable for this parser.
12	a cat, 45 degree angle	Predicted clear	null	45	45 degree	Clear term sets phi = 45; theta remains null. The matched phrase consumes the word angle.	Proposal: preserve phi = 45 and request or preserve unspecified azimuth.	Exact elevation is supplied, but azimuth is underdetermined.
13	slightly high angle	Predicted clear	null	50	high angle	high angle matches inside the phrase and sets phi = 50; slightly is ignored.	Proposal: either map “slightly high” to a lower elevation or retain it as an approximate high-angle cue.	Implementation ignores the modifier slightly; suitability of 50° is uncertain.
14	portrait	Predicted none	—	—	—	portrait is not a clear, vague, or generic viewpoint term.	Proposal: treat as framing/orientation metadata rather than a camera angle.	Framing term, not enough information for theta/phi.
15	a three-quarter rear view	Predicted clear	135	null	three-quarter rear	Longest clear phrase matches first and consumes the text, so rear view cannot also match.	Proposal: accept as a rear three-quarter view, while clarifying left versus right if required.	Overlapping phrases are handled by longest-first matching; three-quarter rear consumes the text before rear view.
16	a 3/4 rear view	Predicted clear	135	null	3/4 rear	The longer 3/4 rear phrase matches and consumes the text before rear view can match.	Proposal: same as ID 15, with left/right still unspecified.	Overlap is resolved correctly by longest-first matching.
17	a rear view	Predicted clear	180	null	rear view	Clear term sets theta = 180; phi remains null.	Proposal: accept rear azimuth with unspecified elevation.	Exact implementation is straightforward; elevation is not specified.
18	a portrait facing the camera	Predicted none	—	—	—	portrait and facing the camera are not supported terms.	Proposal: treat “facing the camera” as subject orientation, not automatically as camera azimuth; ask if a frontal camera view is intended.	Semantic ambiguity and vocabulary coverage gap.
19	a side-on view	Predicted none	—	—	—	side view is supported, but side-on view does not match it because the phrase is not contiguous.	Proposal: recognise side-on view as a side view, while noting that the implementation currently maps side to theta 90 only.	Vocabulary coverage gap; also, “side” could mean either azimuth depending on convention.
20	the cat seen from below	Predicted ambiguous	—	—	from below	Vague cue produces candidates ((0,-45), (325,-25), (35,-25)).	Proposal: retain ambiguity and ask for a specific below-subject angle.	“From below” specifies a general elevation, not one exact viewpoint.
Significant findings

Implementation error — false match in ID 4.
The substring rear view inside “rear view mirror” is consumed as a viewpoint term, producing theta = 180. The whole-word/phrase check prevents partial words but cannot distinguish a viewpoint phrase from an object name.

Vocabulary coverage — several natural forms are unsupported.
The supplied terms do not match 30 degrees elevation (ID 8), three-quarters behind (ID 9), side-on view (ID 19), facing the camera (ID 18), or the non-contiguous relation camera behind (ID 6). These are predicted none or generic ambiguity results, not confirmed runtime results.

Semantic ambiguity — subject orientation is treated differently from camera position.
“The cat looking up” (ID 3), “turned away” (ID 5), and “facing the camera” (ID 18) describe the subject’s orientation. They do not necessarily specify where the camera is. Mapping them directly to camera elevation or azimuth would require an additional interpretation rule.

Reasonable clarification — vague height cues do not justify one angle.
IDs 2, 7, 10, and 20 correctly remain ambiguous under the stated design. Their candidate positions communicate a general region, while a unique theta/phi would be unjustified.

Output distribution is not accuracy.
The predicted distribution is 8 clear, 6 ambiguous, and 6 none. That count only describes how the rules classify these inputs; it does not establish that the classifications are suitable or accurate.

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
      "Clear term sets phi = 90; vertical view then forces theta = null.",
      "Proposal: clear top-down view with no azimuth.",
      "Implementation behaves consistently with the vertical-view rule."
    ],
    [
      "2",
      "a cat seen from above",
      "Predicted ambiguous",
      "—",
      "—",
      "from above",
      "Vague cue produces candidates (0,55), (325,40), (35,40).",
      "Proposal: ask for a specific angle or present these candidate positions.",
      "“From above” does not determine one azimuth or elevation."
    ],
    [
      "3",
      "a cat looking up at the camera",
      "Predicted ambiguous",
      "—",
      "—",
      "looking up",
      "Vague cue is interpreted as “somewhere below the subject”; candidates ((0,-45), (325,-25), (35,-25)).",
      "Proposal: distinguish subject orientation from camera position; ask whether the camera is below the cat.",
      "Semantic ambiguity: “cat looking up” describes the subject, not necessarily the camera."
    ],
    [
      "4",
      "a car door with a rear view mirror",
      "Predicted clear",
      "180",
      "null",
      "rear view",
      "The clear scanner matches the substring rear view inside “rear view mirror”.",
      "Proposal: avoid treating an object name such as “rear view mirror” as a viewpoint request.",
      "False match caused by the substring rear view; likely implementation/vocabulary boundary issue."
    ],
    [
      "5",
      "the cat turned away from the camera",
      "Predicted none",
      "—",
      "—",
      "—",
      "No clear term, vague cue, or generic viewpoint word matches.",
      "Proposal: treat “turned away” as subject orientation, or ask whether a rear camera view is intended.",
      "Semantic ambiguity; no viewpoint is justified from the wording alone."
    ],
    [
      "6",
      "shot from the camera behind the cat",
      "Predicted ambiguous",
      "—",
      "—",
      "shot from",
      "from behind does not match because “camera” occurs between from and behind; generic shot from produces candidates ((0,10), (45,30), (0,90)).",
      "Proposal: recognise the intended camera-behind relation, while clarifying left/right three-quarter position if needed.",
      "Vocabulary/phrase coverage gap; the available phrase is not contiguous."
    ],
    [
      "7",
      "an over the shoulder shot",
      "Predicted ambiguous",
      "—",
      "—",
      "over the shoulder",
      "Vague cue produces candidates ((160,25), (200,25), (180,40)).",
      "Proposal: retain ambiguity and ask for the intended shoulder/angle.",
      "Reasonable clarification; over-the-shoulder does not specify one exact azimuth."
    ],
    [
      "8",
      "the camera at 30 degrees elevation",
      "Predicted none",
      "—",
      "—",
      "—",
      "The lexicon supports 45 degrees but not 30 degrees or elevation; no generic viewpoint term matches.",
      "Proposal: parse the explicit elevation as phi = 30, with unspecified theta.",
      "Vocabulary coverage gap; the numeric elevation is clear to a human but unsupported here."
    ],
    [
      "9",
      "the cat from three-quarters behind",
      "Predicted none",
      "—",
      "—",
      "—",
      "three-quarter rear and three-quarter do not match plural three-quarters; from behind is not present.",
      "Proposal: clarify or support the intended rear three-quarter view, noting that left/right remains unspecified.",
      "Vocabulary coverage gap plus genuine left/right uncertainty."
    ],
    [
      "10",
      "shot from the balcony above",
      "Predicted ambiguous",
      "—",
      "—",
      "from the balcony",
      "Vague cue produces candidates ((0,55), (325,40), (35,40)).",
      "Proposal: interpret as an elevated camera and ask for the desired angle if precision matters.",
      "The matched phrase is from the balcony; above itself is not separately matched."
    ],
    [
      "11",
      "a close-up of the cat's face",
      "Predicted none",
      "—",
      "—",
      "—",
      "close-up, face, and framing terms are not in the viewpoint lexicon.",
      "Proposal: represent close-up as framing metadata, not as theta/phi.",
      "Framing and object description are distinct from viewpoint; none is reasonable for this parser."
    ],
    [
      "12",
      "a cat, 45 degree angle",
      "Predicted clear",
      "null",
      "45",
      "45 degree",
      "Clear term sets phi = 45; theta remains null. The matched phrase consumes the word angle.",
      "Proposal: preserve phi = 45 and request or preserve unspecified azimuth.",
      "Exact elevation is supplied, but azimuth is underdetermined."
    ],
    [
      "13",
      "slightly high angle",
      "Predicted clear",
      "null",
      "50",
      "high angle",
      "high angle matches inside the phrase and sets phi = 50; slightly is ignored.",
      "Proposal: either map “slightly high” to a lower elevation or retain it as an approximate high-angle cue.",
      "Implementation ignores the modifier slightly; suitability of 50° is uncertain."
    ],
    [
      "14",
      "portrait",
      "Predicted none",
      "—",
      "—",
      "—",
      "portrait is not a clear, vague, or generic viewpoint term.",
      "Proposal: treat as framing/orientation metadata rather than a camera angle.",
      "Framing term, not enough information for theta/phi."
    ],
    [
      "15",
      "a three-quarter rear view",
      "Predicted clear",
      "135",
      "null",
      "three-quarter rear",
      "Longest clear phrase matches first and consumes the text, so rear view cannot also match.",
      "Proposal: accept as a rear three-quarter view, while clarifying left versus right if required.",
      "Overlapping phrases are handled by longest-first matching; three-quarter rear consumes the text before rear view."
    ],
    [
      "16",
      "a 3/4 rear view",
      "Predicted clear",
      "135",
      "null",
      "3/4 rear",
      "The longer 3/4 rear phrase matches and consumes the text before rear view can match.",
      "Proposal: same as ID 15, with left/right still unspecified.",
      "Overlap is resolved correctly by longest-first matching."
    ],
    [
      "17",
      "a rear view",
      "Predicted clear",
      "180",
      "null",
      "rear view",
      "Clear term sets theta = 180; phi remains null.",
      "Proposal: accept rear azimuth with unspecified elevation.",
      "Exact implementation is straightforward; elevation is not specified."
    ],
    [
      "18",
      "a portrait facing the camera",
      "Predicted none",
      "—",
      "—",
      "—",
      "portrait and facing the camera are not supported terms.",
      "Proposal: treat “facing the camera” as subject orientation, not automatically as camera azimuth; ask if a frontal camera view is intended.",
      "Semantic ambiguity and vocabulary coverage gap."
    ],
    [
      "19",
      "a side-on view",
      "Predicted none",
      "—",
      "—",
      "—",
      "side view is supported, but side-on view does not match it because the phrase is not contiguous.",
      "Proposal: recognise side-on view as a side view, while noting that the implementation currently maps side to theta 90 only.",
      "Vocabulary coverage gap; also, “side” could mean either azimuth depending on convention."
    ],
    [
      "20",
      "the cat seen from below",
      "Predicted ambiguous",
      "—",
      "—",
      "from below",
      "Vague cue produces candidates ((0,-45), (325,-25), (35,-25)).",
      "Proposal: retain ambiguity and ask for a specific below-subject angle.",
      "“From below” specifies a general elevation, not one exact viewpoint."
    ]
  ]
]
```
