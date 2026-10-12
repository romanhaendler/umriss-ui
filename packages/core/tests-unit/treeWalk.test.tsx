/* Walking a tree: moving the active node is not a reason to flatten the tree
   again, and the entries a move did not touch stay the same objects. */

import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTree, type NodeReader } from "../src/components/TreeView";

interface Item {
  id: string;
  children?: Item[];
}

const ROOTS: Item[] = [
  { id: "a", children: [{ id: "a1" }, { id: "a2" }] },
  { id: "b", children: [{ id: "b1" }] },
  { id: "c" },
];

function walk() {
  const calls = { children: 0 };
  const reader: NodeReader<Item> = {
    key: (o) => o.id,
    children: (o) => {
      calls.children += 1;
      return o.children;
    },
    label: (o) => o.id,
  };
  const hook = renderHook(() =>
    useTree(ROOTS, { reader, defaultExpanded: ["a", "b"], defaultActive: "a" }),
  );
  return { calls, hook };
}

describe("Moving the active node", () => {
  it("does not read the nodes again", () => {
    const { calls, hook } = walk();
    const before = calls.children;
    act(() => hook.result.current.move("down"));
    expect(hook.result.current.active).toBe("a1");
    expect(calls.children).toBe(before);
  });

  it("keeps every entry it did not touch", () => {
    const { hook } = walk();
    const before = hook.result.current.flattening;
    act(() => hook.result.current.move("down"));
    const after = hook.result.current.flattening;
    expect(after.map((e) => e.active)).toEqual(before.map((e) => e.key === "a1"));
    for (const [i, entry] of before.entries()) {
      if (entry.key !== "a" && entry.key !== "a1") expect(after[i]).toBe(entry);
    }
  });

  it("still flattens again when something open changes", () => {
    const { calls, hook } = walk();
    const before = calls.children;
    act(() => hook.result.current.collapseAll());
    expect(calls.children).toBeGreaterThan(before);
  });
});
