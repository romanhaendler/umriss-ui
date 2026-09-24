/* Grouping in the interface (table-grouping 03): the option, the view, the
   group key without a column, the column menu and the chip in the table
   toolbar. What the body draws is table-grouping 04. */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColumnMenu, Toolbar, useTable } from "../src";
import type { Table, TableView } from "../src";

interface Order {
  id: string;
  line: string;
  customer: string;
  quantity: number;
  start: Date;
  tags: string[];
}

const at = (d: number, h: number) => new Date(2026, 9, d, h);

const ORDERS: Order[] = [
  { id: "A-1041", line: "Line 1", customer: "Brenner GmbH", quantity: 1200, start: at(2, 7), tags: [] },
  { id: "A-1044", line: "Line 1", customer: "Brenner GmbH", quantity: 800, start: at(2, 15), tags: [] },
  { id: "A-1052", line: "Line 1", customer: "Kessler AG", quantity: 2400, start: at(3, 23), tags: [] },
  { id: "A-1043", line: "Line 2", customer: "Brenner GmbH", quantity: 5000, start: at(2, 8), tags: [] },
];

const shiftOf = (d: Date) => (d.getHours() < 6 || d.getHours() >= 22 ? "Night" : d.getHours() < 14 ? "Early" : "Late");

let current: Table<Order> | null = null;
const capture = (t: Table<Order>) => {
  current = t;
};

function Orders({
  start,
  defaultGrouping,
  groupable,
}: {
  start?: TableView;
  defaultGrouping?: string | readonly string[];
  groupable?: boolean;
}) {
  const t = useTable(ORDERS, { rowKey: (o) => o.id, defaultGrouping, initialView: start });
  capture(t);
  const { Table: Frame, Column, GroupBy } = t;
  return (
    <Frame groupable={groupable}>
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <Column value="id" label="Order" rowHeader />
      <Column value="line" label="Line" />
      <Column value="customer" label="Customer" />
      <Column value="quantity" label="Quantity" aggregate="sum" groupable={false} />
      <Column value="tags" label="Tags">
        {(tags) => tags.join(", ")}
      </Column>
      <GroupBy id="shift" value={(o) => shiftOf(o.start)} label="Shift" />
    </Frame>
  );
}

const openMenu = () => {
  fireEvent.click(screen.getByRole("button", { name: "Columns" }));
  return screen.getByRole("dialog");
};

describe("the grouping as state", () => {
  it("starts from defaultGrouping, which the view leaves out", () => {
    render(<Orders defaultGrouping={["line", "customer"]} />);
    expect(current!.grouping).toEqual(["line", "customer"]);
    expect(current!.view.grouping).toBeUndefined();
    act(() => current!.setGrouping(["customer"]));
    expect(current!.view.grouping).toEqual(["customer"]);
  });

  it("takes grouping and folds from the view and gives them back", () => {
    const folded = [JSON.stringify(["value:Line 1"])];
    render(<Orders start={{ grouping: ["line", "customer"], folded }} />);
    expect(current!.grouping).toEqual(["line", "customer"]);
    expect(current!.view.folded).toEqual(folded);
    act(() => current!.unfoldAll());
    expect(current!.view.folded).toBeUndefined();
    act(() => current!.foldAll());
    // Line 1 and Brenner GmbH on Line 1 - the groups of one order do not fold.
    expect(current!.view.folded).toHaveLength(2);
  });

  it("lets names fall out that no column and no group key carries, and keeps three levels at most", () => {
    render(<Orders start={{ grouping: ["line", "plant", "shift", "customer", "id"] }} />);
    expect(current!.grouping).toEqual(["line", "shift", "customer"]);
  });

  it("does not group by a column that says groupable={false}, or by a value without a text form", () => {
    render(<Orders />);
    act(() => current!.setGrouping(["quantity", "tags", "line"]));
    expect(current!.grouping).toEqual(["line"]);
  });

  it("toggles a fold by the group's path", () => {
    render(<Orders defaultGrouping="line" />);
    const path = JSON.stringify(["value:Line 2"]);
    act(() => current!.toggleFold(path));
    expect(current!.folded).toEqual([]); // Line 2 has one order: nothing to fold
    const line1 = JSON.stringify(["value:Line 1"]);
    act(() => current!.toggleFold(line1));
    expect(current!.folded).toEqual([line1]);
  });
});

describe("the column menu", () => {
  it("offers the groupable columns and the group keys, and groups by the one chosen", () => {
    render(<Orders />);
    const menu = within(openMenu());
    const offered = menu.getAllByRole("button", { name: /^Group by / }).map((b) => b.getAttribute("aria-label"));
    expect(offered).toEqual(["Group by Order", "Group by Line", "Group by Customer", "Group by Shift"]);
    fireEvent.click(menu.getByRole("button", { name: "Group by Shift" }));
    expect(current!.grouping).toEqual(["shift"]);
    expect(menu.getByRole("button", { name: "Group by Shift" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("does not list a group key among the columns, and the export leaves it out", () => {
    render(<Orders />);
    const menu = within(openMenu());
    expect(menu.queryByRole("checkbox", { name: "Shift" })).toBeNull();
    expect(current!.asCsv().split("\n")[0]).not.toContain("Shift");
  });

  it("offers no grouping in a table that says groupable={false}", () => {
    render(<Orders groupable={false} />);
    expect(within(openMenu()).queryByRole("button", { name: /^Group by / })).toBeNull();
  });
});

describe("the chip in the table toolbar", () => {
  it("names the levels in order and takes the grouping away", () => {
    render(<Orders defaultGrouping={["line", "shift"]} />);
    const chip = screen.getByRole("group", { name: "Grouped by" });
    expect(chip.textContent).toContain("Line›Shift");
    fireEvent.click(within(chip).getByRole("button", { name: "Remove grouping" }));
    expect(current!.grouping).toEqual([]);
    expect(screen.queryByRole("group", { name: "Grouped by" })).toBeNull();
  });
});
