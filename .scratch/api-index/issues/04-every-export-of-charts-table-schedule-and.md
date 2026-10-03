# 04: Every export of charts, table, schedule and calculation carries JSDoc

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/api-index/spec.md`

**What to build:** The same as ticket 03 for the other four packages.

- [x] A one-off run of the export check lists no export without JSDoc in these four packages.
- [x] Comments are in English and name no internal requirement numbers or source paths.
- [x] Typecheck, lint and unit tests stay green.

## Comments

**Delivered.** 106 of the four packages' 295 exports had no JSDoc: charts 63 of
126 (the `wording/de` subpath's `GERMAN_CHARTS_WORDING` among them), table 28
of 94, schedule 9 of 53, calculation 6 of 22. Each now has one, directly above
its declaration and below any `/* */` maintainer note, in the voice of ticket
03: components say what they are for and how they are driven (a chart's series
and axes say they register with the surrounding `Chart`), props interfaces
name their component, unions say what their values mean, `useTable`,
`shiftTask`, `resolveAppearance` and `detectFlood` have `@param`/`@returns`
where the type does not say it. The diff is comment lines only, plus an
"Unreleased" entry in each of the four CHANGELOGs. One existing comment moved:
in the table's `alarmModel.ts` the JSDoc meant for `detectFlood` stood above a
private helper; it now stands above `detectFlood`.

**The check.** Ticket 03's one-off script, run over `charts` (`src/index.ts`,
`src/wording/de.ts`), `table`, `schedule` and `calculation` (`src/index.ts`).
Before: 106 of 295 without one. After: 0 of 295.

**Green:** `pnpm lint`, `pnpm typecheck` (props gates included) and
`pnpm test:unit` (all six packages). The plant-word guard caught "shift" in
`shiftTask`'s first comment; it was reworded. Playwright was not run, for the
reason ticket 03 gives: no page, table or screenshot reads an export's own
comment.

**Baselines moved:** none. **Deviations:** none.
