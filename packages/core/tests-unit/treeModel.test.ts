/* The tree model (tree-view). Everything that is really hard about a tree lies
   here and needs no browser: the flattening, the cascade, the derived
   indeterminate state, the search with its path, the sibling counts under a
   filter and every key movement as a pure state transition.

   Almost every rule here is one that looks right when it is wrong: a cascade
   without grandchildren cascades all the same, a stored indeterminate state
   shows itself all the same, and sibling counts taken from the unfiltered tree
   are wrong only while a filter runs. */

import { describe, expect, it } from "vitest";
import {
  allBranches,
  treeModel,
  move,
  duplicateKey,
  toggleCheck,
  expand,
  collapse,
  keysBetween,
  toggleAll,
  setChecked,
  setActive,
  setAnchor,
  typeaheadTarget,
  pathTo,
  revealPath,
  type TreeSnapshot,
  type FlatteningEntry,
  type NodeReader,
} from "../src/components/TreeView/treeModel";

interface Folder {
  id: string;
  name: string;
  children?: Folder[];
  disabled?: boolean;
  unloaded?: boolean;
}

/*  Anlagen
      Vertrag
      Bilder
        Skizze
        Foto
      Notiz
    Leer          (branch without content – not the same as a leaf)
    Einzelblatt   (leaf)
    Archiv
      Zweitausend
        Kassenbuch   (deep, for searching under closed branches) */
const TREE: Folder[] = [
  {
    id: "a",
    name: "Anlagen",
    children: [
      { id: "a1", name: "Vertrag" },
      {
        id: "a2",
        name: "Bilder",
        children: [
          { id: "a2x", name: "Skizze" },
          { id: "a2y", name: "Foto" },
        ],
      },
      { id: "a3", name: "Notiz" },
    ],
  },
  { id: "b", name: "Leer", children: [] },
  { id: "c", name: "Einzelblatt" },
  {
    id: "d",
    name: "Archiv",
    children: [{ id: "d1", name: "Zweitausend", children: [{ id: "d1a", name: "Kassenbuch" }] }],
  },
];

const READER: NodeReader<Folder> = {
  key: (o) => o.id,
  children: (o) => o.children,
  label: (o) => o.name,
};

function snapshot(part: Partial<TreeSnapshot> = {}): TreeSnapshot {
  return {
    expanded: new Set<string>(),
    checked: new Set<string>(),
    active: null,
    anchor: null,
    search: "",
    ...part,
  };
}

const flattening = (s: TreeSnapshot): readonly FlatteningEntry<Folder>[] =>
  treeModel(TREE, READER, s);
const ids = (f: readonly FlatteningEntry<Folder>[]) => f.map((e) => e.key);
const entry = (f: readonly FlatteningEntry<Folder>[], id: string) =>
  f.find((e) => e.key === id);

describe("Flattening", () => {
  it("shows only the roots when everything is closed", () => {
    expect(ids(flattening(snapshot()))).toEqual(["a", "b", "c", "d"]);
  });

  it("gives roots level 0 and grandchildren level 2", () => {
    const f = flattening(snapshot({ expanded: new Set(["a", "a2"]) }));
    expect(entry(f, "a")?.level).toBe(0);
    expect(entry(f, "a2")?.level).toBe(1);
    expect(entry(f, "a2x")?.level).toBe(2);
  });

  it("runs in reading order", () => {
    const f = flattening(snapshot({ expanded: new Set(["a", "a2"]) }));
    expect(ids(f)).toEqual(["a", "a1", "a2", "a2x", "a2y", "a3", "b", "c", "d"]);
  });

  it("does not let a closed branch contribute its content", () => {
    const f = flattening(snapshot({ expanded: new Set(["a"]) }));
    expect(ids(f)).toEqual(["a", "a1", "a2", "a3", "b", "c", "d"]);
  });

  it("tells branch, leaf and empty branch apart", () => {
    const f = flattening(snapshot());
    expect(entry(f, "a")).toMatchObject({ branch: true, empty: false });
    // A branch with an empty child list: expanding it shows nothing. The user
    // should not click something that never opens.
    expect(entry(f, "b")).toMatchObject({ branch: true, empty: true });
    expect(entry(f, "c")).toMatchObject({ branch: false, empty: false });
  });

  it("reports position and sibling count", () => {
    const f = flattening(snapshot({ expanded: new Set(["a"]) }));
    expect(entry(f, "a")).toMatchObject({ position: 1, siblings: 4 });
    expect(entry(f, "d")).toMatchObject({ position: 4, siblings: 4 });
    expect(entry(f, "a1")).toMatchObject({ position: 1, siblings: 3 });
    expect(entry(f, "a3")).toMatchObject({ position: 3, siblings: 3 });
  });

  it("copes with an empty tree", () => {
    expect(treeModel([], READER, snapshot())).toEqual([]);
  });

  it("passes over an active key that no longer exists", () => {
    const f = flattening(snapshot({ active: "weg" }));
    expect(f.every((e) => !e.active)).toBe(true);
  });

  it("passes over an expanded key that no longer exists", () => {
    expect(ids(flattening(snapshot({ expanded: new Set(["weg"]) })))).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });
});

