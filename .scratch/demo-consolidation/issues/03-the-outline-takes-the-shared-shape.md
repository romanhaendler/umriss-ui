# 03 — The outline takes the shared shape

Status: done
Type: task

Blocked by: 01, 02

Spec: `.scratch/demo-consolidation/spec.md` (**The pages of the charts demo**, needs confirmation)

## Scope

`packages/charts/demo/outline.ts` stops defining its own `Page`/`Example` types and takes `Rubric`, `Page` and `addresses` from `@umriss-ui/demo/outline`, as core and table do. That brings three things with it: the rubric level, single-segment addresses (`#/line`, the rubric deliberately not in them), and the fields `sentence`, `types` and `exports` per page.

**Blocked on a decision, which is why this ticket is `needs-info`:** what a page is here. The spec recommends four rubrics and fourteen pages and gives the alternative. Confirm or overturn before cutting the files; the rest of the ticket follows either way.

- Each page gets one sentence saying what the thing is for, in the voice of the other two outlines.
- `types` lists the `*Props`/`*Config` interfaces whose tables belong on that page — charts exports 29 of them. `exports` is the import line a reader copies, which is not derived from `types` (the shell's outline says why).
- The example folders from ticket 02 are moved to match the pages. `readExamples` throws on a folder without a page, so a mistake here fails at load rather than showing an empty page.
- Example ids stay as they are, whatever page they land on.
- `CONTEXT.md`, **Rubric**: the sentence listing the core demo's rubrics gains charts' — the entry already carries such a list and it would otherwise be half true.

## Acceptance

- `outline.ts` imports its types from `@umriss-ui/demo/outline` and exports `ADDRESSES` through `addresses(OUTLINE)`, as the other two do.
- Every address is single-segment and contains no rubric id.
- `pnpm --filter @umriss-ui/charts typecheck` is green and the demo starts.
- `pnpm test:visual` for the charts projects is green **without updating a baseline**; the suites read addresses from the outline, so a moved page does not move a picture.
- `CONTEXT.md`'s rubric list names the charts demo's rubrics.

## Comments

**Confirmed and delivered.** Roman chose the recommended structure: four rubrics,
fourteen pages. The `Monitoring` rubric carries the name from ticket 09 from the
start rather than being renamed twice.

**Five pages carry no example**: `Area`, `Bar`, `Scatter`, `StateBand` and
`Tooltip & Legend`. Each is drawn inside a composed example on another page — the
mixed chart, the limits-and-state chart, nearly every chart for the tooltip — and
the thirteen existing ids were carried over unchanged, as the ticket requires, so
no example was invented to fill them. Their API tables are complete regardless.
The smoke test carries the five as a named exception, so that a sixth page
without an example fails instead of passing unnoticed. **Five small examples are
the obvious follow-up ticket** and were deliberately not smuggled into this one.
