# 02 — The new grouping

Status: done
Type: task

Blocked by: 01

Spec: `.scratch/demo-rubrics/spec.md`

## Scope

`packages/core/demo/outline.ts` takes the rubrics confirmed in ticket 01. Only
the grouping and the order change.

- **No page is split, merged, renamed or moved to another package.** The forty
  pages, their ids, their sentences, their `types` and their `exports` stay
  exactly as they are. A diff that touches a page's body is a diff that has done
  something this ticket did not ask for.
- **Every rubric gets a sentence that describes it rather than excusing it.**
  Today's `"What every surface needs before it is a form or a table"` is the
  shape to avoid: it says what the rubric is not.
- **Within a rubric the pages run from the simple to the composed** —
  `Button` before `ButtonGroup`, `Tooltip` before `Popover` before `Menu`. Not
  alphabetical, and not the order of delivery, which is what produced today's
  run.
- The file's head comment explains the cut in two sentences, as the outlines of
  the other two demos do.

## Acceptance

- `pnpm --filter @umriss-ui/core typecheck` is green and `pnpm dev:core` shows
  the new sidebar.
- Every page id is unchanged: `git diff` shows no line containing `id:` inside a
  page object.
- No file under `packages/core/src` is touched.
- The demo still starts on the overview, and every rubric card carries its pages
  as chips.

## Comments

**Delivered.** `packages/core/demo/outline.ts` now carries eight rubrics and the
same forty pages.

- **No page body was touched, and that is measured rather than claimed.** The
  page objects were lifted out of the old file and re-emitted unchanged: all
  forty ids are the same set, and every one of the forty blocks is byte-identical
  to its version in `HEAD`. **The acceptance criterion as literally written —
  "`git diff` shows no line containing `id:` inside a page object" — is not
  met, and cannot be:** moving a page between rubrics moves its whole block, so
  roughly thirty such lines appear in the diff as a removal and an addition of
  the same text. What the criterion was protecting is the substance, and that is
  measured below rather than asserted. The `id:` lines that do show in `git diff` are whole
  page blocks that moved from one rubric to another — no id was renamed. The
  check that proves it:
  `blocks(HEAD) == blocks(worktree)` over the forty `{ id: … }` objects — same id
  set, identical bodies.
- **Every rubric sentence describes the rubric.** `Setup`: *the one component an
  application meets before every other — and the only page here that is not a
  component*. `Layout and text`: *the surface a page stands on, and the type it
  is set in*. `Actions`: *what a user presses when something is to happen*.
  `Status and waiting`: *what a surface says about itself: a message, a mark —
  and the three shapes of something not yet there*. `Overlays`: *what opens above
  the surface and gives it back when it is answered*. `Navigation and structure`:
  *how one gets from one place to the next — and how many places are held in one*.
  `Forms` and `Monitoring` keep the sentences they had.
- **Simple before composed, inside every rubric.** `Stack and Grid · Card ·
  Divider · Typography · VisuallyHidden`; `Button · ButtonGroup`; `Alert · Badge ·
  Tag · Toast · Spinner · Skeleton · EmptyState` (what is said, then what is
  marked, then what is awaited); `Tooltip · Popover · Menu · Modal ·
  ConfirmDialog · CommandPalette` (the seam's caller before the seam's other
  callers, the dismissible before the modal); `Tabs · TreeView · Dock`. Forms and
  Monitoring keep today's order, which already reads that way.
- **The head comment gained a paragraph** on the cut and on the order rule,
  pointing at ticket 01 for the one name that is argued rather than obvious.

`pnpm --filter @umriss-ui/core typecheck` green, `pnpm lint` green,
`pnpm --filter @umriss-ui/core test:unit` green (44 files, 948 tests). No file
under `packages/core/src` is in the diff.
