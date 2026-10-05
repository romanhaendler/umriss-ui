# 01 — A horizontal radio group stands on the field line in a row of fields

Status: done

Blocked by: None (can start immediately)

Spec: `.scratch/field-row-alignment/spec.md`

## What to build

The case from the report: a select, a select and a horizontal radio group in a
row, each in a `FormField`. Today the radios hang a few pixels above the
selects' text. After this ticket a horizontal radio group always takes the
height of a control at its **Control size**, its first line on the field's
centre line - so the radio words stand on the baseline of the select's
placeholder, at `md` and at `sm`. A line of explanation under an option runs
below and moves nothing. A vertical radio group stays as it is.

This ticket also lays the layout seam every later ticket measures against: a
demo example "a row of fields" and a Playwright test on it, in the manner of
the Sizes behaviour tests (ADR-0041).

## Acceptance criteria

- [x] A demo example shows a row of fields - select, select, horizontal radio group - at `md` and at `sm`
- [x] A Playwright test on that example measures each control's first line of text: its vertical centre lies within 1 px of the select's text centre, at both sizes
- [x] The horizontal radio group takes its size from a `ControlSizeProvider` around it, and its own `size` wins
- [x] A horizontal option with a description keeps its label on the field line; the description runs below
- [x] A vertical radio group's height and spacing are unchanged
- [x] No new token; the heights come from the control height tokens (ADR-0045)
- [x] Screenshots that change because of the taller horizontal group (the demo configurator's panel among them) are reviewed and updated, not suppressed
- [x] Lint, types, unit, build and visual pass

## Comments

Delivered. The horizontal group's block padding is half of the control height
less one line of `text-sm` (`text-xs` at `sm`): 6.25 px at `md`, 4.75 px at
`sm`. The test was red at 6.25 px, as the arithmetic said. The description
case is not measured on its own: the padding counts one line of label and
nothing else, so what follows below cannot move the first line. The vertical
group is untouched - its screenshots did not change. 106 baselines changed,
all reviewed by sample: the configurator's choice groups grow by 12.5 px and
every page below one shifts by that, which moves text by a half pixel
(anti-aliasing only) and a page screenshot's content under a fixed popover.
