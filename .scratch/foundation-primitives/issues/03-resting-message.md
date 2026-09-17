# 03 — Resting message

Status: done

Spec: `.scratch/foundation-primitives/spec.md`

## Scope

Add a message that stays on the page. The toast is transient and lives in a
fixed corner; it is the right answer for "saved" and the wrong answer for "this
view shows data as of the twelfth" or for a summary of what went wrong in a form.

Behaviour:

- Takes a tone from the same vocabulary the status badge uses — neutral, accent,
  success, warning, danger — drawn from the existing subtle semantic surfaces,
  so a warning message and a warning badge are visibly the same warning.
- Renders a title, a body and an optional row of actions.
- Optionally dismissible.
- The accessibility role follows the tone rather than being a caller decision:
  the two urgent tones announce assertively, the informational ones do not
  interrupt.

## Acceptance

- Demo tile showing all five tones, dismissible and not, with and without an
  action row, and one with a long body that wraps.
- Screenshot baselines in both themes.
- Unit test for the tone-to-role mapping.
- No existing component changed.

## Notes

Resist adding an icon per tone unless it earns its place. The design concept
carries meaning in colour and wording; a row of decorative glyphs is the kind of
addition that reads as noise in a system this quiet. If an icon is added, it
comes from the same specification as everything else and is a deliberate choice
recorded in the delivery report.
