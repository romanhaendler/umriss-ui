# 01 — The selection greys what the planner is not working with

Status: done
Type: task

Origin: grilling session 2026-09-26. Vocabulary in `CONTEXT.md`: **Selected
subtask**, and the hue sentence under **Appearance**.

## What

A planner selects a subtask and sees at once what they are working with:

- the **Selected subtask** in its task's full colour (outline and grips as
  today);
- its siblings — the other subtasks of the selected task — halfway to grey;
- all other work grey.

"Grey" means the grey of the colour's OWN lightness: the hue goes, the
lightness stays. Never mixed towards the surface — that is `muted`'s channel,
and a sibling must not read as another team's work.

## Decisions

- **Three levels**, not two: the clicked subtask stands out from its siblings.
- **A task selected by its dependency** has no selected subtask: the whole
  task stays in full colour, everything else grey.
- **Dependencies**: the selected task's (siblings' included) keep the task
  colour; other tasks' go grey.
- **Findings keep their colours**: overlaps, violated dependencies in the alarm
  colour, the blocked-time hatch. A view never hides a finding (ADR-0025).
- **Miniatures** follow the same levels: other tasks' strips grey.
- **Appearances survive**: a provisional bar stays hollow, a fixed one keeps its
  caps, a muted one becomes a lighter grey. The bar label's colour is measured by
  `barFace` as before.
- **Drag**: the picture of the selection stands. A ghost is always in full
  colour, also when a grey bar of another task is dragged. A drag still selects
  nothing.
- **Forced colours**: the selection in `CanvasText`, everything else in
  `GrayText`.
- **Always on**, no prop. A switch waits for someone who asks.
- Nothing selected: the picture is as today.

## Acceptance

- First, before anything is finished: a half-grey sibling beside a `muted` bar,
  in both themes, rendered in the browser and shown to the user — the two must
  not read for one another.
- A unit test on the colour step: grey keeps the lightness, halfway is between.
- Browser pictures renewed where a selection is shown, **with the count read
  and stated**.
- The schedule's changelog names the change.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, the browser suites green.

## Comments

**Delivered.**

- `towardsGrey(colour, t)` takes a colour the share `t` of the way to the grey
  of its own lightness, mixed in linear light so every step keeps the
  luminance exactly - and with it the label colour `barFace` measures.
  `workColour` decides the step: selected subtask whole, siblings halfway,
  the rest grey; a task selected by its dependency whole; under forced colours
  the selected task in the text colour and the rest in `GrayText`. Bars,
  strips, dependencies, the hover wash and the DOM label measure all ask it;
  findings never do.
- The ghost alone is drawn with no selection, so it is in full colour; its
  dependencies stay as the selection draws them.
- `scene.ts` hands the drawing the selected subtask only where it belongs to
  the selected task: a controlled selection can move to another task while
  the last click stays behind, and would otherwise grey the whole new task
  halfway.
- The demo's "Select a task" has a third leg, so the siblings show; the
  Selection page says what the grey means.
- **Baselines: 8 moved** - `selection--select-a-task` ×2 (the third leg), its
  forced-colours picture ×2 (the same leg), `page-selection` ×2 (the new
  paragraph), `selection--control-the-selection` ×2 (it starts with a
  controlled selection, now greying the other consignments). The core
  control room's kiln scenario holds a selection too and did not move: its
  batches are all one grey already.
- The changelog entry comes with the release, as every schedule change's does.
- Rendered in both themes and checked before the rest: siblings clearly paler
  and still blue, other work grey, the muted bar a lighter grey.
- `pnpm lint`, `pnpm typecheck`, unit tests (all packages), the schedule's
  browser suite (435 passed, 151 skipped) green.
