/* An accessor held for its source text is stale when it reads a value from outside its row that has changed.
   Development says so once per column (or for the rowKey); a `key` on the column that changes with the value
   is the way out and keeps the column's sort and width. Each test has its own ids: a warning is once per id. */

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { useTable } from "../src";
import type { Table as TableOf } from "../src";

interface Item {
  id: string;
  net: number;
}
const ITEMS: Item[] = [
  { id: "a", net: 3 },
  { id: "b", net: 1 },
  { id: "c", net: 2 },
];

afterEach(() => vi.restoreAllMocks());
const warnings = (warn: { mock: { calls: unknown[][] } }, id: string) => warn.mock.calls.filter(([t]) => String(t).includes(id));

let current: TableOf<Item> | null = null;
const capture = (t: TableOf<Item>) => {
  current = t;
};

function Probe({ rate, id, part, rows = ITEMS, colKey }: { rate: number; id: string; part: string; rows?: Item[]; colKey?: number }) {
  const props: Record<string, unknown> = {};
  if (part === "sort") props.sortValue = (v: number) => v * rate;
  if (part === "group") props.groupValue = (v: number) => v * rate;
  const t = useTable(rows, { defaultSort: { column: "keyed", direction: "asc" },
    rowKey: part === "rowKey" ? (r: Item) => `${r.id}${rate}`.slice(0, 1 + (rate > 1 ? 1 : 0)) : (r: Item) => r.id });
  capture(t);
  const { Table, Column } = t;
  return (
    <Table empty="none">
      <Column key={colKey} id={id} label={id} value={part === "value" ? (r: Item) => r.net * rate : (r: Item) => r.net} {...props} />
    </Table>
  );
}

describe("a stale column", () => {
  it.each(["value", "sort", "group", "rowKey"])("warns once for %s, naming the column", (part) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const id = `stale-${part}`;
    const { rerender } = render(<Probe rate={1} id={id} part={part} />);
    rerender(<Probe rate={2} id={id} part={part} />);
    rerender(<Probe rate={3} id={id} part={part} />);
    const found = part === "rowKey" ? warnings(warn, "rowKey") : warnings(warn, id);
    expect(found).toHaveLength(1);
    // A rowKey has no column to give a key to.
    expect(/`key`/.test(String(found[0]?.[0]))).toBe(part !== "rowKey");
  });

  it("stays silent for an unchanged closure, a field name and a native function", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    function Quiet({ n }: { n: number }) {
      const { Table, Column } = useTable(ITEMS, { rowKey: (r: Item) => r.id });
      return (
        <Table empty="none">
          <Column id="quiet-closure" label="a" value={(r: Item) => r.net * 2} />
          <Column id="quiet-field" label="b" value="net" />
          <Column id="quiet-native" label="c" value={(r: Item) => r.net} sortValue={Number} />
          <span hidden>{n}</span>
        </Table>
      );
    }
    const { rerender } = render(<Quiet n={1} />);
    rerender(<Quiet n={2} />);
    expect(warnings(warn, "quiet-")).toHaveLength(0);
    expect(warnings(warn, "outside the row")).toHaveLength(0);
  });

  it("a key that changes with the rate shows the new figures", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<Probe rate={1} colKey={1} id="keyed" part="value" />);
    const cells = () => screen.getAllByRole("cell").map((c) => c.textContent);
    expect(cells()).toEqual(["1", "2", "3"]);
    act(() => {
      current!.toggleSort("keyed");
      current!.setWidth("keyed", 222);
    });
    expect(cells()).toEqual(["3", "2", "1"]);
    rerender(<Probe rate={2} colKey={2} id="keyed" part="value" />);
    // The new figures, with the sort and the width the user chose.
    expect(cells()).toEqual(["6", "4", "2"]);
    expect(screen.getByRole("columnheader", { name: /keyed/ }).style.width).toBe("222px");
  });

  it("calls an accessor at most 1,000 times per side per render", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const rows = Array.from({ length: 5000 }, (_, i) => ({ id: String(i), net: i }));
    let n = 0;
    return import("../src/dev").then(({ probeStale: probe }) => {
      probe("count", (r: Item) => (n++, r.net), (r: Item) => (n++, r.net), rows);
      expect(n).toBe(2000);
    });
  });
});
