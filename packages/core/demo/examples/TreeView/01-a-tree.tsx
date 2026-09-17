import { TreeView, useTree } from "../../../src";
import type { NodeReader } from "../../../src";

export const title = "A tree";

/* The smallest tree there is: a handful of nodes, one of them active, and the
   arrow keys. No ticking, no search, no virtualisation - those are the examples
   below this one.

   `useTree` takes the caller's data and a reader that says how to get a key, a
   label and the children out of it. The library never owns the data; it owns
   the view state over it. */

interface Folder {
  id: string;
  name: string;
  children?: Folder[];
}

const FILING: Folder[] = [
  {
    id: "contracts",
    name: "Contracts",
    children: [
      { id: "framework", name: "Framework contracts" },
      { id: "single", name: "Single orders" },
    ],
  },
  { id: "documents", name: "Documents", children: [{ id: "2026", name: "2026" }] },
  { id: "statutes", name: "Statutes.pdf" },
];

const READER: NodeReader<Folder> = {
  key: (e) => e.id,
  children: (e) => e.children,
  label: (e) => e.name,
};

export default function ATree() {
  const tree = useTree(FILING, { reader: READER, defaultExpanded: ["contracts"], defaultActive: "framework" });

  return (
    <TreeView tree={tree} ariaLabel="Filing">
      {(e) => e.node.name}
    </TreeView>
  );
}
