# Spec: The sidebar gets a shape — the rubrics of the core demo

Status: done

Origin: session of 13 Sep 2026, immediately after `docs-structure` and
`demo-consolidation` were delivered. The brief, in the words it was given in:
"Aber ich dachte wir wollten die Rubriken und die Gliederung der Demos
verbessern? Das sieht bei mir aktuell genauso aus wie vorher" — said while
looking at the demo of `@umriss-ui/core`, and it is correct. `demo-consolidation`
regrouped **charts** (four topics became four rubrics and fourteen pages) and
renamed one rubric in all three demos; it never touched how core and table are
grouped. This spec is about the one demo where the grouping is actually wrong.

Builds on: `.scratch/demo-as-documentation/spec.md`, which set today's rubrics in
August 2026 and argued them. This spec overturns part of that argument and says
which part, below.

Glossary: no new terms. The rubric list under **Rubric** in `CONTEXT.md` is
corrected by ticket 03.

ADRs: none. A rubric has no address and no meaning inside the library
(`CONTEXT.md`, **Rubric**), so nothing here is a decision a caller could ever
notice — which is also why it is cheap.

Tickets: `issues/01`–`05`. 01 is the decision, 02 the outline, 03 the prose and
the suites, 04 the pictures, 05 the check that table is deliberately left alone.

---

## Problem Statement

Forty pages in four rubrics: **Foundation 13 · Forms 13 · Structure and overlays
11 · Monitoring 3.** Three findings, all measured against what stands in
`packages/core/demo/outline.ts` today.

**Foundation is a leftovers box.** It holds `UmrissProvider` (infrastructure, not
a visible component), `Button` and `ButtonGroup` (actions), `Tag` and `Badge`
(status marks), `Divider`, `Card` and `Typography` (surface and text), `Alert` (a
message), `Spinner`, `Skeleton` and `EmptyState` (waiting and emptiness), and
`VisuallyHidden` (an accessibility primitive). That is four subjects, not one.
Its own sentence gives it away: *"What every surface needs before it is a form or
a table"* describes a remainder, not a group — it says what the rubric is **not**.

**Structure and overlays carries a seam it cannot close.** Eleven pages: layout
(`Stack and Grid`), six real overlays (`Menu`, `Tooltip`, `Popover`, `Modal`,
`ConfirmDialog`, `Toast`), navigation (`Tabs`), and three large components that
are none of those (`TreeView`, `Dock`, `CommandPalette`). The name is two nouns
joined by "and", which is the shape a rubric takes when it has stopped being one
thing. A reader looking for the tree does not look under overlays.

**The order inside a rubric is the order of delivery, not of reading.**
Foundation runs `UmrissProvider · Button · ButtonGroup · Tag · Divider · Badge ·
Alert · Typography · Card · Spinner · Skeleton · EmptyState · VisuallyHidden` —
`Tag` between `ButtonGroup` and `Divider`, `Typography` between `Alert` and
`Card`. That run is quoted verbatim in `demo-as-documentation` ticket 05, so it
was set once, in August, and has only ever been appended to: `UmrissProvider`
went to the front in `english-and-umriss-ui` 37 because that is where a new entry
is cheapest to add. Nobody would sort it this way starting today.

And the count is visible: the sidebar prints it beside every rubric heading
(`railCount`). A **13** next to "Foundation" tells a reader exactly what the
rubric is — everything that was left.

## Solution

**Eight rubrics, forty pages, not one page moved between packages and not one
page split.** Only the grouping and the order change. Recommended cut:

| Rubric | n | Pages |
|---|---|---|
| **Setup** | 1 | `UmrissProvider` |
| **Layout and text** | 5 | `Stack and Grid` · `Card` · `Divider` · `Typography` · `VisuallyHidden` |
| **Actions** | 2 | `Button` · `ButtonGroup` |
| **Forms** | 13 | unchanged, and in today's order |
| **Status and waiting** | 7 | `Alert` · `Badge` · `Tag` · `Toast` · `Spinner` · `Skeleton` · `EmptyState` |
| **Overlays** | 6 | `Tooltip` · `Popover` · `Menu` · `Modal` · `ConfirmDialog` · `CommandPalette` |
| **Navigation and structure** | 3 | `Tabs` · `TreeView` · `Dock` |
| **Monitoring** | 3 | `Stat` · `Sparkline` · `Meter` — unchanged |

Every rubric is then a sentence a reader can finish, and the largest is Forms,
which is large because forms are.

