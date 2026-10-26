/* Rows that are not an array read as none: the table shows its empty state and, in development, warns once
   with the keys that arrived. Rows still loading say nothing. */

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

function Grid({ rows }: { rows: unknown }) {
  const { Table, Column } = useTable(rows as { a: number }[], { rowKey: (r) => String(r.a) });
  return (
    <Table aria-label="Grid">
      <Column value="a" label="A" />
    </Table>
  );
}

afterEach(() => vi.restoreAllMocks());

describe("rows that are not an array", () => {
  it("renders the empty state and warns once, naming the keys", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const columns = { alpha: [1], beta: [2], gamma: [3], delta: [4] };
    const { rerender } = render(<Grid rows={columns} />);
    rerender(<Grid rows={columns} />);
    expect(document.querySelector("tbody td[colspan]")).not.toBeNull();
    expect(screen.queryAllByRole("row")).toHaveLength(2);
    const said = warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes("alpha, beta, gamma"));
    expect(said).toHaveLength(1);
    expect(said[0]).not.toContain("delta");
    expect(said[0]).toContain("Array.from");
  });

  it("says nothing for undefined, null or a proper array", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Grid rows={undefined} />);
    render(<Grid rows={null} />);
    render(<Grid rows={[{ a: 1 }]} />);
    expect(warn).not.toHaveBeenCalled();
  });
});
