/* Visible columns (table-surface 05). Hiding and reordering act together -
   which is why the cases here check both at once and not only each on its own.
   The column count is derived, so that the empty state and the footer row go on
   spanning the table correctly. */

import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { column, tableModel } from "../src/model/tableModel";
import { useCompanion } from "../src/model/companion";

interface Row {
  id: string;
  project: string;
  budget: number;
  status: string;
}

const ROWS: Row[] = [
  { id: "a", project: "Aurora", budget: 300, status: "aktiv" },
  { id: "b", project: "Basalt", budget: 100, status: "ruht" },
];

/* The id column is fixed: it carries the row's identity and must not be
   switchable. */
const COLUMNS = [
  column<Row>("projekt", { label: "Projekt", value: (z) => z.project, hideable: false }),
  column<Row>("budget", { label: "Budget", value: (z) => z.budget }),
  column<Row>("status", { label: "Status", value: (z) => z.status }),
];

const ids = (columns: readonly { id: string }[]) => columns.map((s) => s.id);

describe("tableModel – visible columns", () => {
  it("gives every column in its order without being asked", () => {
    const projection = tableModel(ROWS, COLUMNS, {});
    expect(ids(projection.columns)).toEqual(["projekt", "budget", "status"]);
    expect(projection.columnCount).toBe(3);
  });

  it("leaves hidden columns out", () => {
    const projection = tableModel(ROWS, COLUMNS, { hidden: ["budget"] });
    expect(ids(projection.columns)).toEqual(["projekt", "status"]);
  });

  it("derives the column count from the visible columns", () => {
    // That is exactly what the empty state and the footer row hang on.
    expect(tableModel(ROWS, COLUMNS, { hidden: ["budget"] }).columnCount).toBe(2);
  });

  it("does not hide what is not hideable", () => {
    const projection = tableModel(ROWS, COLUMNS, { hidden: ["projekt", "budget"] });
    expect(ids(projection.columns)).toEqual(["projekt", "status"]);
  });

  it("passes over ids that do not exist", () => {
    const projection = tableModel(ROWS, COLUMNS, { hidden: ["gibtsnicht" as "budget"] });
    expect(ids(projection.columns)).toEqual(["projekt", "budget", "status"]);
  });

  it("reorders by the order given", () => {
    const projection = tableModel(ROWS, COLUMNS, { order: ["status", "budget", "projekt"] });
    expect(ids(projection.columns)).toEqual(["status", "budget", "projekt"]);
  });

  it("appends columns that are not named in natural order", () => {
    const projection = tableModel(ROWS, COLUMNS, { order: ["status"] });
    expect(ids(projection.columns)).toEqual(["status", "projekt", "budget"]);
  });

  it("passes over ids in the order that do not exist", () => {
    const projection = tableModel(ROWS, COLUMNS, {
      order: ["gibtsnicht" as "budget", "status"],
    });
    expect(ids(projection.columns)).toEqual(["status", "projekt", "budget"]);
  });

  it("hiding and reordering take hold together", () => {
    /* The case the error sits in, if it sits anywhere: order first, then hide -
       and the count must fit the result. */
    const projection = tableModel(ROWS, COLUMNS, {
      order: ["status", "budget", "projekt"],
      hidden: ["budget"],
    });
    expect(ids(projection.columns)).toEqual(["status", "projekt"]);
    expect(projection.columnCount).toBe(2);
  });

  it("leaves the rows untouched, whatever happens to the columns", () => {
    const projection = tableModel(ROWS, COLUMNS, {
      hidden: ["budget"],
      order: ["status"],
    });
    expect(projection.filtered.map((z) => z.id)).toEqual(["a", "b"]);
  });

  it("goes on sorting by a hidden column when the sort is by it", () => {
    /* Hiding is a question of presentation, not of the pipeline. Whoever sorts
       by budget and hides the column wants to keep the order. */
    const projection = tableModel(ROWS, COLUMNS, {
      hidden: ["budget"],
      sort: [{ column: "budget", direction: "asc" }],
    });
    expect(projection.filtered.map((z) => z.id)).toEqual(["b", "a"]);
  });
});

describe("useCompanion – switching columns", () => {
  const setUp = (pageSize = 10) =>
    renderHook(() => useCompanion(ROWS, COLUMNS, { rowKey: (z) => z.id, pageSize }));

  it("begins with every column visible", () => {
    const { result } = setUp();
    expect(ids(result.current.columns)).toEqual(["projekt", "budget", "status"]);
    expect(result.current.hidden).toEqual([]);
  });

  it("switches a column away and back again", () => {
    const { result } = setUp();
    act(() => result.current.toggleColumn("budget"));
    expect(ids(result.current.columns)).toEqual(["projekt", "status"]);
    act(() => result.current.toggleColumn("budget"));
    expect(ids(result.current.columns)).toEqual(["projekt", "budget", "status"]);
  });

  it("does not change the page when hiding", () => {
    // Unlike search, sort and page size: the set of rows does not change, so
    // there is nothing to reset.
    const { result } = setUp(1);
    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);
    act(() => result.current.toggleColumn("budget"));
    expect(result.current.page).toBe(2);
  });

  it("leaves the sort untouched when reordering", () => {
    const { result } = setUp();
    act(() => result.current.toggleSort("budget"));
    act(() => result.current.setOrder(["status", "projekt", "budget"]));
    expect(result.current.sortDirectionOf("budget")).toBe("asc");
    expect(ids(result.current.columns)).toEqual(["status", "projekt", "budget"]);
  });

  it("reports the column count to match the visible columns", () => {
    const { result } = setUp();
    act(() => result.current.toggleColumn("budget"));
    expect(result.current.columnCount).toBe(2);
  });
});
