import { describe, expect, it } from "vitest";
import { column, tableModel } from "../src/model/tableModel";

interface Row {
  n: number;
}

describe("sort keys", () => {
  it("reads a row's sort value at most once per sort, not once per comparison", () => {
    const rows: Row[] = Array.from({ length: 200 }, (_, i) => ({ n: (i * 37) % 101 }));
    let reads = 0;
    const columns = [column<Row>("n", { label: "N", value: (r) => (reads++, r.n) })];
    const out = tableModel(rows, columns, { sort: { column: "n", direction: "asc" } });
    expect(reads).toBeLessThanOrEqual(rows.length);
    const seen = out.filtered.map((r) => r.n);
    expect(seen).toEqual([...seen].sort((a, b) => a - b));
  });
});
