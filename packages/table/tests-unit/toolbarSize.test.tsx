/* The size of a table toolbar: `Toolbar` says it once, and every control the
   table puts into it stands at it, unless the control says its own. */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColumnMenu, Export, Search, Toolbar, useTable } from "../src";

interface Order {
  id: string;
  number: string;
}

const ORDERS: Order[] = [
  { id: "1", number: "A-1" },
  { id: "2", number: "B-1" },
];

function Orders({ size, searchSize }: { size?: "sm" | "md"; searchSize?: "sm" | "md" }) {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id });
  return (
    <Table ariaLabel="Orders">
      <Toolbar size={size}>
        <Search size={searchSize} />
        <ColumnMenu />
        <Export onExport={() => {}} />
      </Toolbar>
      <Column value="number" label="Order" rowHeader />
    </Table>
  );
}

/* The search is a clearable field: its size stands on the wrapper. */
const searchSmall = () => screen.getByRole("searchbox").parentElement!.className.includes("wrapperSm");
const small = (element: HTMLElement) => element.className.split(" ").some((c) => /(^|_)sm(_|$)/.test(c));

describe("the toolbar's size", () => {
  it("is small without a statement, as it always was", () => {
    const { container } = render(<Orders />);
    expect(searchSmall()).toBe(true);
    expect(small(within(container).getByRole("button", { name: "Columns" }))).toBe(true);
    expect(small(within(container).getByRole("button", { name: /Export/ }))).toBe(true);
  });

  it("at md reaches the search, the column menu, the export and 'reset'", () => {
    const { container } = render(<Orders size="md" />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "A" } });
    expect(searchSmall()).toBe(false);
    expect(small(within(container).getByRole("button", { name: "Columns" }))).toBe(false);
    expect(small(within(container).getByRole("button", { name: /Export/ }))).toBe(false);
    expect(small(within(container).getByRole("button", { name: "Reset" }))).toBe(false);
  });

  it("a control's own size wins over the toolbar's", () => {
    render(<Orders size="md" searchSize="sm" />);
    expect(searchSmall()).toBe(true);
  });
});
