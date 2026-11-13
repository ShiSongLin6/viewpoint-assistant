# 02_PROMPT_LOG.md — GenAI Interaction Log & Declaration

## GenAI Usage & Academic Integrity Declaration

- **Approved tool used:** Google Gemini (Gemini Student) in a web browser, logged in with my University of Birmingham student account — https://gemini.google.com/
- **How it was used:** GenAI was used solely as an evaluative, critique and verification tool to inspect, challenge and review my human-authored specification, my HTML prototype and my reflection logic. It did not write any submitted file. All design decisions, the interaction architecture, the spherical coordinate conversion (azimuth θ, elevation φ) and the code are my own work, finalised under my own decision-making.
- **Scope statement:** The prompts I sent, the outputs returned and the changes I then made are recorded round by round below.

*I acknowledge the use of Google Gemini (https://gemini.google.com/) to review and provide feedback on my specification and prototype code for this assessment. The following pages record the prompts, the outputs and my modifications. No AI-generated content has been presented as my own work.*

---

## Session — 2026-10-22

### Round 1: Verification and review of `01_SPEC.md`

**Tool used:** Gemini Student (web).

**Prompt:**

> This is my completed 01_SPEC.md for the "Intelligent Interactive Systems" Lab 3. The lab gives a fixed starter template with these sections: User goal, System inputs, Processing and technology, Intended result and next action, Fallback strategy, System path or interaction diagram, Test A (standard input), Test B (problem input), and Review and revision. The use case is helping users of text-to-image AI specify and correct camera viewpoint, with a 360° spherical controller (azimuth/elevation) as the fallback.
>
> Please review my file against the required template and the tests. Check: (1) every starter section is present and filled; (2) each test records input, what the system receives, what it does, and the response plus next action; (3) mocked components are clearly labelled; (4) the review identifies one interaction change and one technology change, and re-runs Test B. Do NOT rewrite the file. List concrete issues, if any, and suggested fixes in bullet points.

**What came back:**

- Confirmed that every required starter section is present and filled, and that Test A and Test B contain all four required fields (input, what the system receives, what it does, response + next action).
- Recommended that the `[MOCKED]` status of every planned component (LLM extraction, VLM viewpoint detector, diffusion model) be applied consistently in both the narrative and the component table.
- Suggested converting the component table to plain text.

**What I kept, changed or rejected:**

- **Kept / applied:** I checked and standardised the `[MOCKED]` labels across the numbered processing steps, the component table and the technology summary so every planned component is labelled identically.
- **Rejected:** converting the table to plain text — the Markdown table states the component / technology / status mapping more clearly for the marker.

---

### Round 2: Inspection of `sphere_controller.html`

**Tool used:** Gemini Student (web).

**Prompt:**

> This is my self-contained HTML/CSS/JS prototype of the 360° spherical viewpoint controller described in the SPEC. It must work offline with no external dependencies. Please review it and report: (1) whether the spherical conversion (azimuth theta 0-360, elevation phi -90 to +90) to screen coordinates is mathematically correct; (2) whether the ambiguous-prompt fallback (Test B) is actually demonstrated, including candidate points and confirmation before generation; (3) any JavaScript bugs or broken interactions with the draggable marker, sliders, presets, undo and confirm; (4) accessibility or usability problems. List bugs by severity with the relevant line, and suggest small, targeted fixes. Do NOT rewrite the whole file.

**What came back:**

- Verified the projection: x = R·cos(φ)·sin(θ), y = R·sin(φ), z = R·cos(φ)·cos(θ) maps the 3D camera position to the 2D canvas correctly.
- Confirmed that the Test B fallback shows amber dashed candidate points and that generation is gated behind explicit user confirmation.
- Recommended keeping a plain-language label next to the numeric θ/φ readouts to reduce cognitive load for non-technical users, and noted that slider dragging should not flood the undo history.

**What I kept, changed or rejected:**

- **Kept / applied:** retained the two-way synchronised sliders (θ 0–360°, φ −90° to +90°) alongside the existing plain-language angle readout ("slightly high angle, front-right view", etc.).
- **Kept / verified:** the sliders push one history entry per completed drag (pointerdown records the start, change commits it), so each drag is a single Undo step.
- I reviewed the listed severity items and found no blocking bug; the candidate-point, confirmation and undo behaviour matched the SPEC.

---

### Round 3: Challenging the revision (stress test of the fallback)

**Tool used:** Gemini Student (web).

**Prompt:**

> In my SPEC, the main failure is that metaphorical viewpoint phrases such as "looking down at it from the stage" are misread as literal top-down angles. My revision opens the 360° spherical controller and lets the user point at the angle instead of guessing. Please challenge this design: identify 2-3 weaknesses, edge cases or new failure modes (e.g. mobile use, users who do not understand azimuth/elevation, users who cannot express what they want even with the sphere). For each, say whether the current fallback strategy handles it.

**What came back:**

- Identified that a blank sphere could intimidate users with weak 3D spatial perception, and that touch/mobile users need a tappable target rather than only a precise drag.
- Suggested concrete anchor points as the mitigation, and judged the 2–3 highlighted candidates to be the correct pattern; it also confirmed that the existing plain-language angle readout helps users who do not understand azimuth/elevation.

**What I kept, changed or rejected:**

- **Kept / applied:** I strengthened the Fallback strategy in `01_SPEC.md` so that ambiguous metaphors always highlight 2–3 candidate anchor positions near the likely angle, and the user can either drag the marker or tap a candidate; I also stated that the controller is touch-friendly so the same fallback works on mobile.
- The remaining weakness (a user who cannot express the angle at all) is already covered by the "no viewpoint word" fallback, which asks an explicit question and opens the sphere instead of guessing.

---

## Summary of changes made after the review

- **`01_SPEC.md`:** standardised `[MOCKED]` labels across the numbered steps, the component table and the summary; made the 2–3 candidate anchor points an explicit part of the ambiguous-wording fallback (including tap-to-select / touch devices); added the sliders to the list of next actions.
- **`sphere_controller.html`:** projection math and the Test B candidate / confirmation flow verified; kept the synchronised sliders, plain-language readout and the single-history-step-per-drag behaviour.

## References

- University of Birmingham — *Generative Artificial Intelligence and its role within teaching, learning and assessment*: https://www.birmingham.ac.uk/libraries/education-excellence/gai
- University of Birmingham — *Acknowledging and Citing the Use of Generative AI by Students*: https://www.birmingham.ac.uk/libraries/education-excellence/gai/acknowledging-gai-by-students
- University of Birmingham — *Academic Integrity: support and advice*: https://intranet.birmingham.ac.uk/student/academic-support/academic-integrity-support-and-advice.aspx
- LH/LM Intelligent Interactive Systems (Canvas course 90253), Week 3 Lab Materials and the Lab 3 submission instructions: https://canvas.bham.ac.uk/courses/90253
- Google Gemini: https://gemini.google.com/
