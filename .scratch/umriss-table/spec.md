# Spec: `@umriss/table` — a table declared the way it reads

Status: done

Origin: `/grill-with-docs` session, 11 Sep 2026. It began with the table's demo page ("far too little for a component this central") and ended in a new package. It replaces the table surface of `@umriss/ui` that `.scratch/table-model/` and `.scratch/table-surface/` produced; the pure modules those specs delivered move here unchanged.

Sequencing: tickets 01 and 02 are a throwaway prototype and come first. The API under **Solution** is the hypothesis they test; if either overturns part of it, this spec is amended before ticket 06 starts. The package scaffold (03) and the public-surface work in `@umriss/ui` (04) can run alongside the prototype. The table leaves `@umriss/ui` (14) only once `@umriss/table` has a demo of its own carrying the behaviour tests — a separate spec, `.scratch/table-demo/spec.md`; see **Testing Decisions**.

Research: `.scratch/umriss-table/research.md`. Decisions: ADR-0016, ADR-0017.

---

## Problem Statement

The table is the most important component in the library and the one its demo shows worst. Its page has nine examples, more than any other, but seven are three-row miniatures, and the column filter, the filter strip, the column menu, column widths, row actions, the export and the view link have no example of their own. They exist only inside a 691-line demonstration.

That is a symptom. The cause is the shape of the interface. `table-model` decided that columns are data for the pipeline and that rendering stays compositional, so a caller describes every column up to four times: in the column array, in a header cell, in a data cell and in the footer. Everything the model knows about columns — which are hidden, in what order, how wide — has to be re-applied by hand at each place, and the demonstration does it with `zeigt("budget") && …` in front of every cell.

Where the hand-application is missing, the model and the screen disagree. `setReihenfolge` reorders the model: the column menu, the export and the view link follow it. The rendered table does not, because its header, body and footer are written in a fixed JSX order. The demonstration's "Status und Budget nach vorn" moves nothing on screen, beside a panel stating that the order follows the model and not the markup. No test covers it, and `AlarmList`, the model's second consumer, avoids the question with six fixed columns.

The array itself is the other half. Configuration arrays are the dominant shape for data grids (TanStack Table, AG Grid, MUI X), and they read as configuration: nothing in them looks like the table that comes out. The libraries that declare columns in JSX instead (PrimeReact, KendoReact, Blueprint, Syncfusion) pay with the row type — accessors and cell renderers are `any` — and most break when a column is wrapped in a component of the caller's own. React Aria keeps wrappers working at the cost of a second render pass and matches cells to columns by position only. No library offers a JSX-declared table whose columns are typed against their rows and can still be wrapped and reused (research, point 4).

## Solution

A new package, `@umriss/table`, with `@umriss/ui` as a peer dependency (ADR-0016). `@umriss/ui` keeps no table.

Columns are declared by composition. The companion hook binds the row type once and hands out the building blocks that need it; everything that does not need the row type is an ordinary import (ADR-0017).

```tsx
import { Toolbar, Search, ColumnMenu, Export, Pagination } from "@umriss/table";

function Auftragsliste({ auftraege }: { auftraege: Auftrag[] }) {
  const { Table, Column, VerdictColumn, RowDetail, RowActions, Action } =
    useTabelle(auftraege, { rowKey: (a) => a.id, pageSize: 25 });

  return (
    <Table selectable stickyHeader>
      <Toolbar>
        <Search placeholder="Auftrag suchen" />
        <ColumnMenu />
        <Export filename="auftraege.csv" />
      </Toolbar>

      <Column value="nummer" label="Auftrag" rowHeader />
      <Column value="linie" label="Linie" filter="list" />
      <Column value="menge" label="Menge" footer="sum" />
      <Column value="auslastung" label="Auslastung" format="prozent" />
      <VerdictColumn value="messwert" label="Messwert" limits={GRENZEN} />
      <Column value="status" label="Status">
        {(status) => <Badge tone={TON[status]}>{status}</Badge>}
      </Column>
      <Column id="abweichung" label="Abweichung" value={(a) => a.messwert - a.sollwert} footer="avg">
        {(abw) => <Zahl wert={abw} einheit="mm" vorzeichen />}
      </Column>
      <Column id="trend" label="Trend" value={(a) => a.verlauf}>
        {(verlauf) => <Sparkline data={verlauf} />}
      </Column>

      <RowDetail>{(a) => <AuftragDetail auftrag={a} />}</RowDetail>
      <RowActions>
        <Action onSelect={(a) => oeffnen(a)}>Öffnen</Action>
        <Action bulk onSelect={(auftraege) => archivieren(auftraege)}>Archivieren</Action>
      </RowActions>

      <Pagination />
    </Table>
  );
}
```

