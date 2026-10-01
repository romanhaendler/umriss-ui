# 03 — The table follows

Status: ready-for-agent
Type: feature
Blocked by: 01, 02

## What

- `Toolbar` wraps its content in `ControlSizeProvider` at its size.
- The search drops its 160 px and takes its natural width; the page-size select
  drops its 64 px for `chars`.
- The demos that gave a field a width by `style` say it with `chars`.

## Acceptance

- Unit test: a core control of one's own inside a `Toolbar` is `sm`, and `md`
  in `Toolbar size="md"`.
- The table's browser suite stays green; moved baselines are renewed and
  looked at.
