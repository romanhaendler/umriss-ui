/* A row that leaves `rows` leaves the selection - but not while the table is `loading`: the application
   says the rows are not settled, as when a refetch empties them for a moment. */

import { useEffect, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTable } from "../src";

interface Item {
  id: string;
  name: string;
}
const ROWS: Item[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
];

let set: (rows: Item[], loading: boolean) => void = () => {};
function Refetching() {
  const [state, setState] = useState({ rows: ROWS, loading: false });
  useEffect(() => {
    set = (rows, loading) => setState({ rows, loading });
  }, []);
  const t = useTable(state.rows, { rowKey: (r) => r.id });
  const { Table, Column } = t;
  return (
    <>
      <Table aria-label="Items" selectable loading={state.loading}>
        <Column value="name" label="Name" rowHeader />
      </Table>
      <output data-testid="held">{[...t.selection.selected].join(",")}</output>
    </>
  );
}

const held = () => screen.getByTestId("held").textContent;

describe("the selection when rows change", () => {
  it("stays while loading empties and refills the rows", () => {
    render(<Refetching />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Alpha" }));
    expect(held()).toBe("a");
    act(() => set([], true));
    expect(held()).toBe("a");
    act(() => set(ROWS, false));
    expect(held()).toBe("a");
  });

  it("still drops a row that has left without loading", () => {
    render(<Refetching />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Alpha" }));
    act(() => set([ROWS[1]!], false));
    expect(held()).toBe("");
  });
});
