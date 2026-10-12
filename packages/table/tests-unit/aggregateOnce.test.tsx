/* An aggregate is computed once for a set of rows: a render that changes
   nothing reads only the cells of the page, not all the rows again. */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination, useTable } from "../src";

interface Sale {
  id: string;
  region: string;
  bucket: string;
  amount: number;
}

const SALES: Sale[] = Array.from({ length: 40 }, (_, i) => ({ id: `s${i}`, region: i % 2 ? "north" : "south", bucket: i % 3 ? "a" : "b",amount: i + 0.5 }));

function rendersWithCount(grouped: boolean) {
  let reads = 0;
  /* One function for every render: the model is not rebuilt, so what is
     counted is what the aggregates read. */
  const amount = (s: Sale) => {
    reads++;
    return s.amount;
  };
  function Sales({ tick }: { tick: number }) {
    const { Table, Column } = useTable(SALES, { rowKey: (s) => s.id, pageSize: 5, defaultGrouping: grouped ? ["region", "bucket"] : undefined });
    return (
      <Table data-tick={tick}>
        <Column value="id" label="Id" rowHeader />
        <Column value="region" label="Region" />
        <Column value="bucket" label="Bucket" />
        <Column
          id="amount"
          value={amount}
          label="Amount"
          aggregate="sum"
        />
        <Pagination />
      </Table>
    );
  }
  const { rerender } = render(<Sales tick={0} />);
  const first = reads;
  rerender(<Sales tick={1} />);
  return { first, second: reads };
}

describe("an aggregate is computed once", () => {
  it("a footer sum is not read again by a render with nothing changed", () => {
    const { first, second } = rendersWithCount(false);
    expect(first).toBeGreaterThanOrEqual(SALES.length);
    expect(second - first).toBeLessThan(SALES.length);
  });

  it("group aggregates and share bars are not read again either", () => {
    const { first, second } = rendersWithCount(true);
    expect(first).toBeGreaterThanOrEqual(SALES.length);
    expect(second - first).toBeLessThan(SALES.length);
  });
});
