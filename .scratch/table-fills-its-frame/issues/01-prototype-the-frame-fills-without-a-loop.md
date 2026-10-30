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
