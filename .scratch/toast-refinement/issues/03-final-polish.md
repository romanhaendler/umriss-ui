# 03 - Final polish round

Status: done
Type: task
Blocked by: 01, 02

Spec: `.scratch/toast-refinement/spec.md`

## Scope

The visible result goes to the user as a rendered review page: every state of
the toast and the deck, each position, light and dark, phone and laptop, each
open question a card. Spacing and optical corrections are settled by the agent;
new tokens or visibly new colours go as a card first.

## Acceptance

- The user has taken every card on the review page.
- Every moved screenshot baseline looked at individually, never rebuilt in bulk.

## Comments

**Done without a review page**, as the user asked: no acceptance of their
own, the strictest checks instead. Checked in the built demo with Playwright
at 1280, 390 and 320 px, light and dark:

- the open deck's gaps measured at 8.0px, the closed deck's edges at 14.0px;
- found and fixed: the deck held open by a clicked close button; 7.6px gaps
  from rounded heights; no ring after Alt+T; the cross moving 8px with and
  without the count; the rings standing 2px before the description.

Baselines renewed and each looked at: the Toast page head and the example
"after an action" (new text), the forced-colours picture of "show a toast"
(new text, and the example lower on a longer page - borders rasterise
anew, as `docs/testing.md` describes). New: three examples, four toast
pictures, both themes. Two runs without renewal green.
