# 03 — Hover is not selection

Status: done
Type: task

Blocked by: 02
Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 8, 9)

## Scope

- Hover becomes a wash over the bar; selection stays an outline.
- The clicked subtask's outline is 2 px, its task's other bars 1 px.

## Acceptance

- Browser test: hovering a selected bar changes its pixels; the clicked subtask is told from a sibling.
- Pictures of `selection` renewed, count stated.

## Comments

### Delivery

- `drawHover` is a **wash** over the whole occupied box; `drawSelection` stays
  an outline. Two different kinds of mark, so both can be seen at once - which
  a one-pixel outline inside a two-pixel one of the same colour never allowed.
- The wash takes the colour the bar's **label** takes (`barFace`, from 02), so
  a dark bar is lightened, a light one darkened, and a hollow one - which has
  nothing to lighten - is greyed by the page's own ink. One rule, and one the
  picture already had; no new decision about colour was invented here.
- The clicked subtask's outline is 2 px, its task's other bars 1 px. It follows
  `scene.selected`, which is null while the selection came from the caller
  rather than from a click - so a controlled selection outlines every bar of
  the task evenly and claims none of them, which is the truth of it.

### Tests

- `features-schedule`, 2 new. The hover test measures the overlay before and
  after the pointer arrives on an ALREADY selected bar, and again after it
  leaves.
- The clicked/sibling test measures one and the same bar in both roles - first
  clicked, then a sibling once another stop of the same task was clicked. The
  first attempt compared two different bars and failed for the wrong reason:
  the mill's bars are offset by an overlap, so the column missed the bar. One
  bar against itself has no such trap.
- All schedule suites: 175 passed, 91 skipped.

### Pictures

70 baselines read. **2 renewed**: `schedule--selection`, light and dark.
