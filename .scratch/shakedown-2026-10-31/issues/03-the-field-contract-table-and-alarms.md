# 03: The field contract - table and alarms on the new names

Status:     ready-for-agent
Blocked by: 01

Spec: `../spec.md`, decision 1. A migrate batch of the wide rename begun in 01.

**What to build:** the table's cell editors, filters, toolbar and pager size, and the alarms' controls, use
core's fields by the new names, and no DEV deprecation warning fires anywhere in their demos and tests.

- [ ] Table and alarms sources, demos, READMEs and `llms-full.md` use `onValueChange`/`onCheckedChange`.
- [ ] Their tests that pass a deprecated name to a core field move to the new one (same exception as 02).
- [ ] `grep` finds no deprecated call left in `packages/table` and `packages/alarms`.
- [ ] `pnpm check table`, `pnpm check alarms`, `pnpm typecheck`, `pnpm check:site`.

## Comments
