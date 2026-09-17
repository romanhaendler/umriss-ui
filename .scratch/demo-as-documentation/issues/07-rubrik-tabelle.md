# 07 — Rubrik Tabelle: one page, and the demonstration it keeps

Status: done

Blocked by: 03, 05

Spec: `.scratch/demo-as-documentation/spec.md`

## Scope

`Table` — one page, and the hardest one.

Thirty-five props, a model (`tabellenModell.ts`), a view (`ansicht.ts`), an
export (`csv.ts`), a virtualised body, a filter strip and a selection hook. The
current demo carries it as `TabellenKachel.tsx`: 664 lines, four `useState`, two
panels sharing state — which is exactly why it is one file.

**The demonstration stays.** Per the spec, `Table` is the archetype of a
component that isolated miniatures would misrepresent: filter, selection, shared
view and export are one thing, and a page that showed them in four separate
examples would have documented four features and hidden the component. The
demonstration sits last, shown whole, with its source like any other example.

**In front of it, real examples**, each showing something the demonstration
buries: columns and cell rendering; sorting; the empty state; the loading
skeleton; pagination; row detail; virtualisation with twenty thousand rows
(today's `VirtuelleTabellenKachel`, which becomes an example and not a page,
since virtualisation is a prop and not a component).

**`ansicht.ts` and the address.** The "Ansicht teilen und exportieren" panel
becomes an example: a view encoded into search parameters, copied, and read
back. Keep the existing behaviour test that asserts on the rendered address —
`funktionen-tabelle.spec.ts` checks a `code` element's text, and that assertion
should survive the move.

**JSDoc to write**: Table 25/35 · TableFilter 5/9 · TableFilterStrip 5/8 ·
TableRow 4/8 · TableVirtualBody 2/5. Only the props that reach the page's table
need it; the internal row and body components are documented only insofar as
they are exported and shown.

**"Warum so"**: `.scratch/table-model/` and `.scratch/table-surface/` hold the
reasoning. The reader needs: why the model is separate from the view, what the
library remembers (nothing), and who owns selection.

## Acceptance

- One page, one demonstration, and at least six examples in front of it.
- The virtualisation example is on this page, and `tabelle-virtualisierung` no
  longer exists as an address.
- `useTableSelection` is documented on this page, since it has no page of its
  own.
- The gate fails for any bare prop reaching this page's table.
- Every behaviour assertion from `funktionen-tabelle.spec.ts` and
  `funktionen-virtuell.spec.ts` survives, against the new addresses.
- Baselines regenerated; suite passes.

## Notes

The demonstration is the one place where 664 lines of shown source is
acceptable, because it is the only honest way to show a component with a model.
Do not trim it to look tidier — a demonstration with its interesting parts
removed is a screenshot again.

The page-level "alle Beispiele mit Code" switch makes this page very long when
on. That is correct and is not a reason to special-case it.

## Comments

**Delivered, together with ticket 03** — see the reasoning there: the bridge was
the way to an intermediate state, and there was none.

Every page of this rubric has at least one example; the JSDoc gaps of these
components are closed, and the gate is unconditional for them.

**Addendum from the review.** The ticket says the "Ansicht teilen und
exportieren" surface becomes *an example*. It has instead remained part of the
demonstration, and for the very reason the demonstration exists at all: the
surface shows the state of the model that the table above it operates — sort
levels, column choice, the view as a link, the CSV of the filtered set. As a
standalone example it would need a second table beside it in order to show
anything at all, and then it would be the demonstration over again. The ticket's
assurance — the check on the rendered link — is preserved
(`funktionen-tabelle.spec.ts`, now against `[data-rolle='ansicht']`).

Eight examples stand in front of the demonstration: columns and cells, the model
and its sort levels, the empty state, the loading state, the pagination, the row
detail, the virtualisation and the selection.

