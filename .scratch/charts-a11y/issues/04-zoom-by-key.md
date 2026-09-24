# 04 - Zoom and pan by key

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/charts-a11y/spec.md` - Q6.

## Scope

Only on an x axis with `onDomainChange`: `+`/`−` propose a zoom around the
Active point (the wheel's rate), Shift+←/→ a pan by a tenth, `0` the data
extent (the double click's proposal). The walk never pans by itself; after a
domain change the Active point moves to the nearest visible position.

## Acceptance

Interaction tests beside the pointer's zoom tests: each key proposes the
domain the matching gesture would, an axis without a handler ignores them.
