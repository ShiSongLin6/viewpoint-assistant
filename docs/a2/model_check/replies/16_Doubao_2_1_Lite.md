# Doubao 2.1 Lite (LITE)

Platform: Doubao app

Date: 2026-11-17 (Europe/London)

Chat: no OneChat link for this reply; the model is recorded as LITE (Doubao 2.1 Lite).

Status: STATIC PREDICTION. The model did not execute JavaScript; the rows below are a static reading of the supplied source snapshot. Local independent execution is recorded separately in 02_local_outputs.md and is not treated as this model's run.

## Original response (rendered text)

STATIC PREDICTION

I read the supplied prototype/viewpoint.js snapshot and the 20 fixed inputs. I could not execute JavaScript in this session, so every row below is a static prediction, not a run result. I keep two questions separate: what the exact implementation returns, and whether that behaviour suits the request. Suggested behaviour is my proposal for your review, not ground truth.

| ID | Exact input | Predicted or executed kind | theta | phi | Matched terms | Reason in code | Suggested acceptable behaviour | Finding / uncertainty |
|---|---|---|---|---|---|---|---|---|
| 1 | a cat, top-down view | clear | null | 90 | ["top-down"] | "top-down" is a clear term mapping phi=90; at |phi|>=80 the code sets theta=null because direction has no meaning straight above. | Clear: theta=null, phi=90. | None on the code path. Whether a true top-down should keep a slight offset is a design choice, not an implementation error. |
| 2 | a cat seen from above | ambiguous | — | — | ["from above"] | "from above" is a VAGUE_CUE above group; it yields three candidates and no exact angle. | Ambiguous: candidates (0,55), (325,40), (35,40); ask for an exact height. | None. The phrase only hints at an elevated camera; no single phi can be justified. |
| 3 | a cat looking up at the camera | ambiguous | — | — | ["looking up"] | "looking up" is a VAGUE_CUE below group; candidates are below the subject, no exact angle. | Ambiguous: candidates (0,-45), (325,-25), (35,-25); clarify the low angle. | Uncertainty: "looking up at the camera" describes the subject's orientation toward the camera, which the prompt brief says is distinct from camera position; the code treats it as a below-camera cue. Whether that mapping is intended is a design judgement. |
| 4 | a car door with a rear view mirror | clear | 180 | null | ["rear view"] | "rear view" is a CLEAR_TERM theta=180. findWord checks only the character immediately before and after the phrase; here both are spaces, so the later word "mirror" does not break the whole-word boundary and the phrase still matches. | Proposal: this is a false viewpoint match. "rear view mirror" is an object name (the mirror on the door), not a request for a back view of the subject; the parser should distinguish object names from viewpoint terms, or return none/ambiguous here. | Implementation / vocabulary finding: a substring that forms part of a fixed object noun ("rear view mirror") is consumed as a viewpoint direction. The code has no object-name exclusion. |
| 5 | the cat turned away from the camera | none | — | — | [] | No clear term, vague cue or generic word matches: "turned away" is not in the lexicon, and "from the camera" is not "from behind" / "from the back". | Proposal: this semantically suggests a rear/back orientation (subject turned away), but the code cannot map it; either clarify or add a phrase such as "turned away" to the rear-view vocabulary. | Vocabulary coverage gap. Note subject orientation and camera position are distinct; the intended mapping needs your design call. |
| 6 | shot from the camera behind the cat | ambiguous | — | — | ["shot from"] | No CLEAR_TERM hits: "behind" alone is not listed (only "from behind" / "from the back"). The generic word "shot from" then matches, producing the generic ambiguous branch with GENERIC_CANDIDATES. | Proposal: semantically this reads as a camera behind the cat (rear, theta≈180), but the code cannot justify that angle from the listed phrases; clarify the rear viewpoint rather than guessing 180. | Vocabulary gap: bare "behind" is not covered, and the generic "shot from" cue masks it. The word "camera" here denotes the viewpoint, not a subject term. |
| 7 | an over the shoulder shot | ambiguous | — | — | ["over the shoulder"] | "over the shoulder" is a VAGUE_CUE behind-and-above group; three candidates, no exact angle. | Ambiguous: candidates (160,25), (200,25), (180,40); clarify whether the camera is behind-left, behind-right or directly behind and above. | None on the code path. OTS is conventionally a rear-three-quarter position, but the code deliberately leaves it vague. |
| 8 | the camera at 30 degrees elevation | none | — | — | [] | The only numeric elevation clear term is "45-degree"/"45 degree"/"45 degrees"/"45-degrees"/"45°"; "30 degrees elevation" matches none of them. No generic word matches either ("elevation" is not in GENERIC_WORDS). | Proposal: a stated 30° elevation is a precise phi request; the parser should either parse a numeric elevation generically or return ambiguous asking for the angle, rather than none. | Vocabulary / numeric-parsing gap: only the fixed 45° phrase is supported; other explicit degree values fall through to none. |
| 9 | the cat from three-quarters behind | none | — | — | [] | The rear three-quarter terms are "three-quarter rear", "three quarter rear", "3/4 rear", "three-quarter back", "three quarter back"; the hyphenated "three-quarters" plus "behind" matches none. The bare "three-quarter" front group also does not match "three-quarters". | Proposal: this is a rear three-quarter view (theta≈135) in ordinary wording, but the code returns none; add the "three-quarters behind / three-quarter rear" surface forms. | Vocabulary coverage gap: plural "three-quarters" and the word "behind" are not accepted variants. |
| 10 | shot from the balcony above | ambiguous | — | — | ["from the balcony"] | "from the balcony" is a VAGUE_CUE above group; "above" alone is not a listed clear term. It yields the above candidates, no exact angle. | Ambiguous: candidates (0,55), (325,40), (35,40); clarify the elevated camera height. | None on the code path. The balcony implies an elevated vantage but not a precise phi. |
| 11 | a close-up of the cat's face | none | — | — | [] | No viewpoint term matches; "close-up" and "face" are framing/object words, not angle words, and no generic viewpoint word is present. | None is acceptable: framing should not be parsed as a camera angle. | None. Brief explicitly separates framing from viewpoint. |
| 12 | a cat, 45 degree angle | clear | null | 45 | ["45 degree"] | "45 degree" is a CLEAR_TERM phi=45; "angle" is also a generic word but the clear branch returns before generic matching. theta stays null because no direction term is given. | Clear: phi=45, theta=null. | Uncertainty: "45 degree angle" does not say whether 45° is elevation or azimuth; the code fixes it as a high elevation (phi=45). Whether that disambiguation is intended is a design choice. |
| 13 | slightly high angle | clear | null | 50 | ["high angle"] | "high angle" is a CLEAR_TERM phi=50. findWord matches the phrase inside "slightly high angle" because the preceding character is a space; the modifier "slightly" is not consumed and has no rule. | Proposal: "slightly" should lower the elevation toward a mildly high angle (closer to phi≈20–30), rather than applying the full high-angle phi=50; either treat the modifier as a hedge or ask for clarification. | Implementation/vocabulary finding: a modifier preceding a clear term is ignored, so the returned phi=50 overstates the intended height. The match itself is correct; the modifier is unsupported. |
| 14 | portrait | none | — | — | [] | "portrait" is not in any list; no generic viewpoint word matches. | Proposal: "portrait" conventionally implies an eye-level, front-facing framing, but the code treats framing separately and returns none. Whether portrait should map to theta=0, phi=0 is a design decision. | Vocabulary/framing boundary: the code deliberately does not map portrait; this is acceptable if framing is out of scope. |
| 15 | a three-quarter rear view | clear | 135 | null | ["three-quarter rear"] | "three-quarter rear" is the longest matching clear term, theta=135; matched text is consumed, so the shorter "rear view" inside it does not also match. | Clear: theta=135, phi=null. | None on the code path. |
| 16 | a 3/4 rear view | clear | 180 | null | ["rear view"] | "3/4 rear" in the rear-three-quarter group requires the exact token "3/4 rear"; the input is "3/4 rear view", so that phrase does not match as a boundary-bounded unit. Scanning falls through to the shorter "rear view" (theta=180), which consumes "rear view". | Proposal: this should be a rear three-quarter view, theta≈135, not a straight rear view 180. The parser should recognise "3/4 rear view" and bind the three-quarter modifier to the rear direction before matching the bare "rear view". | Implementation/vocabulary finding: the slash variant "3/4 rear" is not recognised before the generic "rear view", so a three-quarter direction is misread as a full rear view. This is the highest-impact angle error. |
| 17 | a rear view | clear | 180 | null | ["rear view"] | "rear view" is a CLEAR_TERM theta=180. | Clear: theta=180, phi=null. | None. |
| 18 | a portrait facing the camera | none | — | — | [] | "facing the camera" is not a listed front term (the front group has "front view", "frontal", "from the front", "head-on"); "portrait" is not mapped either. | Proposal: "facing the camera" normally indicates a front view (theta=0), but the code returns none; add the phrase to the front vocabulary or clarify. | Vocabulary coverage gap. Subject/camera orientation wording is not recognised. |
| 19 | a side-on view | none | — | — | [] | The side group lists "side view", "side-view", "profile view", "in profile", "from the side"; the hyphenated adjective "side-on" matches none of them. | Proposal: "side-on" is plainly a side view (theta≈90), but the code returns none; add "side-on" / "side on" to the side-view vocabulary. | Vocabulary coverage gap: a common hyphenated side synonym is unsupported. |
| 20 | the cat seen from below | ambiguous | — | — | ["from below"] | "from below" is a VAGUE_CUE below group; candidates below the subject, no exact angle. | Ambiguous: candidates (0,-45), (325,-25), (35,-25); clarify the low angle. | None. |

