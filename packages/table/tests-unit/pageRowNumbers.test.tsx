/* A page tells assistive technology where its rows stand in the whole set:
   aria-rowcount and aria-rowindex count head, rows and footer of every page,
   and paging by the pager's steps says the new range politely. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination, useTable } from "../src";

const ROWS = Array.from({ length: 30 }, (_, i) => ({ id: `r${i}`, n: i, g: i < 15 ? "A" : "B" }));

function Paged({ grouped = false, bar = true }: { grouped?: boolean; bar?: boolean }) {
  const { Table: Frame, Column } = useTable(ROWS, {
    rowKey: (r) => r.id,
    pageSize: 10,
    defaultGrouping: grouped ? ["g"] : undefined,
  });
  return (
    <Frame aria-label="P">
      {bar && <Pagination />}
      <Column value="g" label="G" />
      <Column value="n" label="N" aggregate="sum" />
    </Frame>
  );
}

const index = (tr: Element) => tr.getAttribute("aria-rowindex");
const bodyIndexes = (root: HTMLElement) => Array.from(root.querySelectorAll("tbody tr")).map(index);


describe("a paged table", () => {
  it("numbers its rows within the whole set on page 1 and on a later page", () => {
    const { container } = render(<Paged />);
    const table = container.querySelector("table")!;
    expect(table.getAttribute("aria-rowcount")).toBe("32");
    expect(Array.from(container.querySelectorAll("thead tr")).map(index)).toEqual(["1"]);
    expect(bodyIndexes(container)[0]).toBe("2");
    expect(bodyIndexes(container)[9]).toBe("11");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(bodyIndexes(container)[0]).toBe("12");
    expect(bodyIndexes(container)[9]).toBe("21");
    expect(index(container.querySelector("tfoot tr")!)).toBe("32");
  });

  it("numbers grouped lines within the whole set", () => {
    const { container } = render(<Paged grouped />);
    const table = container.querySelector("table")!;
    // 30 rows + 2 group headers + head + footer
    expect(table.getAttribute("aria-rowcount")).toBe("34");
    expect(bodyIndexes(container)[0]).toBe("2");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    const first = container.querySelector("tbody tr[aria-rowindex]")!;
    expect(Number(index(first))).toBeGreaterThan(9);
  });

  it("is unchanged without a Pagination", () => {
    const { container } = render(<Paged bar={false} />);
    expect(container.querySelector("table")!.hasAttribute("aria-rowcount")).toBe(false);
    expect(container.querySelector("tbody tr")!.hasAttribute("aria-rowindex")).toBe(false);
  });

  it("says the new range politely after a step, and nothing before or for a page size", () => {
    render(<Paged />);
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "25" } });
    expect(screen.queryByRole("status")).toBeNull();
    const next = screen.getByRole("button", { name: "Next page" });
    fireEvent.click(next);
    expect(screen.getByRole("status").textContent).toBe("26–30 of 30");
  });
});
