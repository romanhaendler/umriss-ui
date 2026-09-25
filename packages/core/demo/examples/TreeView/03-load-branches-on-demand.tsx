import { useState } from "react";
import { TreeView, useTree } from "../../../src";
import type { NodeReader } from "../../../src";

export const title = "Load branches on demand";
export const lead = "Mark a branch `unloaded` in the reader and fetch in `onLoadChildren`; the branch shows it is loading until your data brings its children.";

interface Place {
  id: string;
  name: string;
  children?: Place[];
  unloaded?: boolean;
}

const DEPOTS: Place[] = [
  { id: "north", name: "North depot", unloaded: true },
  { id: "river", name: "Riverside depot", unloaded: true },
  { id: "east", name: "East Gate depot", unloaded: true },
];

/** What the server would answer, after a while. */
const TOURS: Record<string, string[]> = {
  north: ["T-01 · FP 214 K", "T-02 · FP 377 K", "T-03 · FP 118 R"],
  river: ["T-04 · FP 402 R", "T-05 · FP 455 R"],
  east: ["T-06 · FP 290 E", "T-07 · FP 311 E", "T-08 · FP 520 E"],
};

const READER: NodeReader<Place> = {
  key: (p) => p.id,
  children: (p) => p.children,
  label: (p) => p.name,
  unloaded: (p) => p.unloaded === true,
};

export default function LoadBranchesOnDemand() {
  const [depots, setDepots] = useState(DEPOTS);
  const load = (depot: Place) => {
    window.setTimeout(() => {
      setDepots((previous) =>
        previous.map((p) =>
          p.id === depot.id
            ? { ...p, unloaded: false, children: TOURS[p.id]!.map((name) => ({ id: `${p.id}/${name}`, name })) }
            : p,
        ),
      );
    }, 800);
  };
  const tree = useTree(depots, { reader: READER, onLoadChildren: load });

  return (
    <TreeView tree={tree} ariaLabel="Today's tours by depot">
      {(entry) => entry.node.name}
    </TreeView>
  );
}
