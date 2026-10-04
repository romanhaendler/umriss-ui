# 06: Table: manual mode becomes server mode

**What to build:** The table over rows a server holds says what it is: `server` instead of `manual`, and it asks the server through `onRequest(request)` with the **Request** - search, conditions, sort, page, page size - instead of `onViewChange`. A width, an order, a pin or a fold asks the server nothing. The demo page is called 'Server mode'.

**Blocked by:** 05 (Table: a view applies by content)

**Status:** done

- [x] Model test: no request on a width drag; one per request change
- [x] Every type, warning and comment says server mode
- [x] The five examples pass on the new names; the page is renamed and its old address resolves

## Comments

**2026-10-04, delivered.** `manual` is `server` throughout `packages/table`: the option, `TableSnapshot.server`, the registry (`setServer`), the model input, the DEV warnings (`server-prefilter`, `server-virtual`, `server-grouping`, `server-groupable`, `server-groupable-column`, `server-filter-options`), comments, README and outline. `ManualView` is `TableRequest`, `manualViewKey` is `requestKey`. The request is now the five parts and nothing else (`Required<Pick<TableView, ...>>`) - it used to carry the whole view, widths and pins included; `onViewChange` hears those. Test: `tests-unit/serverMode.test.tsx` "reports every change of what decides the rows once, and nothing else" now drags a width, reorders, pins, folds and hides before the next page and expects that request with exactly five parts (red before the narrowing). Test files renamed `manualMode.test.tsx` -> `serverMode.test.tsx`, `manualModel.test.ts` -> `serverModel.test.ts`; `requestKey`'s "whatever else the view carries" case went, the type no longer admits it.

The page is 'Server mode' at `/server-mode/`, examples under `demo/examples/Server-mode/`; `MOVED` in `demo/outline.ts` forwards `manual-mode`. Outside the package and left as they are: `docs/testing.md` (names the old test files and says manual mode), the export and select-all wording comments in `packages/core/src/lib/language/wording.ts`, ADR-0042 and the journal (history). The changelog is 08's.
