/* The matcher (command-palette 01). Pure functions, nothing mounted - the model
   is options.test.ts.

   What is pinned here is the *order*, not the formula. The numbers of the
   bonuses and costs are an internal decision and may change; that a word start
   comes before a word middle may not. That is why almost every test here
   compares a pair that differs in exactly one property: if a rule falls, the
   test that names it falls, and not just any one.

   The result fields (`rank`, `finds`, `kandidat`) keep their German
   names: they are the module's, not this test's. */

import { describe, expect, it } from "vitest";
import { find, findInName } from "../src/lib/search";

const names = (finds: readonly { kandidat: { name: string } }[]) =>
  finds.map((f) => f.kandidat.name);

/** Shorthand: a list of bare names. */
const list = (...values: string[]) => values.map((name) => ({ name }));

describe("findInName – a subsequence rather than a substring", () => {
  it("finds the abbreviation in the word starts", () => {
    // The case that justifies the whole exercise: `dtp` stands nowhere as a
    // run in `DateTimePicker`.
    expect(findInName("dtp", "DateTimePicker")).not.toBeNull();
  });

  it("finds nothing where a character is missing", () => {
    expect(findInName("abc", "DateTimePicker")).toBeNull();
  });

  it("demands the order of the query", () => {
    // Both characters occur, but the wrong way round.
    expect(findInName("ba", "Balken")).not.toBeNull();
    expect(findInName("kb", "Balken")).toBeNull();
  });

  it("pays no regard to case", () => {
    const lower = findInName("dtp", "DateTimePicker");
    const upper = findInName("DTP", "DateTimePicker");
    expect(lower).not.toBeNull();
    expect(upper).toEqual(lower);
  });

  it("does not let whitespace at the edge of the query count", () => {
    expect(findInName("  dtp  ", "DateTimePicker")).toEqual(
      findInName("dtp", "DateTimePicker"),
    );
  });

  it("finds nothing for an empty query", () => {
    // The resting state: an empty field is not a query that matches everything,
    // but one that matches nothing.
    expect(findInName("", "DateTimePicker")).toBeNull();
    expect(findInName("   ", "DateTimePicker")).toBeNull();
  });
});

describe("findInName – the match spans", () => {
  it("marks exactly the characters the query hit", () => {
    const found = findInName("dtp", "DateTimePicker");
    const matched = found!.finds.flatMap((s) =>
      [...Array(s.to - s.from).keys()].map((i) => "DateTimePicker"[s.from + i]),
    );
    expect(matched.join("")).toBe("DTP");
  });

  it("joins consecutive match spans into one span", () => {
    expect(findInName("date", "DateTimePicker")!.finds).toEqual([{ from: 0, to: 4 }]);
  });

  it("yields the spans half-open, ascending and without overlap", () => {
    const spans = findInName("dtp", "DateTimePicker")!.finds;
    expect(spans).toEqual([
      { from: 0, to: 1 },
      { from: 4, to: 5 },
      { from: 8, to: 9 },
    ]);
    let last = -1;
    for (const span of spans) {
      expect(span.to).toBeGreaterThan(span.from);
      expect(span.from).toBeGreaterThanOrEqual(last);
      last = span.to;
    }
    expect(last).toBeLessThanOrEqual("DateTimePicker".length);
  });
});

/* Every rule gets a pair that differs in exactly that one property - same
   length, same query, otherwise the same situation. */
