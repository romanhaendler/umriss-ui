# A control limit is not a specification limit, and is never computed from the window

Status: accepted
Date:   2026-08

Two numbers on a control chart look alike and mean opposite things.

A **specification limit** is chosen. It comes from engineering and it says what
the customer will accept. A **control limit** is computed from the process and it
says what this process normally does. A process can be in control and out of
specification, or in specification and out of control, and each of those four
states calls for a different action. A chart that draws both the same way makes
that distinction invisible, and the distinction is the entire reason the
instrument exists.

They are therefore different objects in this library and they are drawn
differently. A specification limit is a `<Limit>` in its severity's colour,
dashed. A control limit is a `<Limit>` in the role `eingriff`: neutral in colour,
solid. It claims nothing about good or bad; it says what normal looks like.

The second half of this decision is where the plausible wrong implementation
lives. **Control limits are never computed from whatever data is currently
rendered.** Either the caller supplies them, having established them from a
reference period, or the caller names a reference window and they are computed
from exactly that window. The type expresses this: there are two variants and
"from everything present" is not one of them.

Computing from the visible data is the easy implementation and it produces a
chart that looks professional and cannot do its job. The limits move when the
window scrolls. An out-of-control process gradually redefines normal around
itself. The rule that is supposed to detect drift drifts with it.

## Consequences

The chart is an **individuals** chart. A library that receives a stream of
measurements cannot know its subgroup structure, and guessing one is worse than
not offering subgroups. Sigma is estimated from the average moving range using
d₂ for a sample of two; the constant and its provenance are named beside the
arithmetic, because a bare `1.128` in a source file is unmaintainable.

The violation rules are four named pure predicates, individually switchable. The
run lengths differ between the Western Electric rules and Nelson's — eight versus
nine, most visibly. Nelson is used, is named in the code, and both lengths are
parameters, so a plant with a house convention is not arguing with the library.

`<ControlChart>` adds no drawing code. It is a line, limit lines, faint zone
lines and a scatter of the violating points — all parts that already existed. It
exists because the composition has enough pieces to be wired inconsistently, not
because it needed to draw anything. If it ever gains a canvas call of its own,
the composition was wrong and the missing capability belongs in the parts.