The table renders its own rows. Because every fact about a column lives in one element, hiding and reordering are applied by the table to header, body and footer alike, and the bug above cannot be written.

The scope is parity with today's table plus `VerdictColumn`: search, the list column filter, the filter strip, multi-level sort, selection, column visibility and order, widths, row detail, row actions, export, the view link, sticky header and first column, density, empty and loading states, and virtualisation. Grouping, live data, grid keyboard navigation and inline editing are later specs built on this one.

## User Stories

1. As a developer, I want to declare a table as JSX that reads like the table it produces, so that I do not translate between a configuration array and the screen.
2. As a developer, I want everything about a column — its value, label, look and footer — in one element, so that there is one place to change it.
3. As a developer, I want the row type inferred from the rows I pass, so that I never write it down and a mistyped field name fails the build.
4. As a developer, I want my cell renderer's value typed as the field's type, so that a status column's renderer knows it holds `"Aktiv" | "Pausiert"`.
5. As a developer, I want a column wrapped in my own component to keep working, so that a column shared by twenty tables is written once.
6. As a developer, I want a shared column bound to a property rather than to a row type, so that a quantity column fits every row with a quantity and the compiler rejects it for rows without one.
7. As a developer, I want hiding and reordering to move header, cells and footer together without my involvement, so that the model and the screen cannot disagree.
8. As a developer, I want a column without a renderer to look right from its value's type, so that the common column is one line.
9. As a developer, I want to choose percent, fixed decimals or date-only by naming a format, so that sorting, export and footers keep working on the underlying value.
10. As a developer, I want the compiler to refuse a footer sum on text and a date format on a number, so that a meaningless column does not reach review.
11. As a developer, I want the compiler to require a renderer when a value cannot be shown as text, so that a column holding an array does not silently render nothing.
12. As a developer, I never want to check a cell's value for null, so that absent values look the same in every table without code in every cell.
13. As a developer, I want to mark one column as the row header, so that checkboxes, expanders and action menus are announced by the row's name without my writing an `aria-label`.
14. As a developer, I want selection to be a prop, so that the checkbox column is not something I place.
15. As a developer, I want to write an action once and have it appear on the row and, if it acts on many, in the toolbar for the selection, so that row actions and bulk actions cannot drift apart.
16. As a developer, I want a bulk action to receive a list whether triggered on one row or on the selection, so that deleting three rows is one confirmation and not three.
17. As a developer, I want search, column menu, export and pagination as plain imports placed inside the table, so that parts that know nothing about my rows need no binding.
18. As a developer, I want to place the search field outside the table when my layout demands it, so that the table's structure does not dictate my page's.
19. As a developer, I want the view as a string I put in the address bar myself, so that the library does not choose my router.
20. As a developer, I want the export to contain the filtered set in the visible columns and order, with numbers as numbers, so that a spreadsheet receives data rather than formatted text.
21. As a developer, I want virtualisation to be something I switch on for a large table, so that a small table does not pay for it.
22. As a developer, I want `@umriss/table` to honour the `UmrissProvider` I already have, so that theme, density, formats and wording are set once for both packages.
23. As a developer maintaining `AlarmList`, I want it expressed in the same API as every other table, so that the library has one way to build a table.
24. As an end user, I want the columns I rearrange to move on screen, so that arranging a table does what it says.
25. As an end user, I want "select all" to mean every row matching my filter, so that a bulk action acts on what I filtered to.
26. As an end user with a screen reader, I want every row control announced with the row's name, so that "checkbox, not checked" becomes "A-2041 auswählen".
27. As a library maintainer, I want the column typing proven by compiler tests that include the errors it must produce, so that a change loosening the types fails.
28. As a library maintainer, I want registration, order, hiding and defaults covered by component tests, so that the rendering the table now owns is tested where it lives.
29. As a library maintainer, I want the pure modules of the old table moved with their tests unchanged, so that the rewrite does not reopen questions they already answered.
30. As a library maintainer, I want lint to forbid `@umriss/ui` and `@umriss/charts` from importing `@umriss/table`, and `@umriss/table` from reaching past `@umriss/ui`'s public entry, so that the dependency direction is enforced rather than remembered.