describe("Cascade", () => {
  it("checks every descendant with a branch, grandchildren included", () => {
    const s = toggleCheck(TREE, READER, snapshot(), "a");
    expect([...s.checked].sort()).toEqual(["a", "a1", "a2", "a2x", "a2y", "a3"]);
  });

  it("unchecks again symmetrically", () => {
    const on = toggleCheck(TREE, READER, snapshot(), "a");
    const off = toggleCheck(TREE, READER, on, "a");
    expect([...off.checked]).toEqual([]);
  });

  it("turns the branch on as soon as its last child is checked", () => {
    let s = toggleCheck(TREE, READER, snapshot(), "a2x");
    expect(s.checked.has("a2")).toBe(false);
    s = toggleCheck(TREE, READER, s, "a2y");
    expect(s.checked.has("a2")).toBe(true);
  });

  it("reconciles all the way to the top", () => {
    let s = snapshot();
    for (const id of ["a1", "a2x", "a2y", "a3"]) s = toggleCheck(TREE, READER, s, id);
    expect(s.checked.has("a2")).toBe(true);
    expect(s.checked.has("a")).toBe(true);
  });

  it("takes the branch out again as soon as a child is unchecked", () => {
    let s = toggleCheck(TREE, READER, snapshot(), "a");
    s = toggleCheck(TREE, READER, s, "a2x");
    expect(s.checked.has("a2")).toBe(false);
    expect(s.checked.has("a")).toBe(false);
    expect(s.checked.has("a2y")).toBe(true);
  });

  it("treats an empty branch like a leaf", () => {
    // Otherwise every empty branch would be checked at once: "all children
    // checked" is vacuously true over an empty list.
    expect(snapshot().checked.has("b")).toBe(false);
    const untouched = toggleCheck(TREE, READER, snapshot(), "c");
    expect(untouched.checked.has("b")).toBe(false);
    const b = toggleCheck(TREE, READER, snapshot(), "b");
    expect(b.checked.has("b")).toBe(true);
  });

  it("changes nothing about the active node", () => {
    const s = toggleCheck(TREE, READER, snapshot({ active: "c" }), "a");
    expect(s.active).toBe("c");
  });

  it("does not touch the snapshot it was given", () => {
    const s = snapshot({ checked: new Set(["c"]) });
    const before = [...s.checked];
    toggleCheck(TREE, READER, s, "a");
    expect([...s.checked]).toEqual(before);
  });

  it("reconciles only the ancestors of the touched node", () => {
    // A snapshot set from outside may be inconsistent in itself – restored
    // from a link, say. A click elsewhere must not silently "repair" it and
    // throw away a choice while doing so.
    const s = snapshot({ checked: new Set(["a2"]) }); // a2 on, a2x/a2y off
    const after = toggleCheck(TREE, READER, s, "c");
    expect(after.checked.has("c")).toBe(true);
    expect(after.checked.has("a2")).toBe(true);
  });

  it("reconciles the ancestor where it lies on the path", () => {
    const s = snapshot({ checked: new Set(["a2"]) });
    const after = toggleCheck(TREE, READER, s, "a2x");
    // Now a2 lies on the path: a2y is still missing, so a2 drops out.
    expect(after.checked.has("a2x")).toBe(true);
    expect(after.checked.has("a2")).toBe(false);
  });

  it("leaves the snapshot unchanged for an unknown key", () => {
    const s = snapshot({ checked: new Set(["c"]) });
    expect(toggleCheck(TREE, READER, s, "gibtesnicht")).toBe(s);
  });
});

describe("Indeterminate – always derived", () => {
  it("reports a partially checked branch as indeterminate", () => {
    const s = toggleCheck(TREE, READER, snapshot(), "a2x");
    const f = treeModel(TREE, READER, { ...s, expanded: new Set(["a", "a2"]) });
    expect(entry(f, "a2")).toMatchObject({ checked: false, indeterminate: true });
    expect(entry(f, "a")).toMatchObject({ checked: false, indeterminate: true });
    expect(entry(f, "a2x")).toMatchObject({ checked: true, indeterminate: false });
    expect(entry(f, "a2y")).toMatchObject({ checked: false, indeterminate: false });
  });

  it("reports a fully checked branch as checked and not indeterminate", () => {
    const s = toggleCheck(TREE, READER, snapshot(), "a");
    const f = treeModel(TREE, READER, { ...s, expanded: new Set(["a"]) });
    expect(entry(f, "a")).toMatchObject({ checked: true, indeterminate: false });
  });

  it("reports an untouched branch as neither", () => {
    const f = flattening(snapshot());
    expect(entry(f, "a")).toMatchObject({ checked: false, indeterminate: false });
  });

  it("never lets an empty branch become indeterminate", () => {
    const f = flattening(toggleCheck(TREE, READER, snapshot(), "b"));
    expect(entry(f, "b")).toMatchObject({ checked: true, indeterminate: false });
  });
});

