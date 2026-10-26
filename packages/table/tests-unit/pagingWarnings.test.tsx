/* A page size without a pagination bar, and a part without a table, say so in development. */

import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination, Search, useTable } from "../src";

const rows = Array.from({ length: 30 }, (_, i) => ({ id: `r${i}`, n: i }));
const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
afterEach(() => warn.mockClear());
const said = (needle: string) => warn.mock.calls.filter((c) => String(c[0]).includes(needle));
const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

type Opts = Parameters<typeof useTable<(typeof rows)[number]>>[1];
function Report({ options, bar }: { options: Opts; bar?: "inside" | "before" | "after" }) {
  const t = useTable(rows, options);
  return (
    <>
      {bar === "before" && <Pagination of={t} />}
      <t.Table aria-label="x">
        <t.Column id="n" label="N" value="n" />
        {bar === "inside" && <Pagination />}
      </t.Table>
      {bar === "after" && <Pagination of={t} />}
    </>
  );
}

describe("pageSize without a Pagination", () => {
  it("warns once after the first frame", async () => {
    const { rerender } = render(<Report options={{ pageSize: 10, rowKey: (r: { id: string }) => r.id }} />);
    expect(said("pageSize")).toHaveLength(0);
    await waitFor(() => expect(said("pageSize")).toHaveLength(1));
    rerender(<Report options={{ pageSize: 10, rowKey: (r: { id: string }) => r.id }} />);
    await frame();
    expect(said("pageSize")).toHaveLength(1);
  });

  it.each(["inside", "before", "after"] as const)("is silent with a bar %s", async (bar) => {
    render(<Report options={{ pageSize: 10, rowKey: (r: { id: string }) => r.id }} bar={bar} />);
    await frame();
    expect(said("pageSize")).toHaveLength(0);
  });
});

describe("pageSize stays silent", () => {
  it.each([
    ["no pageSize", { rowKey: (r: { id: string }) => r.id }],
    ["virtual", { pageSize: 10, virtual: true, rowKey: (r: { id: string }) => r.id }],
    ["server", { pageSize: 10, server: true, rowCount: 30, rowKey: (r: { id: string }) => r.id }],
    ["tree", { pageSize: 10, childRows: () => undefined, rowKey: (r: { id: string }) => r.id }],
  ] as const)("%s", async (_name, options) => {
    render(<Report options={options as unknown as Opts} />);
    await frame();
    expect(said("pageSize")).toHaveLength(0);
  });
});

describe("a part without a table", () => {
  it("warns once per part kind, naming it", () => {
    const { rerender } = render(
      <>
        <Pagination />
        <Search />
      </>,
    );
    rerender(
      <>
        <Pagination />
        <Search />
      </>,
    );
    expect(said("`Pagination` stands in no table")).toHaveLength(1);
    expect(said("`Search` stands in no table")).toHaveLength(1);
  });
});
