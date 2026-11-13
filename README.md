# Viewpoint Assistant for Text-to-Image Generation

README prose word count: TODO (update before submission; code and commands not counted)

An interactive assistant that helps people get a generated still image from the camera viewpoint they intend. It sits beside the text prompt, compares the requested viewpoint with the one in the image, and lets the person point the camera on a 360° sphere instead of guessing angle words.

Module project for LH/LM Intelligent Interactive Systems (University of Birmingham, 2026/27): Assignment 1 defined the problem; this repository holds the system for Assignment 2.

## Project status

> Draft: this section will be finalised before submission.

- **Implemented:** 360° spherical viewpoint controller (`prototype/sphere_controller.html`): draggable camera marker, azimuth θ and elevation φ sliders, presets, 2–3 candidate positions for ambiguous requests, confirm-before-generate and Undo.
- **Simulated:** viewpoint extraction from the prompt, viewpoint detection in the generated image, and image generation.
- **Planned / unfinished:** a prompt panel that connects the full loop (prompt → interpretation → comparison → sphere → confirmation → result), version history, a camera-controllable text-to-image model and a vision-language viewpoint detector.

## Technology stack

- Self-contained HTML, CSS and JavaScript; no build step, no API key.
- Lab 2 storyboard pages load Tailwind CSS from a CDN.
- No AI model is called at present. The model and detector for later phases are undecided.

## Running or inspecting the work

- Open `prototype/sphere_controller.html` in a browser (works offline).
- Lab 3 specification and tests: `docs/lab3/01_SPEC.md`; system path diagram: `docs/lab3/system_path.png`.
- Lab 2 interaction flow and storyboards: open the HTML pages in `docs/lab2/`.

## Development record

Work before 13 November 2026 was done outside Git and was imported in the first commit of this repository; its dates come from the module lab submissions.

- **Lab 1 and Assignment 1 (Sept–23 Oct 2026):** defined the problem (specifying camera viewpoint in text-to-image generation) and the research question from a literature review.
- **Lab 2 (Oct 2026):** one inference (requested vs detected viewpoint mismatch), interaction flow and three storyboards; corrections used one-tap preset buttons. Files: `docs/lab2/`.
- **Lab 3 (22 Oct 2026):** specification with two tests. Test B showed that metaphorical phrases ("looking down from the stage") were read as literal angles, so the main control changed from presets to the 360° sphere, and ambiguous phrases now open the sphere instead of generating. Files: `docs/lab3/`, `prototype/`.
- **Assignment 2 (from 13 Nov 2026):** TODO, record each significant change, why it was made and how it was checked, with commit links.

## AI assistance

- **Google Gemini (Lab 3):** reviewed the specification, the sphere projection maths and the fallback design. Kept: consistent `[MOCKED]` labels, 2–3 candidate anchors and touch support. Rejected: turning the component table into plain text. Full record: `docs/lab3/02_PROMPT_LOG.md`.
- **Claude (Assignment 2):** used to organise the assignment brief into study notes and to set up this repository's structure and README outline. TODO: add what was checked or changed.

## Additional files

- `docs/lab2/`: Lab 2 worksheet and storyboard pages (student ID removed for the public repository).
- `docs/lab3/`: Lab 3 specification, prompt log and system path diagram.
