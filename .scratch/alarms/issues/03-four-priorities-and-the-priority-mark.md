# 03 - Four priorities and the PriorityMark

Status: ready-for-agent
Type: task
Size: M

Blocked by: `02-the-package-with-the-restored-model-list-and-demo.md`
Spec: `.scratch/alarms/spec.md`

## What to build

The tracer slice for priority, end to end. Four fixed levels in the model, a mark that tells them apart
without colour, and the list showing that mark.

- **The model.**
  - `Priority` becomes `"critical" | "high" | "medium" | "low"`, and `PRIORITIES` lists them in that order,
    most urgent first. `priorityRank` follows.
  - An alarm of an unknown type stays `"high"`; its comment says why: it must not slide down, and "critical"
    is kept for what the application rationalised as such.
  - The restored tests that name priorities move to the four levels. The order tests get a case with a
    critical alarm above a high one.
- **`PriorityMark`**, exported, with JSDoc and its own page on the demo.
  - **Props:** `priority`, and the alarm's state as the list knows it: whether it is active and
    unacknowledged and in service (flashing), and whether it is in service at all (neutral when not). Plus
    the element shape of the root contract (spec, "The root contract").
  - **The shape** by level: 1 a diamond, 2 a triangle pointing up, 3 a square, 4 a circle. The shapes differ
    by outline, so they hold in forced colours and greyscale. Draw them in CSS, not as an SVG glyph: the
    glyph rules (one stroke, no fill) are for icons, and this is a filled mark.
  - **The number** 1 to 4 inside the shape, in tabular figures, scaled with the type (rem), so that a doubled
    root font size scales mark, row and button together.
  - **Colour** from one token per level: red, amber, yellow, blue. The number holds AA against its fill, and
    the shape holds 3:1 against the surface, in light and in dark. A neutral mark (not in service) takes the
    neutral tone and keeps its number.
  - **Its name** comes from the wording: "Priority 1, critical" / "Priorität 1, kritisch".
  - **The flash.** The mark of an active, unacknowledged alarm in service flashes at 1 Hz: a CSS animation
    whose duration is a token. It is steady once acknowledged; a returned, unacknowledged alarm is steady.
    Under `prefers-reduced-motion: reduce` there is no animation, and a steady ring marks the unacknowledged
    state. Setting the token to `none` turns the flash off (ADR-0045). The token's documentation says that
    1 Hz is umriss's choice and that no source gives a rate.
- **The list** shows `PriorityMark` in its priority column instead of the three-tone badge, with the word
  beside it. A hidden alarm's mark is neutral, as its badge was.
- **Wording**, English and German:
  - the four priority words, with the prefix `alarm` (`alarmPriorityCritical` is new; the three restored ones
    keep their names);
  - the mark's name, as one function of number and word.
- **The demo:**
  - a page `PriorityMark` with one example of the four marks in their states (unacknowledged, acknowledged,
    returned, shelved);
  - the restored examples move to four priorities where their data names one.

## Acceptance criteria

- [ ] A critical alarm sorts above a high one in the default order. An unknown type sorts as high.
- [ ] Each mark's accessible name is "Priority N, word", in English and German.
- [ ] The four marks are told apart in forced colours: the shell's forced-colours check passes, and its
      screenshot of the PriorityMark page shows four outlines.
- [ ] The contrast of the number and of the shape is asserted for both schemes, as core's tests assert
      its tokens in `contrast.test.ts`.
- [ ] Under reduced motion no mark animates (asserted on the computed style), and an unacknowledged mark
      carries the ring.
- [ ] `pnpm check alarms`, `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick alarms` pass.
