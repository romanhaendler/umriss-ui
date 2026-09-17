# 02 — One channel per statement

Status: done
Type: task

Blocked by: 01
Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 1–7, 10, 11, "The bar system")

## Scope

- Redraw per the table in the spec: `provisional` hollow and dashed, `fixed` as end caps, `muted` full height and opaque half-mix without outline, the rail within the main time, `open` fading at either edge.
- Painting order fixed and written at the site; `barRect` stops halving; the label's colour on a hollow bar is the text colour.
- The hatch leaves the bars in this ticket (blocked by 01 so that it never means two things).
- `SubtaskAppearance`, `resolveAppearance` and its tests stay as they are.

## Acceptance

- Browser tests through occupied canvas pixels: hollow centre, caps, left fade, rail ends at `mainTo`, muted against a setup in the same picture.
- One example of combinations (fixed + muted + open) with pictures in both themes.
- Bulk renewal of pictures allowed: the count read and stated beforehand, the list of examples named.
- `CONTEXT.md` **Appearance** and the changelog say what each one looks like now.

## Comments

### Delivery

The table of the spec, drawn. `drawSubtask` now carries the rule at its site
("ONE CHANNEL PER STATEMENT"), with the fixed painting order and the reason for
it: fill, rail, caps, fade, outline.

- `barRect` is **gone**, not emptied. Muted work says it in saturation, so no
  appearance changes what a bar measures, and `barLabelBox` reads the box.
- `barFace(look, colour, colours)` is the one answer to "what is this bar
  actually painted in, and what colour reads on it". The drawing, the caps, the
  rail and the DOM label all ask it, so they cannot disagree.
- The hatch left the bars. `hatch` gained a step and a line width and is now
  called only by `drawRefusedLanes` (01).
- `open` fades at either edge of the view, and at its own end where it passes
  neither - the statement belongs to the work and must not vanish because the
  zoom shows all of the bar.

### Three things the spec did not foresee, found by looking at the picture

1. **A cap flush with the end is not a mark.** A light cap at the start of a
   bar on a light page reads as the bar beginning three pixels later. The caps
   sit two pixels INSIDE the end, framed by the bar's own colour on three
   sides. Both themes had the problem, with opposite colours.
2. **The label lay on the cap.** Exactly the complaint that took the hatch off
   the face. `barLabelBox` steps aside for the caps of a fixed bar; `CAP` and
   `CAP_INSET` moved to `geometry.ts` because the label has to know them. It is
   a horizontal inset only - no appearance takes HEIGHT from a label any more.
3. **The label's contrast rule was wrong for a mid-tone bar.** A single
   luminance threshold (`isDark`, 0.45) worked only while every bar was a
   saturated task colour. A muted bar is that colour mixed half into the
   surface and lands in the middle: in light it got white on salmon, in dark
   near-black on mid-brown. `isDark` is replaced by measuring the contrast of
   both candidate colours and taking the better one - right in both themes,
   with nothing to tune. It moved no existing picture (the flip is below the
   0.001 diff ratio, so it is asserted in the test instead).

Also repaired, found on the way: the snapshot was published BEFORE the theme
was read, so every bar label carried the contrast of a scene that had no
colours yet. `draw()` publishes once more when it first resolves them.

### The one thing to look at in review

`muted` is the task colour mixed **half** with the surface, as the spec's table
says; a setup is the same colour at 28 per cent, outlined. They are
distinguishable - the test demands a channel distance above 50, and the muted
bar carries no outline where the setup does - but they are the closest pair in
the picture. If "without doubt" (user story 4) is not met, the number to move
is the mix in `barFace`, and nothing else.

Not renamed, as the spec instructs: `ResolvedAppearance.hatched` still carries
the name of a drawing it no longer uses. Its doc now names the channel it
really owns. Ticket 11 may want to settle the word.

### Tests

- Unit: `barLabel.test.ts` rewritten around the two new rules (no appearance
  takes height; a fixed bar's label steps aside). 140 green.
- `features-schedule`: 6 new tests, all through counted canvas pixels -
  hollow against filled, the caps and the uniform face between them, muted
  against a setup in one picture and by a measured distance, the rail within
  the main time and inset, the fade at both edges, and the three-statement bar.
- All schedule suites: 173 passed, 89 skipped.

### Pictures

68 baselines read beforehand. **2 renewed** (`subtasks--appearances`, light and
dark - the example gained a "Began before" lane and every appearance changed),
**2 new** (`subtasks--combinations`, light and dark). 70 now. No other picture
moved: no other example uses `appearance` or `progress`, which was checked
rather than assumed.

`CONTEXT.md` **Appearance** rewritten around the channels; the changelog opens
a new "One language for the bars" section with what changes for callers.
