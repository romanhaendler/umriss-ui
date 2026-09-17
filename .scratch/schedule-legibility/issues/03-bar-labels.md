# 03 — Text in the bars

Status: done
Type: task

Blocked by: 02
Spec: `.scratch/schedule-legibility/spec.md` (user stories 1–8, "Bar labels")

## Scope

- A label per subtask from a caller's function, as DOM over the bar, only for bars in view; cut off with an ellipsis, left out where too narrow, held at the view's edge for a bar that began before it.
- Contrast resolved against the bar's colour.

## Acceptance

- Unit test of the cutting-off; browser tests for present, cut off, left out and held at the edge; own examples and their pictures; the check of 02 stays green.

## Comments

**Delivered.**

- `label?: (subtask) => string` on `Schedule`. The scene publishes the visible
  main time of every bar in view (`snapshot.bars`) with the contrast its colour
  calls for; the component renders one DOM element per bar, the bar's width,
  with the text cut off by an ellipsis inside it.
- `barLabelBox` in `geometry.ts` is the rule, with `barLabel.test.ts` written
  first: the label lies on the main time, keeps to the VISIBLE part of it (a bar
  that began before the view keeps its text at the edge), and is left out where
  the visible part is too narrow.
- **`MIN_LABEL_WIDTH` was measured, not guessed, and it moved twice.** At 28 and
  at 44 pixels the short subtasks wore "A-…" - a letter and an ellipsis, which
  says less than nothing. At 64 about seven characters fit, which is an order
  number; below that the bar stays silent and the tooltip answers.
- Contrast: `isDark` reads the sRGB luminance of the resolved task colour, and
  the label takes `--u-color-on-accent` on a dark bar, `--u-color-text` on a
  pale one. No caller says which.
- Example `Subtasks/04-bar-labels`, two pictures. Browser tests: the full text
  where it fits, an ellipsis where it does not, silence where nothing would
  fit, the label inside its bar (measured against the example's own declared
  times), the label held at the edge after panning, and the check of ticket 02
  green in that moment.
- **The check of 02 caught something real on the way:** two bar labels covering
  each other on the mill. They do because their bars do, and that is the
  overlap the demo plans on purpose. A label IS its bar, so the "apart"
  invariant does not apply to bar labels; they say so themselves with
  `data-schedule-may-cover` and the reason stands at the site. That is story 38
  answered too: a label cannot be wider than its bar, because it is given the
  bar's width - and the browser test measures it against the example's times.
- **An hour lost to a stale preview build:** Playwright reuses a running server
  outside CI, which serves the `dist-demo` it was started with, so a renewed
  picture can be the old one and the next run passes against it. Now written
  down in `docs/testing.md`.
