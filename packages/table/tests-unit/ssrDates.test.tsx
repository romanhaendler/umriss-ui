/* A table with a Date column on a server: the markup holds no formatted
   instant, so a reader in another zone hydrates it without an error, and the
   dates show afterwards. */

import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { useTable } from "../src";

interface Order {
  id: string;
  quantity: number;
  due: Date;
}

const ORDERS: Order[] = [
  { id: "A-1041", quantity: 1200, due: new Date(2026, 2, 17, 9, 5) },
  { id: "A-1044", quantity: 800, due: new Date(2026, 2, 19, 18, 30) },
];

function Orders() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id });
  return (
    <Table aria-label="Orders">
      <Column value="id" label="Order" rowHeader />
      <Column value="quantity" label="Quantity" aggregate="sum" />
      <Column value="due" label="Due" format="date" aggregate="range" />
    </Table>
  );
}

describe("a table with a Date column on a server", () => {
  it("writes no instant, keeps everything else, and hydrates to the dates", async () => {
    const html = renderToString(<Orders />);
    expect(html).not.toMatch(/\d\d\/\d\d\/\d{4}/);
    for (const text of ["Order", "Due", "A-1041", "A-1044", "1,200", "2,000"]) expect(html).toContain(text);

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    const onRecoverableError = vi.fn();
    await act(async () => {
      hydrateRoot(container, <Orders />, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toContain("17/03/2026");
    container.remove();
  });
});
