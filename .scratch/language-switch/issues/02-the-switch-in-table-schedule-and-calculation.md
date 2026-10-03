# 02: The switch in table, schedule and calculation; charts explains its absence

Status: done
Blocked by: 01 (EN/DE switch in the core demo)
Spec: `.scratch/language-switch/spec.md`

**What to build:** The table, schedule and calculation demos pass the switch option. German carries across demos, because they share one origin and one stored setting.

The charts demo shows no switch. Its Installation page gains one sentence: the charts take German per chart through the `wording` prop from the charts' German subpath, and the keyboard and screen reader example shows it.

- [x] With DE on, the table's empty state, the schedule's readout and a calculation's library text render in German, with German dates and numbers. (The schedule's probe reads the day heading and the lane count, see Deviations.)
- [x] German chosen in core is still on after moving to the table demo.
- [x] The charts demo shows no switch (asserted in the shell suite), and its Installation page carries the sentence.
- [x] Shell suite probes per demo are green; no baseline changed.

## Comments

**Delivered.** Table, schedule and calculation pass `german` from their `App.tsx`: `GERMAN_WORDING` and `GERMAN_FORMATS` from `@umriss-ui/core/wording/de`, as core does. Table's and schedule's `vite.demo.config.ts` gained the subpath's alias (before the entry's, which would swallow it); calculation had it. Charts passes nothing and shows no switch. Its Installation page gains a paragraph: the charts take German per chart (`wording={GERMAN_CHARTS_WORDING}` from `@umriss-ui/charts/wording/de`), as the keyboard and screen reader example shows, and read no language provider, so the demo has no switch.

**Tests.**

- Each `features-shell.spec.ts` has a `language` probe:
  - table, Row appearance: "Nothing matches the search and filters" → "Nichts passt zu Suche und Filtern", `15/04/2026` → `15.04.2026`, and the button "Clear input" → "Eingabe leeren";
  - schedule, Lane groups: "Tuesday, 17 March 2026" → "Dienstag, 17. März 2026", "2 lanes" → "2 Bahnen", and the button "Fold group: Developers" → "Gruppe einklappen: Developers";
  - calculation, Calculation: `1,173.60` → `1.173,60`, and the button "Show how Discount is derived" → "Herleitung von Discount zeigen".
- The shell suite (`packages/demo/checks/shell.ts`) has a new test: on the built site, German chosen in core's header is still on in the table, schedule and calculation demos. Like the other built-site tests, it is skipped where `site/` is not built.
- The "no switch" test now runs for charts alone. Charts' `features-shell.spec.ts` also checks the Installation paragraph and its link to the example.

Results:

- `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` are green.
- Under the lock, `features-shell` in table-, schedule-, calculation- and charts-light: 221 passed, 20 skipped.
- The built-site test, with `site/` built: 3 passed.
- `features-page` and `silent-pages` in charts-light: 19 passed.

**Baselines.** None moved. These suites all pass with the switch in the header: `screenshots`, `forced-colors`, `pinning`, `grouping` and `features-keyboard` in the three demos, light and dark. They photograph examples and scenario stages, not the header.

Two failures in that run are not this ticket's. `forced-first-table--first-table` (table-light and table-dark) has no baseline on main ("snapshot doesn't exist"). The images the run wrote were deleted.

**Deviations.** The schedule's readout is spoken only once a key rests, so the static probe cannot read it. The probe reads the day heading, the lane count and the fold button instead. The readout itself is proven in German by `tests-unit/readout.test.tsx`.

**Seen on the way.** On schedule's Lane groups page, the "controlled" example shows no "2 Bahnen" under its group headers with German on, while English shows "2 lanes". It looks like the count is left out when the longer word does not fit. Worth a look; not changed here.
