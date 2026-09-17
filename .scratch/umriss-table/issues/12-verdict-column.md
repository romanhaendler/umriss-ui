# 12 — `VerdictColumn`

Status: done

Blocked by: 07

Spec: `.scratch/umriss-table/spec.md`

## Scope

A column over a numeric value and a set of limits, using `bewerte` from `@umriss/ui`: the value formatted as a number, its verdict shown with tone and a cue that does not rely on colour, and an unknown verdict shown as a verdict rather than as an absent value. It is built only on the public column API, so it doubles as proof that the domain layer needs nothing private.

Decide:

- Default sort by value or by severity (`schwere`), and whether the other is offered.
- Whether the export carries the verdict as a second field.

## Acceptance

- Built without any import that a caller of `@umriss/table` could not make.
- Component tests: each of the four verdicts, including unknown for `null` and `NaN`; the excess shown where a limit is violated.

## Comments

**Delivered**: `packages/table/src/VerdictColumn.tsx` and `VerdictColumn.module.css`, handed out by the hook. Tests: `urteil.test.tsx`.

- **Built only on the public column API.** The file imports `react`, `@umriss/ui` and its stylesheet, nothing else from the package; a test reads its source and holds that. It needed one addition to the public API, which is general rather than verdict-specific: `sortValue` and `exportValue` on `Column`, so that a value without order or text of its own can be sorted and exported.
- **Sort: by severity** (`schwere`: ok, unknown, warning, alarm), with ties left in their previous order because the sort is stable; **`sortBy="value"`** sorts by the value instead, unknown values last. Severity *and* value in one stage would mean packing two numbers into one sort value over a range nobody knows.
- **Export: the value only.** The verdict is a function of value and limits, which whoever needs it in a spreadsheet has; a second field per column would need a second header nobody asked for.
- An unknown verdict — `null` or `NaN` — is shown as a verdict (`?`, muted, "Kein Wert"), not as an absent value: the column's value is the pair of measurement and assessment, never absent, so its presentation is always called.
- The cue that does not rely on colour: a shape per verdict (✓ ? ▲ ■), the word for assistive technology and as `title`, and the excess (`+0,3`) where a limit is violated, formatted with the column's `format`.

**After review:** the type documentation claimed ties sort by value; they keep their previous order, as decided above, and the documentation says so now. The reason for sorting by severity is stated precisely in `VerdictColumn.tsx`: the worst ends up at one end (a second click puts it on top), whereas by value an alarm below a lower limit would sit among the small values, far from an alarm above the upper one. A computed `VerdictColumn` without `id` now reaches `Column` without one and gets `Column`'s development warning instead of silently taking its label; its value and sort functions are memoised, so an inline `limits` literal does not rebuild the model on every render.
