# 03 — The table follows

Status: done
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

## Comments

**Delivered, 2 Oct 2026.** The toolbar's `width: auto` for every part, the
search's 160 px and the page-size select's 64 px are gone; the page-size select
takes `chars` from its longest size. The demos lost their widths in `style` and
their `size="sm"`; the Toolbar controls page says the toolbar sizes a control
of one's own. `toolbarSize.test.tsx` holds it (sm, md, own size).