## Significant findings

### Implementation errors

- #16 `a 3/4 rear view` → straight rear theta=180 instead of rear three-quarter ≈135. The rear-three-quarter lexicon entry "3/4 rear" does not match the boundary-bounded text "3/4 rear view"; the shorter "rear view" then consumes the phrase and wins. The substring that causes the false rear match is "rear view".
- #4 `a car door with a rear view mirror` → clear theta=180. "rear view" sits inside the fixed object name "rear view mirror"; the code has no object-name exclusion, so an object noun is read as a viewpoint direction. The triggering substring is "rear view".

### Vocabulary coverage

- #5 "turned away", #6 bare "behind", #8 "30 degrees elevation", #9 "three-quarters behind", #18 "facing the camera", #19 "side-on" are not in the lexicon and fall to none or generic ambiguous. Only the fixed 45° elevation phrase is parsed numerically; other explicit degree values are unsupported.
- #13 the modifier "slightly" before "high angle" is ignored; the full phi=50 is applied instead of a milder high angle.

### Semantic ambiguity

- #3 "looking up at the camera" mixes subject orientation with camera position; the code maps it to a below-camera cue. Whether that is the intended reading needs your design judgement.
- #12 "45 degree angle" does not state whether 45° is elevation or azimuth; the code fixes it as phi=45.
- #7, #10, #20 and #2 are legitimately vague: the cue names a region (above, below, behind-and-above) but no exact angle, so clarification candidates are appropriate.

