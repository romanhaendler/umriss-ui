/* A column keeps its accessor only while it keeps its id: columns mapped from
   the data with the index as `key` show the numbers of the year in the header. */

import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

interface Plant {
  id: string;
  byYear: Record<number, number>;
}
const PLANTS: Plant[] = [
  { id: "p", byYear: { 2024: 1, 2025: 20, 2026: 300 } },
  { id: "q", byYear: { 2024: 2, 2025: 30, 2026: 400 } },
];

function Matrix({ years }: { years: number[] }) {
  const { Table, Column } = useTable(PLANTS, { rowKey: (r) => r.id });
  return (
    <Table empty="none">
      <Column id="plant" label="Plant" value={(r: Plant) => r.id} rowHeader />
      {years.map((y, i) => (
        <Column key={i} id={`y${y}`} label={String(y)} value={(r: Plant) => r.byYear[y]} aggregate="sum" />
      ))}
    </Table>
  );
}

afterEach(() => vi.restoreAllMocks());

describe("a column whose id changes", () => {
  it("takes its new accessors, and no duplicate id is reported", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<Matrix years={[2024, 2025]} />);
    rerender(<Matrix years={[2025, 2026]} />);
    const cells = screen
      .getAllByRole("row")
      .flatMap((r) => within(r).queryAllByRole("cell").map((c) => c.textContent));
    const flat = cells.join(" ");
    expect(flat).toContain("300");
    expect(flat).toContain("700"); // 2026 footer: 300 + 400
    expect(flat).toContain("50"); // 2025 footer: 20 + 30
    expect(cells).not.toContain("1");
    expect(warn.mock.calls.some(([m]) => String(m).includes("Two columns carry"))).toBe(false);
  });

  it("still reports two columns that share an id", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    function Twice() {
      const { Table, Column } = useTable(PLANTS, { rowKey: (r) => r.id });
      return (
        <Table empty="none">
          <Column id="same-id" label="A" value={(r: Plant) => r.id} />
          <Column id="same-id" label="B" value={(r: Plant) => r.id} />
        </Table>
      );
    }
    render(<Twice />);
    expect(warn.mock.calls.filter(([m]) => String(m).includes('"same-id"'))).toHaveLength(1);
  });
});
