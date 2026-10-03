# 01: One table model, two writers

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** A prefactor that keeps today's output. A pure function turns one type entry of the generated props data into a table model: heading with its `#type-<Name>` anchor, rows of segmented cells, badges, closing sentences. One writer turns the model into HTML, one into Markdown. The prerendered page, the page the app shows and the llms text all take their API section from these writers. The app mounts the generated HTML instead of drawing its own table, the React props table component is removed, and in-site links inside the generated HTML are handled by the shell like every other link. Required props read "required" as a small label in both outputs.

- [ ] The API section the app shows and the prerendered page's API section are the same HTML for every page of all five demos.
- [ ] The React props table component no longer exists; the events tables of table and schedule still appear.
- [ ] A parity test over a fixture entry asserts that HTML and Markdown carry the same rows, order, type text, defaults and required labels.
- [ ] Each props table heading carries the anchor `#type-<Name>`.
- [ ] The llms text and the prerendered pages differ from today only in the required label.
- [ ] Shell and page suites stay green in all five demos.