describe("Search", () => {
  it("shows a deep match with its whole path, although everything is closed", () => {
    const f = flattening(snapshot({ search: "Kassenbuch" }));
    expect(ids(f)).toEqual(["d", "d1", "d1a"]);
    expect(entry(f, "d1a")?.matches).toBe(true);
    // Present only for the path's sake – the surface may dim them.
    expect(entry(f, "d")?.matches).toBe(false);
    expect(entry(f, "d1")?.matches).toBe(false);
  });

  it("brings the children of a branch that matches itself only when it is open", () => {
    const closed = flattening(snapshot({ search: "Bilder" }));
    expect(ids(closed)).toEqual(["a", "a2"]);
    const open = flattening(snapshot({ search: "Bilder", expanded: new Set(["a2"]) }));
    expect(ids(open)).toEqual(["a", "a2", "a2x", "a2y"]);
  });

  it("shows a match even when its ancestor matches itself and is closed", () => {
    // "Anlagen" matches itself and has a matching descendant in
    // "Anlagenverzeichnis". Whoever expands only the ancestors of matches
    // that do not match themselves loses this one entirely.
    const deep: Folder[] = [
      { id: "p", name: "Anlagen", children: [{ id: "p1", name: "Anlagenverzeichnis" }] },
    ];
    const f = treeModel(deep, READER, snapshot({ search: "anlagen" }));
    expect(f.map((e) => e.key)).toEqual(["p", "p1"]);
  });

  it("dims only the ancestors of a match, not the children of a match", () => {
    // A child under a matching branch is neither a match nor a signpost – it
    // is context. Treating both the same dims half the view.
    const f = flattening(snapshot({ search: "Anlagen", expanded: new Set(["a"]) }));
    expect(entry(f, "a")).toMatchObject({ matches: true, pathOnly: false });
    expect(entry(f, "a1")).toMatchObject({ matches: false, pathOnly: false });
    const deeper = flattening(snapshot({ search: "Kassenbuch" }));
    expect(entry(deeper, "d")).toMatchObject({ matches: false, pathOnly: true });
    expect(entry(deeper, "d1a")).toMatchObject({ matches: true, pathOnly: false });
  });

  it("searches without regard to case and to surrounding whitespace", () => {
    expect(ids(flattening(snapshot({ search: "  kAsSeNbUcH  " })))).toEqual([
      "d",
      "d1",
      "d1a",
    ]);
  });

  it("returns nothing for a text without a match", () => {
    expect(flattening(snapshot({ search: "Regenbogen" }))).toEqual([]);
  });

  it("lets every entry count as a match without a search text", () => {
    expect(flattening(snapshot()).every((e) => e.matches)).toBe(true);
  });

  it("leaves the expanded state untouched", () => {
    const before = flattening(snapshot({ expanded: new Set(["a"]) }));
    const during = flattening(snapshot({ expanded: new Set(["a"]), search: "Kassenbuch" }));
    expect(ids(during)).toEqual(["d", "d1", "d1a"]);
    // The search text falls away, and the tree stands exactly as it did.
    const after = flattening(snapshot({ expanded: new Set(["a"]) }));
    expect(ids(after)).toEqual(ids(before));
    expect(after.map((e) => e.expanded)).toEqual(before.map((e) => e.expanded));
  });

  it("does not touch the snapshot it was given", () => {
    // The rule is not "the tree looks the same afterwards" but "the model does
    // not write into the snapshot". Comparing two separately built snapshots
    // cannot see a mutation at all.
    const s = snapshot({
      expanded: new Set(["a"]),
      checked: new Set(["c"]),
      active: "a",
    });
    const expandedBefore = [...s.expanded];
    const checkedBefore = [...s.checked];
    treeModel(TREE, READER, { ...s, search: "Kassenbuch" });
    treeModel(TREE, READER, s);
    expect([...s.expanded]).toEqual(expandedBefore);
    expect([...s.checked]).toEqual(checkedBefore);
    expect(s.active).toBe("a");
  });

  it("counts siblings among the survivors, not in the whole tree", () => {
    // "a" matches Anlagen, Einzelblatt and Archiv – Leer it does not.
    const roots = flattening(snapshot({ search: "a" })).filter((e) => e.level === 0);
    expect(roots.map((e) => e.key)).toEqual(["a", "c", "d"]);
    expect(roots.map((e) => e.position)).toEqual([1, 2, 3]);
    expect(roots.map((e) => e.siblings)).toEqual([3, 3, 3]);
  });

  it("counts siblings on deeper levels under the filter too", () => {
    // "Kassenbuch" leaves exactly one child of "Archiv".
    const f = flattening(snapshot({ search: "Kassenbuch" }));
    expect(entry(f, "d1")).toMatchObject({ level: 1, position: 1, siblings: 1 });
    expect(entry(f, "d")).toMatchObject({ level: 0, position: 1, siblings: 1 });
  });

  it("brings the whole subtree of a self-matching branch when it opens", () => {
    // "Anlagen" matches itself and has a matching descendant in "Vertrag": it
    // opens, and then its subtree counts as context – the children that do
    // not match themselves included.
    const f = flattening(snapshot({ search: "a" }));
    // "Archiv" and "Zweitausend" both carry an a and open in their turn –
    // every match is visible.
    expect(ids(f)).toEqual(["a", "a1", "a2", "a3", "c", "d", "d1", "d1a"]);
    expect(entry(f, "a1")?.matches).toBe(true);
    expect(entry(f, "a2")?.matches).toBe(false);
    expect(entry(f, "a2")?.pathOnly).toBe(false);
  });
});

