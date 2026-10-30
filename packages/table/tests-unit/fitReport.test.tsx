/* A fit reports nothing to onViewChange, and a new line does not re-cut a
   page the user holds focus in. Same layout as pageAnchor.test.tsx. */

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Pagination, useTable } from "../src";
import { SETTLE_MS } from "../src/fit";

const area = { height: 0 };
const watchers = new Set<() => void>();
const notify = () => watchers.forEach((cb) => cb());

function Case({ n = 100, onView }: { n?: number; onView?: (view: object) => void }) {
  const rows = Array.from({ length: n }, (_, i) => ({ id: `r${i}`, n: i }));
  const t = useTable(rows, { rowKey: (r) => r.id, pageSize: 5, initialView: { page: 3 }, onViewChange: onView });
  return (
    <>
      <t.Table aria-label="Rows">
        <t.Column value="id" label="Id" rowHeader />
        <t.Column value="n" label="N" />
        <Pagination />
      </t.Table>
      <button>outside</button>
    </>
  );
}

const rowsOnPage = () => Array.from(screen.getAllByRole("rowgroup")[1]!.querySelectorAll<HTMLElement>("tr[data-motion]")).map((tr) => tr.dataset.motion);
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

describe("a frame resize", () => {
  it("reports no view change, also where the anchor moves the page", () => {
    const onView = vi.fn();
    render(<Case onView={onView} />);
    expect(rowsOnPage()[0]).toBe("r10");
    resize(20 + 8 * 20);
    expect(rowsOnPage()[0]).toBe("r8");
    expect(onView).not.toHaveBeenCalled();
  });

  it("still reports the user's own page change afterwards", () => {
    const onView = vi.fn();
    render(<Case onView={onView} />);
    resize(20 + 8 * 20);
    act(() => screen.getByRole("button", { name: "Next page" }).click());
    expect(onView).toHaveBeenCalledTimes(1);
  });
});

describe("a new line", () => {
  it("does not re-cut the page while focus is in the rows", () => {
    const { rerender } = render(<Case n={100} />);
    const row = document.querySelector<HTMLElement>('tr[data-motion="r10"]')!;
    row.tabIndex = 0;
    row.focus();
    resize(20 + 8 * 20);
    expect(rowsOnPage()).toHaveLength(5);
    rerender(<Case n={101} />);
    expect(rowsOnPage()).toHaveLength(5);
  });
});
