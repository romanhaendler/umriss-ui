# Which keyboard items of the shakedowns still stand

Type:   research
Status: resolved

## Question

"The acceptance criteria" require every open keyboard item of the shakedown records to be fixed or expressly
declined. Which still stand in the source as it is?

Collect every keyboard and focus item the records list as open or kept (`.scratch/shakedown/`,
`.scratch/shakedown-2026-10-31/`, above all its `earlier-runs-open.md` and its lists "kept by judgement" and
"wishes not taken"; section 5 of
`.scratch/release-1-0/research/12-accessibility-and-browsers-claimed-and-checked.md` names some: the
dashboard's Edit / Done dropping focus, a DatePicker panel open after Tab, MultiSelect options each a Tab
stop, widgets driven by arrows only). For each: the record's line, what the source does now (`file:line`),
and one of **fixed** (name the test or the code that shows it), **stands**, or **cannot be told without
running it**. For what stands: the smallest change and its size, and whether the change breaks a caller.

Read only; nothing is run.

Findings: `.scratch/release-1-0/research/21-which-keyboard-items-of-the-shakedowns-still-stand.md`

## Answer

Findings: `.scratch/release-1-0/research/21-which-keyboard-items-of-the-shakedowns-still-stand.md`. Read
only. Of thirty items: **21 fixed, 5 stand, 4 cannot be told without running it**. Six of the fixed ones
rest on the source line alone, with no test named.

What stands:

- **The chart's legend comes after the plot in Tab order** though it is drawn above it (CSS `order`,
  `packages/charts/src/styles/charts.css:373-411`). *(agent)* Fixed before 1.0: the legend is rendered first.
  No break.
- **Tab and Enter alone cannot change Radio, Segmented, Tabs or Slider**; **a toast's Undo is far in the Tab
  order**; **no Shift+Space range in the grid**. All three were expressly declined before (the shakedown
  spec's decision 6, ADR-0032), which is what the acceptance criteria ask for. They stay declined.
- **The schedule's keyboard cannot change a lead-in or lead-out** (`packages/schedule/src/sceneKeys.ts:183-210`).
  A new chord only: the intent kinds `leadIn` and `leadOut` exist (`packages/schedule/src/model.ts:186,195`),
  so nothing breaks; the findings file is wrong where it says a new kind is needed. Decided in "What of the
  schedule's surface changes before 1.0": added before 1.0.

What only a run tells, checked on the candidate with the acceptance criteria: focus in a virtual grid under a
live re-sort; the two focus rings side by side; the skip link's ring (it is the demo shell's, not core's); a
popover above an on-screen keyboard (a device).
