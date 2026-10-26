/* A late answer in server mode: `answers` names the request the rows answer;
   until it equals the table's current request the table is busy, and the rows
   of an older request never stand as current. */

import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Search, useTable } from "../src";
import type { Table, TableRequest } from "../src";

interface Row {
  id: string;
}

let reports: TableRequest[] = [];
let current: Table<Row> | null = null;
/** The answers the test hands in by hand, in the order it chooses. */
let deliver: (index: number, rows: Row[], pass?: boolean) => void = () => {};
const capture = (t: Table<Row>, d: typeof deliver) => {
  current = t;
  deliver = d;
};

function Server({ pass = true }: { pass?: boolean }) {
  const [data, setData] = useState<{ rows: Row[]; answers?: TableRequest }>({ rows: [] });
  const t = useTable(data.rows, {
    rowKey: (r) => r.id,
    server: true,
    rowCount: data.rows.length,
    onRequest: (request) => reports.push(request),
    ...(pass ? { answers: data.answers } : {}),
  });
  capture(t, (index, rows, passAnswers = pass) => setData({ rows, answers: passAnswers ? reports[index] : undefined }));
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Orders">
      <Search aria-label="Search" />
      <Column value="id" label="Id" rowHeader />
    </Frame>
  );
}

const busy = () => screen.getByRole("table", { hidden: true }).getAttribute("aria-busy");
const ids = () => screen.queryAllByRole("rowheader").map((c) => c.textContent);
/* A search the server hears at once: typed, then Enter - without it the table
   waits for a pause in typing. */
const type = (value: string) => {
  const field = screen.getByLabelText("Search");
  fireEvent.change(field, { target: { value } });
  fireEvent.keyDown(field, { key: "Enter" });
};

beforeEach(() => {
  reports = [];
  current = null;
});
afterEach(() => vi.restoreAllMocks());

describe("answers", () => {
  it("is busy until the answer to the current request stands, and the older rows never stand as current", async () => {
    render(<Server />);
    act(() => deliver(0, [{ id: "first" }]));
    expect(busy()).toBeNull();
    type("ab");
    type("abc");
    expect(reports.map((r) => r.search)).toEqual(["", "ab", "abc"]);
    expect(current!.request).toEqual(reports[2]);
    expect(busy()).toBe("true");
    /* The answer to "abc" comes first, the one to "ab" after it. */
    act(() => deliver(2, [{ id: "abc-row" }]));
    expect(busy()).toBeNull();
    expect(ids()).toEqual(["abc-row"]);
    act(() => deliver(1, [{ id: "ab-row" }]));
    expect(busy()).toBe("true");
    expect(ids()).toEqual(["ab-row"]);
    act(() => deliver(2, [{ id: "abc-row" }]));
    expect(busy()).toBeNull();
  });

  it("takes the rows as current without answers, and does not warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Server pass={false} />);
    act(() => deliver(0, [{ id: "a" }]));
    type("x");
    expect(busy()).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns once for an answers that matches no reported request", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Server />);
    act(() => deliver(0, [{ id: "a" }]));
    expect(warn).not.toHaveBeenCalled();
    act(() => deliver(0, [{ id: "a" }]));
    reports[0] = { ...reports[0]!, search: "never asked" };
    act(() => deliver(0, [{ id: "b" }]));
    act(() => deliver(0, [{ id: "c" }]));
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("answers"))).toHaveLength(1);
  });

  it("has a null request outside server mode", () => {
    function Auto() {
      const t = useTable([{ id: "a" }], { rowKey: (r) => r.id });
      capture(t as unknown as Table<Row>, deliver);
      return null;
    }
    render(<Auto />);
    expect(current!.request).toBeNull();
  });
});
