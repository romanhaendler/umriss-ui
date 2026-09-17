/* Row detail and row actions (umriss-table 09). */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination, Toolbar, useTable } from "../src";
import type { Table } from "../src";

interface Order {
  id: string;
  number: string;
  line: string;
}

const ORDERS: Order[] = [
  { id: "a", number: "A-1", line: "L2" },
  { id: "b", number: "A-2", line: "L1" },
  { id: "c", number: "B-3", line: "L1" },
];

let current: Table<Order> | null = null;
const capture = (t: Table<Order>) => {
  current = t;
};

function List({
  onOpen = () => undefined,
  onArchive = () => undefined,
  third = false,
}: {
  onOpen?: (a: Order) => void;
  onArchive?: (a: readonly Order[]) => void;
  third?: boolean;
}) {
  const t = useTable(ORDERS, { rowKey: (a) => a.id, pageSize: 2 });
  capture(t);
  const { Table: Frame, Column, RowDetail, RowActions, Action } = t;
  return (
    <Frame selectable>
      <Toolbar />
      <Column value="number" label="Order" rowHeader />
      <Column value="line" label="Line" />
      <RowDetail>{(a) => <p>Detail {a.number}</p>}</RowDetail>
      <RowActions>
        <Action onSelect={onOpen}>Open</Action>
        <Action bulk onSelect={onArchive}>
          Archive
        </Action>
        {third && <Action onSelect={() => undefined}>Copy</Action>}
      </RowActions>
      <Pagination />
    </Frame>
  );
}

describe("Row actions", () => {
  it("a row action gets the row and is named after it", () => {
    const onOpen = vi.fn();
    render(<List onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "Open: A-2" }));
    expect(onOpen).toHaveBeenCalledWith(ORDERS[1]);
  });

  it("a bulk action at the row gets a list made of that one row", () => {
    const onArchive = vi.fn();
    render(<List onArchive={onArchive} />);
    fireEvent.click(screen.getByRole("button", { name: "Archive: A-1" }));
    expect(onArchive).toHaveBeenCalledWith([ORDERS[0]]);
  });

  it("in the toolbar it gets the selection across all pages - within the filtered set", () => {
    const onArchive = vi.fn();
    const { container } = render(<List onArchive={onArchive} />);
    expect(within(container.querySelector("div")!).queryByText(/selected/)).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select A-1" }));
    act(() => current!.setPage(2));
    expect(screen.queryByRole("checkbox", { name: "Select A-1" })).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select B-3" }));
    expect(screen.getByText("2 selected")).toBeTruthy();
    // The button in the toolbar is the one without a row name.
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(onArchive).toHaveBeenLastCalledWith([ORDERS[0], ORDERS[2]]);

    act(() => current!.setSearch("B"));
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(onArchive).toHaveBeenLastCalledWith([ORDERS[2]]);
  });

  it("from three actions on, all of them stand in a menu named after the row", () => {
    render(<List third />);
    expect(screen.queryByRole("button", { name: "Open: A-1" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Actions: A-1" }));
    expect(screen.getAllByRole("menuitem").map((m) => m.textContent)).toEqual(["Open", "Archive", "Copy"]);
  });
});

describe("Row detail", () => {
  it("the table sets the expander, named after the row, and the detail row spans every column", () => {
    const { container } = render(<List />);
    const button = screen.getByRole("button", { name: "Expand A-1" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const detail = document.getElementById(button.getAttribute("aria-controls")!)!;
    expect(detail.textContent).toBe("Detail A-1");
    const columns = container.querySelector("thead tr")!.children.length;
    expect(detail.querySelector("td")!.colSpan).toBe(columns);
    expect(screen.getByRole("button", { name: "Collapse A-1" })).toBe(button);
  });

  it("several rows may be open, and they stay open across a change of filter", () => {
    render(<List />);
    fireEvent.click(screen.getByRole("button", { name: "Expand A-1" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand A-2" }));
    expect(screen.getByText("Detail A-1")).toBeTruthy();
    expect(screen.getByText("Detail A-2")).toBeTruthy();
    act(() => current!.setSearch("B"));
    expect(screen.queryByText("Detail A-1")).toBeNull();
    act(() => current!.setSearch(""));
    expect(screen.getByText("Detail A-1")).toBeTruthy();
    expect(screen.getByText("Detail A-2")).toBeTruthy();
  });
});
