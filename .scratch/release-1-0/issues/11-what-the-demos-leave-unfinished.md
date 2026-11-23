# What the demos leave unfinished

Type:   research
Status: resolved

## Question

Read the seven demos as text (`packages/<pkg>/demo/`, and the generated twins under
`packages/<pkg>/demo/.generated/twins/`). What reads as unfinished to someone meeting umriss at 1.0?

- Props and exports no example shows (`props.json` knows "Shown in").
- Pages whose structure departs from the others, leads that say nothing, examples that repeat each other.
- Kinds of value no example covers. Known instance: no example sets a list filter through `initialView`,
  none filters a boolean column.
- Placeholder or leftover text.

The look is not part of this: it needs the sites built. Candidates only.

Findings: `.scratch/release-1-0/research/11-what-the-demos-leave-unfinished.md`

## Answer

Findings: `.scratch/release-1-0/research/11-what-the-demos-leave-unfinished.md`. The generated files were
absent where the review ran (the props step makes them), so its counts are from `API.md` against the example
sources and are a ceiling. Counted again by the coordinating session from a generated `props.json`.

- **The gate already holds the list.** `packages/<pkg>/demo/unshown.json` names every component prop no
  example shows, with the reason: 17 in core, 19 in charts, 8 in the table, 1 in the schedule, 1 in the
  calculation, 2 in the dashboard, none in the alarms. Some say "not shown yet".
- **Members of types are mostly unshown** (wording keys, formats, the returns of hooks, the model's types):
  563 of 1135 members in core, 300 of 497 in charts, 556 of 821 in the table, 82 of 137 in the alarms, 22 of
  165 in the schedule, 3 of 71 in the calculation, 2 of 43 in the dashboard. Nothing says they must be.
- **Kinds of value no example covers**: a list filter set through `initialView`; a column filter on a boolean
  column, though booleans stand in six examples.
- **`SearchProps.onValueChange`** is unshown "with the callers' migration": a prop name still moving. It
  joins "What of the table's surface changes before 1.0".
- **Thin**: the dashboard has one folder of examples, the alarms four.
- No placeholder or leftover text, no empty lead. Look and structure were not judged.
