# Mistral Large 3

Platform: University of Birmingham bAI

Date: 2026-11-17 (Europe/London)

Chat: https://ai.bham.ac.uk/chat/onechat/6e158bdd-c05e-814b-3553-530960c7f6b8

Status: response captured; model assertions not independently endorsed.

## Original response (rendered text)

STATIC PREDICTION

Here is the table for all 20 inputs based on the provided code:

ID	Exact input	Predicted or executed kind	theta	phi	Matched terms	Reason in code	Suggested acceptable behaviour	Finding / uncertainty
1	a cat, top-down view	clear	null	90	["top-down"]	"top-down" is a clear term for phi=90; theta is null because direction is meaningless at phi=±80.	Clear: theta=null, phi=90	None
2	a cat seen from above	ambiguous	—	—	["from above"]	"from above" is a vague cue (no exact angle).	Ambiguous: 3 candidates (theta=0/325/35, phi=55/40/40)	None
3	a cat looking up at the camera	ambiguous	—	—	["looking up"]	"looking up" is a vague cue (no exact angle).	Ambiguous: 3 candidates (theta=0/325/35, phi=-45/-25/-25)	None
4	a car door with a rear view mirror	none	—	—	[]	"rear view" is not matched as a whole word (consumed by "rear view mirror").	None: no viewpoint term matched	False negative: "rear view" substring is present but not matched due to consumption by longer phrase.
5	the cat turned away from the camera	none	—	—	[]	No viewpoint term matched.	None: no viewpoint term matched	None
6	shot from the camera behind the cat	clear	180	null	["from behind"]	"from behind" is a clear term for theta=180.	Clear: theta=180, phi=null	None
7	an over the shoulder shot	ambiguous	—	—	["over the shoulder"]	"over the shoulder" is a vague cue (no exact angle).	Ambiguous: 3 candidates (theta=160/200/180, phi=25/25/40)	None
8	the camera at 30 degrees elevation	none	—	—	[]	No clear term for "30 degrees elevation" (only "45-degree" is supported).	Ambiguous: phi=30 (if "degrees elevation" is treated as a generic angle cue)	False negative: "30 degrees" is not mapped despite being a precise angle.
9	the cat from three-quarters behind	clear	135	null	["three-quarter rear"]	"three-quarter rear" is a clear term for theta=135.	Clear: theta=135, phi=null	None
10	shot from the balcony above	ambiguous	—	—	["from the balcony"]	"from the balcony" is not in the lexicon; "from above" is matched as a vague cue.	Ambiguous: 3 candidates (theta=0/325/35, phi=55/40/40)	None
11	a close-up of the cat's face	none	—	—	[]	No viewpoint term matched.	None: framing is not a viewpoint	None
12	a cat, 45 degree angle	clear	null	45	["45 degree"]	"45 degree" is a clear term for phi=45.	Clear: theta=null, phi=45	None
13	slightly high angle	none	—	—	[]	"slightly high angle" is not in the lexicon (only "high angle" is supported).	Ambiguous: phi=20-30 (if "slightly" is treated as a modifier)	False negative: "slightly" is not mapped despite being a common qualifier.
14	portrait	none	—	—	[]	No viewpoint term matched.	None: framing is not a viewpoint	None
15	a three-quarter rear view	clear	135	null	["three-quarter rear"]	"three-quarter rear" is a clear term for theta=135.	Clear: theta=135, phi=null	None
16	a 3/4 rear view	clear	135	null	["3/4 rear"]	"3/4 rear" is a clear term for theta=135.	Clear: theta=135, phi=null	None
17	a rear view	clear	180	null	["rear view"]	"rear view" is a clear term for theta=180.	Clear: theta=180, phi=null	None
18	a portrait facing the camera	none	—	—	[]	No viewpoint term matched ("facing the camera" is not in the lexicon).	Clear: theta=0, phi=0 (if "facing the camera" is treated as a front view)	False negative: "facing the camera" is not mapped despite being a common description.
19	a side-on view	clear	90	null	["side view"]	"side view" is a clear term for theta=90.	Clear: theta=90, phi=null	None
20	the cat seen from below	ambiguous	—	—	["from below"]	"from below" is a vague cue (no exact angle).	Ambiguous: 3 candidates (theta=0/325/35, phi=-45/-25/-25)	None
Significant Findings

False negatives due to substring consumption

Input 4: "rear view mirror" consumes "rear view", preventing a match for the viewpoint term. The lexicon should prioritize standalone viewpoint terms or use a more robust tokenization strategy.

Precision mismatches in angle terms

Input 8: "30 degrees elevation" is not mapped despite being a precise angle. The lexicon only supports "45-degree" for phi, leaving other angles unsupported.
Input 13: "slightly high angle" is not mapped. The lexicon lacks qualifiers like "slightly" for angles, which are common in natural language.

Semantic ambiguity in common descriptions

Input 18: "facing the camera" is not mapped to theta=0 (front view). This is a widely used phrase for viewpoint and should be added to the lexicon.

Overlap between vague and clear terms

Input 10: "from the balcony above" is matched as "from above" (vague cue) but could reasonably be interpreted as a high angle (phi=50-60). The lexicon could benefit from a tiered approach to vague terms.

Directionality assumptions at extreme elevations