## Implementation Decisions

### The package

**`@umriss/table` depends on `@umriss/ui` as a peer dependency** and imports only from its public entry (ADR-0016). It uses `Button`, `Checkbox`, `Menu`, `Popover`, `Select`, `Tag`, the language seam (`useFormate`, `useWortlaut`), the provider's density, the limit model, freshness and the window arithmetic. The window arithmetic (`useVirtuell`, `sichtFenster`, `scrollFuerZeile`) is today exported only through the table's index and must become a public export of `@umriss/ui` in its own right, since `TreeView` keeps using it. The same applies to anything else the moved modules reach through an internal path.

**`@umriss/ui` keeps no table.** `Table`, `Th`, `Td`, `TableToolbar`, `TablePagination`, `TableEmpty`, `TableSkeletonRows`, `TableFilter`, `TableFilterList`, `TableFilterStrip`, the row components, the virtual body, the model, the export, the view functions, `useTabelle`, `useTableSelection` and `AlarmList` all leave. Nothing in `@umriss/ui` may import `@umriss/table`, and `@umriss/charts` stays standalone.

**Zero runtime dependencies**, like both existing packages.

### Binding the row type

**The hook is where the row type is bound.** `useTabelle(zeilen, optionen)` infers the row type from `zeilen` and returns the building blocks that need it: `Table`, `Column`, `VerdictColumn`, `RowDetail`, `RowActions`, `Action`. Its return value also carries the table's state for anything reading it from outside.

**There is no freely exported `Column`.** TypeScript cannot check that a JSX child fits its parent; every element is typed only as an element. The link between a column and its rows therefore comes from both being obtained from the same hook call. A free `Column` would be the unchecked route and, being shortest, the one people take. The probe establishing this is under **Further Notes**.

**Building blocks that do not touch the row are ordinary imports** — `Toolbar`, `Search`, `ColumnMenu`, `Export`, `Pagination` — and read the table they are placed in. Placed outside a table they take `of={t}`, which means keeping the hook's return value (`const t = useTabelle(…); const { Table, Column } = t;`).

**Reusable columns are presets**, built with a helper bound to a property rather than a row type and spread into a `Column`: `const menge = spalte<{ menge: number }>({ value: "menge", label: "Menge", footer: "sum" })`, then `<Column {...menge} />`. The compiler accepts the preset for any row with a numeric `menge` and rejects it otherwise. A preset over a type with more than one property names its field as a second type argument (`spalte<{ menge: number; nummer: string }, "menge">`), because TypeScript has no partial inference of type arguments (ticket 01). A wrapper component returning a column works too, provided it receives the table as `of` typed with a concrete row type (`of: Tabelle<Auftrag>`); a wrapper generic over its rows does not type, and a wrapper without `of` is unchecked — the documentation says both.

**A column obtained from another hook call is not a type error** when placed in this table: JSX does not check children against their parent (ticket 01). The table reports it at runtime, in development, instead.

**Building blocks handed out by the hook keep their identity** for the life of the hook call; a new identity per render would remount every column. Whether this holds without cost, and whether the table shows its columns in the first painted frame, is what ticket 02 establishes.

### A column

**Every column has exactly one value.** `value` is either a field name of the row — autocompleted, and supplying the column's `id` — or a function of the row, in which case `id` is required. A column that shows something without a value does not exist: a sparkline column reads `value={(a) => a.verlauf}` and presents it.

**The value is what the column is; `children` is how it looks.** Sorting, search, export and footers operate on the value only; nothing reads a presentation back. `children` receives `(wert, zeile)`, with `wert` typed as the field's type or the function's return type.

**`children` is not called for an absent value.** A value that is `null`, `undefined` or `NaN` is absent: the cell shows a muted dash, assistive technology hears the wording entry for "no value", it sorts last in either direction, it is an empty field in the export and it counts towards no footer. In exchange `wert` is typed `NonNullable`. `VerdictColumn` is the exception: an unknown verdict is a verdict of its own (glossary: **Verdict**) and is shown as one.

**Without `children`, the value's type decides the presentation**, using the formats of the language seam:

| Value type | Shown as | Alignment | Sort | Export | `footer` |
|---|---|---|---|---|---|
| `string` | as given | start | `vergleicheText` | text | — |
| `number` | `formate.zahl` | end, tabular figures | numeric | number, decimal comma | `sum`, `avg` |
| `Date` | `formate.datumZeit(d, false)` | start | by time | ISO timestamp | — |
| `boolean` | wording "Ja" / "Nein" | start | false before true | `ja` / `nein` | — |
| anything else | compile error: `children` required | — | not sortable | not exported | — |

