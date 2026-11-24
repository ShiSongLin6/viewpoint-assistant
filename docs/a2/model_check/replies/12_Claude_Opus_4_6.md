# Claude Opus 4.6

Platform: University of Birmingham bAI

Date: 2026-11-17 (Europe/London)

Displayed selection: Selected model: Anthropic Claude Opus 4.6

Chat: https://ai.bham.ac.uk/chat/onechat/003cd7dc-a848-c558-8d2f-b20b19c3f62d

Prompt: ../01_uniform_prompt.md (identical text; 13,956 characters)

Status: completed response captured and model/chat attribution checked; execution claims are the model's own declaration.

## Original response (rendered text)

Now I have all the executed results. Let me compile the full review. The review is complete. I executed all 20 inputs against your parser using Node.js and compiled the results into the artifact above.

Headline takeaways:

2 implementation errors: the "3/4 rear view" longest-match ordering bug (input 16, produces 180° instead of 135°) and the "rear view mirror" false positive (input 4, object name matched as viewpoint).
1 semantic inversion: "looking up" (input 3) is mapped to camera-below, but the sentence means the subject looks up at a camera that is above it.
6 vocabulary gaps across inputs 6, 8, 9, 13, 18, 19 — ranging from a simple missing plural ("three-quarters") to the structural absence of numeric angle extraction.
Distribution: 7 clear / 7 ambiguous / 6 none, but roughly 5–6 of the 20 produce results that diverge from likely user intent.

The findings and suggested behaviours in the table are proposals for your review — you'll judge which warrant changes.

