import { useId, useState } from "react";
import { Stack, Text, TreeSearch, TreeView, useTree } from "../../../src";
import type { NodeReader } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the `TreeSearch` invalid by itself. Without one, set `invalid` and tie your message to the field with `aria-describedby`. Tick a service to clear it.";

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
  const messageId = useId();
  const error = checked.size === 0 ? "Tick at least one service, or the alert rule watches nothing." : undefined;

  return (
    <Stack gap={2} style={{ maxWidth: 360 }}>
      <Stack gap={1}>
        <TreeSearch
          tree={tree}
          size="sm"
          aria-label="Search the services the alert rule watches"
          invalid={error !== undefined}
          aria-describedby={error ? messageId : undefined}
        />
        {error && (
          <Text id={messageId} size="xs" style={{ color: "var(--u-color-danger-text)" }}>
            {error}
          </Text>
        )}
      </Stack>
      <TreeView tree={tree} ariaLabel="Services by team" checkable>
        {(entry) => entry.node.name}
      </TreeView>
    </Stack>
  );
}
