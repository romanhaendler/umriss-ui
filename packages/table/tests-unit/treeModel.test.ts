/* Tree rows in the model (table-tree-rows). The roots and their children go
   through core's flattening; the table adds the sort per level, its match by
   search and conditions, and the sets the footer, the selection and the
   export read. */

import { describe, expect, it } from "vitest";
import { column, tableModel } from "../src/model/tableModel";
import type { TableInput } from "../src/model/tableModel";

interface Unit {
  id: string;
  name: string;
  budget?: number;
  children?: Unit[];
}

/*  Vertrieb 300
      Nord 120
        Hamburg 70
        Kiel 50
      Süd 180
    Stab 40          (a leaf among roots - an uneven hierarchy)
    Werk 200
      Halle 200
        Linie 1 90
        Linie 2 110 */
const UNITS: Unit[] = [
  {
    id: "v",
    name: "Vertrieb",
    budget: 300,
    children: [
      { id: "vn", name: "Nord", budget: 120, children: [{ id: "vnh", name: "Hamburg", budget: 70 }, { id: "vnk", name: "Kiel", budget: 50 }] },
      { id: "vs", name: "Süd", budget: 180 },
    ],
  },
  { id: "s", name: "Stab", budget: 40 },
  {
    id: "w",
    name: "Werk",
    budget: 200,
    children: [
      { id: "wh", name: "Halle", budget: 200, children: [{ id: "wh1", name: "Linie 1", budget: 90 }, { id: "wh2", name: "Linie 2", budget: 110 }] },
    ],
  },
];

const COLUMNS = [
  column<Unit>("name", { value: (u) => u.name, searchable: true }),
  column<Unit>("budget", { value: (u) => u.budget }),
];

const tree = (open: string[] = [], admit?: (u: Unit) => boolean): NonNullable<TableInput<Unit>["tree"]> => ({
  key: (u) => u.id,
  children: (u) => u.children,
  open: new Set(open),
  admit,
});

const ids = (rows: readonly Unit[]) => rows.map((u) => u.id);

describe("tree rows - the flattening", () => {
  it("shows the roots while every branch is closed, and an open branch's children beneath it", () => {
    expect(ids(tableModel(UNITS, COLUMNS, { tree: tree() }).visible)).toEqual(["v", "s", "w"]);
    const open = tableModel(UNITS, COLUMNS, { tree: tree(["v", "vn"]) });
    expect(ids(open.visible)).toEqual(["v", "vn", "vnh", "vnk", "vs", "s", "w"]);
    expect(open.entries?.map((e) => e.level)).toEqual([0, 1, 2, 2, 1, 0, 0]);
  });

  it("never pages a tree", () => {
    expect(ids(tableModel(UNITS, COLUMNS, { tree: tree(["v"]), pageSize: 2 }).visible)).toHaveLength(5);
  });

  it("sorts every level on its own, and a child never leaves its parent", () => {
    const sorted = tableModel(UNITS, COLUMNS, { tree: tree(["v", "vn", "w", "wh"]), sort: { column: "budget", direction: "desc" } });
    expect(ids(sorted.visible)).toEqual(["v", "vs", "vn", "vnh", "vnk", "w", "wh", "wh2", "wh1", "s"]);
  });

  it("puts an absent value last within its level", () => {
    const withGap: Unit[] = [{ id: "a", name: "A", children: [{ id: "a1", name: "A1" }, { id: "a2", name: "A2", budget: 1 }] }];
    const up = tableModel(withGap, COLUMNS, { tree: tree(["a"]), sort: { column: "budget", direction: "asc" } });
    const down = tableModel(withGap, COLUMNS, { tree: tree(["a"]), sort: { column: "budget", direction: "desc" } });
    expect(ids(up.visible)).toEqual(["a", "a2", "a1"]);
    expect(ids(down.visible)).toEqual(["a", "a2", "a1"]);
  });

  it("lets the pre-filter take a row away with its subtree", () => {
    const projection = tableModel(UNITS, COLUMNS, { tree: tree(["v", "vn"], (u) => u.id !== "vn") });
    expect(ids(projection.visible)).toEqual(["v", "vs", "s", "w"]);
    expect(ids(projection.filtered)).not.toContain("vnh");
  });
});

describe("tree rows - search and conditions", () => {
  it("shows a deep match with its path, open without opening anything", () => {
    const projection = tableModel(UNITS, COLUMNS, { tree: tree(), search: "kiel" });
    expect(ids(projection.visible)).toEqual(["v", "vn", "vnk"]);
    expect(projection.entries?.map((e) => e.pathOnly)).toEqual([true, true, false]);
  });

  it("follows a condition by the same rule as the search", () => {
    const projection = tableModel(UNITS, COLUMNS, { tree: tree(), filter: (u) => (u as Unit).budget === 110 });
    expect(ids(projection.visible)).toEqual(["w", "wh", "wh2"]);
  });

  it("holds every match on every level in the filtered set, in reading order - path rows not", () => {
    const projection = tableModel(UNITS, COLUMNS, { tree: tree(), search: "l" });
    // Kiel, Halle, Linie 1, Linie 2 - Vertrieb, Nord and Werk only lead there.
    expect(ids(projection.filtered)).toEqual(["vnk", "wh", "wh1", "wh2"]);
  });

  it("counts every row the tree has, on every level, for \"43 of 1,204\"", () => {
    expect(tableModel(UNITS, COLUMNS, { tree: tree(), search: "kiel" }).total).toBe(10);
    expect(tableModel(UNITS, COLUMNS, { tree: tree([], (u) => u.id !== "vn") }).total).toBe(7);
  });

  it("holds every row of the tree in the filtered set without a restriction, open or not", () => {
    expect(ids(tableModel(UNITS, COLUMNS, { tree: tree() }).filtered)).toEqual(["v", "vn", "vnh", "vnk", "vs", "s", "w", "wh", "wh1", "wh2"]);
  });
});

describe("tree rows - what the footer and the export read", () => {
  it("gives the footer the roots that match or lead to a match", () => {
    expect(ids(tableModel(UNITS, COLUMNS, { tree: tree() }).roots ?? [])).toEqual(["v", "s", "w"]);
    expect(ids(tableModel(UNITS, COLUMNS, { tree: tree(), search: "kiel" }).roots ?? [])).toEqual(["v"]);
  });

  it("gives the export every row of the filtered tree with its level, open or not, path rows included", () => {
    const projection = tableModel(UNITS, COLUMNS, { tree: tree(), search: "linie" });
    expect(projection.exported?.map((e) => [e.key, e.level])).toEqual([
      ["w", 0],
      ["wh", 1],
      ["wh1", 2],
      ["wh2", 2],
    ]);
  });
});