describe("Transitions", () => {
  const open = snapshot({ expanded: new Set(["a"]), active: "a" });

  it("expands and collapses", () => {
    expect(expand(snapshot(), "a").expanded.has("a")).toBe(true);
    expect(collapse(open, "a").expanded.has("a")).toBe(false);
  });

  it("sets the active node and nothing else", () => {
    const s = setActive(open, "c");
    expect(s.active).toBe("c");
    expect([...s.expanded]).toEqual([...open.expanded]);
    expect([...s.checked]).toEqual([]);
  });

  describe("move", () => {
    const moved = (s: TreeSnapshot, direction: Parameters<typeof move>[2]) =>
      move(flattening(s), s, direction);

    it("goes down and up along the flattening", () => {
      const s = snapshot({ active: "a" });
      expect(moved(s, "down").active).toBe("b");
      expect(moved(snapshot({ active: "b" }), "up").active).toBe("a");
    });

    it("skips the content of a closed branch while doing so", () => {
      // "a" is closed: the next visible node is "b", not "a1".
      expect(moved(snapshot({ active: "a" }), "down").active).toBe("b");
      const s = snapshot({ expanded: new Set(["a"]), active: "a" });
      expect(moved(s, "down").active).toBe("a1");
    });

    it("stays put at the ends", () => {
      expect(moved(snapshot({ active: "a" }), "up").active).toBe("a");
      expect(moved(snapshot({ active: "d" }), "down").active).toBe("d");
    });

    it("reaches the ends of the flattening with start and end", () => {
      const s = snapshot({ expanded: new Set(["a", "a2"]), active: "a2x" });
      expect(moved(s, "start").active).toBe("a");
      expect(moved(s, "end").active).toBe("d");
    });

    it("opens a closed branch with in, without moving the active node", () => {
      const s = moved(snapshot({ active: "a" }), "in");
      expect(s.expanded.has("a")).toBe(true);
      expect(s.active).toBe("a");
    });

    it("steps into an open branch to the first child with in", () => {
      const s = snapshot({ expanded: new Set(["a"]), active: "a" });
      const after = moved(s, "in");
      expect(after.active).toBe("a1");
      expect(after.expanded.has("a")).toBe(true);
    });

    it("does nothing with in at a leaf", () => {
      const s = moved(snapshot({ active: "c" }), "in");
      expect(s.active).toBe("c");
      expect([...s.expanded]).toEqual([]);
    });

    it("does nothing with in at an empty branch", () => {
      const s = moved(snapshot({ active: "b" }), "in");
      expect(s.active).toBe("b");
      expect(s.expanded.has("b")).toBe(false);
    });

    it("closes an open branch with out, without moving the active node", () => {
      const s = snapshot({ expanded: new Set(["a"]), active: "a" });
      const after = moved(s, "out");
      expect(after.expanded.has("a")).toBe(false);
      expect(after.active).toBe("a");
    });

    it("steps out of a closed node to the parent with out", () => {
      const s = snapshot({ expanded: new Set(["a"]), active: "a1" });
      expect(moved(s, "out").active).toBe("a");
    });

    it("does nothing with out at a closed root", () => {
      const s = moved(snapshot({ active: "c" }), "out");
      expect(s.active).toBe("c");
    });

    it("takes the first of the flattening without an active node", () => {
      expect(moved(snapshot(), "down").active).toBe("a");
    });

    it("never checks anything", () => {
      for (const direction of ["up", "down", "in", "out", "start", "end"] as const) {
        expect([...moved(snapshot({ active: "a" }), direction).checked]).toEqual([]);
      }
    });
  });
});

describe("duplicateKey", () => {
  it("reports null where every key occurs once", () => {
    expect(duplicateKey(TREE, READER)).toBeNull();
  });

  it("finds the first duplicate key", () => {
    const duplicate: Folder[] = [
      { id: "x", name: "Eins", children: [{ id: "y", name: "Zwei" }] },
      { id: "y", name: "Drei" },
    ];
    expect(duplicateKey(duplicate, READER)).toBe("y");
  });
});

/* ================= What cannot be checked (ADR-0005) =================

   Its own fixture instead of extending the one above: the tickets demand both
   "extend the existing fixture" and "the existing cases stay green
   unchanged". Adding one root changes every sibling count - the second demand
   is the more important one. */

