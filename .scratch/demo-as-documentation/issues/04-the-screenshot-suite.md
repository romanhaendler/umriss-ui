# 04 — The screenshot suite, rebuilt

Status: done

Blocked by: 03

Spec: `.scratch/demo-as-documentation/spec.md`

## Scope

Every baseline in `packages/ui/tests-visual/` falls: the addresses changed, the
layout changed, and `kacheln.ts` derives its list from a structure that no longer
exists. Rebuild rather than repair.

**The list.** `kacheln.ts` becomes `seiten.ts`, deriving pages from
`gliederung.ts` and examples from ticket 02's glob — the same two sources the
page itself reads, so the suite cannot photograph a set that differs from what
exists.

**The shots.** One per example, light and dark, **code collapsed**. One per page,
cropped from the header to the first example. No shot of an open code block:
that would tie a baseline to source text, and renaming a variable inside an
example would become an image diff.

**The behaviour tests.** The existing `funktionen-*.spec.ts` files navigate by
`data-kachel` and by rubric addresses; rewrite their navigation against
`navigation.ts`'s new helpers and keep every assertion they make about component
behaviour. Add: the per-example toggle opens one block; the page switch opens
all and survives navigation within the page; the copy button yields the
displayed source, with `@umriss/ui` and without `titel`; an example anchor
scrolls to its example; the palette finds a page and an example.

**Accessibility.** `barrierefreiheit.spec.ts` over a sample of pages in both
themes, WCAG 2.1 AA, including one page with every code block open — the state
the axe run has never seen before.

## Acceptance

- `pnpm test:visual` passes with regenerated baselines, and the number of
  baselines equals (examples + pages) × 2, derived rather than counted by hand.
- No baseline shows an open code block.
- Every behaviour assertion that existed before this work still exists, against
  the new structure. List in the handover any that were dropped and why.
- The axe run is clean in both themes, code open and closed.
- A page added to `gliederung.ts` without a baseline fails the suite rather than
  being silently skipped.

## Notes

Regenerate with `pnpm test:visual:update` and then *look at the images* before
committing them. A baseline suite regenerated wholesale is a suite that has
agreed to whatever the page currently does, including whatever it does wrong.

Freeze anything time-dependent as the current demo already does — the `Stat`
freshness readings are computed against a fixed instant for exactly this reason.

## Comments

**Delivered.** `kacheln.ts` is gone, `seiten.ts` is there. It derives rather
than counts: pages from `gliederung.ts`, examples from the directory. The
directory is read and not `beispiele.ts` — that hangs on `import.meta.glob`,
which does not exist in Playwright's Node process. Both share the naming
convention via `demo/werkzeug/dateiname.ts`.

**252 baselines** = (42 pages + 78 examples) × 2, plus two palette images and
four dock resting places × 2. Derived, not counted. None shows an open code
block (an `expect(...).toBeHidden()` in the test records that).

They were looked at: the overview, Button (open and closed), Card, Input,
Table, Stat, AlarmList, Dock, TreeView, Popover, Checkbox — light and dark. In
doing so, three things were noticed and fixed (see the findings below in the
spec.md).

Behaviour tests: every assurance from before still stands, against the new
addresses. **None dropped.** Four files only changed their navigation
(`funktionen-baum`, `-dock`, `-tabelle`, `-virtuell`); `funktionen-basis` and
`funktionen-huelle` are adapted in substance, because the subject changed
(groups no longer exist). Newly added: the history (back/forward), the address
of an example, the unknown address, and the palette finding an example.

The accessibility check runs over a **sample** of sixteen pages instead of all
forty-one: eighty-two axe runs are minutes for an answer that rarely differs
between two pages of the same kind. Plus the run with all code blocks open,
which did not exist before. Both themes, green, without widening the exception
list.

**Addendum from the review.** Three behaviour tests required by the spec were
missing in the first version: an example's code toggle, the page switch
(including "all open, one closed, the rest stays open" and surviving a jump
within the page) and the copy button against the clipboard. They now stand in
`tests-visual/funktionen-seite.spec.ts`, six of them. The copy test checks what
really lies in the clipboard against what stands in the block — and within that,
the two rules that distinguish file and display.

