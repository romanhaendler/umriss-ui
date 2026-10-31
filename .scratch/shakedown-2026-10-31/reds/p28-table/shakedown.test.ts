import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { act, renderHook } from "@testing-library/react";
import { useTableState } from "../src/model/tableState";
import { useTableSelection } from "../src/model/useTableSelection";
import { tableModel, column } from "../src/model/tableModel";
import { groupRows, linesOf, pageLines, isoWeek, aggregate } from "../src/model/grouping";
import { flexShares } from "../src/flexWidths";
import { asCsv } from "../src/model/csv";
import { onlyKnown } from "../src/model/view";

type R = { id: string; n: number | null; g: string };
const cols = [column<R>("n", { value: (r) => r.n }), column<R>("g", { value: (r) => r.g })];

describe("sort in the view", () => {
  it("a cleared sort survives view -> initialView when defaultSort is set", () => {
    const rows: R[] = [{ id: "a", n: 2, g: "x" }, { id: "b", n: 1, g: "x" }];
    const opts = { rowKey: (r: R) => r.id, defaultSort: { column: "n", direction: "asc" as const } };
    const a = renderHook(() => useTableState(rows, cols, opts));
    act(() => a.result.current.toggleSort("n", true)); // asc -> desc
    act(() => a.result.current.toggleSort("n", true)); // desc -> off
    expect(a.result.current.sort).toEqual([]);
    const kept = JSON.parse(JSON.stringify(a.result.current.view));
    const b = renderHook(() => useTableState(rows, cols, { ...opts, initialView: kept }));
    expect(b.result.current.sort).toEqual([]); // actual: default sort comes back
  });
});

describe("flexShares", () => {
  it("never yields NaN for flex 0", () => {
    expect(flexShares(100, [{ flex: 0 }]).every(Number.isFinite)).toBe(true);
  });
  it("property: >= min, sum <= max(free, mins)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2000 }),
        fc.array(fc.record({ flex: fc.integer({ min: 1, max: 5 }), min: fc.integer({ min: 0, max: 300 }) }), { minLength: 1, maxLength: 6 }),
        (free, items) => {
          const out = flexShares(free, items);
          const mins = items.reduce((s, i) => s + i.min, 0);
          return out.every((w, i) => w >= items[i]!.min - 1e-9) && out.reduce((a, b) => a + b, 0) <= Math.max(free, mins) + 1e-6;
        },
      ),
    );
  });
});

describe("pageLines", () => {
  it("property: each page <= size lines, every line once", () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.constantFrom("a", "b", "c"), fc.constantFrom("x", "y", "z")), { maxLength: 40 }),
        fc.integer({ min: 4, max: 9 }),
        fc.array(fc.constantFrom('["a"]', '["b"]'), { maxLength: 2 }),
        (pairs, size, folded) => {
          const rows = pairs.map(([g1, g2], i) => ({ i, g1, g2 }));
          const groups = groupRows(rows, { levels: [{ id: "g1", value: (r) => r.g1 }, { id: "g2", value: (r) => r.g2 }] });
          const lines = linesOf(groups, new Set(folded));
          const count = pageLines(lines, 1, size).pageCount;
          let seen = 0;
          for (let p = 1; p <= count; p++) {
            const page = pageLines(lines, p, size).lines;
            if (page.length > size) return false;
            seen += page.filter((l) => !(l.kind !== "folded" && "continued" in l && l.continued && l.kind === "header")).length;
          }
          return seen >= lines.length;
        },
      ),
      { numRuns: 300 },
    );
  });
});

describe("isoWeek", () => {
  it.each([
    ["2026-12-31T12:00:00Z", 53, 2026],
    ["2027-01-01T12:00:00Z", 53, 2026],
    ["2024-12-30T12:00:00Z", 1, 2025],
    ["2021-01-03T12:00:00Z", 53, 2020],
    ["2026-01-01T12:00:00Z", 1, 2026],
    ["2026-10-14T12:00:00Z", 42, 2026],
  ])("%s", (d, week, year) => {
    expect(isoWeek(new Date(d), "UTC")).toEqual({ week, year });
  });
});

describe("selection", () => {
  it("keys of rows that left the data are not selected when the id returns", () => {
    let ids = ["a", "b", "c"];
    const { result, rerender } = renderHook(() => useTableSelection(ids));
    act(() => result.current.toggleAll());
    ids = ["a"];
    rerender();
    ids = ["a", "b", "c"];
    rerender();
    expect(result.current.count).toBe(1); // actual: 3
  });
  it("count counts only keys present", () => {
    let ids = ["a", "b", "c"];
    const { result, rerender } = renderHook(() => useTableSelection(ids));
    act(() => result.current.toggleAll());
    ids = ["a"];
    rerender();
    expect(result.current.count).toBe(1); // actual: 3
  });
});

describe("model", () => {
  it("server mode with rowCount 0 keeps page > pageCount", () => {
    const p = tableModel<R>([], cols, { server: { rowCount: 0 }, page: 4, pageSize: 10 });
    expect(p.page).toBeLessThanOrEqual(p.pageCount);
  });
  it("sort: Infinity ties and -0 are stable", () => {
    const rows: R[] = [3, Infinity, -Infinity, Infinity, 0, -0, 1].map((n, i) => ({ id: String(i), n, g: "x" }));
    const p = tableModel(rows, cols, { sort: { column: "n", direction: "asc" } });
    expect(p.filtered.map((r) => r.id)).toEqual(["2", "4", "5", "6", "0", "1", "3"]);
  });
  it("group aggregate over strings-as-numbers", () => {
    expect(aggregate({ id: "n", read: (r: { n: unknown }) => r.n, aggregate: "sum" }, [{ n: "1" }, { n: "2" }])).toBe(3);
  });
});

describe("csv", () => {
  it("NaN is absent like everywhere else", () => {
    const csv = asCsv([{ n: NaN }], [{ id: "n", value: (r: { n: number }) => r.n }]);
    expect(csv.split("\r\n")[1]).toBe(""); // actual: "NaN"
  });
});

