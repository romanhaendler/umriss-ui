/* The table's model: ISO weeks, a cleared sort in the view, flex shares, mixed
   numbers and strings, open filter bounds, editOptions that is no array, and
   the day-only date column. */

import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTable } from "../src";
import type { Table } from "../src";
import { isoWeek } from "../src/model/grouping";
import { flexShares } from "../src/flexWidths";
import { column } from "../src/model/tableModel";
import { useTableState } from "../src/model/tableState";

const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
afterEach(() => warn.mockClear());
const said = (needle: string) => warn.mock.calls.filter((c) => String(c[0]).includes(needle));

describe("isoWeek", () => {
  it.each([
    ["2026-12-31", 53, 2026],
    ["2027-01-01", 53, 2026],
    ["2024-12-30", 1, 2025],
    ["2021-01-03", 53, 2020],
    ["2026-01-01", 1, 2026],
    ["2026-10-14", 42, 2026],
  ])("%s", (d, week, year) => {
    expect(isoWeek(new Date(`${d}T12:00:00Z`), "UTC")).toEqual({ week, year });
  });

  /* The Thursday rule: a week belongs to the year of its Thursday, and is that
     year's week 1 plus the weeks since its first Thursday. */
  it("agrees with the Thursday rule on every day of 2020-2030", () => {
    for (let t = Date.UTC(2020, 0, 1, 12); t < Date.UTC(2031, 0, 1); t += 86_400_000) {
      const day = new Date(t);
      const thursday = new Date(t + (3 - ((day.getUTCDay() + 6) % 7)) * 86_400_000);
      const year = thursday.getUTCFullYear();
      let first = new Date(Date.UTC(year, 0, 1, 12));
      while (first.getUTCDay() !== 4) first = new Date(first.getTime() + 86_400_000);
      const week = 1 + Math.round((thursday.getTime() - first.getTime()) / (7 * 86_400_000));
      expect(isoWeek(day, "UTC"), day.toISOString()).toEqual({ week, year });
    }
  });
});

describe("a cleared sort", () => {
  it("survives view -> initialView when defaultSort is set", () => {
    type R = { id: string; n: number };
    const rows: R[] = [{ id: "a", n: 2 }, { id: "b", n: 1 }];
    const cols = [column<R>("n", { value: (r) => r.n })];
    const opts = { rowKey: (r: R) => r.id, defaultSort: { column: "n", direction: "asc" as const } };
    const a = renderHook(() => useTableState(rows, cols, opts));
    act(() => a.result.current.toggleSort("n", true));
    act(() => a.result.current.toggleSort("n", true));
    expect(a.result.current.sort).toEqual([]);
    const kept = JSON.parse(JSON.stringify(a.result.current.view));
    const b = renderHook(() => useTableState(rows, cols, { ...opts, initialView: kept }));
    expect(b.result.current.sort).toEqual([]);
  });
});

describe("flexShares", () => {
  it("never yields NaN for flex 0", () => {
    expect(flexShares(100, [{ flex: 0 }]).every(Number.isFinite)).toBe(true);
    expect(flexShares(100, [{ flex: 0 }, { flex: 1 }])).toEqual([0, 100]);
  });
});

interface Row {
  id: string;
  n: number;
  d: Date;
  mode: string;
}
let current: Table<Row> | null = null;
const capture = (t: Table<Row>) => {
  current = t;
};

function Grid({ rows, options, aggregate }: { rows: Row[]; options?: unknown; aggregate?: boolean }) {
  const t = useTable<Row>(rows, { rowKey: (r) => r.id });
  capture(t);
  return (
    <t.Table aria-label="x" grid>
      <t.Column value="id" label="Id" rowHeader />
      <t.Column value="n" label="N" filter="range" aggregate={aggregate ? "sum" : undefined} />
      <t.Column value="d" label="D" />
      <t.Column value="mode" label="Mode" edit="select" editOptions={options as string[]} />
    </t.Table>
  );
}
const day = (n: number) => new Date(2026, 0, n);

describe("numbers that meet a string", () => {
  it("a numeric column warns once, naming the column and the fix", () => {
    const rows = [{ id: "a", n: 1, d: day(1), mode: "x" }, { id: "b", n: "2" as unknown as number, d: day(1), mode: "x" }];
    const { rerender } = render(<Grid rows={rows} />);
    rerender(<Grid rows={rows} />);
    expect(said('"n"')).toHaveLength(1);
    expect(said("sortValue={Number}")).toHaveLength(1);
  });

  it("stays silent for numbers", () => {
    render(<Grid rows={[{ id: "a", n: 1, d: day(1), mode: "x" }]} />);
    expect(said("not coerced")).toHaveLength(0);
  });

  it("an aggregate over strings warns too", () => {
    render(<Grid rows={[{ id: "a", n: "1" as unknown as number, d: day(1), mode: "x" }]} aggregate />);
    expect(said('has the aggregate "sum"')).toHaveLength(1);
  });
});

describe("filters", () => {
  const rows = [
    { id: "a", n: Infinity, d: day(1), mode: "x" },
    { id: "b", n: -Infinity, d: day(1), mode: "x" },
    { id: "c", n: 5, d: day(1), mode: "x" },
  ];
  it("an open bound keeps an infinite value", () => {
    render(<Grid rows={rows} />);
    act(() => current!.setFilter("n", { from: 0 }));
    expect(current!.filtered.map((r) => r.id)).toEqual(["a", "c"]);
    act(() => current!.setFilter("n", { to: 10 }));
    expect(current!.filtered.map((r) => r.id)).toEqual(["b", "c"]);
  });

  it("a text condition with join: undefined is an AND condition", () => {
    const Text = () => {
      const t = useTable(rows, { rowKey: (r) => r.id });
      capture(t);
      return (
        <t.Table>
          <t.Column value="id" label="Id" filter="text" />
        </t.Table>
      );
    };
    render(<Text />);
    act(() => current!.setFilter("id", { join: undefined, terms: [{ operator: "contains", value: "a" }] }));
    expect(current!.filtered.map((r) => r.id)).toEqual(["a"]);
  });
});

describe("editOptions", () => {
  it("that is no array warns and offers nothing", () => {
    render(<Grid rows={[{ id: "a", n: 1, d: day(1), mode: "x" }]} options="Auto" />);
    const cell = screen.getByText("x").closest<HTMLElement>("td")!;
    act(() => cell.focus());
    fireEvent.focus(cell);
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    const select = screen.getByLabelText("Edit Mode: a") as HTMLSelectElement;
    expect(Array.from(select.options).filter((o) => o.value !== "")).toHaveLength(0);
    expect(said("not an array")).toHaveLength(1);
  });
});

describe("a date column without a format", () => {
  const cell = () => screen.getAllByRole("row")[1]!.querySelectorAll("td, th")[2]!.textContent;
  it("shows only the day when every value is local midnight", () => {
    render(<Grid rows={[{ id: "a", n: 1, d: day(1), mode: "x" }, { id: "b", n: 1, d: day(2), mode: "x" }]} />);
    expect(cell()).not.toMatch(/:/);
  });
  it("shows the time when one value has one", () => {
    render(<Grid rows={[{ id: "a", n: 1, d: day(1), mode: "x" }, { id: "b", n: 1, d: new Date(2026, 0, 2, 9, 5), mode: "x" }]} />);
    expect(cell()).toMatch(/:/);
  });
});
