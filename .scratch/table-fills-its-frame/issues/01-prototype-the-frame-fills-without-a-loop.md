# 01: Prototype: the frame fills without a feedback loop

Status:     ready-for-agent
Type:       prototype
Blocked by: None (can start immediately)

Spec: `../spec.md`, decisions "Prototype first", "Filling", "What the table
contributes", "Settling", "One new read on the table".

**What to build:** a throwaway prototype that answers whether a table can
fill a parent of definite height without a layout feedback loop - the reason
Ant Design withdrew its `scroll.y: 'fill'` in July 2026 and MUI X flickered
(research `docs/research/table-height-and-paging-2026-10/`, "Risiken" 1).
The prototype is not merged; its findings are.

Setup: a stretched two-column grid row - a table beside a chart whose height
a control grows and shrinks - and the same table inside a stretched Card
body, and alone in a flowing page.

- [ ] In the grid row the table's frame is the row's height and grows and shrinks with the chart; the row shrinks back when the chart does (the table never holds it at the tallest it was).
- [ ] Inside a stretched Card body the frame fills the body.
- [ ] In a flowing page the table is as tall as today.
- [ ] No `ResizeObserver` loop warning and no oscillation over a minute of resizing, in Chromium and WebKit (Firefox does not launch in job sandboxes; leave the page runnable so the user can check it locally).
- [ ] The way the table contributes its held page height (computed as lines × pitch, never its current rows) is chosen and written down - e.g. `contain-intrinsic-block-size` on the scroll area or a computed min-height - with what it does to column widths.
- [ ] The way the table knows it is framed (`framed`), independent of a Pagination, is chosen and written down.
- [ ] The settle delay and dead zone for a resize are chosen (in the region of 50-200 ms, at least one pitch) and written down.
- [ ] Findings are appended under `## Comments` below; if filling cannot be made to hold, say so plainly and stop: tickets 03-09 wait for the user.

## Comments

### Findings of the prototype (2026-10-30)

**Verdict: filling holds.** Every box of the ticket is met in Chromium and WebKit; tickets 03-09 can go ahead on the mechanism below. Firefox was not run (the user checks it locally).

**The prototype** is the local branch `prototype/table-fills-its-frame` (commit `255a0970`, never pushed; delete it when the work is merged). To look at it, in a checkout of that branch:

    pnpm install && pnpm --filter @umriss-ui/table proto

then open http://localhost:4274/ . Buttons switch 0/5/100 rows and the chart's height (200-700 px); "storm 60 s" changes the chart's height every 90 ms for a minute. In Firefox's console `window.__proto.errors` must stay `[]` and `window.__fits` counts the re-cuts. Cases on the page: `grid` (table Card beside a real `@umriss-ui/charts` Chart Card in a stretched grid row), `card` (Card of fixed height 360), `pane` (block of 320 px, table its direct child), `flex` (flex column of 320 px, same), `narrow` (250 px wide pane, the pager wraps), `flow`, `max` (`maxHeight` 200px). Headless checks: `node packages/table/proto/check-fill.mjs chromium|webkit [stormMs]`, `node packages/table/proto/check-settle.mjs chromium|webkit` (own Playwright library script, port 4274).

