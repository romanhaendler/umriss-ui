/* Manual mode in the model (table-server-mode 01, M1): the rows are the page a
   server answered. The model passes them through as they came and only counts
   the pages from the server's total. */

import { describe, expect, it } from "vitest";
import { column, tableModel } from "../src/model/tableModel";
import { manualViewKey } from "../src/model/view";

interface Row {
  id: string;
  project: string;
  budget: number;
}

/* Deliberately unsorted, and with a row the search below would drop: the
   server answered this page, and the table has no business second-guessing it. */
const PAGE: Row[] = [
  { id: "p7", project: "Cirrus", budget: 200 },
  { id: "p3", project: "Aurora", budget: 300 },
  { id: "p9", project: "Basalt", budget: 100 },
];

const COLUMNS = [
  column<Row>("project", { value: (z) => z.project, searchable: true }),
  column<Row>("budget", { value: (z) => z.budget }),
];

describe("tableModel – manual mode", () => {
  it("passes the rows through untouched: no search, no filter, no sort, no paging", () => {
    const projection = tableModel(PAGE, COLUMNS, {
      manual: { rowCount: 1_000_000 },
      search: "aur",
      filter: (z) => z.budget > 150,
      sort: { column: "budget", direction: "asc" },
      page: 4,
      pageSize: 2,
    });
    expect(projection.filtered).toEqual(PAGE);
    expect(projection.visible).toEqual(PAGE);
    projection.visible.forEach((row, i) => expect(row).toBe(PAGE[i]));
    // The model's arrays are its own - sorting one later must not reorder the caller's page.
    expect(projection.visible).not.toBe(PAGE);
  });

  it("counts the pages from the server's total", () => {
    const projection = tableModel(PAGE, COLUMNS, { manual: { rowCount: 1_000_000 }, page: 4, pageSize: 25 });
    expect(projection.pageCount).toBe(40_000);
    expect(projection.page).toBe(4);
  });

  it("clamps the page against a known total", () => {
    const projection = tableModel(PAGE, COLUMNS, { manual: { rowCount: 30 }, page: 9, pageSize: 10 });
    expect(projection.page).toBe(3);
  });

  it("keeps a requested page while no total is known yet", () => {
    // The first request is still out: a view's page three must survive it.
    const projection = tableModel([], COLUMNS, { manual: { rowCount: 0 }, page: 3, pageSize: 10 });
    expect(projection.page).toBe(3);
    expect(projection.pageCount).toBe(1);
  });

  it("groups nothing (M3)", () => {
    const projection = tableModel(PAGE, COLUMNS, {
      manual: { rowCount: 3 },
      grouping: { levels: [{ id: "project", value: (z) => z.project }], folded: new Set() },
    });
    expect(projection.groups).toBeUndefined();
    expect(projection.visibleLines).toBeUndefined();
  });

  it("still orders and hides columns - they are the table's, not the server's", () => {
    const projection = tableModel(PAGE, COLUMNS, { manual: { rowCount: 3 }, order: ["budget"], hidden: ["project"] });
    expect(projection.columns.map((c) => c.id)).toEqual(["budget"]);
  });
});

describe("manualViewKey - what is reported once", () => {
  const view = { search: "", conditions: {}, sort: [], page: 1, pageSize: 10 };

  it("is the same for the same rows-deciding view, whatever else the view carries", () => {
    expect(manualViewKey({ ...view, widths: { project: 200 }, hidden: ["budget"] })).toBe(manualViewKey(view));
  });

  it("changes with each of the five parts that decide the rows", () => {
    const changed = [
      { ...view, search: "aur" },
      { ...view, conditions: { line: ["L2"] } },
      { ...view, sort: [{ column: "budget", direction: "asc" as const }] },
      { ...view, page: 2 },
      { ...view, pageSize: 25 },
    ].map(manualViewKey);
    expect(new Set([manualViewKey(view), ...changed]).size).toBe(6);
  });
});