Alignment is decided at runtime, where types no longer exist: it follows the first present value, and `numeric` overrides it.

**`format` chooses a standard presentation by name** from the language seam — `"prozent"`, `"anzahl"`, `{ nachkomma: n }` for numbers; `"datum"`, `"zeit"`, `"datumZeit"` for dates — typed by the value, so a date format on a number does not compile. It keeps every default that depends on the value: alignment, sort, export, footer. `children` is for genuine presentation — a badge, a meter, a sparkline.

**`footer`** is `"sum"` or `"avg"`, offered for numeric values only, computed over the filtered set, skipping absent values.

**`sortValue` and `exportValue`** say how a value without order or text of its own is sorted and exported (ticket 12). Without them such a value is neither.

**`rowHeader`** marks the column whose value names the row. It renders row header cells, cannot be hidden, is the sticky first column when the table sticks one, and supplies the accessible names of the row's checkbox, expander and actions. A table has at most one.

**`label`** names the column in its header, in the column menu and in the export's header row.

### The table

**The table renders its rows.** Columns register with the table they were obtained from; their order is their JSX order; the table applies hidden columns and the user's order to header, body and footer.

**A hidden column stays mounted.** Hiding is state; removing a column from the JSX removes the column. Only a mounted column appears in the column menu, and a view link naming an unmounted column drops that name, as today.

**`selectable`** adds the selection column. Selecting all selects the filtered set and preserves selections outside it, as `table-model` established. The hook option `auswahl` hands in a selection the application holds (ticket 13).

**A table pages only when a `Pagination` is placed** (ticket 13). Without one it shows the whole filtered set; `pageSize` applies once there is a bar to page with.

**`RowDetail`** renders a detail row under an expanded row, spanning the visible columns; the table places the expander. Several rows may be open.

**`RowActions` holds `Action`s.** An action's `onSelect` receives the row. With `bulk`, it receives a list — the selection within the filtered set when triggered from the toolbar, a list of one when triggered on a row — and the action also appears in the toolbar while a selection exists. Row actions keep the quiet gesture: dim at rest, full on row hover or focus within.

**The model stays.** Filter, then sort, then page; aggregates and selection from the filtered set; the page resets on search, filter, sort and page-size changes and is clamped. `tabellenModell`, `alsCsv`, `alsSuchparameter`/`ausSuchparametern` and the selection logic move into the package with their tests. What changes is where their input comes from: column descriptors are produced by registration instead of a hand-written array.

### Rules carried over

1. Selecting all means the filtered set, not the page.
2. Presentations stay open: `children` is arbitrary JSX; there is no catalogue of cell types.
3. No business logic: the application decides what a filter means; the library renders and removes it.
4. German is the only language shipped; the export follows German conventions.
5. Zero runtime dependencies.
6. The quiet gesture and the token vocabulary.
7. The library remembers nothing: a view lives in a string the application places.
8. No server mode: the table works synchronously on rows it is handed.
9. Virtualisation or paging, never both.

Rules 7 to 9 hold for this spec and are explicitly open for the later specs on live data and large data sets.

### Open, to be settled in the named ticket

- ~~**A column that leaves the JSX and returns** (06)~~ — settled: its width and its place in the user's order survive, keyed by `id`.
- ~~**Where the table's wording lives** (04)~~ — settled: the table's entries **stay in `@umriss/ui`'s `Wortlaut`**, in a section marked as belonging to `@umriss/table`, and the new entries the package needs are added there. One directory keeps overriding wording a single act for an application that uses both packages.
- ~~**How many actions show before the overflow menu** (09)~~ — settled: up to two stand in the row; from three on, all of them are in one menu named after the row.
- ~~**The first frame** (02)~~ — settled by ticket 02: **columns register during render** into a register owned by the hook call. Writes are idempotent and keyed by `useId`; the body is rendered after the children and reads the columns of its own pass, so the first frame has them and an update with inline `children` renders the body once (registration from an effect renders it twice). Only structural changes are announced from a layout effect; the order comes from the render pass and is corrected from DOM markers after commit. **Client only**, stated.
- ~~**Empty and loading states** (08)~~ — settled: props of `Table` (`empty`, `loading`). "Nothing matches the search and filters" is a state the table recognises itself, with the way back.

