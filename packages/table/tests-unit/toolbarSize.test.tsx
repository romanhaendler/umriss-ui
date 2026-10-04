/* The size of a table toolbar: `Toolbar` says it once, and every control the
   table puts into it stands at it, unless the control says its own. */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, MultiSelect, Select } from "@umriss-ui/core";
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

/* A control from @umriss-ui/core that a caller puts into the toolbar takes
   the toolbar's size without a word (control-sizes 03, ADR-0041): it used to
   stand at its own `md` beside the `sm` search unless the caller said `sm`. */
function OwnControls({ size, own }: { size?: "sm" | "md"; own?: "sm" | "md" }) {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id });
  return (
    <Table ariaLabel="Orders">
      <Toolbar size={size}>
        <Select aria-label="Status" size={own}>
          <option>Open</option>
        </Select>
        <MultiSelect aria-label="Carriers" value={[]} onChange={() => {}} options={[]} />
        <Button>Assign</Button>
      </Toolbar>
      <Column value="number" label="Order" rowHeader />
    </Table>
  );
}

const smallWithin = (element: HTMLElement) =>
  [element, ...element.querySelectorAll<HTMLElement>("*")].some((e) =>
    [...e.classList].some((c) => /(^|_)(sm|\w+Sm)_/.test(c)),
  );

describe("a control of one's own in the toolbar", () => {
  it("takes the toolbar's sm", () => {
    render(<OwnControls />);
    expect(smallWithin(screen.getByRole("combobox", { name: "Status" }).parentElement!)).toBe(true);
    expect(smallWithin(screen.getByRole("button", { name: "Carriers" }).parentElement!)).toBe(true);
    expect(small(screen.getByRole("button", { name: "Assign" }))).toBe(true);
  });

  it("takes the toolbar's md", () => {
    render(<OwnControls size="md" />);
    expect(smallWithin(screen.getByRole("combobox", { name: "Status" }).parentElement!)).toBe(false);
    expect(smallWithin(screen.getByLabelText("Carriers"))).toBe(false);
    expect(small(screen.getByRole("button", { name: "Assign" }))).toBe(false);
  });

  it("keeps its own size", () => {
    render(<OwnControls own="md" />);
    expect(smallWithin(screen.getByRole("combobox", { name: "Status" }).parentElement!)).toBe(false);
  });
});