const EDGE_CASES: Folder[] = [
  {
    id: "g",
    name: "Gemischt",
    children: [
      { id: "g1", name: "Frei" },
      { id: "g2", name: "Gesperrt", disabled: true },
    ],
  },
  {
    id: "w",
    name: "Mit Ungeladenem",
    children: [
      { id: "w1", name: "Da" },
      { id: "u", name: "Ungeladen", unloaded: true },
    ],
  },
  {
    id: "p",
    name: "Ueber Teilgeladenem",
    children: [
      { id: "t", name: "Teilgeladen", unloaded: true, children: [{ id: "t1", name: "Schon da" }] },
    ],
  },
];

const EDGE_READER: NodeReader<Folder> = {
  ...READER,
  disabled: (o) => o.disabled === true,
  unloaded: (o) => o.unloaded === true,
};

const edgeSnapshot = (part: Partial<TreeSnapshot> = {}): TreeSnapshot =>
  snapshot({ expanded: new Set(["g", "w", "p", "t"]), ...part });
const edgeFlattening = (s: TreeSnapshot = edgeSnapshot()) =>
  treeModel(EDGE_CASES, EDGE_READER, s);
const edgeEntry = (id: string, s: TreeSnapshot = edgeSnapshot()) =>
  edgeFlattening(s).find((e) => e.key === id);

/* A disabled node *underneath* an intermediate branch - not directly under the
   touched one. Exactly this depth was missing, and that is why the defect came
   through all the previous tests. */
const DEEP: Folder[] = [
  {
    id: "R",
    name: "Wurzel",
    children: [
      {
        id: "B",
        name: "Zwischen",
        children: [
          { id: "c1", name: "Frei" },
          { id: "d", name: "Gesperrt", disabled: true },
        ],
      },
      { id: "e", name: "Nebenan" },
    ],
  },
];

describe("The counting test holds at every level, not only at the touched node", () => {
  it("leaves an intermediate branch open whose disabled child is outstanding", () => {
    /* The cascade sets a whole subtree. If one reconciles only the path from
       the root to the touched node, every branch *inside* the subtree stays on
       what the cascade set - and thereby claims to be full while something
       underneath it is outstanding. */
    const s = toggleCheck(DEEP, EDGE_READER, snapshot(), "R");
    expect(s.checked.has("c1")).toBe(true);
    expect(s.checked.has("d")).toBe(false);
    expect(s.checked.has("B")).toBe(false);
    expect(s.checked.has("R")).toBe(false);
  });

  it("unchecks again on the second click instead of getting stuck", () => {
    /* The case a person finds by clicking and no test had so far: a branch
       with a disabled child can by rule 2 never be checked itself. If one
       reads the direction from its own state, it is permanently "check" - the
       first click sets everything checkable, every further one sets the same
       again, and the tree is stuck. */
    const first = toggleCheck(DEEP, EDGE_READER, snapshot(), "R");
    expect([...first.checked].sort()).toEqual(["c1", "e"]);
    const second = toggleCheck(DEEP, EDGE_READER, first, "R");
    expect([...second.checked]).toEqual([]);
  });

  it("leaves the disabled node as it is while doing so", () => {
    // Unchecking takes away what the user may take away - and only that.
    const withDisabled = snapshot({ checked: new Set(["d"]) });
    const on = toggleCheck(DEEP, EDGE_READER, withDisabled, "R");
    expect([...on.checked].sort()).toEqual(["B", "R", "c1", "d", "e"]);
    const off = toggleCheck(DEEP, EDGE_READER, on, "R");
    expect([...off.checked]).toEqual(["d"]);
  });

  it("holds just the same for a range", () => {
    const s = setChecked(DEEP, EDGE_READER, snapshot(), ["R"], true);
    expect(s.checked.has("B")).toBe(false);
    expect(s.checked.has("R")).toBe(false);
  });

  it("agrees with toggleAll – the model must not contradict itself", () => {
    const viaToggle = toggleCheck(DEEP, EDGE_READER, snapshot(), "R");
    const viaAll = toggleAll(DEEP, EDGE_READER, snapshot());
    expect([...viaToggle.checked].sort()).toEqual([...viaAll.checked].sort());
  });
});

describe("The counting test takes every child as it is", () => {
  /* The pair ADR-0005 is about. Exactly these two assurances are the whole
     argument: taking disabled children out of the counting test would have
     reported the parent as full while a child is outstanding - and *that* is
     the state no checkbox can show honestly. */

  it("leaves the branch open as long as a disabled child is outstanding", () => {
    const s = toggleCheck(EDGE_CASES, EDGE_READER, edgeSnapshot(), "g");
    expect(s.checked.has("g1")).toBe(true);
    expect(s.checked.has("g2")).toBe(false);
    expect(s.checked.has("g")).toBe(false);
  });

  it("makes the branch full where the disabled child arrived checked", () => {
    const s = toggleCheck(
      EDGE_CASES,
      EDGE_READER,
      edgeSnapshot({ checked: new Set(["g2"]) }),
      "g1",
    );
    expect(s.checked.has("g")).toBe(true);
  });
});