Input 1: Theta is null for phi=±80+ (top-down/bottom-up), which is correct but may not align with user expectations for "top-down" shots that imply a slight offset (e.g., theta=0, phi=85). This is a design choice, not an error.

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
      "clear",
      "null",
      "90",
      "[\"top-down\"]",
      "\"top-down\" is a clear term for phi=90; theta is null because direction is meaningless at phi=±80.",
      "Clear: theta=null, phi=90",
      "None"
    ],
    [
      "2",
      "a cat seen from above",
      "ambiguous",
      "—",
      "—",
      "[\"from above\"]",
      "\"from above\" is a vague cue (no exact angle).",
      "Ambiguous: 3 candidates (theta=0/325/35, phi=55/40/40)",
      "None"
    ],
    [
      "3",
      "a cat looking up at the camera",
      "ambiguous",
      "—",
      "—",
      "[\"looking up\"]",
      "\"looking up\" is a vague cue (no exact angle).",
      "Ambiguous: 3 candidates (theta=0/325/35, phi=-45/-25/-25)",
      "None"
    ],
    [
      "4",
      "a car door with a rear view mirror",
      "none",
      "—",
      "—",
      "[]",
      "\"rear view\" is not matched as a whole word (consumed by \"rear view mirror\").",
      "None: no viewpoint term matched",
      "False negative: \"rear view\" substring is present but not matched due to consumption by longer phrase."
    ],
    [
      "5",
      "the cat turned away from the camera",
      "none",
      "—",
      "—",
      "[]",
      "No viewpoint term matched.",
      "None: no viewpoint term matched",
      "None"
    ],
    [
      "6",
      "shot from the camera behind the cat",
      "clear",
      "180",
      "null",
      "[\"from behind\"]",
      "\"from behind\" is a clear term for theta=180.",
      "Clear: theta=180, phi=null",
      "None"
    ],
    [
      "7",
      "an over the shoulder shot",
      "ambiguous",
      "—",
      "—",
      "[\"over the shoulder\"]",
      "\"over the shoulder\" is a vague cue (no exact angle).",
      "Ambiguous: 3 candidates (theta=160/200/180, phi=25/25/40)",
      "None"
    ],
    [
      "8",
      "the camera at 30 degrees elevation",
      "none",
      "—",
      "—",
      "[]",
      "No clear term for \"30 degrees elevation\" (only \"45-degree\" is supported).",
      "Ambiguous: phi=30 (if \"degrees elevation\" is treated as a generic angle cue)",
      "False negative: \"30 degrees\" is not mapped despite being a precise angle."
    ],
    [
      "9",
      "the cat from three-quarters behind",
      "clear",
      "135",
      "null",
      "[\"three-quarter rear\"]",
      "\"three-quarter rear\" is a clear term for theta=135.",
      "Clear: theta=135, phi=null",
      "None"
    ],
    [
      "10",
      "shot from the balcony above",
      "ambiguous",
      "—",
      "—",
      "[\"from the balcony\"]",
      "\"from the balcony\" is not in the lexicon; \"from above\" is matched as a vague cue.",
      "Ambiguous: 3 candidates (theta=0/325/35, phi=55/40/40)",
      "None"
    ],
    [
      "11",
      "a close-up of the cat's face",
      "none",
      "—",
      "—",
      "[]",
      "No viewpoint term matched.",
      "None: framing is not a viewpoint",
      "None"
    ],
    [
      "12",
      "a cat, 45 degree angle",
      "clear",
      "null",
      "45",
      "[\"45 degree\"]",
      "\"45 degree\" is a clear term for phi=45.",
      "Clear: theta=null, phi=45",
      "None"
    ],
    [
      "13",
      "slightly high angle",
      "none",
      "—",
      "—",
      "[]",
      "\"slightly high angle\" is not in the lexicon (only \"high angle\" is supported).",
      "Ambiguous: phi=20-30 (if \"slightly\" is treated as a modifier)",
      "False negative: \"slightly\" is not mapped despite being a common qualifier."
    ],
    [
      "14",
      "portrait",
      "none",
      "—",
      "—",
      "[]",
      "No viewpoint term matched.",
      "None: framing is not a viewpoint",
      "None"
    ],
    [
      "15",
      "a three-quarter rear view",
      "clear",
      "135",
      "null",
      "[\"three-quarter rear\"]",
      "\"three-quarter rear\" is a clear term for theta=135.",
      "Clear: theta=135, phi=null",
      "None"
    ],
    [
      "16",
      "a 3/4 rear view",
      "clear",
      "135",
      "null",
      "[\"3/4 rear\"]",
      "\"3/4 rear\" is a clear term for theta=135.",
      "Clear: theta=135, phi=null",
      "None"
    ],
    [
      "17",
      "a rear view",
      "clear",
      "180",
      "null",
      "[\"rear view\"]",
      "\"rear view\" is a clear term for theta=180.",
      "Clear: theta=180, phi=null",
      "None"
    ],
    [
      "18",
      "a portrait facing the camera",
      "none",
      "—",
      "—",
      "[]",
      "No viewpoint term matched (\"facing the camera\" is not in the lexicon).",
      "Clear: theta=0, phi=0 (if \"facing the camera\" is treated as a front view)",
      "False negative: \"facing the camera\" is not mapped despite being a common description."
    ],
    [
      "19",
      "a side-on view",
      "clear",
      "90",
      "null",
      "[\"side view\"]",
      "\"side view\" is a clear term for theta=90.",
      "Clear: theta=90, phi=null",
      "None"
    ],
    [
      "20",
      "the cat seen from below",
      "ambiguous",
      "—",
      "—",
      "[\"from below\"]",
      "\"from below\" is a vague cue (no exact angle).",
      "Ambiguous: 3 candidates (theta=0/325/35, phi=-45/-25/-25)",
      "None"
    ]
  ]
]
```
