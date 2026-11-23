# Viewpoint Assistant for Text-to-Image Generation

README prose word count: about 1,540 (code and setup commands not counted)

An interactive assistant that helps people get a generated still image from the camera viewpoint they intend. It sits beside the text prompt, compares the requested viewpoint with the one in the image, and lets the person point the camera on a 360° sphere instead of guessing angle words.

Module project for LH/LM Intelligent Interactive Systems (University of Birmingham, 2026/27): Assignment 1 defined the problem; this repository holds the system for Assignment 2.

I developed the project idea and interaction design through Labs 1–5. Assignment 2 extends my Lab 3 specification and spherical controller into a complete interface. I used AI tools to assist with implementation and checking under my direction, and reviewed and revised the work myself.

## Project status

**Implemented** (runs in the browser, `prototype/index.html`)

- Reading the prompt: a rule-based lexicon maps viewpoint words to angles, and reports unclear, conflicting or missing viewpoints instead of guessing (`prototype/viewpoint.js`).
- Comparing the requested viewpoint with the detected one: match or mismatch, with a proposed correction.
- 360° sphere: drag the camera marker, sliders, shortcuts, tappable suggestions for unclear requests, plain-language readout, Undo.
- Confirm before generating: nothing is generated from an unclear angle, and nothing is regenerated until the person confirms.
- Version history: every generation is kept and can be reopened.

**Simulated** (labelled "simulated" in the interface)

- Image generation: a placeholder 3D render of a blocky cat stands in for the generated image. I continued using a cat from my earlier lab example. From text alone the simulated model ignores viewpoint words by default; with a confirmed angle it renders exactly that angle.
- Viewpoint detection: reads the angle of the placeholder render, so it is never wrong here.

**Planned / unfinished**

- A camera-controllable text-to-image model and a vision-language viewpoint detector.
- Comparison with text-only prompting (evaluation phase).

**Known limits of the prompt reader:** English only; it knows only the phrases in its lexicon (anything else is reported as no angle, and the person is asked); it matches words, not meaning, so "a rear view mirror" is read as a back view; "side view" is read as the right side; it cannot tell "the subject turns" from "the camera moves" ("from behind" is always read as the camera going behind the subject), which is the failure mode named in the Lab 2 worksheet. In the demo the simulated text-only model deliberately ignores viewpoint words, so examples A and C always start with a mismatch; the detector is never wrong, so wrong-detection cases are not demonstrated.

## Technology stack

- HTML, CSS and JavaScript with no build step, no dependencies and no API key.
- `prototype/viewpoint.js`: parsing and comparison rules (no DOM). `prototype/app.js`: interface, sphere and placeholder renderer.
- Tests use the Node.js built-in test runner.
- Lab 2 storyboard pages load Tailwind CSS from a CDN.
- No AI model is called at present. The model and detector for later phases are undecided.

## Running or inspecting the work

- Open `prototype/index.html` in a browser (works offline). Try examples A, B and C under the prompt box.
- Run the tests (Node.js 18 or later):

```bash
node --test tests/viewpoint.test.js
```

- Storyboards (screenshots of the prototype), the system architecture diagram and the model-check figure: `docs/a2/` (`storyboard_A_corrected.png`, `storyboard_B_asked.png`, `storyboard_C_precise.png`, `system_architecture.png`, `model_check_matrix.png`). The `.html` next to each image is its source; `docs/a2/screens/` holds the individual screenshots.
- Earlier stages: `prototype/sphere_controller.html` (Lab 3 sphere on its own), `docs/lab3/01_SPEC.md`, `docs/lab3/system_path.png`, and the Lab 2 pages in `docs/lab2/`.

## Development record

Work before 13 November 2026 was done outside Git and was imported in the first commit of this repository; its dates come from the module lab submissions.

