/* What a table with tree rows draws and how it is worked (table-tree-rows):
   the roots, a fold in the row header that opens the next level indented, the
   group fold's keys, the open branches in the view, and the rules the footer,
   the export and the combinations follow. The case is an uneven organisation. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColumnMenu, Pagination, useTable } from "../src";
import type { Table, TableView } from "../src";

interface Unit {
  id: string;
  name: string;
  budget: number;
  children?: Unit[];
}

const UNITS: Unit[] = [
  {
    id: "v",
    name: "Sales",
    budget: 300,
    children: [
      { id: "vn", name: "North", budget: 120, children: [{ id: "vnh", name: "Hamburg", budget: 70 }, { id: "vnk", name: "Kiel", budget: 50 }] },
      { id: "vs", name: "South", budget: 180 },
    ],
  },
  { id: "s", name: "Staff", budget: 40 },
  { id: "e", name: "Empty", budget: 0, children: [] },
];

let current: Table<Unit> | null = null;
const capture = (t: Table<Unit>) => {
  current = t;
};

function Units({
  initialView,
  defaultBranches,
  detail = false,
  paged = false,
  grid = false,
  menu = false,
  grouped = false,
}: {
  menu?: boolean;
  grouped?: boolean;
  initialView?: TableView;
  defaultBranches?: number | string[];
  detail?: boolean;
  paged?: boolean;
  grid?: boolean;
}) {
  const t = useTable(UNITS, {
    rowKey: (u) => u.id,
    childRows: (u) => u.children,
    initialView,
    defaultBranches,
    defaultGrouping: grouped ? "budget" : undefined,
  });
  capture(t);
  const { Table: Frame, Column, RowDetail } = t;
  return (
    <Frame ariaLabel="Organisation" grid={grid}>
      {paged && <Pagination />}
      {menu && <ColumnMenu />}
      <Column value="name" label="Unit" rowHeader searchable />
      <Column value="budget" label="Budget" aggregate="sum" />
      {detail && <RowDetail>{(u) => (u.children ? null : <p>Detail of {u.name}</p>)}</RowDetail>}
    </Frame>
  );
}

const bodyRows = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLTableRowElement>("tbody tr[data-motion]"));
const names = (root: HTMLElement) => bodyRows(root).map((tr) => tr.querySelector("th")?.textContent?.replace(/,.*$/, "").trim());

afterEach(() => {
  current = null;
  vi.restoreAllMocks();
});

describe("tree rows - the fold", () => {
  it("shows the roots, and a fold opens the next level beneath its row", () => {
    const { container } = render(<Units />);
    expect(names(container)).toEqual(["Sales", "Staff", "Empty"]);
    fireEvent.click(screen.getByRole("button", { name: "Unfold rows under Sales" }));
    expect(names(container)).toEqual(["Sales", "North", "South", "Staff", "Empty"]);
    expect(screen.getByRole("button", { name: "Fold rows under Sales" }).getAttribute("aria-expanded")).toBe("true");
  });

  it("gives a leaf and an empty branch no fold", () => {
    render(<Units />);
    expect(screen.queryByRole("button", { name: /Staff/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Empty/ })).toBeNull();
  });

  it("is a tree grid whose rows carry level, position, set size and state", () => {
    const { container } = render(<Units defaultBranches={1} />);
    expect(screen.getByRole("treegrid", { name: "Organisation" })).toBeTruthy();
    const [sales, north] = bodyRows(container);
    expect(sales).toMatchObject({ ariaLevel: "1", ariaPosInSet: "1", ariaSetSize: "3", ariaExpanded: "true" });
    expect(north).toMatchObject({ ariaLevel: "2", ariaPosInSet: "1", ariaSetSize: "2", ariaExpanded: "false" });
  });

  it("names the fold apart from the row detail's expander", () => {
    render(<Units detail />);
    expect(screen.getByRole("button", { name: "Expand Staff" })).toBeTruthy();
    expect(screen.queryAllByRole("button", { name: /Staff/ })).toHaveLength(1);
    expect(screen.queryAllByRole("button", { name: /Sales/ })).toHaveLength(1);
  });

  it("gives a row whose detail is nothing no expander and no detail line", () => {
    const { container } = render(<Units detail defaultBranches={1} />);
    expect(screen.queryByRole("button", { name: "Expand Sales" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Expand Staff" }));
    expect(screen.getByText("Detail of Staff")).toBeTruthy();
    act(() => current!.toggleRow("v"));
    expect(container.querySelectorAll("tbody tr:not([data-motion])")).toHaveLength(1);
  });

  it("answers the group fold's keys: Right opens, Left closes, Left on a closed one goes to the parent", () => {
    render(<Units />);
    const sales = screen.getByRole("button", { name: "Unfold rows under Sales" });
    fireEvent.keyDown(sales, { key: "ArrowRight" });
    const north = screen.getByRole("button", { name: "Unfold rows under North" });
    fireEvent.keyDown(north, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fold rows under Sales" }));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(current?.branches).toEqual([]);
  });

  it("opens a branch with its siblings on Alt", () => {
    render(<Units defaultBranches={1} />);
    fireEvent.click(screen.getByRole("button", { name: "Unfold rows under North" }), { altKey: true });
    expect(current?.branches).toEqual(["v", "vn"]);
  });
});

describe("tree rows - the column that carries the tree", () => {
  it("is the first visible column, wherever the row header stands", () => {
    function CodeFirst() {
      const { Table: Frame, Column } = useTable(UNITS, { rowKey: (u) => u.id, childRows: (u) => u.children, defaultBranches: 1 });
      return (
        <Frame>
          <Column value="id" label="Code" />
          <Column value="name" label="Unit" rowHeader />
        </Frame>
      );
    }
    const { container } = render(<CodeFirst />);
    const [sales, north] = bodyRows(container);
    expect(sales!.cells[0]!.querySelector("button")?.getAttribute("aria-label")).toBe("Fold rows under Sales");
    expect(north!.cells[0]!.querySelector("[style]")?.getAttribute("style")).toContain("--tree-level: 1");
  });
});

describe("tree rows - open branches and the view", () => {
  it("opens to a depth on the first render and leaves the default out of the view", () => {
    const { container } = render(<Units defaultBranches={2} />);
    expect(names(container)).toEqual(["Sales", "North", "Hamburg", "Kiel", "South", "Staff", "Empty"]);
    expect(current?.view.branches).toBeUndefined();
    act(() => current!.toggleBranch("vn"));
    expect(current?.view.branches).toEqual(["v"]);
  });

  it("takes the open branches of a kept view and drops a key that no longer occurs", () => {
    render(<Units initialView={{ branches: ["v", "gone"] }} />);
    expect(current?.branches).toEqual(["v"]);
    expect(current?.view.branches).toEqual(["v"]);
  });

  it("unfolds every branch with content and folds them all", () => {
    const { container } = render(<Units />);
    act(() => current!.unfoldAllBranches());
    expect(names(container)).toHaveLength(7);
    act(() => current!.foldAllBranches());
    expect(names(container)).toEqual(["Sales", "Staff", "Empty"]);
  });
});

describe("tree rows - search, footer, export", () => {
  it("shows a match with its path, mutes the path and says so", () => {
    const { container } = render(<Units />);
    act(() => current!.setSearch("kiel"));
    expect(names(container)).toEqual(["Sales", "North", "Kiel"]);
    expect(screen.getAllByText(/on the path to a match/)).toHaveLength(2);
    expect(current?.rowCount).toBe(1);
    act(() => current!.setSearch(""));
    expect(names(container)).toEqual(["Sales", "Staff", "Empty"]);
  });

  it("leaves the open branches alone when a fold is pressed on the way to a match", () => {
    const { container } = render(<Units />);
    act(() => current!.setSearch("kiel"));
    fireEvent.click(screen.getByRole("button", { name: "Fold rows under Sales" }));
    expect(current?.branches).toEqual([]);
    act(() => current!.setSearch(""));
    expect(names(container)).toEqual(["Sales", "Staff", "Empty"]);
  });

  it("warns once when a key occurs twice in the tree", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    function Twice() {
      const twice: Unit[] = [{ id: "a", name: "A", budget: 1, children: [{ id: "a", name: "A again", budget: 1 }] }];
      const { Table: Frame, Column } = useTable(twice, { rowKey: (u) => u.id, childRows: (u) => u.children });
      return (
        <Frame>
          <Column value="id" label="Id" rowHeader />
        </Frame>
      );
    }
    render(<Twice />);
    expect(warn.mock.calls.some(([message]) => String(message).includes('"a" occurs twice'))).toBe(true);
  });

  it("sums the top level in the footer, never a parent and its children", () => {
    const { container } = render(<Units defaultBranches={2} />);
    expect(container.querySelector("tfoot")?.textContent).toContain("340");
  });

  it("exports every row of the filtered tree with its level, open or not", () => {
    render(<Units />);
    act(() => current!.setSearch("kiel"));
    const lines = current!.asCsv().replace(/^﻿/, "").split("\r\n");
    expect(lines).toEqual(["Level;Unit;Budget", "1;Sales;300", "2;North;120", "3;Kiel;50"]);
  });
});

describe("tree rows - combinations", () => {
  it("passes pagination over with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Units paged />);
    expect(screen.queryByRole("navigation")).toBeNull();
    act(() => current!.unfoldAllBranches());
    expect(names(container)).toHaveLength(7);
    expect(warn.mock.calls.some(([message]) => String(message).includes("Pagination"))).toBe(true);
  });

  it("offers no grouping in the column menu, but unfolds and folds every branch", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Units menu grouped />);
    expect(current?.grouping).toEqual([]);
    expect(warn.mock.calls.some(([message]) => String(message).includes("grouping is passed over"))).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    expect(screen.queryByRole("button", { name: /^Group by/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Unfold all" }));
    expect(names(container)).toHaveLength(7);
    fireEvent.click(screen.getByRole("button", { name: "Fold all" }));
    expect(names(container)).toHaveLength(3);
  });
});

describe("tree rows - grid mode", () => {
  it("keeps the arrows on the cells, and Enter reaches the fold", () => {
    render(<Units grid />);
    const salesCell = screen.getByRole("rowheader", { name: /Sales/ });
    act(() => salesCell.focus());
    fireEvent.keyDown(salesCell, { key: "ArrowRight" });
    expect(document.activeElement?.textContent).toContain("300");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    const fold = screen.getByRole("button", { name: "Unfold rows under Sales" });
    expect(document.activeElement).toBe(fold);
    fireEvent.keyDown(fold, { key: "ArrowRight" });
    expect(current?.branches).toEqual(["v"]);
  });
});
