# Spec: Column filters that do not move the table

Status: done

Origin: `/grill-with-docs` session, 11 Sep 2026. It began with two observations — "the new table has no column filters any more" and "a search inserts a row between toolbar and data, which shifts the layout" — and ended in a filter interface, a pre-filter, conditions in the toolbar, and the view leaving the address bar.

Builds on `.scratch/umriss-table/spec.md` (delivered). Reverses two of its decisions: the filter strip as a row of its own (ticket 08), and the view as a string for the address bar (story 19, ticket 11).

Glossary: **Pre-filter**, **Column filter**, **Condition** and **Search** are new; **Filtered set**, **View**, **Table toolbar** and **Query** are sharpened. No ADR: one for conditions in the view link was drafted and withdrawn when all table state left the URL.

Tickets: `issues/01`–`06`, in that order; each names what blocks it.

---

## Problem Statement

The table does have column filters, but only one kind. `filter="list"` puts a funnel into the header that offers the values occurring in the column. What `@umriss/ui`'s old table had and this one lost is the open filter: `TableFilter` took any panel content, so a range, a date span or a filter of the application's own was possible. Now a quantity column cannot be restricted to 100–500 and a date column not to a week. The funnel itself is 13 px, muted at rest, and easy to overlook — which is how "there are no column filters" came to be said about a table that has them.

What restricts the table is shown in a strip of its own between the toolbar and the header. The strip exists only while something restricts, so the first keystroke in the search inserts a row and pushes the table down, and clearing the search pulls it back up. The strip also repeats the search as a condition next to the search field that already shows it.

The application's own filter (`useTabelle(…, { filter })`) is a second, invisible kind of restriction, and nothing around it is consistent. Probing it found two outright defects.

### Defects found

| # | Defect | Evidence |
|---|---|---|
| D1 | **Layout shift.** `FilterLeiste` renders as its own row between the table's children (the toolbar) and its frame, and appears with the first condition. | `packages/table/src/bausteine.tsx:264`, `filter.tsx` (`FilterLeiste`) |
| D2 | **The search is shown twice** — in its field and as a tag "Suche: …" in the strip. | `filter.tsx` (`sucheBedingung`) |
| D3 | **The application's filter is invisible and inconsistent.** It is not listed in the strip but shrinks "43 von 1.204". If it alone empties the table, the body says "Keine Einträge" (or `empty`). Together with a search, "Alles zurücksetzen" clears the search and leaves the filter, so the table may stay empty after the way back. | `bausteine.tsx:324`, `ausgabe.ts:25` |
| D4 | **An inline application filter crashes the table.** `filter: (z) => …` written in the call gives a new identity each render; the combined predicate is memoised on it, and the companion resets the page *during render* whenever the predicate changes — React throws "Too many re-renders" on the first render. The documentation only says "keep stable (useCallback)". Confirmed by a probe test. | `useTabelle.tsx:120`, `kern/begleiter.ts:147` |
| D5 | **The list filter offers values the application's filter excludes.** `listenOptionen` reads every row, not the rows the filter admits — with a filter by permission or plant, the options disclose values the user is not meant to see. Confirmed by a probe test (options "Werk A", "Werk B" under a filter admitting only "Werk A"). | `filter.tsx` (`listenOptionen(eintrag, kern.zeilen, …)`) |
| D6 | **A condition outlives its column.** When a filtered column leaves the JSX, its selected values stay in state: the predicate silently skips them, the empty state still counts them as restricting, and when the column returns the filter applies again without a word. Found in the code, not probed. | `useTabelle.tsx` (`vereineFilter`), `bausteine.tsx:324` |

## Solution

Filters are declared on the column, typed by its value like `format` and `footer`. The application's own restriction becomes an explicit **pre-filter** that is never shown and never reset. Everything a user can undo is a **condition** of a column filter, and conditions appear in the **table toolbar** — the row that already exists — so nothing inserts a row above the data.

