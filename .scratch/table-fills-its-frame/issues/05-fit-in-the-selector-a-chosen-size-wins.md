# 05: "Fit" in the page-size selector, a chosen size wins

Status:     ready-for-agent
Blocked by: 02, 04

Spec: `../spec.md`, user stories 26-32, decisions "Option and view", "The
selector".

**What to build:** in a filled frame the page-size selector starts with
"Fit", preselected while no size is chosen, then `pageSizes`. A number the
user picks is a choice: it wins in the frame too - the page then scrolls or
leaves blank - and is kept in the view. "Fit" is the absence of a choice.

- [ ] In a filled frame the selector offers "Fit" ("Passend" in German) first, then the page sizes; in flow and with `maxHeight` there is no "Fit".
- [ ] Picking a number gives exactly that many rows per page in the frame and writes it to the view (`onViewChange`); a page size in `initialView` is a choice as well.
- [ ] Picking "Fit" removes the choice from the view; "Fit" is never written to the view.
- [ ] A frame resize under "Fit" fires no `onViewChange`.
- [ ] `setPageSize` accepts `"fit"` beside a number; documented, API.md regenerated.
- [ ] Core wording gets "Fit" in English and German.
- [ ] Unit tests: "Fit" only when framed; a chosen size wins and lands in the view; "Fit" never does; a resize fires no `onViewChange`; `setPageSize("fit")`.
- [ ] `pnpm check core`, `pnpm check table`, `pnpm check:site` pass; the selector looked at in the demo as a user.

## Comments
