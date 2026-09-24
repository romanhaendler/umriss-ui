# 01 - Availability in the alarm model

Status: done
Type: task

Spec: `.scratch/alarm-standards/spec.md`

## Scope

I1, I3, I6 in `packages/table/src/alarms`.

## Acceptance

- Unit tests of every transition and of the shelf's expiry against a given clock.

## Comments

**Delivered (2026-09-24).** `Alarm` carries `availability` beside `lifecycle`,
never merged into it; a shelved alarm carries `shelf: { until, by }`, and the
type is a union so that a shelf without an end cannot be written. Four pure
transitions (`shelve`, `unshelve`, `takeOutOfService`, `returnToService`),
each returning the same object when it does not apply; a shelf never
overwrites out of service or suppressed by design, which has no transition -
the plant's logic writes it. `availabilityAt(alarm, asOf)` brings an expired
shelf back at the as-of time. The projection counts `hiddenFromOperation`,
orders in service above hidden (`DEFAULT_ORDER` gained a first level), and
`standingUnacknowledged` counts only what is in service. Glossary:
Availability, Shelved, Suppressed by design, Out of service. Tests:
`packages/table/tests-unit/availability.test.ts` (20, literals written from
the rules), written red first.

Beyond the spec, and why: the availability column and the first sort level
(a shelved alarm of high priority must not take the first glance from a
standing one of medium); the live figure counting only what is in service.
`Alarm` became a type alias - `Partial<Alarm>` no longer spreads into one
(CHANGELOG, Changed). The wording keys live in core, as all of the list's do.
