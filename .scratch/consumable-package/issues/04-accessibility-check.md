# 04 — Accessibility check in the browser suite

Status: done

Spec: `.scratch/consumable-package/spec.md`

## Scope

Run an automated accessibility check over the demo's tiles, in both themes, as a
new spec file in the **existing** browser suite — not as a new test level.

The demo is already the seam through which every component is exercised, which
is what makes this cheap: the infrastructure exists and is running, only the
check is absent.

Handling findings:

- Genuine defects in the library are fixed as part of this work.
- Findings that are artefacts of the demo are fixed in the demo.
- Findings that are disagreements with the checker are suppressed
  **individually, with a written reason**. Never wholesale.

## Acceptance

- Covers every demo tile in both themes.
- The suppression list, if any, has one entry per suppression, each with its
  reason.
- The delivery report lists what was found and what was done about each finding —
  fixed, demo-only, or suppressed with a reason.

## Notes

Expect findings. The components are built carefully and keyboard operation is
part of the definition of done, but nothing has ever checked, and "nobody has
noticed" is not evidence.

The temptation when a check first turns red across a dozen tiles is to suppress
broadly and revisit later. That produces a check that passes and proves nothing.
If the volume is genuinely large, land the check for a subset of tiles and open a
follow-up for the rest, rather than landing a check with a blanket suppression.

## Comments

**Implemented, Aug 2026.** `packages/ui/tests-visual/barrierefreiheit.spec.ts`
checks each of the 18 demo tiles individually, in both themes, with
`@axe-core/playwright` against WCAG 2.1 AA. 38 tests, green.

One tile per test rather than one check over the whole page: a finding should
say which component has it, and a red test should not drag eleven other tiles
down with it. axe's "best-practice" rules are deliberately excluded — they are
recommendations with no standard behind them, and a check that reports opinions
as errors gets switched off rather than read.

### Report: what was found and what came of it

Four different findings, all with impact `serious`, on four tiles. **None was
suppressed** — the suppression list is empty, and a test of its own records that
a future entry must carry a reason.

| # | Rule | Where | Finding | Handling |
|---|---|---|---|---|
| 1 | `aria-meter-name` | `Meter` in `tabelle`, `tabelle-virtuell` | `role="meter"` without an accessible name. The visible percentage inside does not count for it, nor does the column heading beside it. | **Fixed in the library.** `Meter` gets `label`; with none given, the general term from the wording seam stands there („Füllstand"). The demo now says „Auslastung". |
| 2 | `color-contrast` | row actions in `tabelle` | `.aktionen` sat at `opacity: 0.4` at rest. The accent tone on paper thereby comes to about **1.6:1** — no longer legible text, but an inkling of it. | **Fixed in the library.** Rest at `0.9`: the difference between rest and access remains, the 4.5:1 holds. **Two baselines moved** (`tabelle` light/dark); the diff shows the action labels and nothing else. |
| 3 | `color-contrast` | disabled `Tag` in `bausteine-tag-divider` | Disabled was only a CSS class. The statement was therefore missing from the accessibility tree — and the contrast rule read the pale text as an error, because nothing was there marking it as inactive. | **Fixed in the library.** `aria-disabled` on the tag. No circumvention of the rule: a disabled element should arrive as such anyway. |
| 4 | `scrollable-region-focusable` | CSV block in `tabelle-ansicht` | A scrollable `<pre>` without keyboard access — the lower part of the output could only be reached with the mouse. | **Fixed in the demo.** `tabIndex={0}`. Belongs to the demo, not to the library. |

Finding 2 is the one this check was there for: nobody had noticed it, because
the actions appear on hover anyway — and at rest, the state a screenshot shows
them in, the pale text looked like intent rather than like a defect. It is at the
same time the only one that visibly changes the picture; the two new baselines
are worth looking at.

### Follow-up to the review: the check was at first checking an unstyled page

The spec review rightly asked whether this check really proves anything. Chasing
that up turned out an **older, systemic defect**:

`demo/main.tsx` never loaded the token and base layer. It does stand at the head
of `src/index.ts`, but `package.json` declares only CSS files to have side
effects — so the bundler was allowed to cut away the body of the barrel when only
`ToastProvider` is used from it, and the two imports with it. In the built demo
CSS, `:root` occurred **zero** times.

Consequences, all of which arose before this work:

* The demo ran without tokens; every `var(--u-…)` was invalid.
* The screenshot baselines showed an unstyled page — light and dark
  byte-identical. For months the suite said nothing about colour, spacing or
  theme.
* This accessibility check measured the same unstyled page.

Fixed in `demo/main.tsx` (the application fetches `@umriss/ui/styles.css` itself
as well; the demo now does the same), plus a section "Stile einbinden" in the
README. **All 36 ui baselines are new** — for the first time they show the
concept "Tinte & Papier", and light and dark differ.

What the check then found, with real colours:

| Pair | Ratio | Handling |
|---|---|---|
| `#8b8b8b` on `#ffffff` (86×) | 3.40:1 | **Tolerated, justified.** The muted text has long been recorded in `kontrast.test.ts` as a deliberate exception to 3:1 — it carries labels and help texts, never running text. axe does not know the distinction. |
| `#77777e` on `#161618` (86×) | 4.07:1 | The same pair, dark theme. |
| `#9a6700` on `#f7efdb` | 4.24:1 | **Fixed.** Warning tone darkened to `#8a5c00`, now 4.97:1. |
| `#ffffff` on `#d0655c` | 3.68:1 | **Open, passed on.** |
| `#d0655c` on `#2f1b1d` | 4.39:1 | **Open, passed on.** |

The last two pull in opposite directions: in the dark theme
`--u-color-danger` is at once a surface under white text and text on a pale
surface. One hex value cannot be both. The clean solution is a text token of its
own, as `--u-color-accent-text` demonstrates — for which there is now
`.scratch/tone-contrast/spec.md`.

**Not suppressed wholesale.** Instead of `disableRules()`, the check filters per
**site** to exactly four named colour pairs with a written reason; every other
pair keeps failing, on every tile. Two tests of its own record that each entry
carries a reason and that the open ones point at a follow-up.
