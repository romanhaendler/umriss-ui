/* Row details and column widths (table-surface 06 and 08).

   Both are state of the model, not of the presentation - which is why they
   stand here and not in a rendering test. The widths additionally stand in the
   view, so the starting state belongs with them. */

import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { column } from "../src/model/tableModel";
import { useCompanion } from "../src/model/companion";

interface Row {
  id: string;
  project: string;
  budget: number;
}

const ROWS: Row[] = [
  { id: "a", project: "Aurora", budget: 300 },
  { id: "b", project: "Basalt", budget: 100 },
  { id: "c", project: "Cirrus", budget: 200 },
];

const COLUMNS = [
  column<Row>("projekt", { label: "Projekt", value: (z) => z.project, searchable: true, resizable: true }),
  column<Row>("budget", { label: "Budget", value: (z) => z.budget, resizable: true, width: 120 }),
];

const setUp = () =>
  renderHook(() => useCompanion(ROWS, COLUMNS, { rowKey: (z) => z.id, pageSize: 10 }));

describe("useCompanion – expanding rows", () => {
  it("begins with every row collapsed", () => {
    const { result } = setUp();
    expect(result.current.expanded).toEqual([]);
    expect(result.current.isExpanded("a")).toBe(false);
  });

  it("expands a row and collapses it again", () => {
    const { result } = setUp();
    act(() => result.current.toggleRow("a"));
    expect(result.current.isExpanded("a")).toBe(true);
    act(() => result.current.toggleRow("a"));
    expect(result.current.isExpanded("a")).toBe(false);
  });

  it("lets several rows be open at once", () => {
    // So that two rows can be compared side by side.
    const { result } = setUp();
    act(() => result.current.toggleRow("a"));
    act(() => result.current.toggleRow("c"));
    expect(result.current.expanded).toEqual(["a", "c"]);
  });

  it("holds an open row across a change of filter", () => {
    /* Decided deliberately: whoever filters, looks something up and widens the
       filter again would otherwise find his row collapsed. A key that occurs
       nowhere at the moment costs nothing. */
    const { result } = setUp();
    act(() => result.current.toggleRow("a"));
    act(() => result.current.setSearch("Basalt"));
    expect(result.current.visible.map((z) => z.id)).toEqual(["b"]);
    expect(result.current.isExpanded("a")).toBe(true);

    act(() => result.current.setSearch(""));
    expect(result.current.isExpanded("a")).toBe(true);
  });

  it("does not change the page when expanding", () => {
    const { result } = renderHook(() =>
      useCompanion(ROWS, COLUMNS, { rowKey: (z) => z.id, pageSize: 1 }),
    );
    act(() => result.current.setPage(2));
    act(() => result.current.toggleRow("b"));
    expect(result.current.page).toBe(2);
  });
});

describe("useCompanion – column widths", () => {
  it("takes the initial widths from the columns", () => {
    const { result } = setUp();
    expect(result.current.widths).toEqual({ budget: 120 });
  });

  it("sets a width", () => {
    const { result } = setUp();
    act(() => result.current.setWidth("projekt", 220));
    expect(result.current.widths.projekt).toBe(220);
  });

  it("takes the specification back instead of setting it to zero", () => {
    /* `undefined` means "fit to content", not "width zero" - the entry must
       disappear, so that the browser decides again. */
    const { result } = setUp();
    act(() => result.current.setWidth("budget", undefined));
    expect("budget" in result.current.widths).toBe(false);
  });

  it("leaves the remaining widths untouched", () => {
    const { result } = setUp();
    act(() => result.current.setWidth("projekt", 220));
    act(() => result.current.setWidth("budget", undefined));
    expect(result.current.widths).toEqual({ projekt: 220 });
  });

  it("does not change the page when dragging", () => {
    const { result } = renderHook(() =>
      useCompanion(ROWS, COLUMNS, { rowKey: (z) => z.id, pageSize: 1 }),
    );
    act(() => result.current.setPage(3));
    act(() => result.current.setWidth("projekt", 220));
    expect(result.current.page).toBe(3);
  });
});

describe("Widths in the view", () => {
  it("reports only the dragged ones, not the columns' specifications", () => {
    const { result } = setUp();
    expect(result.current.view).toEqual({});
    act(() => result.current.setWidth("projekt", 220));
    expect(result.current.view).toEqual({ widths: { projekt: 220 } });
  });

  it("takes widths from the view as the starting state", () => {
    const { result } = renderHook(() =>
      useCompanion(ROWS, COLUMNS, { rowKey: (z) => z.id, initialView: { widths: { projekt: 180 } } }),
    );
    // The view beats the columns' specification - as with the sort.
    expect(result.current.widths).toEqual({ projekt: 180 });
  });
});
