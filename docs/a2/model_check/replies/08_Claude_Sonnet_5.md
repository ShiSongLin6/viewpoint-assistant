# Claude Sonnet 5

Platform: University of Birmingham bAI

Date: 2026-11-17 (Europe/London)

Displayed selection: Selected model: Anthropic Claude Sonnet 5

Chat: https://ai.bham.ac.uk/chat/onechat/46b67804-094e-785d-006a-c590aa49ddfc

Prompt: ../01_uniform_prompt.md (identical text; 13,956 characters)

Status: response captured; model assertions not independently endorsed.

## Original response (rendered text)

Node is available, so I'll actually execute the supplied source against the 20 fixed inputs rather than predict statically.Hash matches the supplied snapshot exactly, so I'm executing the authentic file.Execution status: EXECUTED. Ran the exact supplied source (/tmp/viewpoint.js, sha256 47c06d79c6a8a06848c28570131ab3cd5160e350a3df65551464368bc86c5645 — matches your snapshot hash) under Node.js v22.23.4 with a harness calling parsePrompt() on each of the 20 fixed strings verbatim. Raw JSON output is shown above this message's tool calls; the table below is a direct transcription of it.

ID	Exact input	Executed kind	theta	phi	Matched terms	Reason in code	Suggested acceptable behaviour (proposal, not ground truth)	Finding / uncertainty
1	a cat, top-down view	clear	null	90	"top-down"	CLEAR_TERMS top-down group; phi≥80 forces theta=null	phi 90, theta undefined — direction is meaningless looking straight down	Correct, no issue
2	a cat seen from above	ambiguous	—	—	"from above"	VAGUE_CUES "above" cue, no exact angle	Candidates {0,55},{325,40},{35,40}; asking for an angle is reasonable	"from above" treated differently from "overhead"/"directly above" (clear, phi 90) despite near-identical meaning — inconsistent synonym tier
3	a cat looking up at the camera	ambiguous	—	—	"looking up"	VAGUE_CUES "looking up" → "somewhere below the subject"	Candidates {0,-45},{325,-25},{35,-25}	This sentence describes the subject's gaze, not requested camera position — parser conflates subject orientation with camera position
4	a car door with a rear view mirror	clear	180	null	"rear view"	CLEAR_TERMS "rear view" matched inside "rear view mirror"	Should likely be none — this names a car part, not a viewpoint	False match: substring "rear view" fires regardless of surrounding object-name context ("mirror")
5	the cat turned away from the camera	none	—	—	(none)	No lexicon phrase matches	Arguably equivalent to a back/180° view; could be added as a synonym	Vocabulary gap — correct per current lexicon, but a plausible phrase for "back view" is unrecognized
6	shot from the camera behind the cat	ambiguous	—	—	"shot from"	GENERIC_WORDS fallback; "from behind" doesn't match (non-adjacent to "behind")	"behind the cat" strongly implies back view (180°); flagging ambiguity to the user is acceptable, but discarding "behind" entirely loses signal	Pattern-matching limitation: non-contiguous "from … behind" not recognized even though both words are present
7	an over the shoulder shot	ambiguous	—	—	"over the shoulder"	VAGUE_CUES group, 3 candidates	Candidates {160,25},{200,25},{180,40}; genuine real-world ambiguity (which shoulder, how high)	Reasonable clarification request
8	the camera at 30 degrees elevation	none	—	—	(none)	Only the literal "45-degree" family is in CLEAR_TERMS; "30 degrees" isn't	Should probably be recognized as phi=30 (a numeric-degree parser, not hardcoded to 45)	Significant vocabulary gap: no generic numeric-angle extraction exists at all
9	the cat from three-quarters behind	none	—	—	(none)	"three-quarters" (plural) fails the word-boundary check against lexicon entry "three-quarter" (singular)	Could reasonably map to theta=135 like "three-quarter rear"	Vocabulary gap: trailing "s" defeats an otherwise-covered concept
10	shot from the balcony above	ambiguous	—	—	"from the balcony"	VAGUE_CUES "above" group	Candidates {0,55},{325,40},{35,40}	Reasonable clarification
11	a close-up of the cat's face	none	—	—	(none)	No viewpoint term present ("close-up" isn't in any list)	Correctly none — framing, not viewpoint	Correct separation of framing vs. viewpoint
12	a cat, 45 degree angle	clear	null	45	"45 degree"	CLEAR_TERMS 45-degree group, phi=45	Treat as elevation per this prototype's convention, but flag that "45 degree angle" is also commonly used for a 3/4 rotation (azimuth) in photography	Semantic ambiguity resolved as "clear" with no hedge — may overstate confidence
13	slightly high angle	clear	null	50	"high angle"	CLEAR_TERMS "high angle" matches the substring regardless of "slightly"	plain() itself defines "slightly high angle" as a separate 10–29° band — parsePrompt should arguably distinguish the qualifier	Internal inconsistency between parse vocabulary and the code's own plain()-language bands
14	portrait	none	—	—	(none)	No match in any list	Correctly none — "portrait" is framing/aspect, not a camera angle	Correct
15	a three-quarter rear view	clear	135	null	"three-quarter rear"	Longest-phrase-first scan: 18-char phrase matched before shorter "rear view"/"three-quarter" could	Matches lexicon intent	Correct — longest-match-first worked as designed here
16	a 3/4 rear view	clear	180	null	"rear view"	"rear view" (9 chars) sorts ahead of "3/4 rear" (8 chars) in the global length-sorted match list, so it is matched and consumed first, even though "3/4 rear" is explicitly listed to produce theta=135	Should produce theta=135, matching "a three-quarter rear view"	Implementation bug: the single global length-sort across all groups doesn't guarantee a more-specific overlapping phrase wins; an explicitly-supported synonym ("3/4 rear") is silently defeated by a shorter, less-specific one from a different group
17	a rear view	clear	180	null	"rear view"	CLEAR_TERMS back-view group	Correct	Correct
18	a portrait facing the camera	none	—	—	(none)	"facing the camera" not in any lexicon (only "from the front"/"frontal"/"head-on"/"front view")	Could reasonably map to theta=0	Vocabulary gap
19	a side-on view	none	—	—	(none)	"side-on view" doesn't contain contiguous substring "side view" (hyphen+"-on" breaks it)	Could reasonably map to theta=90	Vocabulary gap — common synonym defeated by exact substring matching
20	the cat seen from below	ambiguous	—	—	"from below"	VAGUE_CUES "below" group	Candidates {0,-45},{325,-25},{35,-25}	Reasonable clarification
Five significant findings

