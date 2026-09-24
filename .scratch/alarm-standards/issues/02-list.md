# 02 - Shown in the AlarmList

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/alarm-standards/spec.md`

## Scope

I2: the neutral drawing, the word, the view and its count; wording EN/DE.

## Acceptance

- Interaction tests; axe; screenshots light/dark.

## Comments

**Delivered (2026-09-24).** A hidden row stays in `<AlarmList>` and is drawn
neutrally: no lifecycle edge (the edge rules now require
`data-availability="in-service"`), the priority badge neutral with its word,
the cells muted; the availability stands as a word before the lifecycle
("Shelved until 11:10 by M. Keller · Standing, acknowledged"). The bar counts
them; with `onHiddenOnlyChange` the count is a checkbox for the view, which
the application applies with the table's own `filter` - the list owns no
filtering. Wording EN/DE in core. Seven interaction tests in
`alarmList.test.tsx` (German asserted as the subject). axe: the `alarmlist`
page is in the sample and passes in both themes with the new example. New
example `03-hidden-from-operation` with two new baselines, looked at in both
themes; no existing baseline moved (table suite 295 passed, 81 skipped).

Found on the way: the muted colour of a done row (`keepDone`) stood on the
`tr` and never reached the cells, which set their own - it now stands on
`td`/`th` for both cases. Left for 05: the availability word and the
lifecycle wrap onto two lines in a narrow state column, and the checkbox label
is a step larger than the live figure beside it.
