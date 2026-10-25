/* A current row set from outside is brought into view; focus stays put. */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination, useTable } from "../src";

const ROWS = Array.from({ length: 10 }, (_, i) => ({ id: `r${i + 1}`, name: `Row ${i + 1}` }));

function Rows({ currentRow }: { currentRow: string | null }) {
  const { Table, Column } = useTable(ROWS, { rowKey: (r) => r.id, pageSize: 3 });
  return (
    <>
      <input aria-label="Elsewhere" />
      <Table currentRow={currentRow}>
        <Column value="name" label="Name" rowHeader />
        <Pagination />
      </Table>
    </>
  );
}

describe("The current row comes into view", () => {
  it("a key on page 3 moves the table to page 3, focus stays", () => {
    const { rerender } = render(<Rows currentRow={null} />);
    screen.getByLabelText("Elsewhere").focus();
    rerender(<Rows currentRow="r8" />);
    expect(screen.getByText("Row 8").closest("tr")!.getAttribute("aria-current")).toBe("true");
    expect(screen.queryByText("Row 1")).toBeNull();
    expect(document.activeElement).toBe(screen.getByLabelText("Elsewhere"));
  });

  it("a key outside the filtered set changes neither page nor focus", () => {
    const { rerender } = render(<Rows currentRow={null} />);
    screen.getByLabelText("Elsewhere").focus();
    rerender(<Rows currentRow="nope" />);
    expect(screen.getByText("Row 1")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Elsewhere"));
  });
});
