# 11 — The view link

Status: done

Blocked by: 06, 08, 10

Spec: `.scratch/umriss-table/spec.md`

## Scope

`alsSuchparameter` and `ausSuchparametern` on registered columns. The new difficulty is timing: columns are known only once registered, so an initial view read from a link cannot be validated against the column list at the moment the hook is called. Decide whether the view is applied after registration or validated lazily, and keep the old guarantees: unknown names dropped, malformed values fall back to defaults, defaults not written, the application's default sort and page size are the defaults.

## Acceptance

- Round-trip tests for a fully populated and an empty view.
- A link naming a column not in the JSX yields a valid view without that name.
- A link opened on a table whose columns register after the first render shows the linked sort in the first rendered rows.

## Comments

**Delivered** in `useTabelle.tsx` (`initialeAnsicht`, `ansicht`, `suchparameter`). Tests: `ansichtLink.test.tsx`; the copied `ansicht.test.ts`, `tabelleAnsicht.test.ts` and `zeilenUndBreiten.test.ts` still hold for the companion.

- **Decision: applied at once, validated lazily.** The view from the link (`initialeAnsicht`, a string from the address bar or an already parsed view) enters the state on the first render, before any column has registered. It is checked against the registered columns when it is read: `ansicht`, `suchparameter` and `sortierung` omit names no registered column carries. The state keeps them, so a column that mounts later still picks up its part of the link.
- Why not "apply after registration": the body computes with the columns of its own render pass, so the linked sort is already in the first rendered rows — nothing is gained by waiting, and waiting would render the unsorted rows first.
- The old guarantees hold: unknown names dropped, malformed values fall back to defaults, defaults are not written, and the defaults are the application's `defaultSort` and `pageSize`.
- Tests: an untouched table gives an empty link; a fully populated view round-trips unchanged through a second table; a link naming a column not in the JSX gives a valid view without it; malformed values fall back; the first two rows rendered through a wrapped column are the linked sort's.
