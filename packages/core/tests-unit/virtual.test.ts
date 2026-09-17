/* The visible window of the virtualised table (table-surface 09).

   Pure arithmetic, therefore checkable without a DOM. The expected values come
   from the rule - "which rows does the band between scrollTop and scrollTop +
   height cut" - and not from the implementation's way of computing them.

   The input and output field names stay German: they are the model's, not this
   test's. */

import { describe, expect, it } from "vitest";
import { scrollForRow, visibleWindow } from "../src/lib/virtual";

const BASE = { count: 1000, rowHeight: 40, viewportHeight: 400, overscan: 0 };

describe("visibleWindow – which rows are rendered", () => {
  it("shows from the beginning as many rows as fit into the height", () => {
    const w = visibleWindow({ ...BASE, scrollTop: 0 });
    expect(w.from).toBe(0);
    // 400 / 40 = 10 whole rows, plus the eleventh, cut off.
    expect(w.to).toBe(11);
  });

  it("leaves nothing standing above as long as nothing is scrolled", () => {
    expect(visibleWindow({ ...BASE, scrollTop: 0 }).before).toBe(0);
  });

  it("keeps the total height constant across filler height and window", () => {
    const w = visibleWindow({ ...BASE, scrollTop: 2000 });
    const rendered = (w.to - w.from) * BASE.rowHeight;
    expect(w.before + rendered + w.after).toBe(BASE.count * BASE.rowHeight);
  });

  it("travels along with the scrolling", () => {
    const w = visibleWindow({ ...BASE, scrollTop: 2000 });
    expect(w.from).toBe(50);
    expect(w.before).toBe(2000);
  });

  it("counts a row cut off at the edge towards the window", () => {
    // 2010 lies in the middle of row 50; it has to be rendered.
    const w = visibleWindow({ ...BASE, scrollTop: 2010 });
    expect(w.from).toBe(50);
  });

  it("appends the overscan above and below", () => {
    const w = visibleWindow({ ...BASE, scrollTop: 2000, overscan: 3 });
    expect(w.from).toBe(47);
    expect(w.to).toBe(64);
  });

  it("does not run negative at the beginning", () => {
    const w = visibleWindow({ ...BASE, scrollTop: 0, overscan: 5 });
    expect(w.from).toBe(0);
    expect(w.before).toBe(0);
  });

  it("does not run past the last row at the end", () => {
    const w = visibleWindow({ ...BASE, scrollTop: 1000 * 40, overscan: 5 });
    expect(w.to).toBe(1000);
    expect(w.after).toBe(0);
  });

  it("treats a negative scroll position like the beginning", () => {
    // Overscrolling ("rubber banding") reports < 0 on some systems.
    expect(visibleWindow({ ...BASE, scrollTop: -80 }).from).toBe(0);
  });

  it("yields an empty window for an empty set", () => {
    const w = visibleWindow({ ...BASE, count: 0, scrollTop: 0 });
    expect(w).toEqual({ from: 0, to: 0, before: 0, after: 0 });
  });

  it("yields an empty window without a measured row height, instead of dividing", () => {
    const w = visibleWindow({ ...BASE, rowHeight: 0, scrollTop: 0 });
    expect(w).toEqual({ from: 0, to: 0, before: 0, after: 0 });
  });

  it("renders everything where the set is smaller than the window", () => {
    const w = visibleWindow({ ...BASE, count: 5, scrollTop: 0 });
    expect(w.from).toBe(0);
    expect(w.to).toBe(5);
    expect(w.after).toBe(0);
  });
});

describe("scrollForRow – bringing a row into view", () => {
  const PLACEMENT = { rowHeight: 40, viewportHeight: 400, headerHeight: 0 };

  it("reports null where the row can be seen already", () => {
    expect(scrollForRow(5, { ...PLACEMENT, scrollTop: 0 })).toBeNull();
  });

  it("scrolls down until the row stands at the lower edge", () => {
    // Row 20 ends at 840; it becomes visible from scrollTop 440 on.
    expect(scrollForRow(20, { ...PLACEMENT, scrollTop: 0 })).toBe(440);
  });

  it("scrolls up until the row stands at the upper edge", () => {
    expect(scrollForRow(5, { ...PLACEMENT, scrollTop: 800 })).toBe(200);
  });

  it("leaves room under a sticky header", () => {
    /* Without this arithmetic the row lands behind the header: it is scrolled,
       but covered - the defect one notices only once the focus ring becomes
       invisible. */
    expect(scrollForRow(5, { ...PLACEMENT, scrollTop: 800, headerHeight: 36 })).toBe(164);
  });

  it("does not run negative", () => {
    expect(scrollForRow(0, { ...PLACEMENT, scrollTop: 20, headerHeight: 36 })).toBe(0);
  });

  it("brings the last row to the lower end", () => {
    expect(scrollForRow(999, { ...PLACEMENT, scrollTop: 0 })).toBe(40000 - 400);
  });
});
