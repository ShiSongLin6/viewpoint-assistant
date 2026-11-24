# Model predictions compared with the executed parser output

Date: 17 Nov 2026 (Europe/London). Every model got the same prompt (`01_uniform_prompt.md`, 13,956 characters) in a new conversation, and one reply per model is kept. 16 models in total: 14 on the University of Birmingham bAI platform (OneChat) and two in the Doubao app (DeepSeek V4.1 Flash and Doubao 2.1 Lite). Model names are as displayed by the platform; the underlying versions were not independently verified.

The table checks only whether a model predicted the parser's `kind` and, for `clear` results, θ/φ. It does not measure whether the parser does what a user means, and it is not an accuracy ranking of the models: their tools differed and each gave one reply. Matched terms, suggestions and explanations are not scored here; they are in the replies.

| Model | Platform | Model's own statement | Rows matching the executed output | Differing inputs | Reply |
|---|---|---|---|---|---|
| Mistral Large 3 | bAI | static prediction | 14/20 | 4, 6, 9, 13, 16, 19 | [reply](replies/01_Mistral_Large_3.md) |
| GPT-6 Luna | bAI | static prediction | 18/20 | 6, 16 | [reply](replies/02_GPT_6_Luna.md) |
| GPT-5.6 Sol | bAI | static prediction | 19/20 | 16 | [reply](replies/03_GPT_5_6_Sol.md) |
| GPT-6 Sol | bAI | static prediction | 18/20 | 8, 16 | [reply](replies/04_GPT_6_Sol.md) |
| GPT-5.6 Terra | bAI | static prediction | 19/20 | 16 | [reply](replies/05_GPT_5_6_Terra.md) |
| GPT-5.6 Luna | bAI | static prediction | 19/20 | 16 | [reply](replies/06_GPT_5_6_Luna.md) |
| GPT-5.1 | bAI | static prediction | 20/20 | — | [reply](replies/07_GPT_5_1.md) |
| Claude Sonnet 5 | bAI | says it executed the code | 20/20 | — | [reply](replies/08_Claude_Sonnet_5.md) |
| Claude Sonnet 4.6 | bAI | says it executed the code | 20/20 | — | [reply](replies/09_Claude_Sonnet_4_6.md) |
| Claude Opus 5.5 | bAI | says it executed the code | 20/20 | — | [reply](replies/10_Claude_Opus_5_5.md) |
| Claude Opus 5 | bAI | says it executed the code | 20/20 | — | [reply](replies/11_Claude_Opus_5.md) |
| Claude Opus 4.6 | bAI | says it executed the code | 20/20 | — | [reply](replies/12_Claude_Opus_4_6.md) |
| Claude Haiku 5.5 | bAI | static prediction | 20/20 | — | [reply](replies/13_Claude_Haiku_5_5.md) |
| Llama-4 Maverick | bAI | says it executed the code | 12/20 | 5, 6, 8, 9, 13, 16, 18, 19 | [reply](replies/14_Llama_4_Maverick.md) |
| DeepSeek V4.1 Flash | Doubao app | says it executed the code | 20/20 | — | [reply](replies/15_DeepSeek_V4_1_Flash.md) |
| Doubao 2.1 Lite | Doubao app | static prediction | 20/20 | — | [reply](replies/16_Doubao_2_1_Lite.md) |

Nine of the 16 matched on all 20 rows; seven differed somewhere, and all seven differed on #16. The matrix figure in the report (Figure 5) is `../model_check_matrix.png`; the other chart versions I compared are in `figure_versions/`.

## Differences (model prediction → executed output)

**Mistral Large 3**
- #4 `a car door with a rear view mirror`: kind none → clear
- #6 `shot from the camera behind the cat`: kind clear → ambiguous
- #9 `the cat from three-quarters behind`: kind clear → none
- #13 `slightly high angle`: kind none → clear
- #16 `a 3/4 rear view`: θ 135 → 180
- #19 `a side-on view`: kind clear → none

**GPT-6 Luna**
- #6 `shot from the camera behind the cat`: kind clear → ambiguous
- #16 `a 3/4 rear view`: θ 135 → 180

**GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna**
- #16 `a 3/4 rear view`: θ 135 → 180

**GPT-6 Sol**
- #8 `the camera at 30 degrees elevation`: kind ambiguous → none
- #16 `a 3/4 rear view`: θ 135 → 180

**Llama-4 Maverick**
- #5 `the cat turned away from the camera`: kind clear → none
- #6 `shot from the camera behind the cat`: kind clear → ambiguous
- #8 `the camera at 30 degrees elevation`: kind clear → none
- #9 `the cat from three-quarters behind`: kind clear → none
- #13 `slightly high angle`: φ 10 → 50
- #16 `a 3/4 rear view`: θ 135 → 180
- #18 `a portrait facing the camera`: kind clear → none
- #19 `a side-on view`: kind clear → none

## Notes

- Seven models predicted θ 135 for #16; the executed parser gave θ 180. Their agreement did not decide the answer: running the code did, and it showed that the lexicon lacked the full phrase (see `05_post_fix_recheck_20261123.md`).
- Claude Sonnet 4.6 and Claude Opus 4.6 gave summary counts in their text (10/7/3 and 7/7/6 clear/ambiguous/none) that do not match their own full tables; both full tables agree with the executed output row by row (7/6/7). Both the text and the tables are kept.
- Llama-4 Maverick said it had executed the code, yet 8 rows differ. A model's statement that it ran the code is recorded, not treated as proof.
- DeepSeek V4.1 Flash also raised points for my review, including: #6 loses the "behind" direction, the 45° in #12 has no stated axis, #13 silently becomes φ 50, and #4 and #16 are wrong matches. My decisions on these are in `03_my_review.md`.
- The parser was not changed during the check; its SHA-256 matched the snapshot in the prompt.
