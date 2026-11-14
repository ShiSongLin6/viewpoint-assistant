# Viewpoint Assistant for Text-to-Image Generation

README prose word count: TODO (update before submission; code and commands not counted)

An interactive assistant that helps people get a generated still image from the camera viewpoint they intend. It sits beside the text prompt, compares the requested viewpoint with the one in the image, and lets the person point the camera on a 360° sphere instead of guessing angle words.

Module project for LH/LM Intelligent Interactive Systems (University of Birmingham, 2026/27): Assignment 1 defined the problem; this repository holds the system for Assignment 2.

## Project status

> Draft: this section will be finalised before submission.

**Implemented** (runs in the browser, `prototype/index.html`)

- Reading the prompt: a rule-based lexicon maps viewpoint words to angles, and reports unclear, conflicting or missing viewpoints instead of guessing (`prototype/viewpoint.js`).
- Comparing the requested viewpoint with the detected one: match or mismatch, with a proposed correction.
- 360° sphere: drag the camera marker, sliders, shortcuts, tappable suggestions for unclear requests, plain-language readout, Undo.
- Confirm before generating: nothing is generated from an unclear angle, and nothing is regenerated until the person confirms.
- Version history: every generation is kept and can be reopened.

**Simulated** (labelled "simulated" in the interface)

- Image generation: a placeholder 3D render of a blocky cat stands in for the generated image. From text alone the simulated model ignores viewpoint words by default; with a confirmed angle it renders exactly that angle.
- Viewpoint detection: reads the angle of the placeholder render, so it is never wrong here.

**Planned / unfinished**

- A camera-controllable text-to-image model and a vision-language viewpoint detector.
- Updated storyboards and system diagram for this version.
- Comparison with text-only prompting (evaluation phase).

**Known limits of the prompt reader:** English only; it knows only the phrases in its lexicon; "side view" is read as the right side.

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

- Earlier stages: `prototype/sphere_controller.html` (Lab 3 sphere on its own), `docs/lab3/01_SPEC.md`, `docs/lab3/system_path.png`, and the Lab 2 pages in `docs/lab2/`.

## Development record

Work before 13 November 2026 was done outside Git and was imported in the first commit of this repository; its dates come from the module lab submissions.

- **Lab 1 and Assignment 1 (Sept–23 Oct 2026):** defined the problem (specifying camera viewpoint in text-to-image generation) and the research question from a literature review.
- **Lab 2 (Oct 2026):** one inference (requested vs detected viewpoint mismatch), interaction flow and three storyboards; corrections used one-tap preset buttons. Files: `docs/lab2/`.
- **Lab 3 (22 Oct 2026):** specification with two tests. Test B showed that metaphorical phrases ("looking down from the stage") were read as literal angles, so the main control changed from presets to the 360° sphere, and ambiguous phrases now open the sphere instead of generating. Files: `docs/lab3/`, `prototype/sphere_controller.html`. Imported in [167078f](https://github.com/ShiSongLin6/viewpoint-assistant/commit/167078f).
- **Assignment 2 (from 13 Nov 2026):**
  - *Prompt reading and comparison made real* ([98f81b9](https://github.com/ShiSongLin6/viewpoint-assistant/commit/98f81b9)). In Lab 3 these steps were mocked. Rules were chosen over a language model so the behaviour is transparent, testable and runs without an API key. Unclear or conflicting phrases return suggestions, never an angle. Checked with 14 unit tests, including Lab 3 Tests A and B and a whole-word check ("triangle" is not "angle").
  - *Full interaction loop* ([05ebff9](https://github.com/ShiSongLin6/viewpoint-assistant/commit/05ebff9)). The sphere was embedded in a prompt → interpretation → result → correction loop with a version history. Generation and detection stay simulated so that interface behaviour can be examined separately from model accuracy. Suggestions were spread apart and kept visible while dragging, after the first layout made them overlap. Checked by walking examples A–C, the no-angle case, Undo and version switching in a browser.
  - TODO: storyboards, system diagram, and my own review and changes.

## AI assistance

- **Google Gemini (Lab 3):** reviewed the specification, the sphere projection maths and the fallback design. Kept: consistent `[MOCKED]` labels, 2–3 candidate anchors and touch support. Rejected: turning the component table into plain text. Full record: `docs/lab3/02_PROMPT_LOG.md`.
- **Claude (Anthropic), in Claude Code (Assignment 2):** organised the assignment brief into study notes; set up this repository; wrote the first version of `viewpoint.js`, its tests, `index.html` and `app.js` from my Lab 3 specification and sphere prototype, and ran the checks listed above. Commits made this way carry a `Co-Authored-By: Claude` line.
- TODO: what I reviewed, changed or rejected in the Claude-written code, with examples.

## Additional files

- `docs/lab2/`: Lab 2 worksheet and storyboard pages (student ID removed for the public repository).
- `docs/lab3/`: Lab 3 specification, prompt log and system path diagram.