```tsx
const bestandsLage = spaltenFilter<number, "knapp" | "leer">({
  passt: (wert, bedingung) => (bedingung === "leer" ? wert === 0 : wert < 20),
  Eingabe: ({ bedingung, setBedingung }) => (
    <RadioGroup value={bedingung ?? ""} onChange={(e) => setBedingung(e.target.value as "knapp" | "leer")} … />
  ),
  beschreibe: (bedingung) => (bedingung === "leer" ? "leer" : "knapp"),
});

function Auftragsliste({ auftraege, werk }: { auftraege: Auftrag[]; werk: string }) {
  const t = useTabelle(auftraege, {
    rowKey: (a) => a.id,
    vorfilter: (a) => a.werk === werk,                       // inline is fine
    initialeAnsicht: { bedingungen: { status: ["Offen"] } },
  });
  const { Table, Column } = t;

  return (
    <Table>
      <Toolbar>
        <Search placeholder="Auftrag suchen" />
        <ColumnMenu />
      </Toolbar>
      <Column value="nummer" label="Auftrag" rowHeader />
      <Column value="status" label="Status" filter="list" />
      <Column value="menge" label="Menge" filter="range" />
      <Column value="termin" label="Liefertermin" filter="range" />
      <Column value="bestand" label="Bestand" filter={bestandsLage} />
      <Pagination />
    </Table>
  );
}

// elsewhere, e.g. a tile "3 gesperrt":
t.setFilter("status", ["Gesperrt"]);
```

The toolbar with a search and two conditions:

```
[Auftrag suchen…] [Spalten] [Status: Offen, Gesperrt ×] [Menge: 100–500 ×]      43 von 1.204  Zurücksetzen
```

The address bar no longer holds any table state: the functions that wrote and read the view as search parameters leave the package. What stays is the view as an object — handed in at the start with `initialeAnsicht`, read back from `t.ansicht` — for an application that wants to remember it somewhere of its own choosing.

## User Stories

1. As a developer, I want to restrict a numeric column to a range by writing `filter="range"`, so that "Menge 100–500" needs no state code of mine.
2. As a developer, I want `filter="range"` on a date column to offer a date span, so that one word covers numbers and dates.
3. As a developer, I want the compiler to reject `filter="range"` on a text column, so that a meaningless filter does not reach review.
4. As a developer, I want to write a filter of my own — its input, its test and its description — and have the table show, count and reset it like any other, so that a special case does not cost me the strip, the count and the way back.
5. As a developer, I want my own filter typed against the column's value, so that a filter for numbers is rejected on a text column.
6. As a developer, I want to set a condition from outside the table with a typed call, so that a tile "3 gesperrt" can filter the table to those three.
7. As a developer, I want to start a table with conditions already set, without a flicker of the unfiltered table, so that a pre-set list opens as it is meant to look.
8. As a developer, I want to restrict which rows a table has at all — by permission or plant — with a function I may write inline, so that the table does not crash because I forgot `useCallback`.
9. As a developer, I want that restriction invisible to the user and out of every count and reset, so that the user cannot undo it and the numbers they see are about their rows.
10. As a developer, I want no part of my table's state written into the address, so that the library does not decide what my URLs contain.
11. As an end user, I want the table to stay where it is while I type a search or set a filter, so that what I was looking at does not jump away.
12. As an end user, I want every condition that restricts the table shown in its toolbar, removable on its own, so that I can see why rows are missing and bring them back.
13. As an end user, I want to click a condition to change it, so that I do not have to find the column's funnel, which may be scrolled out of sight or hidden.
14. As an end user, I want to see "43 von 1.204", counting only rows I am allowed to see, so that the ratio means something.
15. As an end user, I want a list filter to offer only values that occur in rows I am allowed to see, so that the filter does not disclose other plants' data.
16. As an end user, I want "Zurücksetzen" to always lead back to rows, so that the way back is never a dead end.
17. As an end user with a screen reader, I want to hear how many rows remain after I type or filter, so that I know whether the search found anything.
18. As a library maintainer, I want every defect found in this session covered by a regression test, so that none of them returns.
19. As a library maintainer, I want a browser test asserting that the header does not move while searching and filtering, so that the layout shift cannot come back unnoticed.
20. As a library maintainer, I want the built-in list and range filters implemented through the same interface as a caller's own filter, so that the interface is proven by use from the first day.

## Implementation Decisions

### The pre-filter

