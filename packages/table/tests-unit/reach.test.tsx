/* scrollToRow and focusCell on useTable's return: a caller outside the table
   brings a row into view and puts the focus on a cell. */

import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination, Search, useTable } from "../src";
import type { Table } from "../src";

interface Item {
  id: string;
  tag: string;
  group: string;
}

const items = (n: number): Item[] => Array.from({ length: n }, (_, i) => ({ id: String(i), tag: `T-${i}`, group: i < 3 ? "a" : "b" }));

let current: Table<Item> | null = null;
const capture = (x: Table<Item>) => {
  current = x;
};
const t = () => current!;
const ids = (c: HTMLElement) => Array.from(c.querySelectorAll("tbody th")).map((th) => th.textContent);

function Paged({ rows = items(30), grid = false, grouping }: { rows?: Item[]; grid?: boolean; grouping?: string }) {
  const hook = useTable(rows, { rowKey: (r) => r.id, pageSize: 10, defaultGrouping: grouping });
  capture(hook);
  const { Table: Frame, Column } = hook;
  return (
    <Frame grid={grid}>
      <Column value="tag" label="Tag" rowHeader />
      <Column value="group" label="Group" groupable />
      <Pagination />
    </Frame>
  );
}

const ROWS = items(30);
const THOUSAND = items(1000);
const even = (i: Item) => Number(i.id) % 2 === 0;
function Big({ pre }: { pre?: boolean }) {
  const preFilter = pre ? even : undefined;
  const hook = useTable(THOUSAND, { rowKey: (r) => r.id, virtual: true, preFilter });
  capture(hook);
  const { Table: Frame, Column } = hook;
  return (
    <Frame grid maxHeight="100px">
      <Column value="tag" label="Tag" rowHeader />
    </Frame>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  current = null;
});

describe("scrollToRow", () => {
  it("moves a paged table to the row's page", () => {
    const { container } = render(<Paged />);
    let ok = false;
    act(() => void (ok = t().scrollToRow("25")));
    expect(ok).toBe(true);
    expect(ids(container)[0]).toBe("T-20");
  });

  it("sets the scroll of a virtual table so that the row stands in the window", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    const { container } = render(<Big />);
    const scroll = container.querySelector("table")!.parentElement!;
    act(() => void t().scrollToRow("500"));
    expect(scroll.scrollTop).toBeGreaterThan(0);
    fireEvent.scroll(scroll);
    expect(ids(container)).toContain("T-500");
  });

  it("returns false and changes nothing for what the table does not show", () => {
    render(<Paged grouping="group" rows={ROWS} />);
    act(() => t().foldAll());
    let found = true;
    act(() => void (found = t().scrollToRow("1") || t().scrollToRow("nope")));
    expect(found).toBe(false);
    expect(t().page).toBe(1);
  });

  it("returns false for a row the search hides, and for a table not mounted", () => {
    function Searched() {
      const hook = useTable(ROWS, { rowKey: (r) => r.id, pageSize: 10 });
      capture(hook);
      const { Table: Frame, Column } = hook;
      return (
        <Frame>
          <Search />
          <Column value="tag" label="Tag" rowHeader />
          <Pagination />
        </Frame>
      );
    }
    const { unmount } = render(<Searched />);
    act(() => t().setSearch("T-1"));
    const hook = t();
    expect(hook.scrollToRow("25")).toBe(false);
    expect(hook.page).toBe(1);
    unmount();
    expect(hook.scrollToRow("1")).toBe(false);
  });

  it("returns false for a row a pre-filter hides", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    const { container } = render(<Big pre />);
    const scroll = container.querySelector("table")!.parentElement!;
    expect(t().scrollToRow("501")).toBe(false);
    expect(scroll.scrollTop).toBe(0);
  });
});

describe("focusCell", () => {
  it("focuses the cell, and the arrows walk on from it", () => {
    const { container } = render(<Paged grid />);
    let ok = false;
    act(() => void (ok = t().focusCell("25", "group")));
    expect(ok).toBe(true);
    const cell = document.activeElement as HTMLElement;
    expect(cell.textContent).toBe("b");
    expect(cell.parentElement!.getAttribute("data-grid-line")).toBe("row:25");
    fireEvent.keyDown(cell, { key: "ArrowUp" });
    expect((document.activeElement as HTMLElement).parentElement!.getAttribute("data-grid-line")).toBe("row:24");
    expect(container).toBeTruthy();
  });

  it("returns false outside grid mode and for a column the table does not show", () => {
    render(<Paged />);
    expect(t().focusCell("1", "tag")).toBe(false);
    render(<Paged grid />);
    expect(t().focusCell("1", "nope")).toBe(false);
    expect(t().page).toBe(1);
  });
});
