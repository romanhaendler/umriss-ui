import { describe, expect, it } from "vitest";
import { treeModel, toggleAll, toggleCheck, typeaheadTarget, type NodeReader, type TreeSnapshot } from "../src/components/TreeView/treeModel";
interface N { id: string; kids?: N[]; off?: boolean }
const reader: NodeReader<N> = { key: (n) => n.id, children: (n) => n.kids, label: (n) => n.id, disabled: (n) => !!n.off };
const roots: N[] = [{ id: "fruit", kids: [{ id: "apple" }, { id: "banana" }] }, { id: "veg", kids: [{ id: "carrot" }] }];
const snap = (o: Partial<TreeSnapshot> = {}): TreeSnapshot => ({ expanded: new Set(), checked: new Set(), active: null, anchor: null, search: "", ...o });

describe("p29 tree", () => {
  it("toggleAll with a filter checks only what the filter shows", () => {
    const s = toggleAll(roots, reader, snap({ search: "apple" }));
    expect([...s.checked].sort()).toEqual(["apple"]);
  });
  it("checking a branch while filtering leaves the hidden children alone", () => {
    const s = toggleCheck(roots, reader, snap({ search: "apple", expanded: new Set(["fruit"]) }), "fruit");
    expect(s.checked.has("banana")).toBe(false);
  });
  it("the list under a filter shows the hidden child as checked? parent shows checked when hidden sibling not", () => {
    const s = toggleCheck(roots, reader, snap({ search: "apple" }), "apple");
    const e = treeModel(roots, reader, s).find((x) => x.key === "fruit")!;
    expect(e.checked).toBe(false);
    expect(e.indeterminate).toBe(true);
  });
  it("typeahead with accented/uppercase", () => {
    const flat = treeModel([{ id: "Äpfel" }, { id: "Zebra" }], reader, snap());
    expect(typeaheadTarget(flat, "ä", null)).toBe("Äpfel");
  });
});

describe("tree search folds accents", () => {
  const names: N[] = [{ id: "Kühlung" }, { id: "Café" }, { id: "Zebra" }];
  const shown = (search: string) => treeModel(names, reader, snap({ search })).map((x) => x.key);
  it("finds Kühlung by kuhlung and Café by cafe", () => {
    expect(shown("kuhlung")).toEqual(["Kühlung"]);
    expect(shown("cafe")).toEqual(["Café"]);
  });
});
