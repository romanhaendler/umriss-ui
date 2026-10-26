/* The pass-through guard of the table (ADR-0068): the table is a composite -
   ref, class, style and the rest reach its frame, the three names reach the
   <table> - and its parts are elements, `Search` a field. The `Table` and the
   parts that `useTable` hands back are read from a harness, so that they stand
   among the exports the guard lists. */

import { describe, expect, it } from "vitest";
import type { ReactElement, ReactNode } from "react";
import { createRef } from "react";
import { render, renderHook } from "@testing-library/react";
import * as table from "../src";
import { useTable } from "../src";
import { passThroughGuard } from "../../demo/tests-support/passThroughGuard.tsx";
import type { PassThroughCase, Probe } from "../../demo/tests-support/passThroughGuard.tsx";

interface Order {
  id: string;
}
const ORDERS: Order[] = [{ id: "A-1" }];

/* Untyped, as in core's guard: a part that does not take a ref yet fails this
   test by name instead of the type check. */
const p = (probe: Probe) => probe as object;

function Harness({ children, through }: { children?: ReactNode; through?: object }) {
  const t = useTable(ORDERS, { rowKey: (o) => o.id });
  return (
    <t.Table {...through}>
      <t.Column value="id" label="Order" />
      {children}
    </t.Table>
  );
}

const part = (draw: (probe: Probe) => ReactElement): PassThroughCase => ({
  render: (probe) => <Harness>{draw(probe)}</Harness>,
});

const CASES: Record<string, PassThroughCase> = {
  Table: {
    render: (probe) => <Harness through={p(probe)} />,
    shape: "composite",
    named: (frame) => frame.querySelector("table"),
  },
  Toolbar: part((probe) => <table.Toolbar {...p(probe)} />),
  Pagination: part((probe) => <table.Pagination {...p(probe)} />),
  Export: part((probe) => <table.Export {...p(probe)} />),
  ColumnMenu: part((probe) => <table.ColumnMenu {...p(probe)} />),
  Search: { render: (probe) => <Harness><table.Search {...p(probe)} /></Harness>, shape: "field" },
};

/* The parts of the hook that stand in the JSX, beside the exports. */
const { result, unmount } = renderHook(() => useTable(ORDERS, { rowKey: (o) => o.id }));
const { Table, Column, VerdictColumn, RowDetail, RowActions, Action, GroupBy } = result.current;
unmount();

passThroughGuard(
  "table",
  { ...table, Table, Column, VerdictColumn, RowDetail, RowActions, Action, GroupBy },
  CASES,
  {
    Column: "declares a column for the table; no element of its own stands in the page",
    VerdictColumn: "a Column that judges its value; it declares, it renders no element",
    RowDetail: "declares what opens under a row; the table draws it in the row's place",
    RowActions: "declares the actions of a row; the table draws the menu in its cell",
    Action: "one entry of RowActions, which the table draws",
    GroupBy: "declares a key to group by; it renders no element",
  },
);

describe("the name of the table", () => {
  it("is taken from the frame and put on the <table>: the heading names it, the frame carries none", () => {
    const { container } = render(
      <>
        <h2 id="h">Orders</h2>
        <Harness through={{ "aria-labelledby": "h", "data-testid": "orders", id: "orders" }} />
      </>,
    );
    const frame = container.querySelector<HTMLElement>("#orders")!;
    expect(frame.tagName).toBe("DIV");
    expect(frame.getAttribute("data-testid")).toBe("orders");
    expect(frame.getAttribute("aria-labelledby")).toBeNull();
    expect(container.querySelector("table")!.getAttribute("aria-labelledby")).toBe("h");
  });

  it("ref is the frame", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Harness through={{ ref, id: "frame", style: { marginTop: 8 } }} />);
    expect(ref.current).toBe(container.querySelector("#frame"));
    expect(ref.current!.style.marginTop).toBe("8px");
  });
});
