import { useState } from "react";
import { Stack, Text, TreeView, useTree } from "../../../src";
import type { NodeReader } from "../../../src";

export const title = "Ticking, and the indeterminate parent";

/* The model decision a reader most often comes for: ticking cascades downwards,
   and a parent whose children are only partly checked is INDETERMINATE - a third
   state, not a half-hearted second one.

   The checked set is the caller's, and it is a set of keys. The active node -
   where the arrow keys are - is a different state and is never derived from it
   (ADR-0003). */

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
      { id: "fc-north", name: "Nordwerk GmbH" },
      { id: "fc-south", name: "Suedbahn AG" },
      { id: "fc-east", name: "Ostmarkt eG" },
    ],
  },
  { id: "statutes", name: "Statutes.pdf" },
];

const READER: NodeReader<Folder> = { key: (e) => e.id, children: (e) => e.children, label: (e) => e.name };

export default function Ticking() {
  const [checked, setChecked] = useState<ReadonlySet<string>>(() => new Set(["fc-north"]));
  const tree = useTree(FILING, { reader: READER, checked, onChecked: setChecked, defaultExpanded: ["contracts"] });

  return (
    <Stack gap={2}>
      <TreeView tree={tree} ariaLabel="Filing with a selection" checkable>
        {(e) => e.node.name}
      </TreeView>
      <Text size="xs" tone="muted">
        Checked: {[...checked].sort().join(", ") || "nothing"}
      </Text>
    </Stack>
  );
}
