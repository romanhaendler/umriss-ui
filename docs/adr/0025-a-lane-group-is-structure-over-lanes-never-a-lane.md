# A lane group is structure over lanes, never a lane

Status: accepted
Date:   2026-09

A plant has machine groups, halls and lines; the schedule had a flat list of
lanes and one height. A planner who works on the presses scrolled past
everything else. **Lane groups** put a tree over the lanes — `<LaneGroup>`
around lanes and other groups, to any depth — and a group can be folded into
one row.

A group is **structure over lanes and never a lane itself**. Nothing sits on a
group: a **Subtask** names a lane, a **Transport** connects two subtasks, a
**Finding** belongs to a lane, `canMoveTo` is asked about a lane, and every
**Intent** names a lane. None of them can name a group, and none of them
changes when a group is folded or unfolded. Folding changes the view and not
the plan, which is why it is not an intent.

A folded group shows a **miniature**: every lane in it as a thin strip, at a
smaller scale, in the tasks' own colours. It is the real work, smaller — not a
summary, not a packing, not a utilisation band. A transport into a folded group
arrives at its strip; an overlap inside one shows on its row; a strip can be
hovered and selected. Folding costs a planner detail and never access, and
never hides a finding.

Both standing sentences of this component are cited here because a fold is
exactly where they would be tempting to break, and they are not broken:

- **A lane is not a row.** The word *row* is the layout module's: a row is what
  the plot lays out — a lane's row, a group's head, a miniature — and a lane is
  still a machine. It is in no exported name, no prop and no intent. It reaches
  the outside in exactly one place, `data-row` on a header, and that is
  deliberate: an application styling beside the schedule has to be able to tell
  a machine's row from a group's slim head from a folded group's one row, and
  there is no other honest word for what those three are. Every real lane
  resolves to a **slot**: its own row, or its strip inside a miniature.
- **An overlap is never packed into sub-lanes.** A miniature is a change of
  SCALE, not an arrangement: every bar keeps the time it has and the strip its
  lane has, at a smaller size. Nothing is moved to make anything fit.

## Considered Options

**A group as a lane with children.** Rejected: it makes `lane: "presses"` a
legal value the moment anyone writes it, and then a subtask can sit on a group.
Every rule above would have to gain an exception, and the first application to
place work on a group would be within its rights.

**Deriving groups from the data** — a `group` field on a lane object.
Rejected: the lanes are declared by composition (`<Lane>`), and a second way to
say the same thing drifts. A group reads in JSX as it reads in the plant.

**Folding as an intent.** Rejected: an intent is a request to change the PLAN.
Folding changes what is on screen, and reporting it as an intent would put a
view state into the same channel as a move — where a caller that applies every
intent it receives would write it into its data.

**Summaries on a folded group** — a bar spanning the group's busy time, a
utilisation band. Rejected for this version, and the reason is the same one
that keeps overlaps unpacked: a summary is a claim the schedule computes, and a
planner cannot tell a computed claim from a drawn fact once both are bars. The
miniature shows what is really there.

## Consequences

The layout stops multiplying `laneIndex * laneHeight`. A pure module turns the
tree and the collapsed set into rows with a `top` and a `height` each;
`laneTop` becomes a prefix sum and `laneAt` a binary search over them. Bar
height is per row, so a strip inside a miniature is short and a lane's row is
not.

`collapsedGroups` is controlled with an uncontrolled default, the shape
`selectedTask` has. A folded outer group hides inner ones without touching
their entries, so opening it again gives back the view that was there.

Every y in the package comes from that one module, which is why it is written
test-first and why a flat schedule must stay pixel-identical to the arithmetic
it replaces.
