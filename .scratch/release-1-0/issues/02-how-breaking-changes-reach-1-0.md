# How breaking changes reach 1.0

Type:   grilling
Status: open
Blocked by: 01

## Question

The reviews will turn up changes that break a caller. How are they shipped before `1.0.0`?

- Last `0.x` minors with the old name alive for one minor (ADR-0066 as it stands), so that `1.0.0` differs
  from the last `0.x` only by the removed aliases; or
- a release candidate (`1.0.0-rc.n`) that carries the breaks; or
- a hard cut in `1.0.0` with the guide beside it.

And: is there a point after which the surface is frozen and only fixes go in?
