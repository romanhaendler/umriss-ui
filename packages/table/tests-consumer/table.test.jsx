/* What an application's test does with the installed package: it renders a table the way a user
   sees it and reads the DOM. check:dist runs this file under Vitest and under Jest, in a project
   that has only the lines core's README gives. `React` is imported because Vite's own transform
   of a .jsx file is the classic one. */

import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useTable } from "@umriss-ui/table";

const ORDERS = [
  { number: "A-2041", customer: "Brandt Metalworks", quantity: 120 },
  { number: "A-2042", customer: "Keller & Sons", quantity: 48 },
  { number: "A-2043", customer: "Northworks", quantity: 1250 },
];

function Orders() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number });
  return (
    <Table aria-label="Orders">
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="quantity" label="Quantity" />
    </Table>
  );
}

const firstColumn = () => screen.getAllByRole("rowheader").map((cell) => cell.textContent);

it("sorts the rows by a column", async () => {
  render(<Orders />);
  expect(firstColumn()).toEqual(["A-2041", "A-2042", "A-2043"]);

  fireEvent.click(within(await screen.findByRole("columnheader", { name: /Quantity/ })).getByRole("button"));
  expect(firstColumn()).toEqual(["A-2042", "A-2041", "A-2043"]);
  expect(screen.getByRole("columnheader", { name: /Quantity/ }).getAttribute("aria-sort")).toBe("ascending");
});
