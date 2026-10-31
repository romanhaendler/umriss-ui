# 03: The field contract - table and alarms on the new names

Status:     done
Blocked by: 01

Spec: `../spec.md`, decision 1. A migrate batch of the wide rename begun in 01.

**What to build:** the table's cell editors, filters, toolbar and pager size, and the alarms' controls, use
core's fields by the new names, and no DEV deprecation warning fires anywhere in their demos and tests.

- [x] Table and alarms sources, demos, READMEs and `llms-full.md` use `onValueChange`/`onCheckedChange`.
- [x] Their tests that pass a deprecated name to a core field move to the new one (same exception as 02).
- [x] `grep` finds no deprecated call left in `packages/table` and `packages/alarms`.
- [x] `pnpm check table`, `pnpm check alarms`, `pnpm typecheck`, `pnpm check:site`.

## Comments

**Delivered (2026-10-31, run coordinator).** Table and alarms sources, demos and scenarios on
`onValueChange`/`onCheckedChange`; one test (`toolbarSize`) moved to the new name; new
`fieldContract.test.tsx` in both packages mounts every demo and scenario and fails on any deprecation
warning. Kept native `onChange(event)` where the event is read (row checkbox's Shift, the native inputs
and selects). `SearchProps.onValueChange` stays in `unshown.json` - no example needs it.
