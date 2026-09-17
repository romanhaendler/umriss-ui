/* Table model (table-model). The pipeline filter -> sort -> page is the
   guarantee: figures and the selection's keys come from the filtered set, not
   from the visible page. */

import { describe, expect, it } from "vitest";
import { column, sum, tableModel } from "../src/model/tableModel";

interface Row {
  id: string;
  project: string;
  budget: number;
}

const ROWS: Row[] = [
  { id: "p1", project: "Aurora", budget: 300 },
  { id: "p2", project: "Basalt", budget: 100 },
  { id: "p3", project: "Cirrus", budget: 200 },
  { id: "p4", project: "Dorado", budget: 100 },
  { id: "p5", project: "Änderung", budget: 500 },
];

const COLUMNS = [
  column<Row>("projekt", { value: (z) => z.project, searchable: true }),
  column<Row>("budget", { value: (z) => z.budget }),
];

const ids = (rows: readonly Row[]) => rows.map((z) => z.id);

describe("tableModel – the order of the steps", () => {
  it("filters before paging", () => {
    const projection = tableModel(ROWS, COLUMNS, { search: "a", pageSize: 2 });
    // Aurora, Basalt, Dorado match; Cirrus does not, and neither does
    // "Änderung" - a lower-case "ä" is not an "a".
    expect(ids(projection.filtered)).toEqual(["p1", "p2", "p4"]);
    expect(projection.visible).toHaveLength(2);
  });

  it("searches without regard to case, and only in searchable columns", () => {
    expect(ids(tableModel(ROWS, COLUMNS, { search: "AUROR" }).filtered)).toEqual(["p1"]);
    // budget is not searchable: the 300 must not match.
    expect(tableModel(ROWS, COLUMNS, { search: "300" }).filtered).toHaveLength(0);
  });

  it("sorts text by German collation", () => {
    const projection = tableModel(ROWS, COLUMNS, {
      sort: { column: "projekt", direction: "asc" },
    });
    // "Änderung" belongs to A in German, not behind Z.
    expect(ids(projection.filtered)[0]).toBe("p5");
  });

  it("sorts numbers numerically and in both directions", () => {
    const up = tableModel(ROWS, COLUMNS, { sort: { column: "budget", direction: "asc" } });
    const down = tableModel(ROWS, COLUMNS, { sort: { column: "budget", direction: "desc" } });
    expect(up.filtered[0]!.budget).toBe(100);
    expect(down.filtered[0]!.budget).toBe(500);
  });

  /* Equal values keep their order - otherwise rows jump when sorted again. p2
     stands before p4 and must stay that way. */
  it("sorts stably", () => {
    const projection = tableModel(ROWS, COLUMNS, { sort: { column: "budget", direction: "asc" } });
    expect(ids(projection.filtered).slice(0, 2)).toEqual(["p2", "p4"]);
  });
});

describe("tableModel – paging", () => {
  it("works out the page count and cuts the page out", () => {
    const projection = tableModel(ROWS, COLUMNS, { page: 2, pageSize: 2 });
    expect(projection.pageCount).toBe(3);
    expect(projection.visible).toHaveLength(2);
  });

  it("copes with an exact multiple of the page size", () => {
    const projection = tableModel(ROWS.slice(0, 4), COLUMNS, { page: 2, pageSize: 2 });
    expect(projection.pageCount).toBe(2);
    expect(projection.visible).toHaveLength(2);
  });

  it("clamps a page outside the range", () => {
    const projection = tableModel(ROWS, COLUMNS, { page: 99, pageSize: 2 });
    expect(projection.page).toBe(3);
    expect(projection.visible).toHaveLength(1);
  });

  /* Without a match the display used to say "page 1 of 1" while "next" was
     disabled at the same time - the state contradicted itself. */
  it("stays free of contradiction on an empty result", () => {
    const projection = tableModel(ROWS, COLUMNS, { search: "gibtesnicht", pageSize: 2 });
    expect(projection.filtered).toHaveLength(0);
    expect(projection.visible).toHaveLength(0);
    expect(projection.pageCount).toBe(1);
    expect(projection.page).toBe(1);
  });
});

describe("tableModel – figures and keys", () => {
  it("knows the column count from the description", () => {
    expect(tableModel(ROWS, COLUMNS, {}).columnCount).toBe(2);
  });

  it("sums over the filtered set, not over the page", () => {
    const projection = tableModel(ROWS, COLUMNS, { pageSize: 2 });
    expect(sum(projection.filtered, (z) => z.budget)).toBe(1200);
    expect(sum(projection.visible, (z) => z.budget)).not.toBe(1200);
  });

  it("hands out the filtered set, so that the selection reaches across pages", () => {
    const projection = tableModel(ROWS, COLUMNS, { search: "a", pageSize: 2 });
    expect(projection.filtered).toHaveLength(3);
    expect(projection.visible).toHaveLength(2);
  });
});

describe("tableModel – the additional filter", () => {
  it("joins free-text search and filter with AND", () => {
    const projection = tableModel(ROWS, COLUMNS, {
      search: "a",
      filter: (z) => z.budget >= 200,
    });
    // Aurora (300) matches both; Basalt and Dorado (100 each) drop out.
    expect(ids(projection.filtered)).toEqual(["p1"]);
  });

  it("acts even without a search term", () => {
    const projection = tableModel(ROWS, COLUMNS, { filter: (z) => z.budget === 100 });
    expect(ids(projection.filtered)).toEqual(["p2", "p4"]);
  });
});
