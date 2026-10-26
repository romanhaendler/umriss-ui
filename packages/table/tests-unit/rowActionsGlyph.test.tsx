/* The row-actions trigger draws the "more" glyph, not a character. */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toolbar, useTable } from "../src";
import type { Table } from "../src";

interface Order {
  id: string;
  number: string;
}

const ORDERS: Order[] = [{ id: "a", number: "A-1" }];

function List() {
  const t: Table<Order> = useTable(ORDERS, { rowKey: (a) => a.id });
  const { Table: Frame, Column, RowActions, Action } = t;
  return (
    <Frame>
      <Toolbar />
      <Column value="number" label="Order" rowHeader />
      <RowActions>
        <Action onSelect={() => undefined}>Open</Action>
        <Action onSelect={() => undefined}>Archive</Action>
        <Action onSelect={() => undefined}>Copy</Action>
      </RowActions>
    </Frame>
  );
}

describe("Row actions trigger", () => {
  it("holds a drawn glyph and no text, and keeps its name", () => {
    render(<List />);
    const trigger = screen.getByRole("button", { name: "Actions: A-1" });
    expect(trigger.querySelector("svg")).not.toBeNull();
    expect(trigger.textContent).toBe("");
  });
});
