/* What the pager and the page hold: a page rows have left is written back, a
   server's known 0 is page 1 of 1, a skeleton says no count, the status region
   follows a shrink, a fitted server page keeps a place for the offer, and the
   `answers` placeholder is not told off. */

import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination, Toolbar, useTable } from "../src";
import type { ModelColumn } from "../src/model/tableModel";
import { tableModel } from "../src/model/tableModel";
import type { TableRequest } from "../src";

interface Row {
  id: string;
}
const rowsOf = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: `r${i}` }));

afterEach(() => vi.restoreAllMocks());

describe("a page the rows no longer reach", () => {
  let setCount: (n: number) => void = () => {};
  function Client() {
    const [n, set] = useState(95);
    setCount = set;
    const t = useTable(rowsOf(n), { rowKey: (r) => r.id, pageSize: 10 });
    return (
      <t.Table aria-label="Rows">
        <t.Column value="id" label="Id" rowHeader />
        <Pagination />
      </t.Table>
    );
  }

  it("is written back: rows that return leave the reader on the page they saw", () => {
    render(<Client />);
    fireEvent.click(screen.getByRole("button", { name: "Last page" }));
    expect(screen.getByText("Page 10 of 10")).toBeTruthy();
    act(() => setCount(75));
    expect(screen.getByText("Page 8 of 8")).toBeTruthy();
    act(() => setCount(85));
    expect(screen.getByText("Page 8 of 9")).toBeTruthy();
  });

  it("keeps the page of a view handed in while no row has arrived", () => {
    function Late() {
      const [n, set] = useState(0);
      setCount = set;
      const t = useTable(rowsOf(n), { rowKey: (r) => r.id, pageSize: 10, initialView: { page: 3 } });
      return (
        <t.Table aria-label="Rows">
          <t.Column value="id" label="Id" rowHeader />
          <Pagination />
        </t.Table>
      );
    }
    render(<Late />);
    act(() => setCount(95));
    expect(screen.getByText("Page 3 of 10")).toBeTruthy();
  });
});

describe("a server's total", () => {
  const columns: ModelColumn<Row>[] = [];
  it("0 that was answered is page 1 of 1; one not answered yet keeps the page", () => {
    const answered = tableModel<Row>([], columns, { server: { rowCount: 0, answered: true }, page: 4, pageSize: 10 });
    expect([answered.page, answered.pageCount]).toEqual([1, 1]);
    expect(tableModel<Row>([], columns, { server: { rowCount: 0 }, page: 4, pageSize: 10 }).page).toBe(4);
  });

  it("asks for page 1 once the server's total fell to 0", () => {
    const asked: TableRequest[] = [];
    function Server({ total }: { total: number }) {
      const t = useTable(rowsOf(total ? 10 : 0), {
        rowKey: (r) => r.id,
        server: true,
        rowCount: total,
        pageSize: 10,
        initialView: { page: 4 },
        onRequest: (request) => asked.push(request),
      });
      return (
        <t.Table aria-label="Rows">
          <t.Column value="id" label="Id" rowHeader />
          <Pagination />
        </t.Table>
      );
    }
    const { rerender } = render(<Server total={0} />);
    expect(asked.map((r) => r.page)).toEqual([4]);
    rerender(<Server total={40} />);
    expect(asked).toHaveLength(1);
    rerender(<Server total={0} />);
    expect(asked.map((r) => r.page)).toEqual([4, 1]);
    expect(screen.getByText("Page 1 of 1")).toBeTruthy();
  });
});

describe("a table under its skeleton", () => {
  it("says no count and no page", () => {
    function Loading() {
      const t = useTable([], { rowKey: (r: Row) => r.id, server: true, rowCount: 0, onRequest: () => {}, initialView: { search: "x" } });
      return (
        <t.Table aria-label="Rows" loading>
          <Toolbar />
          <t.Column value="id" label="Id" rowHeader />
          <Pagination />
        </t.Table>
      );
    }
    render(<Loading />);
    expect(screen.queryByText(/Page \d+ of/)).toBeNull();
    expect(screen.queryByText(/\d+–\d+ of/)).toBeNull();
    expect(screen.queryByText(/entries|of 0/)).toBeNull();
  });
});

describe("the pager's status region", () => {
  it("follows a shrink of the data after a step", () => {
    let set: (n: number) => void = () => {};
    function Client() {
      const [n, s] = useState(95);
      set = s;
      const t = useTable(rowsOf(n), { rowKey: (r) => r.id, pageSize: 10 });
      return (
        <t.Table aria-label="Rows">
          <t.Column value="id" label="Id" rowHeader />
          <Pagination />
        </t.Table>
      );
    }
    render(<Client />);
    fireEvent.click(screen.getByRole("button", { name: "Last page" }));
    const region = () => screen.getByRole("navigation").querySelector("[role=status]")!.textContent;
    expect(region()).toBe("91–95 of 95");
    act(() => set(83));
    expect(region()).toBe("81–83 of 83");
  });
});

describe("the offer's place", () => {
  /* The first request carries the fitted page size; the offer's line, 40 px
     here, is taken out of the room the rows are cut into. */
  const pageSizeAsked = (selectable: boolean) => {
    const asked: number[] = [];
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const row = this.tagName === "TR" || this.tagName === "THEAD" || this.tagName === "TFOOT";
      const height = row ? 20 : this.getAttribute("aria-hidden") === "true" ? 40 : this.style.height.startsWith("calc(100% - ") ? 93 : 100;
      return { height, top: 0, left: 0, bottom: height, right: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) };
    });
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
      return this.querySelector(":scope > table") ? 260 : 0;
    });
    function Fitted() {
      const t = useTable(rowsOf(5), { rowKey: (r) => r.id, server: true, rowCount: 100, pageSize: 5, onRequest: (request) => asked.push(request.pageSize) });
      return (
        <t.Table aria-label="Rows" selectable={selectable}>
          <t.Column value="id" label="Id" rowHeader />
          <Pagination />
        </t.Table>
      );
    }
    render(<Fitted />);
    return asked;
  };

  it("is left in the fit of a selectable server table, and not drawn while empty", () => {
    const withOffer = pageSizeAsked(true);
    expect(document.querySelector("div[role=status]")).toBeNull();
    cleanup();
    const without = pageSizeAsked(false);
    expect(without[0]! - withOffer[0]!).toBe(2);
  });
});

describe("the answers warning", () => {
  const placeholder: TableRequest = { search: "", conditions: {}, sort: [], page: 1, pageSize: 10, grouping: [], folded: [] };
  function Server({ error }: { error?: string }) {
    const [answers, setAnswers] = useState<TableRequest>(placeholder);
    const t = useTable(rowsOf(3), {
      rowKey: (r) => r.id,
      server: true,
      rowCount: 3,
      pageSize: 5,
      answers,
      error,
      onRequest: (request) => setAnswers(error ? placeholder : request),
    });
    return (
      <t.Table aria-label="Rows">
        <t.Column value="id" label="Id" rowHeader />
      </t.Table>
    );
  }

  it("lets the placeholder before the first answer pass", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Server />);
    expect(warn).not.toHaveBeenCalled();
  });

  it("lets a placeholder pass beside an error", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Server error="Offline" />);
    expect(warn).not.toHaveBeenCalled();
  });
});
