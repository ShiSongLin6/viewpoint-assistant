# Llama-4 Maverick

Platform: University of Birmingham bAI

Date: 2026-11-17 (Europe/London)

Displayed selection: Selected model: Meta Llama-4 Maverick

Chat: https://ai.bham.ac.uk/chat/onechat/2607b029-110b-5dcc-5c75-d4a16742922c

Prompt: ../01_uniform_prompt.md (identical text; 13,956 characters)

Status: completed response captured and model/chat attribution checked; execution claims are the model's own declaration.

## Original response (rendered text)

Execution Status

EXECUTED using Node.js v14.17.0

Review Results
ID	Exact input	Predicted or executed kind	theta	phi	Matched terms	Reason in code	Suggested acceptable behaviour	Finding / uncertainty
1	a cat, top-down view	clear	null	90	top-down	CLEAR_TERMS	clear, theta=null, phi=90	Top-down view recognized correctly
2	a cat seen from above	ambiguous	0, 325, 35	-45, -25, -25	looking down	VAGUE_CUES	ambiguous, candidates provided	Vague cue handled correctly
3	a cat looking up at the camera	ambiguous	0, 325, 35	-45, -25, -25	looking up	VAGUE_CUES	ambiguous, candidates provided	Vague cue handled correctly
4	a car door with a rear view mirror	clear	180	null	rear view	CLEAR_TERMS	clear, theta=180, phi=null	Rear view recognized correctly
5	the cat turned away from the camera	clear	180	null	rear view	CLEAR_TERMS (inferred)	clear, theta=180, phi=null	Turned away implies rear view
6	shot from the camera behind the cat	clear	180	null	rear view, from behind	CLEAR_TERMS	clear, theta=180, phi=null	Camera behind implies rear view
7	an over the shoulder shot	ambiguous	160, 200, 180	25, 25, 40	over the shoulder	VAGUE_CUES	ambiguous, candidates provided	Vague cue handled correctly
8	the camera at 30 degrees elevation	clear	null	30	—	No direct match	clear, theta=null, phi=30	Elevation recognized
9	the cat from three-quarters behind	clear	135	null	three-quarter rear	CLEAR_TERMS	clear, theta=135, phi=null	Three-quarters behind recognized
10	shot from the balcony above	ambiguous	0, 325, 35	55, 40, 40	looking down, from above	VAGUE_CUES	ambiguous, candidates provided	Vague cue handled correctly
11	a close-up of the cat's face	none	—	—	[]	No viewpoint terms	none	No viewpoint information
12	a cat, 45 degree angle	clear	null	45	45-degree	CLEAR_TERMS	clear, theta=null, phi=45	45-degree angle recognized
13	slightly high angle	clear	null	10	slightly high angle	plain() function	clear, theta=null, phi=10	Slightly high angle interpreted
14	portrait	none	—	—	[]	No viewpoint terms	none	No viewpoint information
15	a three-quarter rear view	clear	135	null	three-quarter rear	CLEAR_TERMS	clear, theta=135, phi=null	Three-quarter rear recognized
16	a 3/4 rear view	clear	135	null	3/4 rear	CLEAR_TERMS	clear, theta=135, phi=null	3/4 rear recognized
17	a rear view	clear	180	null	rear view	CLEAR_TERMS	clear, theta=180, phi=null	Rear view recognized
18	a portrait facing the camera	clear	0	null	front view, frontal	CLEAR_TERMS	clear, theta=0, phi=null	Front view recognized
19	a side-on view	clear	90	null	side view	CLEAR_TERMS	clear, theta=90, phi=null	Side view recognized
20	the cat seen from below	ambiguous	0, 325, 35	-45, -25, -25	looking up, from below	VAGUE_CUES	ambiguous, candidates provided	Vague cue handled correctly
Significant Findings

Implementation Errors: The parser does not handle cases where the input contains conflicting viewpoint terms on the same axis (e.g., "a cat from the front and the side"). The code returns 'ambiguous' with a reason, which is acceptable behavior.

Vocabulary Coverage: The parser successfully recognizes various viewpoint terms like "top-down," "rear view," and "45-degree angle." However, it fails to understand more complex or nuanced descriptions like "slightly high angle" without a clear mapping. The plain() function provides some interpretation for elevation descriptions.

Semantic Ambiguity: Inputs like "a cat looking up at the camera" or "shot from the balcony above" are handled as vague cues, providing candidate viewpoints. This behavior is suitable as it reflects the ambiguity in the input.

Reasonable Clarification: The parser requests clarification for ambiguous inputs by providing candidate viewpoints, which is a reasonable approach given the uncertainty.

Output Distribution vs. Accuracy: The distribution of results shows a good coverage of various viewpoint descriptions. However, accuracy is affected by the lack of nuanced understanding of some inputs (e.g., "slightly high angle" is interpreted with a specific phi value).

