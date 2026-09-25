import { TreeView, useTree } from "../../../src";
import type { NodeReader } from "../../../src";

export const title = "A tree";
export const lead = "Hand your data and a `reader` to `useTree`; the reader says how to get a node's key, label and children.";

interface Unit {
  id: string;
  name: string;
  children?: Unit[];
}

const COMPANY: Unit[] = [
  {
    id: "commercial",
    name: "Commercial",
    children: [
      { id: "CC-1100", name: "Sales, CC-1100" },
      { id: "CC-1200", name: "Marketing, CC-1200" },
    ],
  },
  {
    id: "product",
    name: "Product",
    children: [
      { id: "CC-2100", name: "Engineering, CC-2100" },
      { id: "CC-2200", name: "Design, CC-2200" },
    ],
  },
  { id: "CC-3100", name: "Customer service, CC-3100" },
];

const READER: NodeReader<Unit> = {
  key: (unit) => unit.id,
  children: (unit) => unit.children,
  label: (unit) => unit.name,
};

export default function ATree() {
  const tree = useTree(COMPANY, { reader: READER, defaultExpanded: ["commercial"], defaultActive: "CC-1200" });

  return (
    <TreeView tree={tree} ariaLabel="Cost centres">
      {(entry) => entry.node.name}
    </TreeView>
  );
}
