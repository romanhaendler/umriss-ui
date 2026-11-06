# 04 - The group rule one device pixel at every zoom

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/table-head-geometry/spec.md` (Implementation Decisions, "The group rule is drawn so that the engine snaps it"; Testing Decisions, "A group-rule check at fractional zoom")

## What to build

A user with the browser zoomed to 90, 110, 125 or 150 %, or a display scaled
to 125 or 150 %, sees every `ColumnGroup` rule as one even line of one
device pixel, from the group head through the head and the body to the
footer. Today the rule is a one-pixel background at the cell's fractional
left edge: at those scales it is one device pixel in one row and two lighter
ones in another, at the same boundary.

The rule is drawn so that the engine snaps it to a device pixel, as it snaps
a border, and still: runs through head, body and footer; stays on a sticky
cell; stands beside a pinned edge's shadow without either covering the other.

A check in the table's visual suite renders the group examples at device
scale 0.9, 1, 1.1, 1.25, 1.5 and 2, decodes the screenshot's pixels at every
group boundary in each row, and asserts that one scale gives one width in
every row and boundary, at the same device column from top to bottom. The
probe `.scratch/table-head-geometry/probe/line.spec.ts` is its draft.

## Acceptance criteria

- [ ] At each of the six scales, in Chromium and WebKit, every group rule covers the same number of device pixels in every row and at every boundary, at one device column from top to bottom.
- [ ] Before the fix the check fails on the current `main` (e.g. Chromium at 1.1: head 1, body 2 device pixels); after it, it passes.
- [ ] The rule stays under a sticky head, beside a pinned edge's shadow and through the footer; looked at in screenshots at scale 1 and 1.25, with a group split by pinning.
- [ ] Moved screenshot baselines are each looked at before they are rebuilt.
- [ ] `pnpm check table` passes.
