/* A searchable date, number or boolean column is searched by the text its cell
   shows, not by its sort key. */

import { describe, expect, it } from "vitest";
import { DEFAULT_FORMATS, DEFAULT_WORDING } from "@umriss-ui/core";
import { Registry } from "../src/registry";
import type { ColumnSpec } from "../src/registry";
import { tableModel } from "../src/model/tableModel";

const rows = [
  { id: "a", at: new Date(2026, 2, 3, 9, 0), n: 1234.5, ok: true },
  { id: "b", at: new Date(2026, 9, 24, 14, 30), n: 7, ok: false },
];

const column = (id: string): ColumnSpec => ({ id, label: id, value: id, searchable: true, rowHeader: false, resizable: false });

const found = (search: string) => {
  const registry = new Registry();
  for (const id of ["at", "n", "ok"]) registry.registerColumn(id, column(id));
  const columns = registry.modelColumns(rows, DEFAULT_FORMATS, DEFAULT_WORDING);
  return tableModel(rows, columns, { search }).filtered.map((r) => r.id);
};

describe("search by the shown text", () => {
  it("finds what the cells show", () => {
    expect(found("2026")).toEqual(["a", "b"]);
    expect(found("24/10")).toEqual(["b"]);
    expect(found("1,234")).toEqual(["a"]);
    expect(found("yes")).toEqual(["a"]);
  });

  it("does not find the sort keys", () => {
    expect(found("17")).toEqual([]);
    expect(found("no")).toEqual(["b"]);
  });
});
