/* Absent values in the model (umriss-table 07). The copy of tableModel is
   extended by exactly this rule; the copied tests in tableModel.test.ts stay
   unchanged and green.

   An absent value stands last in BOTH directions. A table whose gaps jump to
   the top when it is reversed shows the user first of all what it does not
   know. */

import { describe, expect, it } from "vitest";
import { column, tableModel } from "../src/model/tableModel";

interface Row {
  id: string;
  name: string | null;
  value: number | null;
  group: string;
}

const ROWS: Row[] = [
  { id: "a", name: "Cirrus", value: 2, group: "x" },
  { id: "b", name: null, value: null, group: "x" },
  { id: "c", name: "Aurora", value: Number.NaN, group: "y" },
  { id: "d", name: "Basalt", value: 1, group: "y" },
];

const COLUMNS = [
  column<Row>("name", { value: (z) => z.name, searchable: true }),
  column<Row>("value", { value: (z) => z.value }),
  column<Row>("group", { value: (z) => z.group }),
];

const ids = (rows: readonly Row[]) => rows.map((z) => z.id);

describe("absent values sort last", () => {
  it("ascending", () => {
    const projection = tableModel(ROWS, COLUMNS, { sort: { column: "value", direction: "asc" } });
    expect(ids(projection.filtered)).toEqual(["d", "a", "b", "c"]);
  });

  it("descending likewise", () => {
    const projection = tableModel(ROWS, COLUMNS, { sort: { column: "value", direction: "desc" } });
    expect(ids(projection.filtered)).toEqual(["a", "d", "b", "c"]);
  });

  it("for text as for numbers", () => {
    const projection = tableModel(ROWS, COLUMNS, { sort: { column: "name", direction: "desc" } });
    expect(ids(projection.filtered)).toEqual(["a", "d", "c", "b"]);
  });

  it("and leave two absent ones to the next level", () => {
    const projection = tableModel(ROWS, COLUMNS, {
      sort: [
        { column: "value", direction: "asc" },
        { column: "group", direction: "desc" },
      ],
    });
    expect(ids(projection.filtered)).toEqual(["d", "a", "c", "b"]);
  });
});

describe("absent values in the search", () => {
  it("are matched by no term - not even by 'null'", () => {
    const projection = tableModel(ROWS, COLUMNS, { search: "null" });
    expect(ids(projection.filtered)).toEqual([]);
  });
});
