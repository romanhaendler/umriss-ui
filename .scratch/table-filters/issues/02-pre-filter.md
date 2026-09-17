# 02 — The pre-filter

Status: done
Type: task

Blocked by: 01 (same files: `useTabelle.tsx`, `kern/begleiter.ts`, `typen.ts`)

Spec: `.scratch/table-filters/spec.md` (The pre-filter; defects D3, D4, D5)

## Scope

- Write the regression tests for D3, D4 and D5 first; they fail.
- Rename the hook option `filter` to `vorfilter`; keep `filter` as a deprecated alias for one minor version (JSDoc `@deprecated`, changelog `Geändert`).
- A pre-filter change no longer resets the page (D4); the model clamps.
- The total in "x von y" counts admitted rows; list options come from admitted rows (D5); a table the pre-filter empties shows `empty` / "Keine Einträge"; "Alles zurücksetzen" never touches the pre-filter and the "nothing matches" state appears only when search or a list filter restricts (D3).
- Demo: `Table › vorfilter` — inline pre-filter by plant, count, options, empty state.

## Acceptance

- D3–D5 regression tests pass; a type test shows `vorfilter` inline compiles and `filter` still compiles.
- The glossary's **Pre-filter** reads true of the code.
