# 02 - Display components

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/core-passthrough/spec.md`

## Scope

`Badge`, `Card`, `EmptyState`, `Skeleton`, `Spinner`, `Sparkline`, `Meter`,
`Stat`, `FormField` forward ref, class, style and rest (P1-P3).

## Acceptance

- The guard is green for these nine.
- No screenshot baseline moves.

## Comments

The nine take their ref through `forwardRef`; class and rest they already
spread. `CardHeader` and `CardBody` came along (see 01). P3 where it bites: the
role and the name `Stat` has read, the role and values of `Meter` and the role
of `Spinner` now stand after `...rest`; a caller's `aria-label` still names a
`Meter` or a `Spinner`, whose name is only a default. Two tests at the end of
the guard hold that. Screenshots were run once for the whole spec (see 04).