### Reasonable clarification

- #2, #3, #7, #10, #20: the code returns ambiguous with candidates rather than forcing one angle; this is acceptable when a unique angle cannot be justified.
- #6: after the generic "shot from" cue, the code offers generic candidates instead of guessing rear; a clarification asking for the rear/front direction would be reasonable.

### Distribution note

Predicted distribution from these 20 rows: 7 clear (#1, #4, #12, #13, #15, #16, #17), 6 ambiguous (#2, #3, #6, #7, #10, #20), 7 none (#5, #8, #9, #11, #14, #18, #19). This output distribution is not an accuracy measure; model consensus is not proof of correct behaviour. I did not execute the code, so none of these predictions should be recorded as a run result.

## Table cells (captured from rendered response)

```json
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
    "\"top-down\" maps phi=90; at |phi|>=80 theta is null.",
    "Clear: theta=null, phi=90.",
    "Straight above/below direction is meaningless; offset is a design choice."
  ],
  [
    "2",
    "a cat seen from above",
    "ambiguous",
    "—",
    "—",
    "[\"from above\"]",
    "\"from above\" is a vague above cue; three candidates, no exact angle.",
    "Ambiguous: (0,55), (325,40), (35,40); clarify height.",
    "Only an elevated camera is hinted."
  ],
  [
    "3",
    "a cat looking up at the camera",
    "ambiguous",
    "—",
    "—",
    "[\"looking up\"]",
    "\"looking up\" is a vague below cue; candidates below the subject.",
    "Ambiguous: (0,-45), (325,-25), (35,-25); clarify low angle.",
    "Subject orientation vs camera position; mapping is a design judgement."
  ],
  [
    "4",
    "a car door with a rear view mirror",
    "clear",
    "180",
    "null",
    "[\"rear view\"]",
    "\"rear view\" matches; boundary chars are spaces, so \"mirror\" does not break it.",
    "Proposal: false viewpoint match; \"rear view mirror\" is an object name, should be none/ambiguous.",
    "Object noun consumed as a rear direction; no object-name exclusion."
  ],
  [
    "5",
    "the cat turned away from the camera",
    "none",
    "—",
    "—",
    "[]",
    "\"turned away\" and \"from the camera\" are not listed phrases.",
    "Proposal: suggests rear orientation; clarify or add \"turned away\" to rear vocabulary.",
    "Vocabulary gap; orientation vs camera position needs design call."
  ],
  [
    "6",
    "shot from the camera behind the cat",
    "ambiguous",
    "—",
    "—",
    "[\"shot from\"]",
    "Bare \"behind\" is not a clear term; generic \"shot from\" triggers the generic ambiguous branch.",
    "Proposal: reads as rear camera, but clarify rather than guessing 180.",
    "Vocabulary gap: bare \"behind\" unsupported; generic cue masks it."
  ],
  [
    "7",
    "an over the shoulder shot",
    "ambiguous",
    "—",
    "—",
    "[\"over the shoulder\"]",
    "\"over the shoulder\" is a vague behind-and-above cue.",
    "Ambiguous: (160,25), (200,25), (180,40); clarify side and height.",
    "Conventionally rear three-quarter, but code leaves it vague."
  ],
  [
    "8",
    "the camera at 30 degrees elevation",
    "none",
    "—",
    "—",
    "[]",
    "Only the 45° elevation phrase is a clear term; \"30 degrees elevation\" matches nothing.",
    "Proposal: parse explicit numeric elevation or return ambiguous asking for the angle.",
    "Numeric-parsing gap: other degree values fall through to none."
  ],
  [
    "9",
    "the cat from three-quarters behind",
    "none",
    "—",
    "—",
    "[]",
    "\"three-quarters\" + \"behind\" matches neither the rear three-quarter terms nor the bare three-quarter entry.",
    "Proposal: rear three-quarter theta≈135; add \"three-quarters behind\" surface forms.",
    "Vocabulary gap: plural and \"behind\" variants unsupported."
  ],
  [
    "10",
    "shot from the balcony above",
    "ambiguous",
    "—",
    "—",
    "[\"from the balcony\"]",
    "\"from the balcony\" is a vague above cue; \"above\" alone is not a clear term.",
    "Ambiguous: (0,55), (325,40), (35,40); clarify elevated height.",
    "Balcony implies elevation but no precise phi."
  ],
  [
    "11",
    "a close-up of the cat's face",
    "none",
    "—",
    "—",
    "[]",
    "Framing/object words match no viewpoint term and no generic word.",
    "None is acceptable: framing is not a camera angle.",
    "None."
  ],
  [
    "12",
    "a cat, 45 degree angle",
    "clear",
    "null",
    "45",
    "[\"45 degree\"]",
    "\"45 degree\" maps phi=45; clear branch returns before generic matching; theta null.",
    "Clear: phi=45, theta=null.",
    "45° axis (elevation vs azimuth) is unspecified; code fixes it as elevation."
  ],
  [
    "13",
    "slightly high angle",
    "clear",
    "null",
    "50",
    "[\"high angle\"]",
    "\"high angle\" matches inside the phrase; \"slightly\" has no rule and is ignored.",
    "Proposal: \"slightly\" should lower phi toward ~20–30, or clarify.",
    "Modifier ignored; phi=50 overstates the intended height."
  ],
  [
    "14",
    "portrait",
    "none",
    "—",
    "—",
    "[]",
    "\"portrait\" is in no list and matches no generic word.",
    "Proposal: portrait usually implies eye-level front; mapping theta=0, phi=0 is a design decision.",
    "Framing boundary; acceptable if framing is out of scope."
  ],
  [
    "15",
    "a three-quarter rear view",
    "clear",
    "135",
    "null",
    "[\"three-quarter rear\"]",
    "Longest phrase \"three-quarter rear\" matches first and consumes the text; \"rear view\" does not re-match.",
    "Clear: theta=135, phi=null.",
    "None."
  ],
  [
    "16",
    "a 3/4 rear view",
    "clear",
    "180",
    "null",
    "[\"rear view\"]",
    "\"3/4 rear\" does not match the boundary-bounded text; shorter \"rear view\" (theta=180) wins.",
    "Proposal: should be rear three-quarter theta≈135; bind the 3/4 modifier before bare rear view.",
    "Slash variant unrecognised; three-quarter misread as full rear. Highest-impact angle error."
  ],
  [
    "17",
    "a rear view",
    "clear",
    "180",
    "null",
    "[\"rear view\"]",
    "\"rear view\" maps theta=180.",
    "Clear: theta=180, phi=null.",
    "None."
  ],
  [
    "18",
    "a portrait facing the camera",
    "none",
    "—",
    "—",
    "[]",
    "\"facing the camera\" is not a listed front term; \"portrait\" is unmapped.",
    "Proposal: front view theta=0; add the phrase to front vocabulary or clarify.",
    "Vocabulary gap: orientation wording not recognised."
  ],
  [
    "19",
    "a side-on view",
    "none",
    "—",
    "—",
    "[]",
    "\"side-on\" matches none of the listed side phrases.",
    "Proposal: side view theta≈90; add \"side-on\" / \"side on\" to side vocabulary.",
    "Vocabulary gap: hyphenated side synonym unsupported."
  ],
  [
    "20",
    "the cat seen from below",
    "ambiguous",
    "—",
    "—",
    "[\"from below\"]",
    "\"from below\" is a vague below cue; candidates below the subject.",
    "Ambiguous: (0,-45), (325,-25), (35,-25); clarify low angle.",
    "None."
  ]
]
```
