# 05 — Rubrik Fundament: twelve pages

Status: done

Blocked by: 03, 04

Spec: `.scratch/demo-as-documentation/spec.md`

## Scope

Button · ButtonGroup · Tag · Divider · Badge · Alert · Typography · Card ·
Spinner · Skeleton · EmptyState · VisuallyHidden

Decompose the demonstrations that ticket 03 parked on these pages into real
examples, add examples to the six pages that never had a panel (`Badge`, `Card`,
`Spinner`, `Skeleton`, `EmptyState`, `VisuallyHidden`), and close the JSDoc gaps
so the gate can fail for this rubric.

`Button` is already finished by ticket 03; leave it alone except to keep it
consistent with whatever the other eleven teach you.

The "Aktivitätsprotokoll" panel is not a component. It is a `Card` with
`collapsible` and a `<pre>` inside, and it becomes an example on the `Card`
page — the one that shows a card carrying content the card knows nothing about.

**JSDoc to write** (documented/total today): Alert 3/10 · Card 5/11 ·
Typography 7/13 · Tag 3/5 · EmptyState 2/4 · Divider 2/3 · Badge 1/2 ·
ButtonGroup 6/7. `Spinner`, `Skeleton` and `Checkbox` are already complete.

**"Warum so"**: expect most of these twelve to have none, and let them have
none. The two candidates worth checking are `Tag`'s tone contrast
(`.scratch/tone-contrast/`) and `Card`'s collapsible behaviour. If the source
header comment says something the page reader needs, move it; if it explains an
implementation, leave it in the source.

## Acceptance

- Every page in the rubric has at least one example; none has a `Vorführung`
  left over from the bridge.
- The gate fails for any bare prop on these twelve components.
- Baselines regenerated for the new examples, and the suite passes.
- `VisuallyHidden` is allowed to be one example and one table and nothing else.
  Do not manufacture a second.

## Notes

This rubric is the cheapest and should go first among 05–09: it sets the house
style for what an example is worth showing, and the more interesting rubrics
inherit that judgement.

An example earns its place by showing something the props table cannot say. Four
examples that differ only by a prop value are one example plus a table.

## Comments

**Delivered, together with ticket 03** — see the reasoning there: the bridge was
the way to an intermediate state, and there was none.

Every page of this rubric has at least one example; the JSDoc gaps of these
components are closed, and the gate is unconditional for them.
