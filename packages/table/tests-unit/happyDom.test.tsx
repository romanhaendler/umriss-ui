// @vitest-environment happy-dom
/* A table rendered under happy-dom, whose `tHead` has no `rows` collection. */

import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { useTable } from "../src";

const ROWS = [
  { id: "a", name: "Anna" },
  { id: "b", name: "Bo" },
];

function People() {
  const { Table, Column } = useTable(ROWS, { rowKey: (r) => r.id });
  return (
    <Table aria-label="People">
      <Column value="id" label="Id" rowHeader />
      <Column value="name" label="Name" />
    </Table>
  );
}

it("renders with a header and rows", () => {
  render(<People />);
  expect(screen.getByRole("table", { name: "People" })).toBeTruthy();
  expect(screen.getAllByRole("row").length).toBe(3);
});
