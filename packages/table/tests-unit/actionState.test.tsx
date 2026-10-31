/* Ticket 32: `disabled` and `hidden` per row on `Action`. Seam: the public
   `useTable` parts rendered as a table. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toolbar, useTable } from "../src";

const disabled = (el: HTMLElement) => (el as HTMLButtonElement).disabled;

interface Order {
  id: string;
  number: string;
  status: "open" | "cancelled";
}

const ORDERS: Order[] = [
  { id: "a", number: "A-1", status: "open" },
  { id: "b", number: "A-2", status: "cancelled" },
  { id: "c", number: "A-3", status: "open" },
];

function Orders({ onCancel, onBulk }: { onCancel: (o: Order) => void; onBulk: (list: Order[]) => void }) {
  const t = useTable(ORDERS, { rowKey: (o) => o.id });
  const { Table: Frame, Column, RowActions, Action } = t;
  return (
    <Frame selectable>
      <Toolbar />
      <Column value="number" label="Order" rowHeader />
      <Column value="status" label="Status" />
      <RowActions>
        <Action disabled={(o) => o.status === "cancelled"} onSelect={onCancel}>
          Cancel
        </Action>
        <Action hidden={(o) => o.status === "open"} onSelect={() => undefined}>
          Reopen
        </Action>
        <Action bulk disabled={(o) => o.status === "cancelled"} onSelect={onBulk}>
          Approve
        </Action>
      </RowActions>
    </Frame>
  );
}

function AllHidden() {
  const t = useTable(ORDERS, { rowKey: (o) => o.id });
  const { Table: Frame, Column, RowActions, Action } = t;
  return (
    <Frame>
      <Column value="number" label="Order" rowHeader />
      <RowActions>
        <Action hidden onSelect={() => undefined}>
          Cancel
        </Action>
      </RowActions>
    </Frame>
  );
}

describe("Action disabled and hidden per row", () => {
  it("a disabled action stays in the row's menu, unavailable", () => {
    render(<Orders onCancel={vi.fn()} onBulk={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Actions: A-2" }));
    expect(disabled(screen.getByRole("menuitem", { name: "Cancel" }))).toBe(true);
  });

  it("a hidden action is absent from the rows it is hidden on", () => {
    render(<Orders onCancel={vi.fn()} onBulk={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Reopen: A-1" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Actions: A-2" }));
    expect(screen.getByRole("menuitem", { name: "Reopen" })).toBeTruthy();
  });

  it("a row menu disappears when no action is left for it", () => {
    render(<AllHidden />);
    expect(screen.queryByRole("button", { name: /Actions: A-/ })).toBeNull();
  });

  it("a bulk action acts on the selected rows where it is enabled, and says how many", () => {
    const onBulk = vi.fn();
    render(<Orders onCancel={vi.fn()} onBulk={onBulk} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select A-1" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select A-2" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select A-3" }));
    const approve = screen.getByRole("button", { name: "Approve (2 of 3)" });
    fireEvent.click(approve);
    expect(onBulk).toHaveBeenCalledTimes(1);
    const [list] = onBulk.mock.calls[0] as [Order[]];
    expect(list.map((o) => o.number)).toEqual(["A-1", "A-3"]);
  });

  it("a bulk action disabled for every selected row is disabled in the toolbar", () => {
    render(<Orders onCancel={vi.fn()} onBulk={vi.fn()} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select A-2" }));
    expect(disabled(screen.getByRole("button", { name: "Approve (0 of 1)" }))).toBe(true);
  });
});