- **Lab 1 and Assignment 1 (Sept–23 Oct 2026):** defined the problem (specifying camera viewpoint in text-to-image generation) and the research question from a literature review.
- **Lab 2 (Oct 2026):** one inference (requested vs detected viewpoint mismatch), interaction flow and three storyboards; corrections used one-tap preset buttons. Files: `docs/lab2/`.
- **Lab 3 (22 Oct 2026):** I developed the specification, including two tests, and the spherical controller prototype. Test B illustrated the problem of interpreting metaphorical phrases ("looking down from the stage") as literal angles. My design used a 360° sphere and opened it for clarification when wording was ambiguous. The Lab 3 prototype already included two sliders and a numeric readout sharing the same θ/φ state: the sphere for "about there", the numbers for "five degrees lower". Assignment 2 builds on this existing work. Files: `docs/lab3/`, `prototype/sphere_controller.html`. Imported in [167078f](https://github.com/ShiSongLin6/viewpoint-assistant/commit/167078f).
- **Assignment 2 (from 13 Nov 2026):**
  - *Prompt reading and comparison made real* ([98f81b9](https://github.com/ShiSongLin6/viewpoint-assistant/commit/98f81b9)). In Lab 3 these steps were mocked. Rules were chosen over a language model so the behaviour is transparent, testable and runs without an API key. Unclear or conflicting phrases return suggestions, never an angle. Checked with unit tests (17 at that commit; 18 after the fix below), including Lab 3 Tests A and B and a whole-word check ("triangle" is not "angle").
  - *Full interaction loop* ([05ebff9](https://github.com/ShiSongLin6/viewpoint-assistant/commit/05ebff9)). The sphere was embedded in a prompt → interpretation → result → correction loop with a version history. Generation and detection stay simulated so that interface behaviour can be examined separately from model accuracy. Suggestions were spread apart and kept visible while dragging, after the first layout made them overlap. Checked by walking examples A–C, the no-angle case, Undo and version switching in a browser.
  - *Storyboards and architecture diagram redrawn for this version.* The Lab 2 storyboards showed preset buttons and the Lab 3 path diagram still marked prompt reading and comparison as mocked; both were out of date. The three new storyboards use screenshots of the prototype (A: wrong angle corrected, B: metaphor, C: precise angle), and every component in the diagram is marked implemented, simulated or planned to match the code.
  - *Parser fix after the model check* ([36d3ba3](https://github.com/ShiSongLin6/viewpoint-assistant/commit/36d3ba3)). In the 17 Nov check (see AI assistance), all seven models that disagreed with my parser expected θ135 for "a 3/4 rear view", but the parser printed θ180 because the shorter "rear view" was matched first. I decided to fix the rule rather than list it as a limit. Checked: 18 unit tests pass, and re-running the same 20 inputs changes only that case. Record: `docs/a2/model_check/05_post_fix_recheck_20261123.md`.
  - *My review decisions on figures and scope (16–19 Nov).* I kept the full sphere card in storyboard frame B3 so that the Confirm button, the system's key control, is visible, and kept frame C3 short because its sliders already show the action. For the model check I compared bar, dot, table and matrix versions and chose the input-by-model matrix, because it shows where the disagreements are; I asked for each model's platform to be labelled. I kept the cat placeholder and used my game-art examples only as motivation, so the prototype stays a single-subject camera-angle system.

## AI assistance

- **Google Gemini (Lab 3):** I asked Gemini to review my specification, sphere projection maths and fallback design. The specification, prototype and design decisions were my own. Full record: `docs/lab3/02_PROMPT_LOG.md`.
- **Claude (Anthropic), in Claude Code (Assignment 2):** I used Claude Code to help organise the brief, set up the repository and implement the expanded interface from my Lab 3 specification, prototype and instructions. This included code assistance for `viewpoint.js`, its tests, `index.html` and `app.js`. I also directed it to run checks and review the code and diagrams against the brief. I reviewed the work and made revisions; the project idea and interaction design were mine. AI-assisted commits carry a `Co-Authored-By: Claude` line.
- **School bAI platform (17 Nov):** I asked Codex to prepare a fixed 20-input parser review packet, operate the school platform and record replies from its 14 listed models. The replies were compared with locally executed parser outputs. Model names, original replies and discrepancies are in `docs/a2/model_check/04_comparison.md`; I did not take the models' agreement as the answer: I ran the parser locally, fixed #16 and kept #4 ("a rear view mirror") and #5 (the subject turning vs the camera moving) as documented limits. Two further models, DeepSeek V4.1 Flash and Doubao 2.1 Lite, were run in the Doubao app.

## Additional files

- `docs/a2/model_check/`: a fixed 20-input packet for LLM-assisted parser review, including the source snapshot, local executed outputs, replies from 14 school-platform models, an output comparison and a student review template. My decisions and the re-check after the fix are in `05_post_fix_recheck_20261123.md`; the figure versions I compared are in `figure_versions/`.
- `docs/a2/`: Assignment 2 storyboards, architecture diagram and model-check figure (PNG plus HTML or SVG source). `docs/a2/motivation/` holds examples from my own game-art work, not produced by this system: `first_person_and_orientation.png` shows a first-person request that still came back as an outside view, and a character drawn facing the player when I asked for a side-back view; the two full-size images of the second case are alongside. They illustrate my motivation; the prototype itself uses the cat example.
- `docs/lab2/`: Lab 2 worksheet and storyboard pages (student ID removed for the public repository).
- `docs/lab3/`: Lab 3 specification, prompt log and system path diagram.
