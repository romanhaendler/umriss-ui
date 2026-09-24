# The six building blocks every evaluator looks for

Status: ready-for-agent
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.
Blocked by: `.scratch/core-passthrough/` ticket 01 (the guard), so every new component is born passing it.

## Problem

Seven of seven large React libraries ship Switch, Slider, Drawer, a progress
bar, Accordion and Breadcrumbs; umriss ships none of them. On a plant screen
each is daily: a function on/off or hand/auto (Switch), a setpoint roughly set
(Slider), a detail beside a process picture (Drawer), a batch's progress
(ProgressBar), plant → line → machine (Breadcrumb), long settings in sections
(Accordion). Their absence reads as unfinished within the first ten minutes.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| F1 | Switch | `role="switch"` on a native checkbox (the Checkbox's construction), `checked`/`defaultChecked`, a label beside it, sizes of the fields. Motion from the canon: the thumb travels on `--u-transition-path`. |
| F2 | Slider | One value first: native `<input type="range">` underneath for keyboard and AT, drawn with tokens; `min`/`max`/`step`, marks, the value as a mono readout, `format`. A range (two thumbs) is a later ticket, not this spec. |
| F3 | Drawer | A `Modal` that enters from an edge: the same `<dialog>`, focus trap and Escape; `side="right" | "left"`, a width token; modal only - a non-modal side panel is layout, not an overlay. |
| F4 | ProgressBar vs Meter | Two things: `Meter` is a measured value against limits (a verdict), `ProgressBar` is how far a task has come (`role="progressbar"`, determinate or indeterminate, no verdict). The glossary gets **Progress** beside **Meter**. |
| F5 | Accordion | The disclosure pattern: headers are buttons with `aria-expanded`, `type="single" | "multiple"`, controlled and uncontrolled; `Card`'s collapse stays as it is. |
| F6 | Breadcrumb | `<nav aria-label>` with an ordered list, the last item `aria-current="page"`; when narrow the middle items fold into a `Menu`. Items are links or buttons - routing is the caller's. |
| F7 | Wording | Every new string in the `Wording` register, German beside English. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | Switch | S |
| 02 | Slider | M |
| 03 | Drawer | M |
| 04 | ProgressBar | S |
| 05 | Accordion | M |
| 06 | Breadcrumb | M |
| 07 | Final polish round | S |

## Testing

Per component: unit tests at its public interface (roles, keys, controlled and
uncontrolled), the pass-through guard of `core-passthrough` covers it from day
one, axe on its demo page, screenshots of each example light and dark.

## Out of scope

Range slider, non-modal side panel, a tree-shaped breadcrumb, Stepper, Splitter
and file upload (those are `core-layout-extras`).