describe("The cascade leaves behind what it may not check", () => {
  it("skips a disabled node and lets its state stand", () => {
    const off = toggleCheck(EDGE_CASES, EDGE_READER, edgeSnapshot(), "g");
    expect(off.checked.has("g2")).toBe(false);
    const on = toggleCheck(
      EDGE_CASES,
      EDGE_READER,
      edgeSnapshot({ checked: new Set(["g2"]) }),
      "g",
    );
    expect(on.checked.has("g2")).toBe(true);
  });

  it("skips an unloaded branch", () => {
    const s = toggleCheck(EDGE_CASES, EDGE_READER, edgeSnapshot(), "w");
    expect(s.checked.has("w1")).toBe(true);
    expect(s.checked.has("u")).toBe(false);
    // And thereby the parent can never be full - rightly so, because nobody
    // has seen the descendants of "u".
    expect(s.checked.has("w")).toBe(false);
  });

  it("descends through an unloaded branch to its loaded children", () => {
    // Touched from above: "t" itself is left behind, its already loaded child
    // is checked along - and "p" stays open, because "t" is outstanding.
    const s = toggleCheck(EDGE_CASES, EDGE_READER, edgeSnapshot(), "p");
    expect(s.checked.has("t")).toBe(false);
    expect(s.checked.has("t1")).toBe(true);
    expect(s.checked.has("p")).toBe(false);
  });

  it("does not reconcile an unloaded branch from below", () => {
    const s = toggleCheck(EDGE_CASES, EDGE_READER, edgeSnapshot(), "t1");
    expect(s.checked.has("t1")).toBe(true);
    // All loaded children of "t" are checked – "t" still does not become
    // full, because there could be more.
    expect(s.checked.has("t")).toBe(false);
  });

  it("does nothing at all at a node that may not be checked", () => {
    const before = edgeSnapshot();
    expect(toggleCheck(EDGE_CASES, EDGE_READER, before, "g2")).toBe(before);
    expect(toggleCheck(EDGE_CASES, EDGE_READER, before, "u")).toBe(before);
  });

  it("does not rewrite a restored snapshot", () => {
    const s = edgeSnapshot({ checked: new Set(["g2"]) });
    const after = toggleCheck(EDGE_CASES, EDGE_READER, s, "w1");
    expect(after.checked.has("g2")).toBe(true);
  });
});

describe("Indeterminate, disabled, unloaded in the flattening", () => {
  it("reports a branch as indeterminate whose only checked node is disabled", () => {
    const f = edgeFlattening(edgeSnapshot({ checked: new Set(["g2"]) }));
    expect(f.find((e) => e.key === "g")).toMatchObject({
      checked: false,
      indeterminate: true,
    });
  });

  it("carries the two marks", () => {
    expect(edgeEntry("g2")).toMatchObject({ disabled: true, unloaded: false });
    expect(edgeEntry("u")).toMatchObject({ disabled: false, unloaded: true });
    expect(edgeEntry("g1")).toMatchObject({ disabled: false, unloaded: false });
  });

  it("holds an unloaded node for a branch and not for empty", () => {
    // Otherwise it would look like a leaf, and nobody would ever expand it.
    expect(edgeEntry("u")).toMatchObject({ branch: true, empty: false });
    expect(edgeEntry("t")).toMatchObject({ branch: true, empty: false });
  });

  it("carries the label along", () => {
    expect(edgeEntry("g1")?.label).toBe("Frei");
  });
});

describe("Search at the edges", () => {
  it("lets an unloaded branch survive every filter", () => {
    // It cannot be searched, so it is never said to contain nothing.
    const f = edgeFlattening(edgeSnapshot({ search: "zzz" }));
    expect(f.map((e) => e.key).sort()).toEqual(["p", "t", "u", "w"]);
    expect(f.find((e) => e.key === "u")?.unloaded).toBe(true);
  });

  it("filters a disabled node like any other", () => {
    // Being disabled says nothing about whether something matches.
    expect(
      edgeFlattening(edgeSnapshot({ search: "Gesperrt" })).map((e) => e.key),
    ).toContain("g2");
    expect(edgeFlattening(edgeSnapshot({ search: "zzz" })).map((e) => e.key)).not.toContain(
      "g2",
    );
  });
});

describe("pathTo – the path from the root to a key", () => {
  it("finds a root, a child and a grandchild", () => {
    expect(pathTo(TREE, READER, "a")).toEqual(["a"]);
    expect(pathTo(TREE, READER, "a2")).toEqual(["a", "a2"]);
    expect(pathTo(TREE, READER, "a2x")).toEqual(["a", "a2", "a2x"]);
  });

  it("reports null for a key that does not exist", () => {
    expect(pathTo(TREE, READER, "gibtesnicht")).toBeNull();
    // Also where the node would lie under an unloaded branch: it is not in
    // the data, and the tree knows no more than that.
    expect(pathTo(EDGE_CASES, EDGE_READER, "u1")).toBeNull();
  });
});

