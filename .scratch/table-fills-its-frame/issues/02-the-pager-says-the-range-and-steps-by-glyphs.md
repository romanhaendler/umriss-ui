# 02: The pager says the range and steps by glyphs, to the first and the last page

Status:     ready-for-agent
Blocked by: None (can start immediately)

Spec: `../spec.md`, Solution (last paragraph), user stories 33-34 and 58-68,
decisions "The range" and "The steps".

**What to build:** every `Pagination` says the range - "13–24 of 120" -
where it said the entry count, and its steps are four glyph buttons around
the page status: first page, previous page, "page 2 of 10", next page, last
page. Users have asked repeatedly for the jump to the first and the last
page. Nothing here depends on filling; it holds for every pager.

- [ ] The pager shows the range of the rows on the page and the total, formatted by the provider's number format, in English and German (`@umriss-ui/core/wording/de`); the entry-count wording goes if nothing else uses it.
- [ ] The steps stand in this order: first, previous, page status, next, last; they wrap as one group in a narrow pane.
- [ ] Each step is an `IconButton` at the pager's size with its name ("First page", "Previous page", "Next page", "Last page", and the German names) as accessible name and tooltip; under touch it has the touch hit area.
- [ ] Previous and next draw `AngleGlyph`, turned; first and last draw a new glyph of core's set - the chevron against a bar, one drawing mirrored - following the glyph rules in `CONTEXT.md`, with its entry in core's glyph documentation and demo.
- [ ] First and previous are disabled on page 1, next and last on the last page.
- [ ] First and last land on page 1 and on `pageCount`; in server mode "last page" sends one request for that page.
- [ ] The pager stays visible when everything fits on one page.
- [ ] Unit tests in the table's Pagination tests find the four buttons by their accessible names and cover order, disabled states and landing pages; the server-mode request is asserted in the server mode tests.
- [ ] Every test in the workspace that found "Back"/"Next" by its text finds the step by its accessible name.
- [ ] `pnpm check core`, `pnpm check table`, `pnpm check alarms` and `pnpm check:site` pass; API.md of core regenerated; the changed pager is looked at in the table demo as a user (light and dark, narrow pane, touch) and screenshots updated.

## Comments
