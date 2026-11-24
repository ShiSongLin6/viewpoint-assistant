# Model check of the prompt parser (17 Nov 2026)

I used language models to cross-check my rule-based parser: each model received the same source code and 20 fixed inputs and predicted what `parsePrompt` would return. I then ran the parser myself and compared. The models' answers were never taken as correct; the executed output decided.

Read in this order:

1. `04_comparison.md`: which models differed from the executed output, and on which inputs.
2. `03_my_review.md`: my judgement on each of the 20 inputs and what I changed or kept.
3. `05_post_fix_recheck_20261123.md`: the re-check after fixing #16.

Supporting files:

- `01_uniform_prompt.md`: the identical prompt sent to every model (code and 20 inputs included).
- `02_local_outputs.md`: the parser's executed outputs; `exec/` holds the runner script and its log.
- `replies/`: one reply per model as returned (16 models: 14 on the University of Birmingham bAI platform, DeepSeek V4.1 Flash and Doubao 2.1 Lite in the Doubao app). `replies/attachments/` holds two full tables that two models returned as files.
- `figure_versions/`: the four chart versions I compared before choosing the input-by-model matrix used in the report (Figure 5).

Fixed versions for the check: code at commit `dff2af6ba5cf8408893467e6c7eb43e67dacf167` (before the fix), `prototype/viewpoint.js` SHA-256 `47c06d79…5c645`, Node.js v22.16.0. The code was not changed during the check. The prompt, the runner and the replies are kept verbatim, so they quote that commit as `bbe2359`, its id before the repository history was rewritten to remove private working files; it is the same code as `dff2af6` here.

This was a check of code behaviour, not a participant study, and no language model is called by the prototype at run time.
