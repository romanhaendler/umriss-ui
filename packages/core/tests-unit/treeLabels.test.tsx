import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TreeView, useTree, type NodeReader } from "../src/components/TreeView";

const reader: NodeReader<{ id: string }> = { key: (n) => n.id, children: () => undefined, label: (n) => n.id };

function Fixture({ checkable }: { checkable: boolean }) {
  const tree = useTree([{ id: "a very long label that the row cuts off" }], { reader });
  return (
    <TreeView tree={tree} aria-label="t" checkable={checkable}>
      {(e) => e.node.id}
    </TreeView>
  );
}

describe("tree rows", () => {
  it("carry the full label as a title, for a label the row cuts off", () => {
    render(<Fixture checkable={false} />);
    expect(screen.getByTitle("a very long label that the row cuts off")).toBeTruthy();
  });

  it("have aria-selected on no row, checkable or not", () => {
    for (const checkable of [false, true]) {
      const { unmount } = render(<Fixture checkable={checkable} />);
      expect(screen.getByRole("treeitem").hasAttribute("aria-selected")).toBe(false);
      unmount();
    }
  });
});
