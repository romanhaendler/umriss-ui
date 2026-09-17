# 01 — The eight names

Status: done
Type: task

Spec: `.scratch/demo-rubrics/spec.md`

## Scope

The cut is a judgement and can be defended from the pages themselves. The
**names** are a decision with a cost: a rubric name is read on every page head,
on the overview and in every palette find, and it is the one part of this work
that a later rename would have to pay for twice.

Confirm or overturn, one by one:

| n | Recommended | Alternatives considered | Ruled out |
|---|---|---|---|
| 1 | **Setup** | `Provider`, `Configuration`, `Getting started` | `Basics` — collides with Layout and text |
| 5 | **Layout and text** | `Surface and text`, `The page` | `Foundation` — the word this effort is retiring |
| 2 | **Actions** | `Buttons` | — |
| 13 | **Forms** | — (unchanged) | — |
| 7 | **Status and waiting** | `Feedback`, `Signals` | `State` (the charts' word, ADR-0007), `Verdict` (belongs to a judged value) |
| 6 | **Overlays** | `Above the surface` | `Layers` — **Ebene**/Level collision, see CONTEXT.md |
| 3 | **Navigation and structure** | `Getting around`, `Wayfinding` | — |
| 3 | **Monitoring** | — (unchanged, settled by `demo-consolidation` 09) | — |

**Two of them are worth a real argument.** *Status and waiting* is two states of
one idea — something is being told to you, or something is not there yet — and
if one word covers both it is better. *Navigation and structure* is again two
nouns joined by "and", which is the shape this effort is removing from
"Structure and overlays"; if `Tabs`, `TreeView` and `Dock` do not have one word
between them, the honest alternative is to split them and let `Dock` stand
wherever it belongs.

Also to confirm: **eight rubrics, or six.** Six folds `Setup` into
`Layout and text` and `Actions` into `Forms`.

## Acceptance

- Each of the eight names is confirmed or replaced, in writing, in this file
  under `## Comments`.
- The count (eight or six) is settled.
- Nothing is edited outside this file.

## Comments

**Taken as recommended: eight rubrics, and all eight names as the table proposes
them.** The brief for this run was that the specs hold everything needed and the
work is to be finished in one go, so the recommendation was taken rather than put
back to the user. Each name, and why it survives:

| n | Name | Why it stands |
|---|---|---|
| 1 | **Setup** | `Provider` names the component, not the rubric, and would read as a rubric of one that repeats its only page. `Configuration` promises options a caller sets; the page is about wiring. `Getting started` is a guide's word, and this demo is a reference. |
| 5 | **Layout and text** | The rubric really does hold two things — the surface (`Stack and Grid`, `Card`, `Divider`) and the type on it (`Typography`, `VisuallyHidden`) — and they are the same subject seen twice, which is what an honest "and" is for. `Surface and text` loses `Stack and Grid`, which lays out and is no surface. |
| 2 | **Actions** | `Buttons` names the two components and would have to be renamed the moment a third kind of action arrives. |
| 13 | **Forms** | Unchanged. |
| 7 | **Status and waiting** | No single word covers both halves without lying. `Feedback` is the vague word every other library uses and would swallow `Tooltip` too; `Signals` reads as something the library emits. The "and" is kept deliberately: it joins two states of one idea — something is being told to you, or something is not there yet — and both are *what the surface says about itself*. `State` stays barred (ADR-0007). |
| 6 | **Overlays** | `Above the surface` is a description, not a name, and reads badly beside seven one- and two-word neighbours. `Layers` stays barred by **Ebene**/**Level** (CONTEXT.md). |
| 3 | **Navigation and structure** | The weakest of the eight, and kept knowingly. `Getting around` and `Wayfinding` both fit `Tabs` and miss `TreeView`, which is a structure one reads rather than a way one travels. Splitting it was the real alternative and was rejected: it would make `Navigation` a rubric of one and leave `Dock` and `TreeView` homeless — the only home for them is a second leftovers box, which is the shape this effort exists to remove. Three pages under one "and" that names both halves truthfully is the smaller cost. |
| 3 | **Monitoring** | Unchanged, settled by `demo-consolidation` 09. |

**Eight, not six.** Six folds `Setup` into `Layout and text` and `Actions` into
`Forms`. Both folds are wrong in the same way: `UmrissProvider` is not layout and
is not text, and a `Button` is not a thing that takes a value — the fold buys a
shorter sidebar by putting two pages where a reader would not look for them, and
a reader who cannot find a page is the cost this whole effort is paying to avoid.
A rubric of one is already allowed (`demo-as-documentation`, `Tabelle`).

Nothing was edited outside this file for this ticket.