describe("revealPath – expand as far as possible", () => {
  it("expands every loaded ancestor and reports the target", () => {
    const { snapshot: after, reached } = revealPath(TREE, READER, snapshot(), [
      "a",
      "a2",
      "a2x",
    ]);
    expect(reached).toBe("a2x");
    expect([...after.expanded].sort()).toEqual(["a", "a2"]);
    // The target itself is not expanded - it is a leaf, and a branch too is
    // meant to be shown and not opened.
    expect(after.expanded.has("a2x")).toBe(false);
  });

  it("reports the unloaded branch it gets stuck at", () => {
    // The deep link knows the path, the data does not know it yet.
    const { snapshot: after, reached } = revealPath(EDGE_CASES, EDGE_READER, snapshot(), [
      "w",
      "u",
      "u1",
    ]);
    expect(reached).toBe("u");
    // And it is expanded – that is exactly what triggers the loading.
    expect(after.expanded.has("w")).toBe(true);
    expect(after.expanded.has("u")).toBe(true);
  });

  it("reports null where already the first step is unknown", () => {
    const { reached } = revealPath(TREE, READER, snapshot(), ["fremd", "a"]);
    expect(reached).toBeNull();
  });

  it("does not touch the checks and the search", () => {
    const before = snapshot({ checked: new Set(["c"]), search: "x" });
    const { snapshot: after } = revealPath(TREE, READER, before, ["a", "a2"]);
    expect([...after.checked]).toEqual(["c"]);
    expect(after.search).toBe("x");
  });
});

describe("Collapsing everything", () => {
  it("leaves nothing open – not even what a search had expanded", () => {
    /* A search never writes the expanded state; what it shows is merely
       computed that way. Collapsing clears the state, and afterwards nothing
       is open any more even without a search text. */
    const withSearch = snapshot({ expanded: new Set(["a"]), search: "Kassenbuch" });
    expect(ids(treeModel(TREE, READER, withSearch))).toEqual(["d", "d1", "d1a"]);
    const closed = { ...withSearch, expanded: new Set<string>(), search: "" };
    expect(ids(treeModel(TREE, READER, closed))).toEqual(["a", "b", "c", "d"]);
  });
});

describe("allBranches – what 'expand everything' expands", () => {
  it("names every loaded branch with content", () => {
    expect(allBranches(TREE, READER).sort()).toEqual(["a", "a2", "d", "d1"]);
  });

  it("leaves empty branches out – expanding showed nothing", () => {
    expect(allBranches(TREE, READER)).not.toContain("b");
  });

  it("leaves unloaded branches out – one click, a thousand requests", () => {
    expect(allBranches(EDGE_CASES, EDGE_READER).sort()).toEqual(["g", "p", "w"]);
  });
});

describe("typeaheadTarget – the typeahead", () => {
  /* a Anlagen | a1 Vertrag | a2 Bilder | a2x Skizze | a2y Foto | a3 Notiz
     b Leer | c Einzelblatt | d Archiv */
  const visible = flattening(snapshot({ expanded: new Set(["a", "a2"]) }));

  it("jumps to the next node that starts like this", () => {
    expect(typeaheadTarget(visible, "n", "a")).toBe("a3");
  });

  it("pays no attention to case", () => {
    expect(typeaheadTarget(visible, "N", "a")).toBe("a3");
  });

  it("wraps around at the end", () => {
    // From "Archiv" onwards no A follows – so it continues at the front.
    expect(typeaheadTarget(visible, "a", "d")).toBe("a");
  });

  it("moves on with a single letter instead of staying put", () => {
    // One letter pressed twice has to move on, not find the same node again:
    // "Anlagen" -> "Archiv".
    expect(typeaheadTarget(visible, "a", "a")).toBe("d");
  });

  it("refines with several letters instead of jumping onwards", () => {
    /* Two nodes start with "Ge": Gemischt and Gesperrt. Standing on the
       first, "ge" has to stay there - a matcher that searches behind the
       current node on the second character too would land on the second.

       With TREE this could not be shown: there "an" matches a single node
       only, and the wrap-around at the end would find it again anyway.
       Exactly what the first version of this test ran past. */
    const g = edgeFlattening();
    expect(typeaheadTarget(g, "ge", "g")).toBe("g");
    // A single "g" moves on, by contrast – to the next one that starts like
    // this, and that is "Gesperrt".
    expect(typeaheadTarget(g, "g", "g")).toBe("g2");
  });

  it("reports null where nothing fits", () => {
    expect(typeaheadTarget(visible, "zz", "a")).toBeNull();
  });

  it("changes nothing but the active node", () => {
    const before = snapshot({
      expanded: new Set(["a", "a2"]),
      checked: new Set(["c"]),
      active: "a",
      search: "",
    });
    const target = typeaheadTarget(flattening(before), "n", "a");
    const after = setActive(before, target);
    expect(after.active).toBe("a3");
    expect([...after.expanded].sort()).toEqual(["a", "a2"]);
    expect([...after.checked]).toEqual(["c"]);
    expect(after.search).toBe("");
    expect(after.anchor).toBe(before.anchor);
  });

  it("copes with an active node that no longer exists", () => {
    expect(typeaheadTarget(visible, "a", "weg")).toBe("a");
  });

  it("starts at the front without an active node", () => {
    expect(typeaheadTarget(visible, "e", null)).toBe("c");
  });

  it("takes disabled and unloaded nodes as targets", () => {
    // Both are navigable; typeahead moves only the focus.
    const g = edgeFlattening();
    expect(typeaheadTarget(g, "ges", "g")).toBe("g2");
    expect(typeaheadTarget(g, "ung", "g")).toBe("u");
  });
});

