/* A range of rows: Shift-click or Shift+Space on a row's checkbox, Shift+Space
   on a cell in grid mode. The range runs over the rows a reader reaches by
   paging, in reading order. */

import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination, useTable, useTableSelection } from "../src";
import type { Table, TableSelection } from "../src";

interface Item {
  id: string;
  name: string;
  group: string;
  size: number;
}

/* Names run a01..a30; the size runs against them, so a sort by size reverses the rows. */
const ITEMS: Item[] = Array.from({ length: 30 }, (_, i) => ({
  id: `i${i + 1}`,
  name: `a${String(i + 1).padStart(2, "0")}`,
  group: i < 10 ? "G1" : i < 20 ? "G2" : "G3",
  size: 100 - i,
}));

let current: Table<Item> | null = null;
const capture = (t: Table<Item>) => {
  current = t;
};

function Items({
  grouped = false,
  selection,
  grid = false,
  onCurrent,
  pageSize,
}: {
  grouped?: boolean;
  selection?: TableSelection<string>;
  grid?: boolean;
  onCurrent?: (key: string) => void;
  pageSize?: number;
}) {
  const t = useTable(ITEMS, {
    rowKey: (i) => i.id,
    defaultGrouping: grouped ? "group" : undefined,
    pageSize,
    selection,
  });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame selectable grid={grid} aria-label="Items" onCurrentRowChange={onCurrent}>
      <Column value="name" label="Name" rowHeader sortable />
      <Column value="size" label="Size" sortable />
      <Column value="group" label="Group" groupable />
      {pageSize ? <Pagination /> : null}
    </Frame>
  );
}

const box = (name: string) => screen.getByRole("checkbox", { name: `Select ${name}` }) as HTMLInputElement;
const shiftClick = (name: string) => fireEvent.click(box(name), { shiftKey: true });
const click = (name: string) => fireEvent.click(box(name));
const ticked = () => [...current!.selection.selected].sort();
const keys = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `i${from + i}`).sort();

describe("A range of rows", () => {
  it("ticks the rows between the anchor and the clicked row, in the order shown", () => {
    render(<Items />);
    act(() => current!.toggleSort("size"));
    act(() => current!.toggleSort("size"));
    /* Sorted by size, a30 comes first: the rows between a28 and a25 are ticked. */
    click("a28");
    shiftClick("a25");
    expect(ticked()).toEqual(keys(25, 28));
  });

  it("clears the range on a Shift-click on a ticked row", () => {
    render(<Items />);
    click("a03");
    shiftClick("a09");
    expect(ticked()).toEqual(keys(3, 9));
    shiftClick("a05");
    /* The range set the anchor to a09: the click on a05 clears a05..a09. */
    expect(ticked()).toEqual(keys(3, 4));
  });

  it("skips the rows of a folded group", () => {
    render(<Items grouped />);
    act(() => current!.foldAll());
    const g2 = current!.folded.find((path) => path.includes("G2"))!;
    act(() => current!.unfoldAll());
    act(() => current!.toggleFold(g2));
    click("a05");
    shiftClick("a25");
    expect(ticked()).toEqual([...keys(5, 10), ...keys(21, 25)].sort());
  });

  it("reaches across pages", () => {
    render(<Items pageSize={10} />);
    click("a03");
    act(() => current!.setPage(3));
    shiftClick("a25");
    expect(ticked()).toEqual(keys(3, 25));
  });

  it("leaves out the rows a search hides", () => {
    render(<Items />);
    click("a01");
    act(() => current!.setSearch("a1"));
    shiftClick("a15");
    /* Only the rows that match stand between: a10..a15 with the anchor a01 hidden, so one row. */
    expect(ticked()).toEqual(["i1", "i15"]);
  });

  it("toggles one row without an anchor", () => {
    render(<Items />);
    shiftClick("a05");
    expect(ticked()).toEqual(["i5"]);
    shiftClick("a09");
    expect(ticked()).toEqual(keys(5, 9));
  });

  it("drops the anchor when the selection is cleared", () => {
    render(<Items />);
    click("a02");
    act(() => current!.selection.clear());
    shiftClick("a06");
    expect(ticked()).toEqual(["i6"]);
  });

  it("does not take the anchor from select all", () => {
    render(<Items />);
    click("a04");
    act(() => current!.selection.toggleAll());
    click("a02");
    shiftClick("a08");
    /* a02 was cleared last and is the anchor: it, not a04, bounds the range. */
    expect(ticked()).toEqual([...keys(1, 1), ...keys(9, 30)].sort());
  });

  it("reaches the application's state with a handed-in selection", () => {
    const seen: ReadonlySet<string>[] = [];
    function Held() {
      const own = useTableSelection(ITEMS.map((i) => i.id));
      seen.push(own.selected);
      const [shown] = useState(true);
      return shown ? <Items selection={own} /> : null;
    }
    render(<Held />);
    click("a02");
    shiftClick("a05");
    expect([...seen.at(-1)!].sort()).toEqual(keys(2, 5));
  });

  it("selects the range with Shift+Space on a checkbox", () => {
    render(<Items />);
    click("a02");
    const b = box("a06");
    fireEvent.keyDown(b, { key: " ", shiftKey: true });
    expect(ticked()).toEqual(keys(2, 6));
  });

  it("selects the range with Shift+Space on a cell in grid mode", () => {
    render(<Items grid />);
    click("a02");
    const cell = screen.getByText("a05").closest<HTMLElement>("td, th")!;
    act(() => cell.focus());
    fireEvent.keyDown(cell, { key: " ", shiftKey: true });
    expect(ticked()).toEqual(keys(2, 5));
  });

  it("chooses no current row, with or without Shift", () => {
    const on = vi.fn();
    render(<Items onCurrent={on} />);
    click("a02");
    shiftClick("a05");
    expect(on).not.toHaveBeenCalled();
  });

  it("marks no text on a Shift press in the selection column", () => {
    render(<Items />);
    const down = new MouseEvent("mousedown", { bubbles: true, cancelable: true, shiftKey: true });
    box("a02").dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    const plain = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    box("a02").dispatchEvent(plain);
    expect(plain.defaultPrevented).toBe(false);
  });
});
