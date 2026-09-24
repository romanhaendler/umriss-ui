# Spec: A text tone of its own for danger and warning

Status: done

Origin: follow-up from `consumable-package/issues/04-accessibility-check.md`,
Aug 2026. The findings stand by name in
`packages/ui/tests-visual/barrierefreiheit.spec.ts` under `OFFEN` and
deliberately let the check pass there, instead of quietly disappearing.

Sequencing: the surface half is delivered — `library-audit` ticket 07 introduced
`--u-color-on-danger`, white on the dark danger surface is thereby fixed and its
`OFFEN` entry deleted. What remains open is the text half
(`--u-color-danger` on `--u-color-danger-subtle`) and thus this ticket.

---

## Problem Statement

In the dark theme the danger tone carries two roles at once, and the two pull in
opposite directions.

`--u-color-danger` is `#d0655c` there. As a **surface** under white text the pair
comes to 3.68:1 — too little for the 4.5:1 that normal text needs. As **text** on
the pale danger surface (`--u-color-danger-subtle`, `#2f1b1d`) the same token
comes to 4.39:1 — likewise just too little.

The contradiction is structural and cannot be solved by a better hex value: the
surface would have to get darker so that white passes on it, and the text
lighter so that it passes on dark. One value cannot be both.

The accessibility check found this after a second defect had been fixed: the
demo had never loaded the token layer (see `demo/main.tsx`), and until then
everything was being checked against an unstyled page.

The light warning tone had the same defect in a simpler form — at 4.24:1 it was
just too light on its own pale surface — and is already fixed
(`#9a6700` → `#8a5c00`, now 4.97:1). There was no conflict of roles there.

## Solution

Give the danger tone a text colour of its own, the way the accent has long had
one: beside `--u-color-accent` stands `--u-color-accent-text`, and for exactly
this reason.

Proposed:

- `--u-color-danger` remains the **surface**. In the dark theme it is darkened
  far enough that white text on it reaches 4.5:1.
- `--u-color-danger-text` is newly added and carries **text** — on the base
  surface as well as on the pale danger surface.
- The same check for the warning tone in both themes, including where it passes
  today: a tone that only gets through by accident is not a system.

Whoever touches the tokens also touches `tests-unit/kontrast.test.ts`: the pairs
belong in there, with the threshold that applies to their role.

## User Stories

1. As a developer I want a token for danger text that means text, so that I do
   not misuse the surface colour.
2. As an end user I want to be able to read an error message in the dark theme
   without guessing it.
3. As a designer I want both themes to keep the same promise, so that the dark
   one does not lag one release behind.
4. As a maintainer I want the accessibility check to run **without** entries
   under `OFFEN` afterwards — the list is the purpose of this ticket, not its
   permanent state.

## Implementation Decisions

**No new tone, but a separated role.** The palette gets no further colour; it
gets the distinction the accent already has.

**The screenshot baselines move**, and that is right here: the defect is
visible, and so is its fix. They belong looked at, not waved through.

**The entries under `OFFEN` are deleted, not rewritten.** If they still stand
after this work, the work is not finished.

## Testing Decisions

The checks already exist; they only have to be allowed to tell the truth.

- `tests-unit/kontrast.test.ts` gets the new pairs with the threshold of their
  role: 4.5:1 wherever text stands.
- `tests-visual/barrierefreiheit.spec.ts` loses the two `OFFEN` entries.
  After that the list is empty, and the check says something.

## Out of Scope

- The muted text (`--u-color-text-muted`). Its exception is deliberately and
  justifiably recorded in `kontrast.test.ts` and continues to apply.
  Whoever touches it makes a ticket of its own out of it.
- Every other colour of the palette. This ticket clears up a contradiction, it
  does not retune the palette.

## Comments

### Delivery report (2026-09-24)

The text half is delivered. Paths in the spec above predate the renames:
`packages/ui` is `packages/core`, `kontrast.test.ts` is `contrast.test.ts`,
and the `OFFEN` list is `OPEN` in `packages/demo/checks/accessibility.ts`.

- **`--u-color-danger-text: light-dark(#b13636, #d86f66)`** in `tokens.css`.
  `--u-color-danger` was not darkened as proposed: the surface half was already
  solved by `--u-color-on-danger` flipping polarity, so the surface keeps its
  value. Measured (text on subtle / surface / page ground): light 5.20 / 6.09 /
  5.83, dark 4.93 / 5.49 / 5.83.
- **Every `color:` that drew danger as type** now reads the text token, in core
  (Alert title, Badge, Tag, FormField error and required mark, Textarea count,
  Menu, MultiSelect chip, Stat verdict and freshness), table (verdict column,
  alarm list freshness), schedule (tooltip finding), calculation (worst
  verdict, freshness) and the demo shell (required mark in the API table).
  Borders, focus rings, the danger button surface, DataViz fills, the Toast
  icon and the schedule's canvas stay on `--u-color-danger`.
- **Warning and success** pass as they are and got no text token: light
  warning 5.07 / 5.81 / 5.57, dark 6.56 / 7.71 / 8.17; light success
  4.64 / 5.32 / 5.09, dark 5.89 / 6.61 / 7.00. Their pairs are now held at
  4.5:1 in both themes; the light warning exception (3:1) is struck, its value
  had been fixed before.
- `contrast.test.ts` checks all nine tone-as-text pairs at 4.5:1; `OPEN` is
  empty.
- **Baselines:** the core suite (light and dark) passes at the repo's
  tolerance without an update - the dark danger text moves ~150 px per image,
  under 0.1 %. None were rewritten. The dark baselines of table, schedule and
  calculation were not run here.