- **The hook option `filter` is renamed `vorfilter`.** `filter` stays as a deprecated alias for one minor version, with a `Geändert` entry in the changelog (ADR-0015, Consequences). Two meanings of `filter` — a column prop and a hook option — are exactly what the glossary exists to prevent.
- **It is invisible.** Never shown as a condition, never touched by "Zurücksetzen", never part of the view.
- **It defines the rows the table has.** The count reads "43 von 1.204" where 1.204 is the number of rows the pre-filter admits. A table the pre-filter leaves empty shows `empty`, or "Keine Einträge" — not "Nichts passt zu Suche und Filtern". List options, and the `werte` handed to a filter's input, come from the admitted rows (D5).
- **A change of the pre-filter does not reset the page.** The model clamps the page anyway; the identity of the function is irrelevant and an inline function is allowed (D4). An application that wants page one after switching plant calls `t.setSeite(1)`. Rationale: a pre-filter defines the table's rows, it is not an operation the table reacts to — and resetting whenever the admitted rows change would reset on every data update, which the live-data spec cannot have.
- Pipeline: pre-filter → search and conditions → sort → page. Selection "all", export and footers keep operating on the filtered set.

### Column filters

- **`filter` on a column takes `"list"`, `"range"` or a filter made with `spaltenFilter`.** The literal is typed by the value like `FormatFuer`: `"list"` for any displayable value, `"range"` for `number` and `Date` only, a custom filter only where its value type matches. `VerdictColumn` keeps `filter?: never`. There is no `"text"` kind; the search and `searchable` cover it.
- **`spaltenFilter<W, B>(definition)`** is a free import, bound to a value type rather than a row type, in the manner of `spalte<P>()`. Its fields are German (ADR-0015, Scope):
  - `passt(wert: Da<W>, bedingung: B): boolean` — never called for an absent value; an absent value never matches a custom condition.
  - `Eingabe` — a component receiving `{ bedingung: B | null, setBedingung(b: B | null), werte: readonly Da<W>[], spalte: { id, label } }`; `setBedingung(null)` lifts the condition.
  - `beschreibe(bedingung: B): string` — the text of its chip.
- **List and range are built with `spaltenFilter` internally.** The list's condition is the chosen values of the column's value type (absent value as `null`), not the `"wert:…"` keys it is today; the keys remain an internal detail of comparison.
- **The list filter** keeps its behaviour: options are the values occurring in the admitted rows, sorted as today, with "ohne Wert" as an option of its own when an absent value occurs; toggling applies immediately.
- **The range filter:**
  - Bounds are inclusive; either may be open (`{ von: 100 }`, `{ bis: 500 }`).
  - An absent value never matches an active range.
  - Numbers: two `NumberInput`s, applied while typing. If `von > bis`, the fields are marked invalid and the condition keeps its last valid state.
  - Dates: `DateRangePicker`, which sets the condition on its second click; its two-click logic is not changed (`packages/ui/HANDOFF.md` A.5 §5). Bounds are calendar days in local time — `bis` 30.09. includes the whole day; a `Date` with a time of day is compared against those day bounds.
  - The panel footer is the list's: "Zurücksetzen" and "Fertig".

### Conditions and state

- **`t.filter` and `t.setFilter(id, bedingung | null)`** replace `filterWerte` and `setFilterWerte` on `TabellenStand` (`typen.ts:291–294`).
  - Typing is by the row's field, not by the column, because the hook cannot see the columns declared in JSX (ADR-0017): for `K extends Feld<Z>`, a list condition is `readonly (Da<Z[K]> | null)[]`, a range condition `{ von?: Da<Z[K]>; bis?: Da<Z[K]> }` and only where `Z[K]` is a number or a `Date`. A computed column's id is a `string` with an `unknown` condition.
  - A condition whose kind does not match the mounted column (a range on a list column, an id with no filter) is ignored, with a development warning via `warneEinmal`.
  - `null` lifts a condition.
- **The view carries conditions** as `bedingungen: Record<string, unknown>` in `TabellenAnsicht`: `initialeAnsicht` sets them for the first render (no flicker), `t.ansicht` reads them back. A condition naming an unknown column drops, as other names do. There is no `defaultFilter`: "Zurücksetzen" means no conditions.
- **Changing a condition resets the page to one**, as changing the search does today.
- **A condition leaves with its column** (D6). When a column unmounts, its condition is removed from state; when it returns it has none. This differs deliberately from width and order, which survive a return (umriss-table 06): a returning width hides no rows, a returning condition does. A *hidden* column is still mounted and keeps its condition; its chip is then the way to the panel.
- **"Zurücksetzen"** clears the search and every condition and nothing else (D3). The table's own empty state for "nothing matches" appears only if search or a condition restricts; otherwise it is `empty` / "Keine Einträge".

