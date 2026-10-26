/* "All that match" as a selection state: the arithmetic of the hook, and what
   the table does with it when the search or the conditions change. */

import { act, render, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable, useTableSelection } from "../src";
import type { Table } from "../src";

describe("useTableSelection - all that match", () => {
  const ids = ["a", "b", "c"];

  it("starts off, with nothing excepted", () => {
    const { result } = renderHook(() => useTableSelection(ids));
    expect(result.current.allMatching).toBe(false);
    expect(result.current.except.size).toBe(0);
  });

  it("selects all, unticks, ticks again and clears", () => {
    const { result } = renderHook(() => useTableSelection(ids));
    act(() => result.current.selectMatching());
    expect(result.current.allMatching).toBe(true);
    expect(result.current.isSelected("zz")).toBe(true);
    expect(result.current.selected.size).toBe(0);
    expect(result.current.count).toBe(0);
    expect(result.current.allSelected).toBe(true);

    act(() => result.current.toggle("b"));
    expect(result.current.isSelected("b")).toBe(false);
    expect([...result.current.except]).toEqual(["b"]);
    expect(result.current.allSelected).toBe(false);
    expect(result.current.someSelected).toBe(true);

    act(() => result.current.toggle("b"));
    expect(result.current.isSelected("b")).toBe(true);
    expect(result.current.except.size).toBe(0);

    act(() => result.current.toggle("b"));
    act(() => result.current.clear());
    expect(result.current.allMatching).toBe(false);
    expect(result.current.except.size).toBe(0);
    expect(result.current.isSelected("a")).toBe(false);
  });

  it("ends the state with the header gesture", () => {
    const { result } = renderHook(() => useTableSelection(ids));
    act(() => result.current.toggle("a"));
    act(() => result.current.selectMatching());
    expect(result.current.selected.size).toBe(0);
    act(() => result.current.toggleAll());
    expect(result.current.allMatching).toBe(false);
    expect(result.current.selected.size).toBe(0);
  });
});

interface Row {
  id: string;
}
const rows: Row[] = [{ id: "a" }, { id: "b" }];

let current: Table<Row> | null = null;
const capture = (t: Table<Row>) => {
  current = t;
};

function Probe({ outside, server = true }: { outside: boolean; server?: boolean }) {
  const own = useTableSelection(rows.map((r) => r.id));
  const t = useTable(rows, {
    rowKey: (r: Row) => r.id,
    ...(server ? { server: true as const, rowCount: 100 } : {}),
    selection: outside ? own : undefined,
  } as never) as Table<Row>;
  capture(t);
  return null;
}

describe("a change of the request and the selection", () => {
  for (const outside of [false, true]) {
    const who = outside ? "held outside" : "the table's own";

    it(`${who}: search clears, sort, page and page size keep`, () => {
      render(<Probe outside={outside} />);
      act(() => current!.selection.selectMatching());
      act(() => current!.selection.toggle("a"));
      act(() => current!.toggleSort("id"));
      act(() => current!.setPage(2));
      act(() => current!.setPageSize(20));
      expect(current!.selection.allMatching).toBe(true);
      expect([...current!.selection.except]).toEqual(["a"]);
      act(() => current!.setSearch("x"));
      expect(current!.selection.allMatching).toBe(false);
      expect(current!.selection.except.size).toBe(0);
    });

    it(`${who}: a condition clears`, () => {
      render(<Probe outside={outside} />);
      act(() => current!.selection.selectMatching());
      act(() => current!.setFilter("id", ["a"]));
      expect(current!.selection.allMatching).toBe(false);
    });
  }

  for (const outside of [false, true]) {
    it(`${outside ? "held outside" : "the table's own"}: a search or a condition clears plain keys in server mode`, () => {
      render(<Probe outside={outside} />);
      act(() => current!.selection.toggle("a"));
      act(() => current!.setSearch("x"));
      expect(current!.selection.isSelected("a")).toBe(false);
      act(() => current!.selection.toggle("b"));
      act(() => current!.setFilter("id", ["a"]));
      expect(current!.selection.isSelected("b")).toBe(false);
    });
  }

  it("leaves plain keys alone when a search changes in automatic mode", () => {
    render(<Probe outside={false} server={false} />);
    act(() => current!.selection.toggle("a"));
    act(() => current!.setSearch("x"));
    expect(current!.selection.isSelected("a")).toBe(true);
  });

  it("warns once in automatic mode and ignores the state", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Probe outside={false} server={false} />);
    act(() => current!.selection.selectMatching());
    act(() => current!.setSearch("x"));
    expect(current!.selection.allMatching).toBe(true);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("allMatching")).length).toBe(1);
    warn.mockRestore();
  });
});