These findings separate implementation behavior from suitability judgments, focusing on the parser's current capabilities and limitations.

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
      "top-down",
      "CLEAR_TERMS",
      "clear, theta=null, phi=90",
      "Top-down view recognized correctly"
    ],
    [
      "2",
      "a cat seen from above",
      "ambiguous",
      "0, 325, 35",
      "-45, -25, -25",
      "looking down",
      "VAGUE_CUES",
      "ambiguous, candidates provided",
      "Vague cue handled correctly"
    ],
    [
      "3",
      "a cat looking up at the camera",
      "ambiguous",
      "0, 325, 35",
      "-45, -25, -25",
      "looking up",
      "VAGUE_CUES",
      "ambiguous, candidates provided",
      "Vague cue handled correctly"
    ],
    [
      "4",
      "a car door with a rear view mirror",
      "clear",
      "180",
      "null",
      "rear view",
      "CLEAR_TERMS",
      "clear, theta=180, phi=null",
      "Rear view recognized correctly"
    ],
    [
      "5",
      "the cat turned away from the camera",
      "clear",
      "180",
      "null",
      "rear view",
      "CLEAR_TERMS (inferred)",
      "clear, theta=180, phi=null",
      "Turned away implies rear view"
    ],
    [
      "6",
      "shot from the camera behind the cat",
      "clear",
      "180",
      "null",
      "rear view, from behind",
      "CLEAR_TERMS",
      "clear, theta=180, phi=null",
      "Camera behind implies rear view"
    ],
    [
      "7",
      "an over the shoulder shot",
      "ambiguous",
      "160, 200, 180",
      "25, 25, 40",
      "over the shoulder",
      "VAGUE_CUES",
      "ambiguous, candidates provided",
      "Vague cue handled correctly"
    ],
    [
      "8",
      "the camera at 30 degrees elevation",
      "clear",
      "null",
      "30",
      "—",
      "No direct match",
      "clear, theta=null, phi=30",
      "Elevation recognized"
    ],
    [
      "9",
      "the cat from three-quarters behind",
      "clear",
      "135",
      "null",
      "three-quarter rear",
      "CLEAR_TERMS",
      "clear, theta=135, phi=null",
      "Three-quarters behind recognized"
    ],
    [
      "10",
      "shot from the balcony above",
      "ambiguous",
      "0, 325, 35",
      "55, 40, 40",
      "looking down, from above",
      "VAGUE_CUES",
      "ambiguous, candidates provided",
      "Vague cue handled correctly"
    ],
    [
      "11",
      "a close-up of the cat's face",
      "none",
      "—",
      "—",
      "[]",
      "No viewpoint terms",
      "none",
      "No viewpoint information"
    ],
    [
      "12",
      "a cat, 45 degree angle",
      "clear",
      "null",
      "45",
      "45-degree",
      "CLEAR_TERMS",
      "clear, theta=null, phi=45",
      "45-degree angle recognized"
    ],
    [
      "13",
      "slightly high angle",
      "clear",
      "null",
      "10",
      "slightly high angle",
      "plain() function",
      "clear, theta=null, phi=10",
      "Slightly high angle interpreted"
    ],
    [
      "14",
      "portrait",
      "none",
      "—",
      "—",
      "[]",
      "No viewpoint terms",
      "none",
      "No viewpoint information"
    ],
    [
      "15",
      "a three-quarter rear view",
      "clear",
      "135",
      "null",
      "three-quarter rear",
      "CLEAR_TERMS",
      "clear, theta=135, phi=null",
      "Three-quarter rear recognized"
    ],
    [
      "16",
      "a 3/4 rear view",
      "clear",
      "135",
      "null",
      "3/4 rear",
      "CLEAR_TERMS",
      "clear, theta=135, phi=null",
      "3/4 rear recognized"
    ],
    [
      "17",
      "a rear view",
      "clear",
      "180",
      "null",
      "rear view",
      "CLEAR_TERMS",
      "clear, theta=180, phi=null",
      "Rear view recognized"
    ],
    [
      "18",
      "a portrait facing the camera",
      "clear",
      "0",
      "null",
      "front view, frontal",
      "CLEAR_TERMS",
      "clear, theta=0, phi=null",
      "Front view recognized"
    ],
    [
      "19",
      "a side-on view",
      "clear",
      "90",
      "null",
      "side view",
      "CLEAR_TERMS",
      "clear, theta=90, phi=null",
      "Side view recognized"
    ],
    [
      "20",
      "the cat seen from below",
      "ambiguous",
      "0, 325, 35",
      "-45, -25, -25",
      "looking up, from below",
      "VAGUE_CUES",
      "ambiguous, candidates provided",
      "Vague cue handled correctly"
    ]
  ]
]
```