### The table toolbar

- **The filter strip is removed** (D1). `FilterLeiste` and its row go; `sucheBedingung` leaves the wording (D2).
- **Conditions are chips in the toolbar**, after its children on the left, in the order they were set — a new condition appends and does not push existing chips. Chip text:
  - list: "Linie: Linie 1, Linie 2"; from three values "Status: Offen, Gesperrt +1";
  - range: "Menge: 100–500", "Menge: ab 100", "Menge: bis 500"; dates formatted with `formate` as days, e.g. "Termin: 01.09.–30.09.2026";
  - custom: `label: beschreibe(bedingung)`.
- **A chip is two controls.** `Tag` is a `span` whose only control is its remove button, so the chip's content is a button that opens the same panel as the funnel, anchored at the chip, and the tag's `onRemove` lifts the condition. Accessible names come from the wording ("Linie: Linie 1, Linie 2 bearbeiten" / "… entfernen"); the chips sit in a `TagGruppe` named by `aktiveFilter`.
- **On the right**, before the selection's count and bulk actions: "43 von 1.204" and "Zurücksetzen", present while the search or a condition restricts. The count is in an element with `role="status"`, so assistive technology announces it (politely, coalesced).
- **The search has no chip.** It shows its own text and has its own clear button; it still counts, and "Zurücksetzen" clears it.
- **A table has a toolbar even where none is placed**, if a column has a filter or a `Search` is connected to it. The implicit toolbar holds only chips, count and reset. Because columns register during render, it is present in the first frame. A `Toolbar` placed *outside* the table with `of` and *after* it in the tree registers after the first frame, as `Pagination` does today; this is documented, not solved. With a `Toolbar` placed, there is no implicit one.
- **Wrapping.** At narrow widths the toolbar may wrap when a condition is added; that happens on a deliberate action, never on a keystroke in the search, and is accepted.

### The view leaves the address

- **Removed from `@umriss/table`:** `alsSuchparameter`, `ausSuchparametern`, `AusSuchparameternOptionen` (`index.ts:34–35`), `t.suchparameter` (`typen.ts:300`), and the string form of `initialeAnsicht` (`typen.ts:242`). `TabellenAnsicht` stays, as the type of `initialeAnsicht` and `t.ansicht`. Changelog: `Entfernt` and `Geändert`.
- **Kept:** `initialeAnsicht` as an object, `t.ansicht` for reading. Unknown column names in it drop, as before (`nurBekannte`).
- `kern/ansicht.ts` loses the encoding and its comment's reasoning; if only the type remains, it moves to `typen.ts` or stays as a type-only module, whichever keeps imports simplest.
- Rule 7 of `umriss-table` ("the library remembers nothing") still holds; its wording "a view lives in a string the application places" no longer does — the view is an object the application may store.

### Wording

The table's entries stay in `@umriss/ui`'s `Wortlaut` (`packages/ui/src/lib/sprache/wortlaut.ts`), in the section belonging to `@umriss/table` (umriss-table, open item 04). Removed: `sucheBedingung`. New, at least: the range fields' labels ("Von", "Bis"), open bounds ("ab", "bis"), the "+n" of a long list chip, the invalid-range message, the chip's edit and remove names. `aktiveFilter`, `trefferVonGesamt`, `allesZuruecksetzen` (shortened to "Zurücksetzen" in the toolbar — decide whether that is a new entry or a changed one), `nichtsPasstZuFiltern`, `filterZuruecksetzen` and `filterFertig` remain. This is a minor release of `@umriss/ui` as well; `wortlautwache.test.ts` and `filterleisteWortlaut.test.tsx` follow.

## Testing Decisions

