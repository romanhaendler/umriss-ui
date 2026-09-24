# 05 — Depth work on three surfaces

Status: ready-for-human

Blocked by: 02, 03, 04

Spec: `.scratch/visuelle-wertigkeit/spec.md`

## Scope

The results from 02 to 04 are **finished properly** on the three surfaces with
the greatest visual weight, instead of being normalised in a thin layer across
thirty components:

1. **Table** — `Table`, `TableRow`, `TableFilter`, `TableFilterStrip`,
   `TableVirtualBody`
2. **Date picking** — `DatePicker`, `DateRangePicker`, `DateTimePicker`,
   `DateTimeRangePicker`, `Kalender`, `ZeitFeld`, `BereichsPanel`,
   `BereichsTrigger`
3. **Combobox / Select / MultiSelect** as a group

All remaining components have received the new vocabulary through 01 to 04 and
nothing else. That is intended: a library does not become high-grade by
everything being equally mediocre.

To be gone through per surface:

- **Motion** — does the origin sit right, is exit shorter than entry, does
  something move that should stand still?
- **States** — does every element follow the canon from 04, including the
  composite ones (table header with sorting and filter, calendar day with range
  band)?
- **Optical alignment** — do characters sit where they look right, instead of
  where they are arithmetically centred?
- **Tracking and size** — is every font size assigned its tracking
  (`--u-tracking-*` hangs free today)?
- **Density and rhythm** — is there too much or too little air in a row?

**Geometric centring is the starting point, not the goal.** A centred triangle
looks too far left, a circle overshoots its reference line, quotation marks want
to hang into the margin. The asymmetric paddings `7px/5px` in combobox, select
and multiselect are with high probability exactly such corrections — craft, not a
debt item. They stay; what is missing is the reason at the site, so that the next
person does not "tidy them up".

## Acceptance

- The three surfaces have been gone through completely; per surface a short list
  of the decisions taken accompanies the delivery.
- Every optical correction — the existing ones as well as the new — carries its
  reason as a comment at its site.
- No raw vocabulary is added; the check from 01 stays green.
- `tests-unit/kontrast.test.ts` and `tests-visual/barrierefreiheit.spec.ts` stay
  green.
- The functional checks of the surfaces stay green:
  `tests-visual/funktionen-tabelle.spec.ts`,
  `tests-visual/funktionen-virtuell.spec.ts`,
  `tests-visual/funktionen-basis.spec.ts`, as well as the unit tests for the
  table model, column view, multi-level sorting, grid, range, time and contract.
  **This work changes appearance, not behaviour.** If a functional test fails,
  the change has overshot its goal.
- Screenshot baselines will move considerably. **Look at every one individually
  and justify it.** A bulk rebuild is ruled out — it would be exactly the
  convenience the rule was written against.

## Notes

Last of the five, because it applies 02 to 04.

The risk of this ticket lies not in the technology but in the judgement:
"finished" here means *looks good*, and that is not a property a test can
deliver. The rule about the baselines is therefore the most important line — it
is the only place where a visual judgement becomes visible and has to be
justified. Drop it, and this ticket becomes a bulk rebuild of baselines with a
story about it.

The selection of the three surfaces is a bet on visual weight, not a
measurement. If going through them shows that a fourth surface carries more —
modal and toast are the next candidates — that is a finding for a follow-up
ticket and no reason to widen this one.
