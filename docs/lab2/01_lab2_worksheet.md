# Lab 2 worksheet

Use this file for the written notes in all five phases. The Canvas page gives the instructions. This is the only Markdown file you need to complete. You do not need to write paragraphs.

## What to do

Work through the five phases on the Canvas page:

1. Write one inference about what the system senses, infers and does.
2. Draw the interaction flow as a loop from the person's goal to system feedback.
3. Draw the normal interaction as a storyboard with as many moments as you need.
4. Show what happens when the inference is wrong and how the person recovers.
5. Choose one design check and draw an improvement into the storyboard.

Submit this worksheet with the three images you make for phases 2, 3 and 4.

## 1. Your interaction

**Problem from Lab 1:**

People using text-to-image generative AI to create photorealistic images struggle to specify and adjust the subject's camera viewpoint: natural-language prompts express spatial intent indirectly, so the tool produces inconsistent camera angles and an artificial look.

**What should the system sense, infer and do?**

- Sense:
  1. The viewpoint words in the user's prompt (e.g. top-down / bird's-eye, eye-level, side view, 45° angle, close-up).
  2. The viewpoint the subject actually has in the current generated image.
  3. Whether the user keeps rewriting the same prompt and regenerating again and again.
- Infer (one inference): the camera viewpoint in the current image does not match the angle the user asked for in the text.
- Do: on the side of the result image, label the viewpoint it detected and offer one-tap buttons such as "switch to side view / switch to top-down"; channel = a viewpoint control panel next to the image plus a short suggestion line.

**When could that inference be wrong?**

- The system mistakes the subject's own facing/orientation for a camera move around the subject.
- It misreads a metaphor (e.g. "like looking down at the subject from the audience stalls on stage") as a literal top-down angle of the subject.

## 2. Your flow

(Drawn as one interaction-loop image — see the separate flow image.)

Loop, in order:
1. Person's goal: get one image whose angle matches their description and looks photorealistic, with little rework.
2. What the system senses: viewpoint words in the prompt, actual angle in the image, repeated regeneration.
3. What the system infers: current viewpoint does not match the requested angle.
4. What the system does and through which channel: labels the detected angle and gives one-tap angle buttons in the side viewpoint panel.
5. What feedback the person receives: a redrawn image at the requested angle; arrow loops back to the goal.

## 3. Your normal-interaction storyboard

(See the separate normal-interaction storyboard image. Frames, in order:)

- Frame 1 — Person: writes a prompt that includes an angle word and presses generate. System: produces a first draft while reading the prompt and the image to judge the viewpoint. Person sees: a first draft image.
- Frame 2 — Person: looks at the draft. System: labels the detected angle on the side panel and, when it mismatches, shows a change-angle suggestion. Person sees: a small angle tag and suggestion button.
- Frame 3 — Person: taps the desired angle (or makes a small adjustment). System: regenerates at that viewpoint. Person sees: a new image with a more accurate angle.
- Frame 4 — Person: confirms and saves. System: signals completion. Person sees: the finished image with the correct, realistic angle.

## 4. Your failure-and-recovery storyboard

(See the separate failure-and-recovery image.)

- **What wrong inference does it make?**
  1. It misjudges the subject's orientation as a camera viewpoint.
  2. It cannot render an exact angle, so its angle-switch suggestion does not match what the user actually wanted.
- **How does the person notice?**
  Visually: after following the system's suggestion the angle becomes even more crooked, or the new image clearly does not match the angle they wrote in the prompt.
- **How do they recover?**
  Undo the suggestion, turn the viewpoint dial back manually, or ignore the suggestion and keep editing the prompt themselves.
- **What should the system learn?**
  Distinguish "subject orientation" from "camera viewpoint"; for ambiguous angle words, first show an angle preview or ask, instead of changing it directly.

## 5. Check the storyboard with a secondary user

- **Which question did you choose?** Can the person correct it?
- **Which frame did you change?** Frame 2 (the side panel where the system labels the angle and gives suggestions).
- **What was unclear?** A secondary user who has never used text-to-image tools and does not know terms like "viewpoint / top-down" cannot understand the side angle labels, and does not know whether a wrong tap can be undone.
- **What did you change and why?** Replace the technical angle labels with plain icons (eye-level / top-down / side view), add a one-line plain-language explanation, and add a clear "Undo / Not happy" button. Reason: a newcomer can understand at a glance and can back out after a wrong tap, which answers "Can the person correct it?".

## Save

Submit this worksheet, one flow image, one normal-interaction storyboard image and one failure-and-recovery storyboard image. Use placeholders instead of real names, faces or private messages.
