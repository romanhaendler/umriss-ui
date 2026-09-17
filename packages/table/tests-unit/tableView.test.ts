/* The view, as the companion reports it (table-surface 02).

   The guarantee at stake: what is reported is what deviates from the default. An
   untouched table yields an empty view - whoever keeps it keeps nothing the user
   did not do. */

import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { column } from "../src/model/tableModel";
import { useCompanion } from "../src/model/companion";

interface Row {
  id: string;
  project: string;
}

const ROWS: Row[] = [
  { id: "a", project: "Aurora" },
  { id: "b", project: "Basalt" },
];

const COLUMNS = [column<Row>("projekt", { label: "Projekt", value: (z) => z.project })];

const setUp = (pageSize?: number) =>
  renderHook(() => useCompanion(ROWS, COLUMNS, { rowKey: (z) => z.id, pageSize }));

describe("useCompanion – what is reported is the non-default", () => {
  it("reports nothing for an untouched table", () => {
    const { result } = setUp();
    expect(result.current.view).toEqual({});
  });

  it("does not report a page size set differently either", () => {
    // The application's setting is its default, not the ten.
    const { result } = setUp(25);
    expect(result.current.view).toEqual({});
  });

  it("reports the page size as soon as the user changes it", () => {
    const { result } = setUp(10);
    act(() => result.current.setPageSize(25));
    expect(result.current.view).toEqual({ pageSize: 25 });
  });

  it("reports the search as soon as something stands in it", () => {
    const { result } = setUp();
    act(() => result.current.setSearch("aur"));
    expect(result.current.view).toEqual({ search: "aur" });
  });

  it("reports the page only from page two on", () => {
    const { result } = setUp(1);
    expect(result.current.view.page).toBeUndefined();
    act(() => result.current.setPage(2));
    expect(result.current.view.page).toBe(2);
  });

  it("does not report the application's default as a sort", () => {
    const { result } = renderHook(() =>
      useCompanion(ROWS, COLUMNS, {
        rowKey: (z) => z.id,
        defaultSort: { column: "projekt", direction: "asc" },
      }),
    );
    expect(result.current.view).toEqual({});
  });

  it("reports the sort as soon as it deviates from the default", () => {
    const { result } = renderHook(() =>
      useCompanion(ROWS, COLUMNS, {
        rowKey: (z) => z.id,
        defaultSort: { column: "projekt", direction: "asc" },
      }),
    );
    act(() => result.current.toggleSort("projekt"));
    expect(result.current.view).toEqual({ sort: [{ column: "projekt", direction: "desc" }] });
  });

  it("passes on the sort of a view handed in", () => {
    /* The comparison is against the default, not against the view handed in -
       otherwise a kept view would lose exactly the sort it was kept for. */
    const { result } = renderHook(() =>
      useCompanion(ROWS, COLUMNS, {
        rowKey: (z) => z.id,
        defaultSort: { column: "projekt", direction: "asc" },
        initialView: { sort: [{ column: "projekt", direction: "desc" }] },
      }),
    );
    expect(result.current.view).toEqual({ sort: [{ column: "projekt", direction: "desc" }] });
  });

  it("reports hidden columns and the order", () => {
    const { result } = setUp();
    act(() => result.current.toggleColumn("projekt"));
    expect(result.current.view.hidden).toEqual(["projekt"]);
  });
});

describe("useCompanion – a view handed in", () => {
  it("takes over search and sort", () => {
    const { result } = renderHook(() =>
      useCompanion(ROWS, COLUMNS, {
        rowKey: (z) => z.id,
        initialView: { search: "aur", sort: [{ column: "projekt", direction: "desc" }] },
      }),
    );
    expect(result.current.search).toBe("aur");
    expect(result.current.sortDirectionOf("projekt")).toBe("desc");
  });

  it("clamps a page beyond the range instead of staying empty", () => {
    /* A kept page 999 must not yield an empty table: the number stays, the
       model clamps it. */
    const { result } = renderHook(() =>
      useCompanion(ROWS, COLUMNS, { rowKey: (z) => z.id, pageSize: 1, initialView: { page: 999 } }),
    );
    expect(result.current.page).toBe(2);
    expect(result.current.visible).toHaveLength(1);
  });

  it("lets the view beat the application's default", () => {
    const { result } = renderHook(() =>
      useCompanion(ROWS, COLUMNS, {
        rowKey: (z) => z.id,
        defaultSort: { column: "projekt", direction: "asc" },
        initialView: { sort: [{ column: "projekt", direction: "desc" }] },
      }),
    );
    expect(result.current.sortDirectionOf("projekt")).toBe("desc");
  });
});
