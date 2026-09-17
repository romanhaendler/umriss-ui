# 07 — Button group and split button

Status: done

Spec: `.scratch/foundation-primitives/spec.md`

## Scope

Two related additions for toolbars.

**Button group** joins adjacent buttons into one control: interior corners
squared, the seam between them collapsed into a single hairline, the outer radii
preserved. It composes the existing button rather than reimplementing it, and
works with all variants and both sizes.

**Split button** composes the group: a main action and a trigger that opens the
existing menu, so a main action can carry its variants without a separate menu
button beside it.

## Acceptance

- Demo tile: a group of three buttons in each variant, a split button with a
  menu of three items, both sizes, a disabled split button.
- Interaction tests: the main action fires without opening anything; the trigger
  opens the menu; dismissal and focus return behave as the popover seam promises.
- Screenshot baselines in both themes.
- No existing component changed.

## Notes

The split button **must** open its menu through the existing popover seam. It
does not re-implement anchoring, dismissal, outside-click handling or focus
return. If it turns out to need behaviour the seam does not offer, that is a
finding about the seam to be reported — not a licence to rebuild the mechanism
locally. That rebuild is exactly what the popover-seam work removed.