describe("Range selection", () => {
  const open = snapshot({ expanded: new Set(["a", "a2"]) });
  // a | a1 | a2 | a2x | a2y | a3 | b | c | d
  const visible = flattening(open);
  const between = (from: string, to: string) => keysBetween(visible, from, to);

  it("names the keys between two nodes, in both directions", () => {
    expect(between("a1", "a3")).toEqual(["a1", "a2", "a2x", "a2y", "a3"]);
    expect(between("a3", "a1")).toEqual(["a1", "a2", "a2x", "a2y", "a3"]);
  });

  it("names exactly one where start and end are the same", () => {
    expect(between("c", "c")).toEqual(["c"]);
  });

  it("leaves out what may not be checked", () => {
    const g = edgeFlattening();
    // g | g1 | g2(disabled) | w | w1 | u(unloaded) | p | t(unloaded) | t1
    expect(keysBetween(g, "g1", "u")).toEqual(["g1", "w", "w1"]);
  });

  it("reports nothing where one end is not visible", () => {
    expect(between("a1", "fremd")).toEqual([]);
  });
});

describe("setChecked – sets instead of toggling", () => {
  it("checks a whole range", () => {
    const s = setChecked(TREE, READER, snapshot(), ["a1", "a3"], true);
    expect(s.checked.has("a1")).toBe(true);
    expect(s.checked.has("a3")).toBe(true);
  });

  it("cascades and reconciles like a single check", () => {
    const s = setChecked(TREE, READER, snapshot(), ["a1", "a2", "a3"], true);
    // a2 cascades onto its children ...
    expect(s.checked.has("a2x")).toBe(true);
    expect(s.checked.has("a2y")).toBe(true);
    // ... and thereby a is complete.
    expect(s.checked.has("a")).toBe(true);
  });

  it("sets instead of toggling – otherwise a child would undo its parent", () => {
    /* Exactly the case the ticket demands a decision on: if the range
       contains a branch *and* one of its children, a sequence of toggles
       would touch the child twice and uncheck it again. */
    const s = setChecked(TREE, READER, snapshot(), ["a2", "a2x"], true);
    expect(s.checked.has("a2x")).toBe(true);
    expect(s.checked.has("a2y")).toBe(true);
    expect(s.checked.has("a2")).toBe(true);
  });

  it("unchecks a range again", () => {
    const on = setChecked(TREE, READER, snapshot(), ["a1", "a2", "a3"], true);
    const off = setChecked(TREE, READER, on, ["a1", "a2", "a3"], false);
    expect([...off.checked]).toEqual([]);
  });

  it("leaves the disabled alone", () => {
    const s = setChecked(EDGE_CASES, EDGE_READER, edgeSnapshot(), ["g1", "g2"], true);
    expect(s.checked.has("g1")).toBe(true);
    expect(s.checked.has("g2")).toBe(false);
    expect(s.checked.has("g")).toBe(false);
  });
});

describe("toggleAll – everything checkable", () => {
  it("checks everything that may be checked", () => {
    const s = toggleAll(TREE, READER, snapshot());
    expect(s.checked.has("a")).toBe(true);
    expect(s.checked.has("a2x")).toBe(true);
    expect(s.checked.has("d1a")).toBe(true);
  });

  it("empties where everything checkable is checked already", () => {
    const full = toggleAll(TREE, READER, snapshot());
    expect([...toggleAll(TREE, READER, full).checked]).toEqual([]);
  });

  it("counts a tree with disabled nodes as full where everything else is checked", () => {
    /* Any other reading would make the gesture useless in exactly those trees
       that need it. */
    const full = toggleAll(EDGE_CASES, EDGE_READER, edgeSnapshot());
    expect(full.checked.has("g2")).toBe(false);
    expect([...toggleAll(EDGE_CASES, EDGE_READER, full).checked]).toEqual([]);
  });

  it("leaves a branch open whose disabled child is outstanding", () => {
    const full = toggleAll(EDGE_CASES, EDGE_READER, edgeSnapshot());
    expect(full.checked.has("g1")).toBe(true);
    expect(full.checked.has("g")).toBe(false);
  });
});

describe("setAnchor", () => {
  it("sets it and touches nothing else", () => {
    const s = setAnchor(snapshot({ active: "a" }), "c");
    expect(s.anchor).toBe("c");
    expect(s.active).toBe("a");
    expect([...s.checked]).toEqual([]);
  });
});
