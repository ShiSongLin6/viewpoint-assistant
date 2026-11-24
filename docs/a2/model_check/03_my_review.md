# Model check: my review and judgement

For each of the 20 fixed inputs: the executed output, what the models predicted, and my own judgement of what is acceptable and what to do. The model findings are recorded as they were; the acceptable outcome and the action are my decisions.

- Platform: 16 model identities — 14 on University of Birmingham bAI (OneChat), plus DeepSeek V4.1 Flash and Doubao 2.1 Lite in the Doubao app
- Test date: 2026-11-17
- Execution status: models gave static predictions (some claimed to have run code); local parser was actually executed in Node
- Replies and comparison: see `replies/` and `04_comparison.md`
- Prompt: `01_uniform_prompt.md` (unmodified)
- Code commit (before the fix): dff2af6ba5cf8408893467e6c7eb43e67dacf167
- Code SHA-256 (before the fix): 47c06d79c6a8a06848c28570131ab3cd5160e350a3df65551464368bc86c5645

| ID | Exact input | Local actual output | Model prediction / finding | My acceptable outcome and reason | My judgement / action |
|---|---|---|---|---|---|
| 1 | a cat, top-down view | clear; θ=null, φ=90 | All 16 agreed with local | Local output is acceptable: top-down is a clear elevation-only request | Keep; no change |
| 2 | a cat seen from above | ambiguous | All 16 agreed | Acceptable: "from above" gives a high area but no exact angle | Keep; no change |
| 3 | a cat looking up at the camera | ambiguous | All 16 agreed | Acceptable: describes the subject's action, not a fixed camera angle | Keep; no change |
| 4 | a car door with a rear view mirror | clear; θ=180, φ=null | Mistral predicted none; others clear | Local clear is the known word-boundary behaviour, not a desired angle | Keep as a documented limit (rear view mirror false hit) |
| 5 | the cat turned away from the camera | none | Llama predicted clear; others none | Local none is correct: a subject turning is not the camera moving | Keep; no change |
| 6 | shot from the camera behind the cat | ambiguous | Mistral, GPT-6 Luna, Llama predicted clear; others ambiguous | Two ways of working: in everyday use a plain back view is enough, so anything near θ180 within tolerance counts as a match; in precision work such as a game, a side-back angle must be exact, so the user pulls the exact degree on the sphere. Describing that exact angle in words means first learning the θ/φ coordinate system, a high barrier, so pointing is the natural path; the system cannot tell which case the user is in, so it must not guess | Keep local ambiguous and open the sphere: a user who only wants the back confirms it, while a precision user drags to the exact side-back; control stays with the person |
| 7 | an over the shoulder shot | ambiguous | All 16 agreed | Acceptable: a named shot type with no exact θ/φ | Keep; no change |
| 8 | the camera at 30 degrees elevation | none | GPT-6 Sol predicted ambiguous, Llama clear; others none | The lexicon has no rule for a bare "number + elevation", so the parser cannot map it; the honest move is to tell the user it does not understand rather than guess | Keep none; tell the user the angle was not recognised and let them point on the sphere |
| 9 | the cat from three-quarters behind | none | Mistral, Llama predicted clear; others none | "three-quarters behind" is not in the lexicon (only the three-quarter rear/back forms), so it cannot be mapped | Keep none; report it as not recognised and ask the user to point |
| 10 | shot from the balcony above | ambiguous | All 16 agreed | Acceptable: a metaphor, no literal angle | Keep; no change |
| 11 | a close-up of the cat's face | none | All 16 agreed | Acceptable: close-up is a distance, not an angle | Keep; no change |
| 12 | a cat, 45 degree angle | clear; θ=null, φ=45 | All 16 agreed | Acceptable: single number read as elevation | Keep; no change |
| 13 | slightly high angle | clear; θ=null, φ=50 | Mistral predicted none, Llama φ=10; others clear φ=50 | "slightly high" is a natural-language range with no fixed degree; how slight cannot be known from words alone. In low-stakes use φ50 and φ10 are both acceptable within tolerance; in precision work such as a game the user sets the exact value on the sphere | Keep local φ50 as a reasonable default, not a precise claim; exact angles are confirmed by the user on the sphere |
| 14 | portrait | none | All 16 agreed | Acceptable: no viewpoint word | Keep; no change |
| 15 | a three-quarter rear view | clear; θ=135, φ=null | All 16 agreed | Acceptable: full phrase maps to a clear azimuth | Keep; no change |
| 16 | a 3/4 rear view | clear; θ=180, φ=null (pre-fix) | Seven models θ=135; local θ=180 | The lexicon lacked the full phrase "3/4 rear view", so the longer "rear view" won; the full phrase should win | Fixed to θ=135 by adding the full phrase (commit 21771c80bedc9c142db83e26bcb174ef5e58be63), 18 tests pass |
| 17 | a rear view | clear; θ=180, φ=null | All 16 agreed | Acceptable: plain rear view maps to θ=180 | Keep; no change |
| 18 | a portrait facing the camera | none | Llama predicted clear; others none | Adding every phrase a user might say is the train/test problem in another form: natural-language phrasings are open-ended, so the rule list can never cover them all, and memorising more phrases is not generalisation. A rule-based parser cannot know a phrase it was never given, so the honest move is to say so rather than pretend it understands | Keep none; report it as not recognised and let the user point on the sphere |
| 19 | a side-on view | none | Mistral, Llama predicted clear; others none | "side-on" is not in the lexicon (only "side view" and related forms), so it cannot be mapped | Keep none; report it as not recognised and ask the user to point |
| 20 | the cat seen from below | ambiguous | All 16 agreed | Acceptable: "from below" gives a low area, no exact angle | Keep; no change |

## My conclusions

- Confirmed: two things. First, #16 was a real bug: matching takes the longest phrase first, and because the lexicon lacked the full phrase "3/4 rear view", "rear view" (one character longer than "3/4 rear") won, so the parser printed θ180 instead of θ135. Second, a rule-based parser only matches its fixed lexicon, so synonym phrasings it was never given (side-on, three-quarters behind, a bare number + elevation, facing the camera) are not recognised; and words such as "behind" and "slightly high" name a range, not one exact point.
- Not accepted: I did not take the seven models' agreement on θ135 for #16 as proof; I ran the code first, which exposed the missing phrase, and only accepted θ135 after fixing it. I also did not follow the models that would label #6/#8/#9/#18/#19 as clear, because the system cannot know the user's real intent from a vague or unlisted phrase, so asking is safer than guessing.
- Fixed or kept: fixed #16 by adding the longer "...rear view" phrases that win by longest-first matching. Kept #4 (rear view mirror), #5 (subject turning vs camera moving) and #8/#9/#18/#19 (unlisted phrases) as documented limits, because adding every possible phrase is open-ended and does not produce generalisation; kept #6 ambiguous and #13's φ50 as a reasonable default rather than a precise value.
- Change and re-check: the #16 fix is commit 21771c80bedc9c142db83e26bcb174ef5e58be63; all 18 unit tests pass, and re-running the same 20 inputs changes only #16's angle (and #15's matched phrase, same angle) (record `05_post_fix_recheck_20261123.md`).

Agreement between models is not proof of correctness. This check is not a participant study, and the system does not call a language model at run time.
