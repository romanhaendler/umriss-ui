# 08: The table's, schedule's and calculation's defaults move from prose into `@default`

Status: done
Blocked by: 03 (`@deprecated` and `@default` are read)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** The same migration as ticket 07 for table (2 of 150 today), schedule (0 of 94) and calculation (0 of 54), and for any core prop whose default is written only in prose.

- [ ] No description in these packages repeats a default that its `@default` states.
- [ ] Across all five packages the Default column is filled for at least 90 % of the props that stated a default in prose on `main` @ 3b2fa14.
- [ ] The JSDoc gate passes.
- [ ] No destructuring default conflicts with a tag.

## Comments

Delivered: every prop of table, schedule, calculation and core whose description stated its default in words carries a `@default` tag, and the words left the description (a description that was only "Default 10." became a sentence: "How many rows a page holds."). Values stand as code (`10`, `"curve"`, `null`, `id`, `anchorRef`); conditional defaults as phrases ("the size of a `ControlSizeProvider` around it, else `"md"`", "the wording's "Search table"", "one digit for a percentage, at most two for a derived number, a given as it was given"). Schedule's `height`, `laneHeight`, `headerWidth`, `snap`, `route`, `attach`, `ends`, `now` got tags too: `Schedule` destructures inside its body, which the reader does not read. Where a description repeated a default the destructuring already fills (Slider's `min`/`max`/`step`, Splitter, Heading, Modal, Pagination's `pageSizes`, Toolbar's `size`, …), the words went as well. `TableSnapshot.view` (an output, no default) is reworded so it no longer says "default".

Count against `main` @ 3b2fa14 (description says "default", Default column empty — the 63 of the spec): core 35/35, table 4/5, schedule 6/6, calculation 0/0; with ticket 07's 17 charts props 62/63 (98 %). The one left is `TableSnapshot.view`. Broader ("without it", "otherwise"): table 19/27, schedule 11/12, calculation 5/5, core 40/61 — the rest describe behaviour, not a value (`chars`, `title`, `selection`, …).

Tests: `packages/core/tests-unit/propsStandard.test.ts` changed its rule. It checked that a default named in a comment matches the destructuring; it now checks that no comment names one in words (the reader stops on a `@default` that contradicts the pattern, so the column is the one place), and that `SparklineProps.width`, `ModalProps.closeOnBackdrop` and `NumberInputProps.step` carry theirs in the column. lint, typecheck (the gate of all five packages) and test:unit green. Playwright: page, shell, screenshot and accessibility suites of core, table, schedule and calculation, both themes: 1404 passed, 1 failed - `language--own-components` (ui-light) on the word "Today", the known failure tickets 01 and 03 reported, left as it is.

Baselines moved: none.

Deviations: core's repeated defaults were cleaned beyond the ticket's list (the spec wants no description repeating its default); that turned the core guard's three "bites at" cases round, which had required the words. The changelogs of all four packages say it under Unreleased / Added.
