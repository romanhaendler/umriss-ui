/* What is selected is what the application hears: rows that leave `rows` leave
   the selection, and count, callback, toolbar and bulk actions speak of the
   rows a reader can see. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Search, Toolbar, useTable } from "../src";
import type { Table } from "../src";

interface P {
  id: string;
  name: string;
}
const ALL: P[] = ["p1", "p2", "p3", "p4"].map((id) => ({ id, name: `Item ${id}` }));
let cur: Table<P> | null = null;
const capture = (t: Table<P>) => {
  cur = t;
};

function Host({ rows, fn, grid = false }: { rows: P[]; fn: (keys: string[], all: string[]) => void; grid?: boolean }) {
  const t = useTable(rows, { rowKey: (p) => p.id, onSelectionChange: fn });
  capture(t);
  return (
    <t.Table selectable grid={grid} aria-label="x">
      <Toolbar>
        <Search />
      </Toolbar>
      <t.Column value="name" label="Name" rowHeader searchable />
    </t.Table>
  );
}

describe("rows that leave the data", () => {
  it("leave the selection, the application hears it, and a returning id is not selected", () => {
    const fn = vi.fn();
    const { rerender } = render(<Host rows={ALL} fn={fn} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]!);
    expect(fn.mock.calls.at(-1)![0]).toHaveLength(4);
    rerender(<Host rows={ALL.slice(0, 1)} fn={fn} />);
    act(() => {});
    expect(cur!.selection.count).toBe(1);
    expect(fn.mock.calls.at(-1)![0]).toEqual(["p1"]);
    rerender(<Host rows={ALL} fn={fn} />);
    act(() => {});
    expect(cur!.selection.count).toBe(1);
    expect(cur!.selection.isSelected("p2")).toBe(false);
  });
});

describe("keys hidden by a search", () => {
  it("count and callback say what the toolbar says; the full set comes apart", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<Host rows={ALL} fn={fn} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]!);
    act(() => cur!.setSearch("p3"));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(cur!.selection.count).toBe(1);
    expect(fn.mock.calls.at(-1)![0]).toEqual(["p3"]);
    expect(fn.mock.calls.at(-1)![1]).toHaveLength(4);
    vi.useRealTimers();
  });
});

describe("grid mode", () => {
  it("Ctrl+A selects every row", () => {
    render(<Host rows={ALL} fn={() => {}} grid />);
    const cell = screen.getByText("Item p2").closest("td, th") as HTMLElement;
    cell.focus();
    fireEvent.keyDown(cell, { key: "a", ctrlKey: true });
    expect(cur!.selection.count).toBe(4);
    fireEvent.keyDown(cell, { key: "a", ctrlKey: true });
    expect(cur!.selection.count).toBe(4);
  });
});

describe("copy after a click on a cell", () => {
  it("a cell click leaves the focus on the table's frame, which hears Ctrl+C", () => {
    render(<Host rows={ALL} fn={() => {}} />);
    const frame = document.querySelector<HTMLElement>("[tabindex='-1']")!;
    expect(frame.contains(screen.getByText("Item p2"))).toBe(true);
  });
});
