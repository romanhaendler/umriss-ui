# 06 — The demo cut by feature: Editing, Findings, and why

Status: done
Type: task

Blocked by: 01, 05
Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 21, 22, 24, 26, "The demo")

## Scope

- The rubrics Editing and Findings with the chapters the spec lists. Drag-in is taught once; `where-it-may-go` shows a drag within and links to placing.
- The per-example readouts (`data-last-intent`, …) go with the example whose feature they prove.
- `demo/why/`: the five pages the spec names, in the form the other demos' have.

## Acceptance

- As 05: renames verified as unchanged pictures, counts stated.
- `features-editing` addresses the new slugs; nothing is tested twice because an example was split.

## Comments

### Delivery

**Editing** is seven chapters and **Findings** one:

    Editing   Move and lane · Stretch, setup, teardown · Snapping ·
              Placing from outside · Where a subtask may go · Ripple ·
              Demonstration
    Findings  Findings as data

The page called after the `Intent` TYPE is gone. Every editing chapter is about
the intents it raises, and a reader who wants to know how to move a bar looks
up *Move and lane*, not a type name. ADR-0023 stands behind all seven, and the
*why* page says so once for all of them.

### Drag-in is taught once - and the judgement that took

The spec says drag-in is taught once and `where-it-may-go` shows a drag within
and links to placing. Done: the mechanics of a drag from a list - `placing`,
`dragstart`, `dragend`, what a `place` intent carries - are in *Placing from
outside* and nowhere else.

But `canMoveTo` holds for work dragged in as well (user stories 15 and 18), and
that is a fact about the RULE, not about drag-in. Putting it nowhere would have
left two of ticket 01's browser tests without a home and a real behaviour
undemonstrated. So *Where a subtask may go* has two examples - `within` and
`from-outside` - one feature each, and the second one teaches nothing about how
a drag from a list is set up: it says in one line where that stands and shows
only the refusal. If that reads as teaching drag-in twice, the second example is
the thing to cut and the two tests to move.

### The why pages

Four of the five the spec names, in the form the other demos use:

- `lane.tsx` - a lane is not a row
- `overlap.tsx` - an overlap is never packed into sub-lanes
- `schedule.tsx` - the schedule changes nothing (ADR-0023)
- `where-it-may-go.tsx` - a refusal is not an error

The fifth, *a folded group keeps every bar its place*, is **not** written here.
It describes a feature that does not exist yet; a why page about the miniature
before the miniature is drawn would be a claim nobody could check. It belongs
to 09, where the miniature lands, and is noted there.

### Tests

- Every `openExample` follows its chapter; `plot.ts` needed nothing, because
  lanes have been named rather than numbered since 04.
- One test was asserting the wrong thing and only passing by accident: it
  claimed a ghost dragged from a list over the welding bay stays on press 1,
  and checked it with `box.y < plot.y("press-2")` - which is true of a bar on
  press 2 as well, since that compares against the lane's MIDDLE. The ghost
  really ends on press 2: the pointer crosses it on the way, and press 2 is a
  lane the mould fits. The test now says so and compares against the lane's
  band.
- The accessibility sample follows the demonstration to its own chapter.
- All schedule suites: **265 passed**, 127 skipped.

### Pictures

122 baselines now, from 110:

- **8 renamed, byte-identical**: `move-and-lane`, `stretch-setup-teardown`,
  `drag-in` and `demonstration`, light and dark - the examples moved with
  `git mv` and their pictures did not move a pixel.
- **6 removed**: `page-intent` (the page id changed), and the two that
  re-rendered under a new name.
- **6 modified**: the page heads of `overview`, `ripple` and `findings` - their
  names and lists changed.
- **18 added**: eleven page heads for the new chapters, the `from-outside`
  example, and the re-rendered renames.
