# 05 - Final polish round

Status: done
Type: task

Spec: `.scratch/alarm-standards/spec.md`

## Scope

The visible result goes to the user as a rendered before/after page (the
review page pattern of visuelle-wertigkeit 05): every surface of this spec in
light and dark, each decision a card. Spacing, tracking and optical corrections
are settled by the agent; new tokens or visibly new colours go as a card first.

## Acceptance

- The user has taken every card on the review page.
- Every moved screenshot baseline looked at individually, never rebuilt in bulk.

## Comments

**Done (2026-09-25).** The user took every card on the review page.

- **alarm-wrap**: the availability is a small neutral `Badge` before the
  lifecycle state - "Shelved", "Suppressed by design", "Out of service"; a
  shelf's end and name stand in the badge's tooltip and in what is spoken
  (the sentence out of sight in the badge). The state holds one line. New
  wording key `availabilityShelvedShort` (English, German).
- **alarm-checkbox-size**: the switch's label in the live figure's size (xs).
- **alarm-midnight**: a shelf that ends on another day than the as-of time
  shows date and time; the `ponytail:` note is gone.
- **isa-register**: decided - the register check stays as it is.

Picture renewed, looked at in both themes:
`example-alarmlist--hidden-from-operation` - the three badges, the shelved
row on one line, the state column a few pixels wider, the switch's label
smaller; nothing else.
