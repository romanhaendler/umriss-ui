/* The projection is computed in stages: a page turned, a group folded, a
   column hidden or moved does not sort the rows again; a change of the sort, a
   filter, the search or the rows does. */

import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination, useTable } from "../src";

interface Item {
  id: string;
  grp: string;
  n: number;
}
const rowsOf = (offset: number): Item[] =>
  Array.from({ length: 12 }, (_, i) => ({ id: `r${i}`, grp: i % 2 ? "odd" : "even", n: ((i * 7) % 12) + offset }));

let sortCalls = 0;
// Module-level: a stable function, so only the staging is under test.
const counted = (v: string | number) => (sortCalls++, v);

let table: ReturnType<typeof useTable<Item>>;

const capture = (t: typeof table) => {
  table = t;
};

function Subject({ rows, grouped }: { rows: Item[]; grouped: boolean }) {
  const t = useTable(rows, {
    rowKey: (r: Item) => r.id,
    pageSize: 3,
    defaultSort: { column: "n", direction: "asc" },
    defaultGrouping: grouped ? "grp" : undefined,
  });
  capture(t);
  const { Table, Column } = t;
  return (
    <Table empty="none">
      <Column id="id" label="Id" value="id" searchable />
      <Column id="grp" label="Group" value="grp" />
      <Column id="n" label="N" value="n" sortValue={counted} />
      <Pagination />
    </Table>
  );
}

const unchanged = (change: () => void) => {
  const before = sortCalls;
  act(change);
  expect(sortCalls).toBe(before);
};
const recomputed = (change: () => void) => {
  const before = sortCalls;
  act(change);
  expect(sortCalls).toBeGreaterThan(before);
};

describe.each([false, true])("staged pipeline, grouped %s", (grouped) => {
  const rows = rowsOf(0);
  it("a page, a hidden column and a moved one sort nothing again", () => {
    render(<Subject rows={rows} grouped={grouped} />);
    unchanged(() => table.setPage(2));
    unchanged(() => table.toggleColumn("grp"));
    unchanged(() => table.setOrder(["n", "id", "grp"]));
  });

  it("a fold sorts nothing again", () => {
    if (!grouped) return;
    render(<Subject rows={rows} grouped />);
    unchanged(() => table.toggleFold(JSON.stringify(["value:even"])));
    expect(table.folded).toHaveLength(1);
  });

  it("a sort, the search and the rows do", () => {
    const { rerender } = render(<Subject rows={rows} grouped={grouped} />);
    recomputed(() => table.toggleSort("n"));
    recomputed(() => table.setSearch("r1"));
    recomputed(() => rerender(<Subject rows={rowsOf(1)} grouped={grouped} />));
  });
});