Viewpoint Parser Review — 20 Fixed Inputs
v1
Markdown

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
      "Suggested acceptable behaviour",
      "Finding / uncertainty"
    ],
    [
      "1",
      "a cat, top-down view",
      "clear",
      "null",
      "90",
      "`top-down`",
      "Matched clear term \"top-down\" → phi 90; phi ≥ 80 so theta nulled",
      "Correct. Top-down is directly above; theta is meaningless.",
      "No issue."
    ],
    [
      "2",
      "a cat seen from above",
      "ambiguous",
      "—",
      "—",
      "`from above`",
      "Matched vague cue \"from above\" → somewhere above, 3 candidates",
      "Reasonable. \"From above\" implies elevated camera but no single angle. Ambiguous is defensible.",
      "\"seen from\" is also a GENERIC_WORD but vague cue fires first on the clear-rest text; no conflict, but the generic match is silently shadowed."
    ],
    [
      "3",
      "a cat looking up at the camera",
      "ambiguous",
      "—",
      "—",
      "`looking up`",
      "Matched vague cue \"looking up\" → somewhere below the subject, 3 candidates with negative phi",
      "**Questionable.** \"Looking up\" here describes the *subject's* pose (cat's gaze direction), not camera position. A cat looking up at the camera implies the camera is *above*, not below.",
      "Semantic inversion: the parser treats \"looking up\" as camera-below, but the sentence means the subject looks upward toward a camera that is above it. The vague cue conflates subject gaze with camera placement."
    ],
    [
      "4",
      "a car door with a rear view mirror",
      "clear",
      "180",
      "null",
      "`rear view`",
      "Substring \"rear view\" in \"rear view mirror\" matched clear term → theta 180",
      "**Should be `none`.** \"Rear view mirror\" is an object name, not a viewpoint instruction.",
      "False match: the substring `rear view` inside the compound noun \"rear view mirror\" triggers the back-view rule. The parser has no object-name exclusion."
    ],
    [
      "5",
      "the cat turned away from the camera",
      "none",
      "—",
      "—",
      "*(none)*",
      "No clear, vague, or generic terms found",
      "Reasonable as `none`. The phrase describes subject orientation, not camera position. Could also be argued as implying a back view, but that's interpretive.",
      "Borderline. \"Turned away\" might imply a rear view to some users, but treating subject orientation as outside parser scope is a valid design choice."
    ],
    [
      "6",
      "shot from the camera behind the cat",
      "ambiguous",
      "—",
      "—",
      "`shot from`",
      "No clear or vague terms; \"shot from\" matched as GENERIC_WORD",
      "**Questionable.** \"Behind the cat\" strongly implies theta ≈ 180 but is not captured. Only the generic \"shot from\" is detected.",
      "Vocabulary gap: \"behind\" (without \"from behind\" as an exact phrase) is not in any lexicon. The word order \"camera behind the cat\" does not contain the substring \"from behind\". The directional content is lost."
    ],
    [
      "7",
      "an over the shoulder shot",
      "ambiguous",
      "—",
      "—",
      "`over the shoulder`",
      "Matched vague cue → behind and above, 3 candidates",
      "Reasonable. Over-the-shoulder is inherently ambiguous (left vs right shoulder, exact elevation). Asking for clarification is appropriate.",
      "No issue."
    ],
    [
      "8",
      "the camera at 30 degrees elevation",
      "none",
      "—",
      "—",
      "*(none)*",
      "No terms matched; \"30 degrees\" is not in the lexicon, \"elevation\" is not a known word",
      "**Missed.** The user specified an exact numeric elevation (phi = 30). The parser has no numeric extraction.",
      "Vocabulary gap: the parser only recognises pre-listed degree values (45°). Arbitrary numeric angles like \"30 degrees\" are invisible."
    ],
    [
      "9",
      "the cat from three-quarters behind",
      "none",
      "—",
      "—",
      "*(none)*",
      "No terms matched",
      "**Missed.** \"Three-quarters behind\" is a natural synonym for three-quarter rear.",
      "Vocabulary gap: the lexicon has \"three-quarter rear\" and \"three-quarter back\" but not \"three-quarter**s**\" (with trailing 's') or \"three-quarter behind\" / \"three-quarters behind\". The plural 's' breaks the match."
    ],
    [
      "10",
      "shot from the balcony above",
      "ambiguous",
      "—",
      "—",
      "`from the balcony`",
      "Matched vague cue \"from the balcony\" → somewhere above, 3 candidates",
      "Reasonable. \"From the balcony\" implies high but not a specific angle.",
      "No issue. \"shot from\" would also be a generic match but the vague cue on \"from the balcony\" fires first during the clear→vague scan pipeline."
    ],
    [
      "11",
      "a close-up of the cat's face",
      "none",
      "—",
      "—",
      "*(none)*",
      "No terms matched",
      "Reasonable as `none`. \"Close-up\" is a framing instruction, not a viewpoint.",
      "No issue. Framing and viewpoint are correctly kept separate by the absence of \"close-up\" from the lexicon."
    ],
    [
      "12",
      "a cat, 45 degree angle",
      "clear",
      "null",
      "45",
      "`45 degree`",
      "Matched clear term \"45 degree\" → phi 45",
      "Partially acceptable. The phi mapping is reasonable, but \"45 degree angle\" is ambiguous in natural language — it could mean azimuth or elevation. The parser assumes elevation only.",
      "Semantic ambiguity: \"45 degree angle\" could mean theta = 45 (three-quarter front) or phi = 45 (high angle) or a compound of both. The parser picks phi only with no flag. Whether this should be `clear` or `ambiguous` is debatable."
    ],
    [
      "13",
      "slightly high angle",
      "clear",
      "null",
      "50",
      "`high angle`",
      "Matched \"high angle\" → phi 50",
      "**Questionable.** The adverb \"slightly\" modifies the angle downward, but the parser returns the full high-angle value (phi 50). \"Slightly high\" should produce a lower phi than unmodified \"high angle\".",
      "Vocabulary gap / false precision: \"slightly\" is not in the lexicon and is silently ignored. The matched substring is `high angle`; the modifier is lost. A phi around 20–30 would better fit \"slightly high\"."
    ],
    [
      "14",
      "portrait",
      "none",
      "—",
      "—",
      "*(none)*",
      "No terms matched",
      "Debatable. \"Portrait\" in photography typically implies a front or near-front view at roughly eye level, but it also denotes framing (head-and-shoulders crop). `none` or `ambiguous` are both defensible.",
      "Vocabulary gap or design choice. If \"portrait\" is treated as framing only, `none` is correct. If it implies a conventional front-facing angle, the parser misses it."
    ],
    [
      "15",
      "a three-quarter rear view",
      "clear",
      "135",
      "null",
      "`three-quarter rear`",
      "Matched clear term \"three-quarter rear\" → theta 135",
      "Correct. The longest-match-first rule correctly consumes \"three-quarter rear\" before \"rear view\" or \"three-quarter\" can match individually.",
      "No issue. This is the intended behaviour of the longest-first scan."
    ],
    [
      "16",
      "a 3/4 rear view",
      "clear",
      "180",
      "null",
      "`rear view`",
      "\"rear view\" (9 chars) is longer than \"3/4 rear\" (8 chars), so \"rear view\" is matched first, consuming \"rear view\" and leaving \"3/4\" unrecognised",
      "**Wrong match.** Should match \"3/4 rear\" → theta 135, not \"rear view\" → theta 180.",
      "**Longest-match ordering bug:** the scan sorts all phrases globally by string length. \"rear view\" (9 chars) > \"3/4 rear\" (8 chars), so \"rear view\" wins the race. The compound \"3/4 rear view\" is not in the lexicon, and the intended \"3/4 rear\" is 1 character shorter than the unintended \"rear view\". This produces theta 180 instead of 135 — a 45° error."
    ],
    [
      "17",
      "a rear view",
      "clear",
      "180",
      "null",
      "`rear view`",
      "Matched clear term \"rear view\" → theta 180",
      "Correct.",
      "No issue."
    ],
    [
      "18",
      "a portrait facing the camera",
      "none",
      "—",
      "—",
      "*(none)*",
      "No terms matched; \"facing the camera\" and \"portrait\" are not in any lexicon",
      "Debatable. \"Facing the camera\" strongly implies theta = 0 (front view). `none` loses that signal.",
      "Vocabulary gap: \"facing the camera\" is a natural way to say \"front view\" but is not in CLEAR_TERMS."
    ],
    [
      "19",
      "a side-on view",
      "none",
      "—",
      "—",
      "*(none)*",
      "No terms matched",
      "**Missed.** \"Side-on\" is a common synonym for side view.",
      "Vocabulary gap: the lexicon has \"side view\", \"side-view\", \"from the side\" but not \"side-on\". The hyphen in the input is a regular hyphen; the issue is purely that the phrase is absent."
    ],
    [
      "20",
      "the cat seen from below",
      "ambiguous",
      "—",
      "—",
      "`from below`",
      "Matched vague cue \"from below\" → somewhere below, 3 candidates",
      "Reasonable. \"From below\" implies low camera but not a unique angle.",
      "\"seen from\" is also a GENERIC_WORD but is not reached because the vague cue already consumed \"from below\" from the residual text. No conflict."
    ],
    [
      "6",
      "\"behind\" (standalone, not \"from behind\")",
      "generic on \"shot from\"",
      "theta ≈ 180"
    ],
    [
      "8",
      "\"30 degrees elevation\" (arbitrary numeric)",
      "none",
      "phi = 30, clear"
    ],
    [
      "9",
      "\"three-quarters\" (plural 's')",
      "none",
      "theta = 135"
    ],
    [
      "13",
      "\"slightly\" (adverb modifier)",
      "ignored; full \"high angle\" returned",
      "phi reduced below 50"
    ],
    [
      "18",
      "\"facing the camera\"",
      "none",
      "theta = 0"
    ],
    [
      "19",
      "\"side-on\"",
      "none",
      "theta = 90"
    ]
  ]
]
```

## Downloaded model artifact

The original Markdown artifact was downloaded through the platform UI: [original artifact](attachments/12_Opus_4_6_original_artifact.md). Its result rows have been added to the captured table cells above; the source text is preserved.
