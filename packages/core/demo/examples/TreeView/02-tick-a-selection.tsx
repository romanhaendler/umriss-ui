import { useState } from "react";
import { Stack, Text, TreeView, useTree } from "../../../src";
import type { NodeReader } from "../../../src";

export const title = "Tick a selection";
export const lead = "Set `checkable` and keep the `checked` keys; a tick cascades down, and a partly ticked team shows as mixed.";

interface Member {
  id: string;
  name: string;
  children?: Member[];
}

const TEAMS: Member[] = [
  {
    id: "web",
    name: "Web",
    children: [
      { id: "arjun", name: "Arjun Mehta" },
      { id: "chloe", name: "Chloe Durand" },
      { id: "noah", name: "Noah Fischer" },
    ],
  },
  {
    id: "apps",
    name: "Apps",
    children: [
      { id: "hana", name: "Hana Sato" },
      { id: "kofi", name: "Kofi Mensah" },
    ],
  },
];

const READER: NodeReader<Member> = { key: (m) => m.id, children: (m) => m.children, label: (m) => m.name };

export default function TickASelection() {
  const [checked, setChecked] = useState<ReadonlySet<string>>(() => new Set(["arjun", "chloe"]));
  const tree = useTree(TEAMS, { reader: READER, checked, onChecked: setChecked, defaultExpanded: ["web"] });

  return (
    <Stack gap={2}>
      <TreeView tree={tree} ariaLabel="People for sprint 15" checkable>
        {(entry) => entry.node.name}
      </TreeView>
      <Text size="xs" tone="muted">
        Checked: {[...checked].sort().join(", ") || "nobody"}
      </Text>
    </Stack>
  );
}
