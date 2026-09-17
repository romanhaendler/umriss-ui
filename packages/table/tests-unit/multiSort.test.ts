/* Multi-level sorting (table-surface 04). The sort is an ordered list of
   levels: the second level decides only what the first leaves open. A
   single-level list is the previous behaviour - which is exactly what the older
   tests in tableModel.test.ts check, and they stay unchanged. */

import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { column, tableModel } from "../src/model/tableModel";
import { useCompanion } from "../src/model/companion";

interface Row {
  id: string;
  department: string;
  budget: number;
}

/* Deliberately built so that the department alone does not decide: three rows
   share "Bau", two share "Cafe". */
const ROWS: Row[] = [
  { id: "a", department: "Bau", budget: 200 },
  { id: "b", department: "Cafe", budget: 100 },
  { id: "c", department: "Bau", budget: 300 },
  { id: "d", department: "Cafe", budget: 100 },
  { id: "e", department: "Bau", budget: 200 },
];

const COLUMNS = [
  column<Row>("abteilung", { label: "Abteilung", value: (z) => z.department }),
  column<Row>("budget", { label: "Budget", value: (z) => z.budget }),
];

const ids = (rows: readonly Row[]) => rows.map((z) => z.id);

describe("tableModel – multi-level sorting", () => {
  it("lets the second level decide only what the first leaves open", () => {
    const projection = tableModel(ROWS, COLUMNS, {
      sort: [
        { column: "abteilung", direction: "asc" },
        { column: "budget", direction: "desc" },
      ],
    });
    // Bau before Cafe; within Bau descending 300, 200, 200.
    expect(ids(projection.filtered)).toEqual(["c", "a", "e", "b", "d"]);
  });

  it("turns the second level without touching the first", () => {
    const projection = tableModel(ROWS, COLUMNS, {
      sort: [
        { column: "abteilung", direction: "asc" },
        { column: "budget", direction: "asc" },
      ],
    });
    expect(ids(projection.filtered)).toEqual(["a", "e", "c", "b", "d"]);
  });

  it("stays stable in the last level", () => {
    // a and e share department and budget: their input order stays.
    const projection = tableModel(ROWS, COLUMNS, {
      sort: [
        { column: "abteilung", direction: "asc" },
        { column: "budget", direction: "asc" },
      ],
    });
    const found = ids(projection.filtered);
    expect(found.indexOf("a")).toBeLessThan(found.indexOf("e"));
  });

  it("takes a single level just as it takes a list holding one level", () => {
    const single = tableModel(ROWS, COLUMNS, {
      sort: { column: "budget", direction: "asc" },
    });
    const asList = tableModel(ROWS, COLUMNS, {
      sort: [{ column: "budget", direction: "asc" }],
    });
    expect(ids(single.filtered)).toEqual(ids(asList.filtered));
  });

  it("ignores levels whose column does not exist", () => {
    const projection = tableModel(ROWS, COLUMNS, {
      sort: [
        { column: "gibtsnicht" as "budget", direction: "asc" },
        { column: "budget", direction: "asc" },
      ],
    });
    expect(ids(projection.filtered)).toEqual(ids(tableModel(ROWS, COLUMNS, {
      sort: [{ column: "budget", direction: "asc" }],
    }).filtered));
  });

  it("leaves the order untouched when the list is empty", () => {
    expect(ids(tableModel(ROWS, COLUMNS, { sort: [] }).filtered)).toEqual(
      ids(ROWS),
    );
  });
});

describe("useCompanion – switching sort levels", () => {
  const setUp = () =>
    renderHook(() => useCompanion(ROWS, COLUMNS, { rowKey: (z) => z.id, pageSize: 10 }));

  it("begins without a sort", () => {
    const { result } = setUp();
    expect(result.current.sort).toEqual([]);
    expect(result.current.sortDirectionOf("budget")).toBeUndefined();
  });

  it("replaces the whole list without the modifier key", () => {
    const { result } = setUp();
    act(() => result.current.toggleSort("abteilung"));
    act(() => result.current.toggleSort("budget", true));
    expect(result.current.sort).toHaveLength(2);

    act(() => result.current.toggleSort("abteilung"));
    expect(result.current.sort).toEqual([{ column: "abteilung", direction: "asc" }]);
  });

  it("turns between up and down without the modifier key, as before", () => {
    const { result } = setUp();
    act(() => result.current.toggleSort("budget"));
    expect(result.current.sortDirectionOf("budget")).toBe("asc");
    act(() => result.current.toggleSort("budget"));
    expect(result.current.sortDirectionOf("budget")).toBe("desc");
    // The third press switches back to up - not off.
    act(() => result.current.toggleSort("budget"));
    expect(result.current.sortDirectionOf("budget")).toBe("asc");
  });

  it("appends a level with the modifier key", () => {
    const { result } = setUp();
    act(() => result.current.toggleSort("abteilung"));
    act(() => result.current.toggleSort("budget", true));
    expect(result.current.sort).toEqual([
      { column: "abteilung", direction: "asc" },
      { column: "budget", direction: "asc" },
    ]);
  });

  it("turns the level concerned with the modifier key and leaves the others standing", () => {
    const { result } = setUp();
    act(() => result.current.toggleSort("abteilung"));
    act(() => result.current.toggleSort("budget", true));
    act(() => result.current.toggleSort("budget", true));
    expect(result.current.sort).toEqual([
      { column: "abteilung", direction: "asc" },
      { column: "budget", direction: "desc" },
    ]);
  });

  it("takes the level out at the end of its cycle and leaves the rest untouched", () => {
    const { result } = setUp();
    act(() => result.current.toggleSort("abteilung"));
    act(() => result.current.toggleSort("budget", true));
    act(() => result.current.toggleSort("budget", true)); // desc
    act(() => result.current.toggleSort("budget", true)); // out
    expect(result.current.sort).toEqual([{ column: "abteilung", direction: "asc" }]);
  });

  it("reports the rank of a level only from two levels on", () => {
    const { result } = setUp();
    act(() => result.current.toggleSort("abteilung"));
    expect(result.current.sortRankOf("abteilung")).toBeUndefined();

    act(() => result.current.toggleSort("budget", true));
    expect(result.current.sortRankOf("abteilung")).toBe(1);
    expect(result.current.sortRankOf("budget")).toBe(2);
  });

  it("resets to page one when the sort changes", () => {
    const { result } = renderHook(() =>
      useCompanion(ROWS, COLUMNS, { rowKey: (z) => z.id, pageSize: 2 }),
    );
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
    act(() => result.current.toggleSort("budget", true));
    expect(result.current.page).toBe(1);
  });

  it("sorts the projection by every level", () => {
    const { result } = setUp();
    act(() => result.current.toggleSort("abteilung"));
    act(() => result.current.toggleSort("budget", true));
    act(() => result.current.toggleSort("budget", true)); // desc
    expect(ids(result.current.filtered)).toEqual(["c", "a", "e", "b", "d"]);
  });
});