**What was measured** (Chromium and WebKit gave the same numbers; the row pitch is 36 px at the demo's tokens):

- Grid row: chart 300 px: row 482 px = the table's held page (head + 10 lines + toolbar + pager), the frame fills it; chart 500: 520, 11 rows; chart 700: 720, 16 rows; back to 300: 482, 10 rows; 200: 482. The row shrinks back every time.
- Stretched Card body (the `grid` case): frame == body in all of the above.
- Pane of 320 px, block or flex column, 0 / 5 / 100 rows: frame 320 each time, pager's bottom edge on the frame's, 5 rows of 100 with no cut row and no scrollbar; with 0 and 5 rows the same frame. `narrow` (pager 105 px tall in three lines): 3 rows, stable.
- Flow: 482 px as before, no inline height, `framed` false. `maxHeight`: as before (frame auto, scroll area `max-height`).
- 62 s of resizing (chart height random every 90 ms), 245 samples in Chromium and 249 in WebKit every 250 ms: frame == parent in every sample, no `pageerror`, no "ResizeObserver loop" message, a constant height once the storm stops.
- Control: with the scroll area left `auto` in a filled frame (`?naive`), chart 300 -> 700 -> 300 leaves the frame at 698 px with 16 rows: the ratchet. The computed height below is what prevents it.

**The contribution of the held page height.** An inline `height` on the scroll area (frame.tsx): `(headRows + askedLines + (footer ? 1 : 0)) * pitch` px, set only while `framed && !maxHeight && !virtual`; the scroll area is `flex: 1 1 auto; min-height: 0`, so in a definite parent it grows and shrinks around that basis, and in an indefinite one the frame is exactly toolbar + this + pager. Not `contain: size` / `contain-intrinsic-block-size`: size containment applies to both axes and would also drop the intrinsic inline size (the table's width in an auto track); an explicit `height` is block-axis only and no input to table layout, so column widths and `useFlexWidths` are untouched (looked at in the screenshots, not measured). Details that matter:

- `askedLines` comes from the **option** `pageSize`, never from the fitted size: `min(max(shownNow, heldBefore, pageCount > 1 ? option : 0), option)` with `shownNow = min(shownLines, option)`; without a Pagination it is `shownLines`. The prototype exposes the option as `tableState.defaultPageSize` (it was already computed in `useTableState`).
- The filler and the loading rows use `min(askedLines, pageSize now)`, or a short page in a small frame would overflow it.
- The pitch is read from the column row's `getBoundingClientRect().height` (as `useVirtualPitch` does), not computed in CSS: `--_table-pitch` is declared on `.table`, and `.compact` sits on the `<table>`, so the scroll area cannot see it. It is a constant per density, not a function of the rows, so it is not a feedback input; it follows density, touch and root font size by itself.
- Frame CSS: `height: 100%` and `min-height: 0` beside the existing `max-height: 100%`; `.frame[data-bounded] { height: auto }`, the attribute set in parts.tsx when `maxHeight` is given. `min-height: 0` is what lets a frame that is a direct flex item of a pane shrink (`flex` case).
- Not in the computation, as the spec says: an open row detail, a horizontal scrollbar. Because the height is only set while framed, flow tables with a detail open grow as today.

**How the table knows it is framed (`framed`).** A probe, not a heuristic (`useFramed` in `fitted.ts`): in a layout effect and in a `ResizeObserver` callback on the frame, set `frame.style.height = "calc(100% - 7px)"`, read the frame's height, put the style back; `framed` is true when the height shrank by 7 px (the percentage resolved), false when it did not (it was auto). It does not read the Pagination, the rows or the scroll area, so a part (the alarm list) may render a Pagination from it without a loop; `maxHeight` and `virtual` turn it off (false). Results: true for the pane, the flex pane, the Card in the grid row and the fixed Card; false for flow and `maxHeight`. In a grid row where the table is the tallest item it is also true (the stretched cell is definite); that is harmless, because there the scroll area equals the held page and the fitted page equals `pageSize`. Cost: two forced layouts per frame resize, restored before any observer is told - no loop message in 62 s of storm. No CSS-only way exists: a probe child takes the parent's height as a flex/in-flow item, an absolutely positioned one resolves against the frame's own padding box (always definite), and comparing the frame with the natural height flaps at equality.

**Settle delay and dead zone.** `useFit` observes the scroll area, waits **120 ms** of stillness, then `room = scroll.clientHeight - thead - tfoot` and the page is `max(1, floor(room / pitch))`; a page of n lines is kept while `room` is in `[n*pitch - 1, (n+1)*pitch)`: it changes only across a whole pitch, grows at a whole further line, and shrinks only when more than **1 px** of the last row would be cut. (A 4 px dead zone on the growing side was tried and rejected: at 398 px for 396 needed it stayed at 10 rows instead of 11.) `clientHeight` excludes a horizontal scrollbar, so the fit corrects itself for it.

| settle | re-cuts in 15 s of storm (90 ms cadence), Chromium / WebKit | frames with a cut row or scrollbar (Chromium) |
|---|---|---|
| 0 ms | 98 / 114 | 28 of 330 samples |
| 60 ms | 79 / 98 | 81 of 333 |
| 120 ms | 1 / 0 | 0 of 337 |
| 300 ms | 0 / 1 | 0 of 335 |

Below the drag cadence the page thrashes; 120 ms holds through a drag and applies a pause within a tenth of a second. One refinement, measured with the chart changing every 250 ms (just over the delay): with a symmetric delay 29% of frames (181 of 623 / 172 of 638) show a cut row or a scrollbar while a shrink waits; applying a shrink that would cut a row **at once** and delaying only the growth brings that to 3% (20 frames, about one frame per shrink, both engines) and costs nothing else. Use that asymmetry. A pager that wraps (more digits when the pages grow) cannot oscillate: smaller pages make the label longer, never shorter. For server mode (ticket 07) the 120 ms is the local re-cut; the request still waits until the size has held 300 ms.

**Where it goes in `packages/table/src`:**

- Ticket 03: `Table.module.css` (`.frame`, `.frame[data-bounded]`, `.scroll`), `parts.tsx` (`data-bounded`; hand the frame element to the registry instead of the prototype's `closest("[data-umriss-frame]")`), `frame.tsx` (inline height, `askedLines`, filler), a `useFramed` like the prototype's whose result goes through the registry into `framed` on the snapshot; the option's size exposed from `useTableState` for the held height.
- Ticket 04: a `useFit` like the prototype's in `fitted.ts`, but writing a separate fitted size (the prototype misuses `setPageSize`, which resets to page one and writes the view; the fitted size must not), its first measurement in a layout effect (the prototype's passive effect showed no flash in 400 animation frames, a layout effect guarantees it), and the pager's selector (the prototype's selector simply gains the fitted number as an option: 5, 16).
- Ticket 06: the anchor applies where the fit applies; the focus rest and the immediate shrink both live in the same ResizeObserver callback.

**Found on the way, for the user.** A Card of fixed height smaller than the table's held page does not shrink its body: `.body` is a flex item with `min-height: auto`, so it is as tall as its content (body 482 in a Card of 360). That is as it is today (emulated: same numbers); with `min-height: 0` on the body the frame fills it (315 px, 5 rows). A stretched Card in a grid row and the dashboard's widget body (`min-height: 0`, Dashboard.module.css) are fine. Making a fixed-height Card hold a table needs `min-height: 0` on `CardBody`; the spec puts any change to the Card out of scope, so this is a decision for the user, or a line in the README ("give a Card of fixed height `min-height: 0` on its body").

**Not tried:** Firefox; an open row detail; grouping, totals footer and tree under the fit; server mode; the focus rest; print; compact and touch pitch; the dashboard widget itself; `virtual` (it fills through the CSS alone, as the `in-a-pane` example already did).
