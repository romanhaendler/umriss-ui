/* A body cell under a column group is announced with its group: the headers a
   screen reader reads for it are the group cell (scope "colgroup", spanning the
   cell's column) and the column cell (scope "col"), "Q1, Jan". */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColumnGroup, useTable } from "../src";

function Report() {
  const { Table, Column } = useTable([{ id: "a", name: "Bolt", jan: 1, apr: 4 }], { rowKey: (r) => r.id });
  return (
    <Table aria-label="Report">
      <Column value="name" label="Name" rowHeader />
      <ColumnGroup label="Q1">
        <Column value="jan" label="Jan" />
      </ColumnGroup>
      <Column value="apr" label="Apr" />
    </Table>
  );
}

/* The column headers of the cell at a grid position, as the HTML table model
   assigns them: every `th` of the head whose span covers the column. */
function headersOf(table: HTMLTableElement, column: number): string[] {
  return Array.from(table.querySelectorAll("thead tr")).flatMap((row) => {
    let start = 0;
    return Array.from((row as HTMLTableRowElement).cells).flatMap((cell) => {
      const covers = column >= start && column < start + cell.colSpan;
      start += cell.colSpan;
      return covers && cell.textContent ? [cell.textContent] : [];
    });
  });
}

describe("a cell under a column group", () => {
  it("has the group and then the column as its headers", () => {
    const { container } = render(<Report />);
    const table = container.querySelector("table")!;
    const cells = Array.from(table.querySelectorAll("tbody tr")[0]!.children);
    const jan = cells.findIndex((cell) => cell.textContent === "1");
    const apr = cells.findIndex((cell) => cell.textContent === "4");
    expect(headersOf(table, jan).join(", ")).toBe("Q1, Jan");
    expect(headersOf(table, apr).join(", ")).toBe("Apr");
  });
});
