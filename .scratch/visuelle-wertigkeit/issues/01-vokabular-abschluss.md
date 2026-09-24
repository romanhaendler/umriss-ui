# 01 — Closing the vocabulary, and the check that holds it

Status: done

Spec: `.scratch/visuelle-wertigkeit/spec.md`

## Scope

A check that answers exactly one question per site: *is there a raw value here
where a token should stand?* Plus the resolution of the sites that would turn it
red today.

**Checked** in the component stylesheets: colours, font sizes, line heights,
durations, timing curves, radii, shadows.

**Not checked** are spacing, paddings, widths and heights. This omission is the
central decision of the spec and not a convenience: a check that turns
`padding: 7px 5px` in combobox, select and multiselect red destroys optical
corrections. The 57 off-grid values stay where they are.

Today's finding, which the check has to collect:

- **2 raw hex values** in `Button.module.css` (`#ffffff`, `#000000`)
- **10 font sizes outside the token set**: `0.75rem` eight times
  (DatePicker 5×, Input, NumberInput, Table), `0.71875rem` twice (DataViz,
  NumberInput)
- **5× `line-height: 1`** raw
- **6 raw motion values** of 58 declarations: `modalOut 160ms ease-in`,
  `backdropOut 160ms ease-in`, `backdropIn … ease-out` (duration tokenised,
  curve raw), `rotate 700ms linear`, `shimmer 1.6s ease-in-out` (2×).

With motion the situation is **not** that anyone worked around tokens: all 39
`transition` declarations reference tokens (8× `var(--u-ease-out)`,
28× `var(--u-transition)`, 3× `none`). The six raw values stand where the
vocabulary offers no name — exit and continuous process. They therefore **cannot
be resolved in this ticket**, but only with the extended set from ticket 02.

The font sizes are decided **per site**: either pulled onto an existing size or —
if they denote a real, recurring role — taken on as a seventh token. `0.75rem`
stands in eight places and is thus a serious candidate for a token;
`0.71875rem` in two places rather not. No blanket rule.

The check for durations and curves is **written here and skipped for now**, with
a reference to 02; 02 extends the token set, resolves the six sites and
activates the check. To activate it here would mean entering six exceptions for
a state that is fixed one ticket later.

## Acceptance

- A unit test following the pattern of `tests-unit/kontrast.test.ts`: stylesheets
  come in as text via Vite's `?raw`, through a glob over the component
  stylesheets. No CSS parser, no file system, no browser.
- The error message names file and property per site, so that it is itself the
  work list.
- Exceptions are named, carry a reason and stand **in the test**, not in a
  document beside it. Taking on an exception is permitted; softening the
  threshold is not.
- The check makes **no** statement about spacing, paddings, widths or heights. A
  test that did so is to be rejected.
- Write the test first, while it is red, then work off the sites.
- No screenshot baseline moves in this ticket. The two hex values and the font
  sizes are to be replaced by tokens that yield **the same value**; if something
  moves, the replacement was not value-identical and is corrected rather than
  rebuilt. (A new token for `0.75rem` carries exactly `0.75rem`.)

## Notes

First of the five. Mechanical, low-risk, and the precondition for 02 to 05 not
working around the token layer again.

The stock is better with the colours and the motion than it looks at first
glance — the token layer is adhered to. The check secures this state rather than
establishing it. Its real value lies with the ten font sizes, where the set is
genuinely open today, and in the fact that in future a motion without a matching
token forces a token rather than a raw value — the way it did not happen with
`modalOut` and `rotate`.

## Comments

**Delivered** (b304ba2, 4b1e07d).

- The check lives in `packages/core/tests-unit/stylesheets.test.ts` and reads
  the stylesheets of core, table, schedule, calculation and the charts
  (`charts.css`; its `--uc-*` declarations are the charts' own token layer and
  not sites). It reads declarations with a regex over `?raw` text - no parser -
  and reports `file: property: value` per find. It checks colours, font sizes,
  line heights, durations, curves, radii and shadows with depth (a shadow
  without blur is an edge or a line in a token colour: geometry, like a
  width). A test of its own holds that it reads no padding, margin, width,
  height, gap or inset. The copies of the colour and duration rules in the
  table, schedule and calculation guards are gone.
- Written first; red with 29 distinct finds. The ticket's numbers had moved:
  the two hex values in `Button.module.css` were already gone
  (library-audit 07), `line-height: 1` stood six times, and the wider reading
  added the charts and a find the ticket did not know - the schedule's chevron
  referenced `--u-ease-standard`, which does not exist, so its transition was
  invalid. The check now also asks that every referenced `--u-*` token
  exists.
- Resolved: `0.75rem` x8 -> new `--u-text-mono` (one role: mono figures beside
  Sans text); `line-height: 1` x6 -> new `--u-leading-none`; Stat's `1.3` ->
  `--u-leading-tight`; the table's `1px` share-bar radius -> `--u-radius-full`
  (renders identically on a 2px bar); the charts get `--uc-size-tooltip`,
  `--uc-leading-label`, `--uc-leading-text`, `--uc-radius-chip`, and the
  tooltip head takes `--uc-size-tick`.
- Named exceptions in the test: `0.71875rem` x2 (NumberInput small, DataViz
  meter - no role, as the ticket expected), the verdict column's `0.7em` and
  `0.9em` (proportions of the cell), Stat's `1.1` (one large figure). The six
  motion values stood as exceptions pointing at 02, and the curve check was
  written and skipped.
- No core screenshot moved (ui-light/ui-dark, 384 passed). The other suites
  were not run; every replacement there carries the value it replaced.