## Testing Decisions

**Types are tested by the compiler.** A type-test file holds calls that must compile and, marked `@ts-expect-error`, calls that must not: a mistyped field name; a preset spread into rows without its property; `footer` on text; `format` on the wrong type; a computed value without `id`; a renderer calling a number method on text; a missing renderer for an array value; a column for the wrong row type. It runs as part of `typecheck`. An expected error that stops occurring fails the build, which is the point: the typing is the product.

**The pure modules keep their tests unchanged** — model, multi-level sort, visible-column derivation, export, view link, selection, window arithmetic. They move; they are not rewritten.

**The table now owns rendering, so rendering gets component tests.** This reverses the rule of `table-model` that rendering gets no unit tests, which held because rendering belonged to the caller. In jsdom with Testing Library: registration order equals JSX order; hiding and reordering move header, body and footer cells together; a wrapped column registers; absent values render as absent and never reach `children`; defaults by value type; `rowHeader` yields row header cells and accessible names; a bulk action receives a list.

**Interaction and screenshot tests follow the demo.** The Playwright suites for the table (`funktionen-tabelle`, `funktionen-virtuell`, the table and alarm list baselines) run against the `@umriss/ui` demo and cannot move before `@umriss/table` has a demo of its own, which is a separate spec. The old table therefore stays in `@umriss/ui` until the new demo carries equivalent suites; ticket 14 is blocked by that spec. Deleting working behaviour tests to make room for a rewrite is not permitted.

**`AlarmList` is the acceptance test of the API.** Its unit tests (`meldeModell`, `alarmList`) move with it and must pass against the re-expression.

**Fixture data stays in the test**, as `table-model` established.

## Out of Scope

- Grouping and subtotal rows.
- Live-updating rows, change highlighting, rows that hold still under the pointer (research, gap 1).
- Grid keyboard navigation between cells.
- Inline cell editing (handoff B.10, which now targets this package).
- Freshness columns; only `VerdictColumn` ships here.
- Column pinning beyond the sticky first column.
- Server-driven data; persisted views.
- The demo application of `@umriss/table`, and what a page is in it — separate spec.
- A column-array API next to the composition API.

## Further Notes

**The compiler probe.** Before anything was chosen, the candidate shapes were checked in memory with TypeScript 5.9 and `@types/react` 19, each with deliberate errors a working shape must report:

- A generic `Table` with a generic `Column` child: the accessor's parameter is `unknown`. With an explicit type argument on the column, a column for the wrong row type inside the table goes unreported.
- A factory per row type, a render-prop child, and a hook returning bound building blocks: all three report a mistyped field and a wrong row type. The hook was chosen because it binds the type where the state is created, with nothing written down.
- Presets spread into a hook-bound column: accepted for rows with the property, rejected without it, and overridable (`<Column {...menge} label="Stück" />`).
- Field-name values with typed renderers, footers restricted to numbers, typed action callbacks: all correct.
- For computed values, a `footer` whose type depends on the function's return type fixes that type to `unknown` before the function is read; `NoInfer` does not prevent it. Splitting "computed with footer" into its own overload, with the numeric constraint on the type parameter, works; callers see no difference. A computed column without `id` is reported correctly but also emits an "implicitly any" message, whose wording is worth improving.
- *Ticket 01 refined the split.* An overload whose distinguishing property is *optional* contextually types `children` while it is tried, and the parameter type sticks for the overloads after it. The overloads therefore differ by **required** properties: computed number with `footer`, computed number with `format`, computed date with `format`, computed value with `children`, computed displayable value without `children` — and the field overload last, so that a mistyped field name produces TypeScript's `Did you mean` message.

**The research** found three gaps no mainstream table fills: limits as a data model rather than style rules (only SAP's OData vocabulary and Grafana have them), stale or uncertain values (only HMI software such as Ignition), and live updates that do not move rows under the user (grids re-sort on every update or not at all). The glossary already names the first two; the third is the strongest candidate for the live-data spec.

**Earlier specs.** `table-model` and `table-surface` are marked superseded but kept: their reasoning about the pipeline, the export and the view link still holds and is why those modules move unchanged. What this spec reverses is one decision of `table-model` — columns as data for the pipeline while rendering stays with the caller (ADR-0017).

**Terms.** The glossary gains a section on tables: column, value, presentation, absent value, row key, row header, filtered set, bulk action, view, table toolbar.