**The order inside a rubric follows the reading, from the simple to the
composed** — `Button` before `ButtonGroup`, `Tooltip` before `Popover` before
`Menu`. Not alphabetical: an alphabet is an index, and the sidebar is already
one, page by page, through the palette.

### What this overturns, said plainly

`demo-as-documentation` chose five rubrics and argued two things that still hold
and are **not** touched here: *one page per component a developer searches for by
name*, and *the rubric is not in the address*. What it did not argue is the cut
itself — the five names appear in that spec as a list, with reasons given only
for three edge cases (`Tabelle` as a rubric of one, `Stack und Grid` as one page,
hooks getting no page). The cut was never defended, which is why it can be
replaced without reversing an argument.

One of its decisions is inherited rather than overturned: **a rubric of one is
allowed.** That spec kept `Tabelle` alone and gave the reason (the page is heavy
enough to carry a heading of its own). `Setup` is the same case: `UmrissProvider`
is the thing an application meets first and the only page that is not a
component.

## Implementation Decisions

### The names are the part to confirm, not the cut *(needs confirmation)*

The grouping above is a judgement; the names are a decision with a cost, because
a rubric name is read on every page head and in every palette find. Ticket 01
puts them up for confirmation, with the alternatives recorded:

- **Setup** — alternatives: `Provider`, `Configuration`, `Getting started`.
  Ruled out: `Basics`, which would collide with **Layout and text**.
- **Status and waiting** — alternatives: `Feedback` (the word every other library
  uses, and vague), `Signals`. Ruled out by collision: `State` is the charts'
  word (ADR-0007), and `Verdict` belongs to a judged value.
- **Navigation and structure** — the weakest name, because it is again two nouns.
  Alternatives: `Getting around`, `Wayfinding`, or splitting it into `Navigation`
  (`Tabs`) and putting `TreeView` and `Dock` elsewhere. If a better word exists,
  this is where it is worth spending it.

Eight rubrics is itself a choice: the alternative is **six**, folding `Setup`
into `Layout and text` and `Actions` into `Forms`. It reads shorter and puts a
provider next to a heading, which is the kind of tidiness that costs a reader a
search.

### No address changes, and that is what makes this cheap

A rubric has no address. Every page keeps `#/button`, `#/treeview`, and every
example keeps its anchor — so **no link breaks and no example picture moves.**
What does move is what shows a rubric name: the page head (`pageRubric`), the
overview's rubric cards, and the palette's finds.

### The order rule is written down where it can be found

`CONTEXT.md`, under **Rubric**, gains one sentence: a rubric sorts, and within a
rubric the pages run from the simple to the composed. Otherwise the next person
appends to the end, which is exactly how today's order came about.

## Testing Decisions

- `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` are untouched by this work
  and must stay green at every ticket boundary. No file under `packages/*/src`
  is edited.
- **Pictures will move, and the count is known in advance.** Of core's 240
  baselines: the `page-*` pictures of every page whose rubric name changes (all
  but the thirteen under Forms and the three under Monitoring — roughly 48
  images across both themes), the two overview pictures, and up to ten palette
  pictures. **No `example-*` picture may move.** Ticket 04 adopts them in one
  run and states the before/after count; a moved example picture is a fault, not
  a consequence.
- `features-shell.spec.ts` in core carries `rail.rubricId` and
  `palettePage.rubricName` and must be corrected with the outline, in the same
  commit.

## Sequencing

01 (the names) → 02 (the outline) → 03 (prose and suites) → 04 (the pictures).
05 hangs off nothing and can be taken at any time.

## Out of Scope

- **The demo of `@umriss-ui/table`.** Twelve pages in four rubrics —
  `Tables 3 · Rows 2 · Unbound parts 5 · Monitoring 2` — each of which is one
  subject with a sentence that describes it rather than excusing it. Ticket 05
  checks that judgement and records it; it does not change the demo.
- **The demo of `@umriss-ui/charts`**, regrouped four hours ago by
  `demo-consolidation` 03.
- **Splitting or merging pages.** `one page per component a reader looks up by
  name` still holds and is not reopened here.
- **The five pages of the charts demo that carry no example**, and the charts
  screenshot flakiness recorded in `docs/testing.md` under Known open. Both are
  their own tickets.

## Further Notes

**Why this was not part of `demo-consolidation`.** That spec's inventory looked
at the demos as machines — one shell, three contents — and found charts to be a
second implementation of the machine. What a rubric is *called* and which pages
stand under it is a different question, and it was only asked when somebody
opened the core demo and saw that nothing had changed. Which is the right way
round: the machine first, then what it shows.
