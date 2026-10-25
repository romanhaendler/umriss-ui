// @vitest-environment node
/* The table rendered on a server (platform-claims-proved 02): `renderToString`
   in the node environment, where `window` and `document` do not exist. */

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { useTable, useTableSelection } from "../src";

interface Order {
  id: string;
  article: string;
  quantity: number;
}

const ORDERS: Order[] = [
  { id: "A-1041", article: "Housing 40", quantity: 1200 },
  { id: "A-1044", article: "Housing 60", quantity: 800 },
];

function Orders({ selected = false, loading = false }: { selected?: boolean; loading?: boolean }) {
  const selection = useTableSelection(ORDERS.map((o) => o.id));
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id, selection: selected ? selection : undefined });
  return (
    <Table aria-label="Orders" selectable={selected} loading={loading}>
      <Column value="id" label="Order" rowHeader />
      <Column value="article" label="Article" />
      <Column value="quantity" label="Quantity" aggregate="sum" />
    </Table>
  );
}

describe("the table on a server", () => {
  it("renders the grid, the headers, the first row and the aggregate", () => {
    const html = renderToString(<Orders />);
    expect(html).toContain("<table");
    for (const text of ["Order", "Article", "Quantity", "A-1041", "Housing 40", "1,200", "2,000"]) expect(html).toContain(text);
  });

  it("renders a selection and a loading table", () => {
    const html = renderToString(<Orders selected loading />);
    expect(html).toContain("A-1041");
    expect(html).toContain('aria-busy="true"');
  });

  it("renders the same markup twice", () => {
    expect(renderToString(<Orders selected loading />)).toBe(renderToString(<Orders selected loading />));
    expect(renderToString(<Orders />)).toBe(renderToString(<Orders />));
  });
});
