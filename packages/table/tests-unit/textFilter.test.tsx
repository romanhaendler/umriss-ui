/* The text filter: `filter="text"` for text columns. Operators contains, does
   not contain, starts with, ends with, equals and is empty; up to two terms
   joined by AND or OR; matching without regard to case. The condition is plain
   JSON, so a view and a server request carry it as it is. */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Toolbar, useTable } from "../src";
import type { Table, TableRequest, TableView, TextCondition, TextOperator } from "../src";

interface Item {
  id: string;
  name: string | null;
}

const ITEMS: Item[] = [
  { id: "1", name: "Foo bar" },
  { id: "2", name: "bar FOO" },
  { id: "3", name: "Baz" },
  { id: "4", name: "" },
  { id: "5", name: null },
];

let current: Table<Item> | null = null;
let requests: TableRequest[] = [];
const capture = (t: Table<Item>) => {
  current = t;
};

function Columns({ t }: { t: Table<Item> }) {
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Items">
      <Toolbar />
      <Column value="id" label="Id" rowHeader />
      <Column value="name" label="Name" filter="text" />
    </Frame>
  );
}

function List({ start }: { start?: TableView }) {
  return <Columns t={useTable(ITEMS, { rowKey: (i) => i.id, initialView: start })} />;
}

function Server() {
  const t = useTable(ITEMS, {
    rowKey: (i) => i.id,
    server: true,
    rowCount: ITEMS.length,
    onRequest: (r) => requests.push(r),
  });
  return <Columns t={t} />;
}

const ids = () => current!.filtered.map((i) => i.id);
const one = (operator: TextOperator, value?: string): TextCondition => ({ terms: [{ operator, value }] });

beforeEach(() => {
  current = null;
  requests = [];
});

describe("operators", () => {
  const cases: [TextOperator, string | undefined, string[]][] = [
    ["contains", "foo", ["1", "2"]],
    ["notContains", "foo", ["3", "4", "5"]],
    ["startsWith", "FOO", ["1"]],
    ["endsWith", "foo", ["2"]],
    ["equals", "baz", ["3"]],
    ["isEmpty", undefined, ["4", "5"]],
  ];
  it.each(cases)("%s %s", (operator, value, expected) => {
    render(<List />);
    act(() => current!.setFilter("name", one(operator, value)));
    expect(ids()).toEqual(expected);
  });

  it("joins two terms with AND and with OR", () => {
    render(<List />);
    const terms = [
      { operator: "startsWith", value: "foo" },
      { operator: "endsWith", value: "foo" },
    ] as const;
    act(() => current!.setFilter("name", { join: "or", terms }));
    expect(ids()).toEqual(["1", "2"]);
    act(() => current!.setFilter("name", { join: "and", terms }));
    expect(ids()).toEqual([]);
    act(() =>
      current!.setFilter("name", {
        terms: [
          { operator: "contains", value: "bar" },
          { operator: "notContains", value: "foo" },
        ],
      }),
    );
    expect(ids()).toEqual([]);
  });

  it("ignores a term without its value and lifts a condition that is only such terms", () => {
    render(<List />);
    act(() => current!.setFilter("name", one("contains", "")));
    expect(current!.filter).toEqual({});
    act(() =>
      current!.setFilter("name", {
        terms: [
          { operator: "contains", value: "baz" },
          { operator: "equals", value: "" },
        ],
      }),
    );
    expect(ids()).toEqual(["3"]);
  });
});

describe("the view and the chip", () => {
  it("restores the condition from JSON and names it in a chip that removes it", () => {
    const stored = JSON.parse(
      JSON.stringify({
        conditions: { name: { join: "or", terms: [{ operator: "startsWith", value: "baz" }, { operator: "isEmpty" }] } },
      }),
    );
    render(<List start={stored} />);
    expect(ids()).toEqual(["3", "4", "5"]);
    expect(current!.view.conditions).toEqual(stored.conditions);
    const chips = screen.getByRole("list", { name: "Active filters" });
    expect(chips.textContent).toContain("starts with “baz” or is empty");
    fireEvent.click(within(chips).getByRole("button", { name: /^Remove Name/ }));
    expect(ids()).toEqual(["1", "2", "3", "4", "5"]);
  });
});

describe("the input", () => {
  const panel = () => screen.getByRole("dialog", { name: "Filter Name" });

  it("sets the operators, the values and the join", () => {
    render(<List />);
    fireEvent.click(screen.getByRole("button", { name: "Filter Name" }));
    const p = within(panel());
    fireEvent.change(p.getAllByLabelText("Operator")[0]!, { target: { value: "startsWith" } });
    fireEvent.change(p.getAllByLabelText("Value")[0]!, { target: { value: "baz" } });
    expect(current!.filter).toEqual({ name: { terms: [{ operator: "startsWith", value: "baz" }] } });
    fireEvent.change(p.getAllByLabelText("Operator")[1]!, { target: { value: "isEmpty" } });
    fireEvent.click(p.getByRole("radio", { name: "or" }));
    expect(current!.filter).toEqual({
      name: { join: "or", terms: [{ operator: "startsWith", value: "baz" }, { operator: "isEmpty" }] },
    });
    expect(ids()).toEqual(["3", "4", "5"]);
  });

  it("moves the focus into the panel when it opens", () => {
    render(<List />);
    fireEvent.click(screen.getByRole("button", { name: "Filter Name" }));
    expect(panel().contains(document.activeElement)).toBe(true);
  });
});

describe("server mode", () => {
  it("reports the condition under the column's id and applies nothing itself", () => {
    render(<Server />);
    const condition: TextCondition = {
      join: "and",
      terms: [
        { operator: "contains", value: "foo" },
        { operator: "notContains", value: "bar" },
      ],
    };
    act(() => current!.setFilter("name", condition));
    expect(requests.at(-1)!.conditions).toEqual({ name: condition });
    expect(ids()).toEqual(["1", "2", "3", "4", "5"]);
  });
});
