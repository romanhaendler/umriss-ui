/* A new row in a table that is a tree: its placeholder has as many cells as the head has columns. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTable } from "../src";

interface Unit {
  id: string;
  name: string;
  children?: Unit[];
}

const UNITS: Unit[] = [{ id: "v", name: "Sales", children: [{ id: "vn", name: "North" }] }];

function Units() {
  const { Table, Column, RowDetail } = useTable(UNITS, { rowKey: (u) => u.id, childRows: (u) => u.children });
  return (
    <Table grid ariaLabel="Units" onRowAdd={() => undefined} newRow={() => ({})}>
      <Column value="name" label="Unit" rowHeader edit="text" />
      <RowDetail>{(u) => <p>Detail of {u.name}</p>}</RowDetail>
    </Table>
  );
}

describe("A new row in a tree", () => {
  it("has as many cells as the head has columns", () => {
    const { container } = render(<Units />);
    fireEvent.click(screen.getByRole("button", { name: "New row" }));
    const head = container.querySelector("thead tr")!;
    const fresh = container.querySelector('tr[data-grid-line="new"]')!;
    expect(fresh.children.length).toBe(head.children.length);
  });
});