1. Implementation error — phrase-priority bug (#16). The matcher sorts all phrases from all groups together by raw string length and matches longest-first. "3/4 rear" (8 chars) is explicitly in the lexicon to trigger theta=135, but "rear view" (9 chars, a different group) is longer and gets matched first, consuming the word "rear" before "3/4 rear" can be tried. Result: "a 3/4 rear view" silently collapses to a plain back view (180°) instead of the three-quarter-rear value the code's own data structure says it should produce. This is a genuine bug in the overlap-resolution logic, not a vocabulary gap.

2. Implementation error — qualifier blindness, internally inconsistent with plain() (#13). "slightly high angle" is parsed identically to "high angle" (phi=50) because the clear-term match only looks for the substring "high angle" and ignores "slightly". But plain() — the same file's own output-formatting function — defines a separate "slightly high angle" band (10–29°) distinct from "high angle" (30–79°). The input vocabulary and the output vocabulary disagree on what "slightly" means.

3. Vocabulary coverage gaps (#9, #18, #19). Three different mechanisms cause the same class of problem — near-synonyms failing exact substring/boundary matching: plural "three-quarters" vs. lexicon "three-quarter" (#9), "facing the camera" vs. lexicon "from the front" (#18), and "side-on" vs. lexicon "side view" (#19, blocked by the hyphen before "-on"). These are coverage decisions, not bugs — the code does exactly what it's built to do — but they represent a visible pattern of common phrasings the lexicon misses.

4. False match from object-name bleed (#4). "rear view mirror" (a car part) triggers the same "rear view" clear match as a genuine viewpoint request, producing theta=180 for a sentence that isn't about camera angle at all. The substring "rear view" is the cause; the parser has no mechanism to recognize that it's embedded in an object/part name rather than a free-standing viewpoint phrase.

5. Semantic ambiguity resolved as "clear" without a hedge — suitability point, not a bug (#3, #12). Two cases show the parser committing to a single interpretation where the phrase itself is genuinely multi-way: (a) "45 degree angle" (#12) is treated purely as elevation, though "45 degree" is also common shorthand for a 3/4 azimuth rotation in photography; (b) "looking up at the camera" (#3) describes the subject's gaze but is routed through a camera-position cue ("somewhere below the subject") as if the user specified where the camera should be. Neither is a code defect — both are deliberate design choices — but both are places where "clear"/"ambiguous" status may not match the actual certainty of the phrase.

Distribution vs. accuracy note: of the 20 inputs, 7 were clear, 9 ambiguous, 4 none — but that split says nothing about correctness. Two of the seven "clear" results (#4, #16) are arguably wrong given the stated design intent, and one "none" result (#9) is a near-miss that a small boundary change would fix. Distribution is a property of lexicon coverage; accuracy depends on whether each individual match was the right one for the input it fired on.

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
      "Suggested acceptable behaviour (proposal, not ground truth)",
      "Finding / uncertainty"
    ],
    [
      "1",
      "a cat, top-down view",
      "clear",
      "null",
      "90",
      "\"top-down\"",
      "CLEAR_TERMS top-down group; phi≥80 forces theta=null",
      "phi 90, theta undefined — direction is meaningless looking straight down",
      "Correct, no issue"
    ],
    [
      "2",
      "a cat seen from above",
      "ambiguous",
      "—",
      "—",
      "\"from above\"",
      "VAGUE_CUES \"above\" cue, no exact angle",
      "Candidates {0,55},{325,40},{35,40}; asking for an angle is reasonable",
      "\"from above\" treated differently from \"overhead\"/\"directly above\" (clear, phi 90) despite near-identical meaning — inconsistent synonym tier"
    ],
    [
      "3",
      "a cat looking up at the camera",
      "ambiguous",
      "—",
      "—",
      "\"looking up\"",
      "VAGUE_CUES \"looking up\" → \"somewhere below the subject\"",
      "Candidates {0,-45},{325,-25},{35,-25}",
      "This sentence describes the subject's gaze, not requested camera position — parser conflates subject orientation with camera position"
    ],
    [
      "4",
      "a car door with a rear view mirror",
      "clear",
      "180",
      "null",
      "\"rear view\"",
      "CLEAR_TERMS \"rear view\" matched inside \"rear view mirror\"",
      "Should likely be none — this names a car part, not a viewpoint",
      "False match: substring \"rear view\" fires regardless of surrounding object-name context (\"mirror\")"
    ],
    [
      "5",
      "the cat turned away from the camera",
      "none",
      "—",
      "—",
      "(none)",
      "No lexicon phrase matches",
      "Arguably equivalent to a back/180° view; could be added as a synonym",
      "Vocabulary gap — correct per current lexicon, but a plausible phrase for \"back view\" is unrecognized"
    ],
    [
      "6",
      "shot from the camera behind the cat",
      "ambiguous",
      "—",
      "—",
      "\"shot from\"",
      "GENERIC_WORDS fallback; \"from behind\" doesn't match (non-adjacent to \"behind\")",
      "\"behind the cat\" strongly implies back view (180°); flagging ambiguity to the user is acceptable, but discarding \"behind\" entirely loses signal",
      "Pattern-matching limitation: non-contiguous \"from … behind\" not recognized even though both words are present"
    ],
    [
      "7",
      "an over the shoulder shot",
      "ambiguous",
      "—",
      "—",
      "\"over the shoulder\"",
      "VAGUE_CUES group, 3 candidates",
      "Candidates {160,25},{200,25},{180,40}; genuine real-world ambiguity (which shoulder, how high)",
      "Reasonable clarification request"
    ],
    [
      "8",
      "the camera at 30 degrees elevation",
      "none",
      "—",
      "—",
      "(none)",
      "Only the literal \"45-degree\" family is in CLEAR_TERMS; \"30 degrees\" isn't",
      "Should probably be recognized as phi=30 (a numeric-degree parser, not hardcoded to 45)",
      "Significant vocabulary gap: no generic numeric-angle extraction exists at all"
    ],
    [
      "9",
      "the cat from three-quarters behind",
      "none",
      "—",
      "—",
      "(none)",
      "\"three-quarters\" (plural) fails the word-boundary check against lexicon entry \"three-quarter\" (singular)",
      "Could reasonably map to theta=135 like \"three-quarter rear\"",
      "Vocabulary gap: trailing \"s\" defeats an otherwise-covered concept"
    ],
    [
      "10",
      "shot from the balcony above",
      "ambiguous",
      "—",
      "—",
      "\"from the balcony\"",
      "VAGUE_CUES \"above\" group",
      "Candidates {0,55},{325,40},{35,40}",
      "Reasonable clarification"
    ],
    [
      "11",
      "a close-up of the cat's face",
      "none",
      "—",
      "—",
      "(none)",
      "No viewpoint term present (\"close-up\" isn't in any list)",
      "Correctly none — framing, not viewpoint",
      "Correct separation of framing vs. viewpoint"
    ],
    [
      "12",
      "a cat, 45 degree angle",
      "clear",
      "null",
      "45",
      "\"45 degree\"",
      "CLEAR_TERMS 45-degree group, phi=45",
      "Treat as elevation per this prototype's convention, but flag that \"45 degree angle\" is also commonly used for a 3/4 rotation (azimuth) in photography",
      "Semantic ambiguity resolved as \"clear\" with no hedge — may overstate confidence"
    ],
    [
      "13",
      "slightly high angle",
      "clear",
      "null",
      "50",
      "\"high angle\"",
      "CLEAR_TERMS \"high angle\" matches the substring regardless of \"slightly\"",
      "plain() itself defines \"slightly high angle\" as a separate 10–29° band — parsePrompt should arguably distinguish the qualifier",
      "Internal inconsistency between parse vocabulary and the code's own plain()-language bands"
    ],
    [
      "14",
      "portrait",
      "none",
      "—",
      "—",
      "(none)",
      "No match in any list",
      "Correctly none — \"portrait\" is framing/aspect, not a camera angle",
      "Correct"
    ],
    [
      "15",
      "a three-quarter rear view",
      "clear",
      "135",
      "null",
      "\"three-quarter rear\"",
      "Longest-phrase-first scan: 18-char phrase matched before shorter \"rear view\"/\"three-quarter\" could",
      "Matches lexicon intent",
      "Correct — longest-match-first worked as designed here"
    ],
    [
      "16",
      "a 3/4 rear view",
      "clear",
      "180",
      "null",
      "\"rear view\"",
      "\"rear view\" (9 chars) sorts ahead of \"3/4 rear\" (8 chars) in the global length-sorted match list, so it is matched and consumed first, even though \"3/4 rear\" is explicitly listed to produce theta=135",
      "Should produce theta=135, matching \"a three-quarter rear view\"",
      "Implementation bug: the single global length-sort across all groups doesn't guarantee a more-specific overlapping phrase wins; an explicitly-supported synonym (\"3/4 rear\") is silently defeated by a shorter, less-specific one from a different group"
    ],
    [
      "17",
      "a rear view",
      "clear",
      "180",
      "null",
      "\"rear view\"",
      "CLEAR_TERMS back-view group",
      "Correct",
      "Correct"
    ],
    [
      "18",
      "a portrait facing the camera",
      "none",
      "—",
      "—",
      "(none)",
      "\"facing the camera\" not in any lexicon (only \"from the front\"/\"frontal\"/\"head-on\"/\"front view\")",
      "Could reasonably map to theta=0",
      "Vocabulary gap"
    ],
    [
      "19",
      "a side-on view",
      "none",
      "—",
      "—",
      "(none)",
      "\"side-on view\" doesn't contain contiguous substring \"side view\" (hyphen+\"-on\" breaks it)",
      "Could reasonably map to theta=90",
      "Vocabulary gap — common synonym defeated by exact substring matching"
    ],
    [
      "20",
      "the cat seen from below",
      "ambiguous",
      "—",
      "—",
      "\"from below\"",
      "VAGUE_CUES \"below\" group",
      "Candidates {0,-45},{325,-25},{35,-25}",
      "Reasonable clarification"
    ]
  ]
]
```