- **Every defect becomes a regression test** before its fix: D3 (count, empty state and reset with a pre-filter), D4 (an inline pre-filter renders and pages), D5 (list options and `werte` exclude what the pre-filter excludes), D6 (a column that unmounts takes its condition along; returning, it has none). D1 and D2 are covered by the component tests of the toolbar and the browser guard below.
- **Types are tested by the compiler** in `tests-unit/typen.test-d.tsx`: `filter="range"` on text is an error; a `spaltenFilter<number, …>` on a text column is an error; `t.setFilter` with the wrong value type for a field is an error; a range condition on a text field is an error; `vorfilter` inline compiles; the deprecated `filter` option still compiles.
- **Component tests** (jsdom): chips appear in the toolbar in the order set, one is removed without the others, a chip opens its panel; the search has no chip but counts; "Zurücksetzen" clears search and conditions only; the implicit toolbar exists when no `Toolbar` is placed and not otherwise; the count has `role="status"`; range bounds inclusive, open, absent values excluded, `von > bis` keeps the last valid state, date bounds include the whole end day; `t.setFilter` sets and lifts, a mismatched kind warns and is ignored; `initialeAnsicht.bedingungen` applies in the first render; `t.ansicht.bedingungen` reads back.
- **The browser guard against the layout shift** (Playwright, `tests-visual/funktionen-tabelle.spec.ts`): record the bounding box of the table header, type into the search, set a list filter, clear — the header's top does not move at any step. It runs against `Table › Vorführung`.
- **Existing suites that change:** the "Filterleiste" tests in `funktionen-tabelle.spec.ts` (lines 23–66) are rewritten against the toolbar; "Die gezogene Breite steht im Ansichtslink" (line 253) moves to the example replacing `ansichtslink` and reads `t.ansicht`; `ansicht.test.ts` loses the encoding cases; `ansichtLink.test.tsx` and `tabelleAnsicht.test.ts` are reduced to the object view or removed where they only tested the string. Behaviour tests are rewritten, not deleted, unless the behaviour itself is removed by this spec. Screenshot baselines of changed examples are looked at one by one and renewed.
- `TESTS.md` rows for the table (lines 27, 28, 38, 114) are updated.

## Demo

- `Table › ansichtslink` is removed and replaced by **`Table › startzustand`**: `initialeAnsicht` as an object, including conditions, and `t.ansicht` shown as what an application would store (keeps `[data-rolle='ansicht']` for the width test).
- `Table › leer-und-laden` uses `initialeAnsicht: { suche: "Zinnwerk" }`.
- New **`Table › vorfilter`**: an inline pre-filter by plant, the count after it, list options only from admitted rows, and the empty state when it admits nothing.
- `Column › listenfilter`: comment and running example updated — conditions in the implicit toolbar.
- New **`Column › bereichsfilter`** (a number and a date column) and **`Column › eigener-filter`** (`spaltenFilter`).
- `Search › suche` and `Search › ausserhalb`: comments updated (no chip; the count sits in the toolbar).
- **Vorführung:** loses the link display (`99-vorfuehrung.tsx:148`); gains `filter="range"` on "Menge" and a tile that calls `t.setFilter`.
- "Warum so" on `table.tsx` (the view paragraph, lines 27–29) and `column.tsx` (filters) rewritten.

## Out of Scope

- Table-wide quick filters over the whole row ("überfällig" = date before today and not done). A later spec; nothing here may block it.
- A "+ Filter" entry in the toolbar for discoverability.
- A default condition that "Zurücksetzen" returns to.
- Any table state in the URL, conditions included.
- A text filter kind; filters on `VerdictColumn`.
- Server-side filtering (umriss-table, rule 8).

## Further Notes

- **Why it looked as if there were no filters.** The funnel is 13 px and muted at rest (`Table.module.css` `.filterButton`), per the quiet gesture. Chips in the toolbar make active conditions visible; making the inactive funnel more prominent is not part of this spec.
- **The probes** for D4 and D5 were run as a temporary test file in `packages/table/tests-unit` and removed afterwards. D4: `useTabelle(rows, { rowKey, filter: (z) => z.id !== "z1" })` → "Too many re-renders" on first render. D5: `filter: nurA` with `filter="list"` on `werk` → options "Werk A", "Werk B".
- **Ordering of tickets.** 01 (view out of the address) and 02 (pre-filter) touch the same files — `useTabelle.tsx`, `kern/begleiter.ts`, `typen.ts` — and run one after the other. 03 (the filter interface) is the base of 04 (toolbar) and 05 (range), which may run in parallel. 06 closes with the demonstration and the documents.
