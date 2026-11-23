/* The names that changed in 0.58: the new one works, the old one works and
   warns once, and where both are given the new one wins. */

import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { csv, tableModel, useTable } from "../src";
import type { ModelColumn } from "../src";
import type { Table } from "../src";

interface Row {
  id: string;
  group: string;
  size: number;
}

const ROWS: Row[] = [
  { id: "a", group: "x", size: 1 },
  { id: "b", group: "x", size: 2 },
  { id: "c", group: "y", size: 3 },
  { id: "d", group: "y", size: 4 },
];

let current: Table<Row> | null = null;
const capture = (t: Table<Row>) => {
  current = t;
};

function Grid({
  pin,
  pinned,
  old = false,
  sticky,
  rowPin,
}: {
  pin?: boolean;
  pinned?: boolean;
  old?: boolean;
  sticky?: boolean;
  rowPin?: "start";
}) {
  const t = useTable(ROWS, { rowKey: (r) => r.id, defaultGrouping: "group" });
  capture(t);
  const { Table: Frame, Column, RowActions, Action, GroupKey, GroupBy } = t;
  const Key = old ? GroupBy : GroupKey;
  return (
    <Frame stickyRowHeader={sticky}>
      <Column value="id" label="Id" rowHeader pin={rowPin} />
      <Column value="group" label="Group" />
      <Column value="size" label="Size" filter="range" />
      <Key id="parity" value={(r) => (r.size % 2 ? "odd" : "even")} label="Parity" />
      <RowActions pin={pin} pinned={pinned}>
        <Action onSelect={() => {}}>Open</Action>
      </RowActions>
    </Frame>
  );
}

const warned = (spy: { mock: { calls: unknown[][] } }, text: string) => spy.mock.calls.filter((c: unknown[]) => String(c[0]).includes(text)).length;

afterEach(() => vi.restoreAllMocks());

describe("t.conditions and t.filter", () => {
  it("conditions holds the conditions; filter reads the same and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Grid />);
    act(() => current!.setFilter("size", { from: 2 }));
    expect(current!.conditions).toEqual({ size: { from: 2 } });
    expect(warned(warn, "t.filter")).toBe(0);
    expect(current!.filter).toEqual({ size: { from: 2 } });
    expect(current!.filter).toEqual({ size: { from: 2 } });
    expect(warned(warn, "t.filter is deprecated")).toBe(1);
    expect(warn.mock.calls.at(-1)![0]).toContain("t.conditions");
  });
});

describe("foldAllGroups and foldAll", () => {
  it("the new names fold; the old ones do the same and warn once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Grid />);
    act(() => current!.foldAllGroups());
    expect(current!.folded).toHaveLength(2);
    act(() => current!.unfoldAllGroups());
    expect(current!.folded).toHaveLength(0);
    expect(warned(warn, "t.foldAll")).toBe(0);
    act(() => current!.foldAll());
    act(() => current!.foldAll());
    expect(current!.folded).toHaveLength(2);
    act(() => current!.unfoldAll());
    expect(current!.folded).toHaveLength(0);
    expect(warned(warn, "t.foldAll is deprecated")).toBe(1);
    expect(warned(warn, "t.unfoldAll is deprecated")).toBe(1);
  });
});

describe("GroupKey and GroupBy", () => {
  it("both declare a group key; GroupBy warns once and names GroupKey", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rerender } = render(<Grid />);
    act(() => current!.setGrouping(["parity"]));
    expect(current!.grouping).toEqual(["parity"]);
    expect(warned(warn, "GroupBy")).toBe(0);
    rerender(<Grid old />);
    rerender(<Grid old />);
    act(() => current!.setGrouping(["parity"]));
    expect(current!.grouping).toEqual(["parity"]);
    expect(warned(warn, "GroupBy is deprecated")).toBe(1);
    expect(warn.mock.calls.at(-1)![0]).toContain("GroupKey");
  });
});

describe("RowActions pinned and pin", () => {
  const stuck = (container: HTMLElement) => container.querySelector("thead tr th:last-child")!.className.includes("pinned");

  it("pinned={false} leaves the actions in the flow; pin={false} does the same and warns once; pinned wins", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { container, rerender } = render(<Grid pinned={false} />);
    expect(stuck(container)).toBe(false);
    expect(warned(warn, "RowActions pin")).toBe(0);
    rerender(<Grid pin={false} />);
    rerender(<Grid pin={false} />);
    expect(stuck(container)).toBe(false);
    expect(warned(warn, "RowActions pin is deprecated")).toBe(1);
    rerender(<Grid pin={false} pinned />);
    expect(stuck(container)).toBe(true);
  });
});

describe("pin=\"start\" on the row header and stickyRowHeader", () => {
  it("both pin the row header; stickyRowHeader warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Grid rowPin="start" />);
    expect(current!.pinned).toEqual({ id: "start" });
    expect(warned(warn, "stickyRowHeader")).toBe(0);
    const { rerender } = render(<Grid sticky />);
    rerender(<Grid sticky />);
    expect(current!.pinned).toEqual({ id: "start" });
    expect(warned(warn, "Table stickyRowHeader is deprecated")).toBe(1);
    expect(warn.mock.calls.at(-1)![0]).toContain('pin="start"');
  });
});

describe("exportAs(csv) and asCsv", () => {
  it("asCsv writes the same text and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Grid />);
    const text = current!.exportAs(csv);
    expect(warned(warn, "asCsv")).toBe(0);
    expect(current!.asCsv()).toBe(text);
    expect(current!.asCsv()).toBe(text);
    expect(warned(warn, "t.asCsv is deprecated")).toBe(1);
    expect(warn.mock.calls.at(-1)![0]).toContain("exportAs(csv)");
  });
});

describe("tableModel preFilter and filter", () => {
  const columns: ModelColumn<Row>[] = [{ id: "size", value: (r) => r.size }];

  it("preFilter filters; filter does the same and warns once; preFilter wins", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const ids = (input: Parameters<typeof tableModel<Row>>[2]) => tableModel(ROWS, columns, input).filtered.map((r) => r.id);
    expect(ids({ preFilter: (r) => r.size > 2 })).toEqual(["c", "d"]);
    expect(warned(warn, "tableModel filter")).toBe(0);
    expect(ids({ filter: (r) => r.size > 2 })).toEqual(["c", "d"]);
    expect(ids({ filter: (r) => r.size > 2 })).toEqual(["c", "d"]);
    expect(warned(warn, "tableModel filter is deprecated")).toBe(1);
    expect(ids({ preFilter: (r) => r.size < 2, filter: (r) => r.size > 2 })).toEqual(["a"]);
  });
});
