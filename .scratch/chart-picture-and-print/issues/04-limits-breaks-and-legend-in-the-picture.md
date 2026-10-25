# 04 - Limits, breaks and the legend in the picture

Status: ready-for-agent
Type: task
Size: M

Blocked by: `03-the-picture-of-plot-and-axes.md`
Spec: `.scratch/chart-picture-and-print/spec.md`

## What to build

The picture holds the rest of what the reader sees: the limits' labels with their marks, the axis breaks of a
working-time axis, the legend and the empty message.

- **Prefactor first: the axis break as elements.** Its two strokes are CSS pseudo-elements, which the
  painter cannot see. They become two elements of their own with the same look. The screenshots stay
  unchanged; this lands before anything below.
- **The painter grows by the rules the spec lists, and no further:**
  - a top border painted as a line in its style (solid, dashed, dotted), width and colour: the limit label's
    mark;
  - an element's computed 2D transform applied: the break's skew;
  - opacity: a hidden series' faint chip, the break's strokes;
  - struck-through text: a hidden series' name;
  - the legend's colour chips as boxes, with their radius;
  - the mark chips of `encoding="marks"` drawn as images of their own serialised SVG;
  - the empty message's text.

  The data key ("Show data") and its open panel stay skipped. A part the rules cannot paint is drawn with
  plain elements, not met with a new rule for a general HTML feature.
- **Demo.** The picture example gains a limit with a label and a legend; one example under
  `encoding="marks"` and one on a working-time axis get the same button, or the tests reach them through
  the existing examples.

## Acceptance criteria

- [ ] The break's screenshots are unchanged after the prefactor.
- [ ] A jsdom test with the recording context: the texts painted include the legend's names and a limit's
      label, and exclude "Show data".
- [ ] Visual tests (charts-light and charts-dark) read the picture in the page:
      - a legend name's and a limit label's rectangles hold text pixels;
      - under `encoding="marks"`, a mark chip's rectangle holds the series' colour;
      - a hidden series' chip is faint, as on screen;
      - a break's rectangle on a working-time axis holds stroke pixels.
- [ ] The `@quick` screenshots of the picture are updated once and look like the chart beside it.
- [ ] `pnpm check charts`, `pnpm check:site` and `pnpm test:visual:quick charts` pass.
