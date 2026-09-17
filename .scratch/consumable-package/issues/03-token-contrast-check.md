# 03 — Token contrast check

Status: done

Spec: `.scratch/consumable-package/spec.md`

## Scope

A pure function over the token pairs the design actually uses, asserting a
minimum contrast ratio for each, in both themes.

Pairs to cover:

- body text on surface, secondary text on surface, muted text on surface,
- muted text on the sunken surface,
- each semantic colour on its subtle surface,
- the primary button's foreground on its background,
- the accent on both grounds.

This is a unit test, not a browser check. It fails at the point a token changes
rather than at the point a screenshot is regenerated.

## Acceptance

- Reads the token values from the stylesheet rather than duplicating them, so
  it fails when a token changes rather than when someone remembers to update the
  test.
- Runs for both themes.
- Any pair that fails today is either fixed or recorded, with a reason, as a
  known exception — not silently excluded from the list.

## Notes

Cheap, fast and pure, which is why it comes before the browser-based
accessibility check. If it turns up existing failures, that is the check working;
report them rather than tuning the threshold to make them disappear.

Reading tokens from the stylesheet rather than hard-coding them is the detail
that decides whether this test keeps its value after six months.
