/* A view handed in applies by its content (ADR-0047): the table compares what
   it is handed with the last one, not by identity - a view written in the call
   is a new object on every render, and the same view again changes nothing. */

import { describe, expect, it } from "vitest";
import { onlyKnown, viewKey } from "../src/model/view";
import type { TableView } from "../src/model/view";

const VIEW: TableView = {
  search: "aur",
  conditions: { line: ["L2"], amount: { min: 1 } },
  sort: [{ column: "amount", direction: "desc" }],
  hidden: ["line"],
  widths: { number: 120 },
};

describe("viewKey - a view's content", () => {
  it("is the same for the same content, in whatever order its keys were written", () => {
    const again: TableView = {
      widths: { number: 120 },
      hidden: ["line"],
      sort: [{ direction: "desc", column: "amount" }],
      conditions: { amount: { min: 1 }, line: ["L2"] },
      search: "aur",
    };
    expect(viewKey(again)).toBe(viewKey(VIEW));
  });

  it("takes the hidden columns, the folded groups and the open branches as sets - their order does not count", () => {
    expect(viewKey({ hidden: ["a", "b"], folded: ["L1", "L2"], branches: ["x", "y"] })).toBe(
      viewKey({ hidden: ["b", "a"], folded: ["L2", "L1"], branches: ["y", "x"] }),
    );
  });

  it("keeps the order of the sort levels, the column order and the grouping - it is their content", () => {
    expect(viewKey({ order: ["a", "b"] })).not.toBe(viewKey({ order: ["b", "a"] }));
    expect(viewKey({ grouping: ["a", "b"] })).not.toBe(viewKey({ grouping: ["b", "a"] }));
    expect(viewKey({ sort: [{ column: "a", direction: "asc" }, { column: "b", direction: "asc" }] })).not.toBe(
      viewKey({ sort: [{ column: "b", direction: "asc" }, { column: "a", direction: "asc" }] }),
    );
  });

  it("changes with every part of the view", () => {
    const changed: TableView[] = [
      { ...VIEW, search: "bas" },
      { ...VIEW, conditions: { line: ["L1"] } },
      { ...VIEW, sort: [{ column: "amount", direction: "asc" }] },
      { ...VIEW, page: 2 },
      { ...VIEW, pageSize: 25 },
      { ...VIEW, hidden: [] },
      { ...VIEW, order: ["amount"] },
      { ...VIEW, widths: { number: 121 } },
      { ...VIEW, grouping: ["line"] },
      { ...VIEW, folded: ["L1"] },
      { ...VIEW, branches: ["a"] },
      { ...VIEW, pinned: { number: "start" } },
    ];
    expect(new Set([VIEW, ...changed].map(viewKey)).size).toBe(changed.length + 1);
  });
});

describe("onlyKnown - names no column carries fall out", () => {
  it("drops unknown columns from sort, hidden, order and widths", () => {
    const view: TableView = {
      search: "aur",
      sort: [{ column: "gone", direction: "asc" }, { column: "amount", direction: "desc" }],
      hidden: ["gone"],
      order: ["gone", "amount"],
      widths: { gone: 80, amount: 90 },
    };
    expect(onlyKnown(view, new Set(["amount", "line"]))).toEqual({
      search: "aur",
      sort: [{ column: "amount", direction: "desc" }],
      order: ["amount"],
      widths: { amount: 90 },
    });
  });

  it("keeps the view as it is while no column has registered", () => {
    const view: TableView = { hidden: ["gone"] };
    expect(onlyKnown(view, new Set())).toBe(view);
  });
});
