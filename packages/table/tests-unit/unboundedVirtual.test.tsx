/* A virtual table whose scroll area has no bound renders every row; in
   development it says so once. jsdom lays nothing out: the area's height is
   stubbed against the window's. */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: String(i) }));

function Virtual({ count }: { count: number }) {
  const data = rows(count);
  const { Table, Column } = useTable(data, { rowKey: (r) => r.id, virtual: true });
  return (
    <Table aria-label="Rows">
      <Column value="id" label="Id" rowHeader />
    </Table>
  );
}

const areaHeight = (height: number) => vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(height);
const said = (warn: { mock: { calls: unknown[][] } }) => warn.mock.calls.filter((c) => String(c[0]).includes("maxHeight"));

afterEach(() => vi.restoreAllMocks());

describe("a virtual table without a bounded scroll area", () => {
  it("warns once, naming maxHeight, when every row is rendered and the area is taller than the viewport", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    areaHeight(window.innerHeight + 500);
    const { rerender } = render(<Virtual count={5} />);
    rerender(<Virtual count={5} />);
    expect(said(warn)).toHaveLength(1);
  });

  it("stays silent when the window is smaller than the rows", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    areaHeight(window.innerHeight + 500);
    render(<Virtual count={5000} />);
    expect(said(warn)).toHaveLength(0);
  });

  it("stays silent when the rows fit the viewport", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    areaHeight(100);
    render(<Virtual count={5} />);
    expect(said(warn)).toHaveLength(0);
  });
});
