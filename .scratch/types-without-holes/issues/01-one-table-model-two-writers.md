# 01: One table model, two writers

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** A prefactor that keeps today's output. A pure function turns one type entry of the generated props data into a table model: heading with its `#type-<Name>` anchor, rows of segmented cells, badges, closing sentences. One writer turns the model into HTML, one into Markdown. The prerendered page, the page the app shows and the llms text all take their API section from these writers. The app mounts the generated HTML instead of drawing its own table, the React props table component is removed, and in-site links inside the generated HTML are handled by the shell like every other link. Required props read "required" as a small label in both outputs.

- [ ] The API section the app shows and the prerendered page's API section are the same HTML for every page of all five demos.
- [ ] The React props table component no longer exists; the events tables of table and schedule still appear.
- [ ] A parity test over a fixture entry asserts that HTML and Markdown carry the same rows, order, type text, defaults and required labels.
- [ ] Each props table heading carries the anchor `#type-<Name>`.
- [ ] The llms text and the prerendered pages differ from today only in the required label.
- [ ] Shell and page suites stay green in all five demos.

## Comments

Delivered: `packages/demo/src/tooling/apiTable.ts`. `tableModel(entry, eventsApart)` is a pure function that returns the heading with its `#type-<Name>` anchor, groups of rows (marked spans, badges, origin) and closing sentences. `tableHtml`/`apiHtml` write it as HTML and `tableMarkdown` writes it as Markdown. `Page.tsx` mounts `apiHtml(...)` in a `div.apiTables`. `llms.ts` writes the Markdown into the llms text, and each prerendered page's API section carries the same `div.apiTables` HTML. `PropsTable.tsx` is gone. `Prose.tsx` reads its marks with the same `spansOf`. A description link `#/page` becomes a relative `../page/`, which works on the dev server, on the site and on the prerendered page, and the shell takes the click as before. The shell now also scrolls to any element id named in the address, so `/button/#type-ButtonProps` lands on the table. Required props show a small `required` label in the app and `*required*` in Markdown.

Tests: `tests-unit/apiTable.test.ts` checks parity over a fixture entry (rows, order, type text, defaults, required labels, closing sentences, with and without events apart), the anchor, the escaping and the empty table. `llms.test.ts` checks that the prerendered page carries the app's HTML. `llmsGuard.test.ts` checks the same for every page of all five demos, from real props. lint, typecheck and test:unit are green. In Playwright, the shell, page, screenshot and accessibility suites of all ten projects ran: 1596 passed. Of the 3 failures, the charts accessibility timeout passed on rerun. `language--own-components` (ui-light) differs in the word "Today", which is not touched here, so that baseline was left as it is.

Baselines moved: `drawer-beside-a-service-list` (ui-light, ui-dark). That picture shows the Drawer page's API table behind the backdrop, and the required label is the change this ticket asks for.

Deviations: in the llms text of the table and the schedule, the `on…` props now stand under `###### Events` as they do on the page. Without that, HTML and Markdown could not hold the same order. One `EVENTS_APART` in their outlines feeds both the app and the generator. "Also every prop of A, B" now reads "A and B", as the app always wrote it. Core, charts and calculation llms texts differ from before only in the required label. The prerendered API section has the app's markup (classes, Events split) instead of marked's GFM table. The Markdown headings carry no anchor; only the HTML has `#type-<Name>`.
