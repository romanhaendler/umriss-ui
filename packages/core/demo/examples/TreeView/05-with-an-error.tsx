import { useState } from "react";
import { FormField, Stack, TreeSearch, TreeView, useTree } from "../../../src";
import type { NodeReader } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` on the `TreeSearch` while your check fails and give its reason to the `FormField` as `error`: the field turns red and reads the reason out. Tick a service to clear it.";

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const TEAMS: Node[] = [
  {
    id: "payments",
    name: "Payments",
    children: [
      { id: "checkout", name: "Checkout" },
      { id: "billing", name: "Billing" },
    ],
  },
  {
    id: "discovery",
    name: "Discovery",
    children: [
      { id: "search", name: "Search" },
      { id: "images", name: "Image service" },
    ],
  },
];

const READER: NodeReader<Node> = { key: (n) => n.id, children: (n) => n.children, label: (n) => n.name };

export default function WithAnError() {
  const [checked, setChecked] = useState<ReadonlySet<string>>(() => new Set());
  const tree = useTree(TEAMS, { reader: READER, checked, onChecked: setChecked, defaultExpanded: ["payments"] });
  const error = checked.size === 0 ? "Tick at least one service, or the alert rule watches nothing." : undefined;

  return (
    <Stack gap={2} style={{ maxWidth: 360 }}>
      <FormField label="Services the alert rule watches" error={error}>
        <TreeSearch tree={tree} size="sm" invalid={error !== undefined} />
      </FormField>
      <TreeView tree={tree} ariaLabel="Services by team" checkable>
        {(entry) => entry.node.name}
      </TreeView>
    </Stack>
  );
}
