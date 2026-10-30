/* A page-size change keeps the anchor row on the page: the row with focus,
   else the current row if the page shows it, else the top row. jsdom lays
   nothing out: rows are 20 px, the head and foot one row each, and the scroll
   area is `area.height` tall; a faked ResizeObserver reports a resize. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Pagination, useTable } from "../src";
import { SETTLE_MS } from "../src/fit";

const ROWS = Array.from({ length: 100 }, (_, i) => ({ id: `r${i}`, n: i }));
const area = { height: 0 };
const watchers = new Set<() => void>();
const notify = () => watchers.forEach((cb) => cb());

function Case({ current }: { current?: string }) {
  const t = useTable(ROWS, { rowKey: (r) => r.id, pageSize: 5, initialView: { page: 3 } });
  return (
    <>
      <t.Table aria-label="Rows" currentRow={current}>
        <t.Column value="id" label="Id" rowHeader />
        <t.Column value="n" label="N" />
        <Pagination />
      </t.Table>
      <button>outside</button>
    </>
  );
}

const rowsOnPage = () => Array.from(screen.getAllByRole("rowgroup")[1]!.querySelectorAll<HTMLElement>("tr[data-motion]")).map((tr) => tr.dataset.motion);
const first = () => rowsOnPage()[0];
const count = () => rowsOnPage().length;
const resize = (height: number) => {
  area.height = height;
  act(() => {
    notify();
    vi.advanceTimersByTime(SETTLE_MS);
  });
};

beforeEach(() => {
  watchers.clear();
  vi.useFakeTimers();
  vi.stubGlobal("ResizeObserver", class { constructor(cb: () => void) { watchers.add(cb); } observe() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const asked = this.style.height.startsWith("calc(100% - ");
    const row = this.tagName === "TR" || this.tagName === "THEAD" || this.tagName === "TFOOT";
    const height = row ? 20 : this.hasAttribute("data-bounded") ? 40 : asked ? 93 : 100;
    return { height, top: 0, left: 0, bottom: height, right: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) };
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.querySelector(":scope > table") ? area.height : 0;
  });
  area.height = 20 + 5 * 20;
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("a page-size change keeps the anchor", () => {
  it("keeps the top row on the page when the frame grows", () => {
    render(<Case />);
    expect(first()).toBe("r10");
    resize(20 + 8 * 20);
    expect(count()).toBe(8);
    expect(first()).toBe("r8");
  });

  it("keeps the current row over the top row when the page shows it", () => {
    render(<Case current="r13" />);
    resize(20 + 20 * 20);
    expect(first()).toBe("r0");
    expect(rowsOnPage()).toContain("r13");
  });

  it("keeps the focused row, over the current row, and its focus", () => {
    render(<Case current="r10" />);
    const row = document.querySelector<HTMLElement>('tr[data-motion="r12"]')!;
    row.tabIndex = 0;
    row.focus();
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "10" } });
    expect(first()).toBe("r10");
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "25" } });
    expect(first()).toBe("r0");
    expect(document.activeElement?.getAttribute("data-motion")).toBe("r12");
  });

  it("a chosen size keeps the top row", () => {
    render(<Case />);
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "25" } });
    expect(first()).toBe("r0");
  });

  it("does not re-cut a resize while focus is in the rows, and cuts when it leaves", () => {
    render(<Case />);
    const row = document.querySelector<HTMLElement>('tr[data-motion="r10"]')!;
    row.tabIndex = 0;
    row.focus();
    resize(20 + 8 * 20);
    expect(count()).toBe(5);
    act(() => {
      screen.getByText("outside").focus();
      vi.advanceTimersByTime(1);
    });
    expect(count()).toBe(8);
  });

  it("says nothing when the frame resizes", () => {
    render(<Case />);
    resize(20 + 8 * 20);
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("a grouped table", () => {
  it("shows the anchor row on the page the new size cuts, headers counted", () => {
    const grouped = Array.from({ length: 60 }, (_, i) => ({ id: `r${i}`, g: `G${Math.floor(i / 7)}` }));
    function Grouped() {
      const t = useTable(grouped, { rowKey: (r) => r.id, pageSize: 10, defaultGrouping: ["g"], initialView: { page: 4 } });
      return (
        <t.Table aria-label="G">
          <t.Column value="g" label="G" />
          <t.Column value="id" label="Id" rowHeader />
          <Pagination />
        </t.Table>
      );
    }
    render(<Grouped />);
    const ids = () => Array.from(document.querySelectorAll<HTMLElement>("tr[data-line='row']")).map((tr) => tr.dataset.motion);
    const anchor = ids()[0];
    for (const size of ["25", "50"]) {
      fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: size } });
      expect(ids()).toContain(anchor);
    }
  });
});