describe("findInName – the ordering rules, one pair each", () => {
  const rankOf = (query: string, name: string) => findInName(query, name)!.rank;

  it("puts the word start above the word middle", () => {
    // "x ab y" hits after the space, "xyab z" in the middle of a word.
    expect(rankOf("ab", "x ab y")).toBeGreaterThan(rankOf("ab", "xyab z"));
  });

  it("recognises the change from lower to upper case as a word start", () => {
    // Without this rule `dtp` would not find the inner T and P as a start.
    expect(rankOf("tp", "DateTimePick")).toBeGreaterThan(rankOf("tp", "datetimepick"));
  });

  it("puts the contiguous run above the scattered one", () => {
    expect(rankOf("abc", "abcxyz")).toBeGreaterThan(rankOf("abc", "axbxcx"));
  });

  it("puts the shorter name above the longer one at equal quality", () => {
    expect(rankOf("table", "Table")).toBeGreaterThan(rankOf("table", "TableFilterStrip"));
  });

  it("does not let length overtake a real difference in quality", () => {
    /* Noticed in the demo and therefore pinned down here: `dtp` hits
       "DatePicker und DateTimePicker" on THREE word starts and
       "DateRangePicker" on only two. The longer name is still the better
       answer. The length cost decides at equal quality and not against it. */
    expect(rankOf("dtp", "DatePicker und DateTimePicker")).toBeGreaterThan(
      rankOf("dtp", "DateRangePicker"),
    );
  });
});

describe("find – over a list", () => {
  it("returns nothing for an empty query", () => {
    expect(find(list("Table", "TreeView"), "")).toEqual([]);
    expect(find(list("Table", "TreeView"), "   ")).toEqual([]);
  });

  it("leaves out what does not fit", () => {
    expect(names(find(list("Table", "TreeView"), "tree"))).toEqual(["TreeView"]);
  });

  it("orders by rank, not by the order of arrival", () => {
    expect(names(find(list("TableFilterStrip", "Table"), "table"))).toEqual([
      "Table",
      "TableFilterStrip",
    ]);
  });

  it("falls back on the order of arrival on a tie", () => {
    // Two names that differ only in the last character: same length, same match
    // spans, same rank. Then the caller decides.
    expect(names(find(list("Alfa", "Alfb"), "alf"))).toEqual(["Alfa", "Alfb"]);
    expect(names(find(list("Alfb", "Alfa"), "alf"))).toEqual(["Alfb", "Alfa"]);
  });

  it("returns the candidate itself, not a copy of its fields", () => {
    const candidate = { name: "Table", payload: 42 };
    expect(find([candidate], "table")[0]!.kandidat).toBe(candidate);
  });
});

describe("find – the group counts too", () => {
  const CANDIDATES = [
    { name: "TreeView", gruppe: "Struktur und Ebenen" },
    { name: "Strukturbaum", gruppe: "Fundament" },
  ];

  it("finds through the group name what the name does not give", () => {
    expect(names(find(CANDIDATES, "struktur"))).toContain("TreeView");
  });

  it("marks nothing on a group-only find", () => {
    // The match spans index the name; a find through the group has nothing to
    // mark in the name, and marking something would be a lie.
    const found = find(CANDIDATES, "struktur").find((f) => f.kandidat.name === "TreeView");
    expect(found!.finds).toEqual([]);
  });

  it("puts every name find above every group-only find", () => {
    // "Strukturbaum" hits in the name, "TreeView" only in the group - and that
    // stays so, however good the group find would be on its own.
    expect(names(find(CANDIDATES, "struktur"))).toEqual(["Strukturbaum", "TreeView"]);
  });
});

describe("find – the caller's weight", () => {
  it("shifts the rank", () => {
    const without = find(list("Table"), "table")[0]!.rank;
    const with_ = find([{ name: "Table", gewicht: 5 }], "table")[0]!.rank;
    expect(with_).toBe(without + 5);
  });

  it("can turn the order round and leaves the match spans untouched", () => {
    const heavy = { name: "TableFilterStrip", gewicht: 100 };
    const light = { name: "Table" };
    expect(names(find([light, heavy], "table"))).toEqual([
      "TableFilterStrip",
      "Table",
    ]);
    expect(find([heavy], "table")[0]!.finds).toEqual(
      find(list("TableFilterStrip"), "table")[0]!.finds,
    );
  });
});
