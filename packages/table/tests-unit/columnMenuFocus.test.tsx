import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColumnMenu, useTable } from "../src";

function Plant() {
  const { Table: Frame, Column } = useTable([{ id: "a", name: "A" }], { rowKey: (r) => r.id });
  return (
    <Frame>
      <ColumnMenu />
      <Column value="name" label="Name" />
    </Frame>
  );
}

describe("the column menu", () => {
  it("opens with the focus inside it", () => {
    render(<Plant />);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    const menu = screen.getByRole("dialog");
    expect(menu.contains(document.activeElement)).toBe(true);
  });
});
