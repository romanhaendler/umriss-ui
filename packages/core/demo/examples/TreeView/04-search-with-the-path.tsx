import { useState } from "react";
import { Stack, TreeSearch, TreeView, useTree } from "../../../src";
import type { NodeReader } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */
interface Service {
  id: string;
  name: string;
  team: string;
  /** 1 is customer-facing and pages at night; 3 waits for the morning. */
  tier: 1 | 2 | 3;
  /** The latency objective: the 95th percentile stays below this, in ms. */
  latencySlo: number;
  /** The availability promised for a month, in per cent. */
  availabilityTarget: number;
}

const SERVICES: readonly Service[] = [
  { id: "checkout", name: "Checkout", team: "Payments", tier: 1, latencySlo: 300, availabilityTarget: 99.95 },
  { id: "billing", name: "Billing", team: "Payments", tier: 1, latencySlo: 400, availabilityTarget: 99.9 },
  { id: "sign-in", name: "Sign-in", team: "Identity", tier: 1, latencySlo: 200, availabilityTarget: 99.95 },
  { id: "search", name: "Search", team: "Discovery", tier: 1, latencySlo: 250, availabilityTarget: 99.9 },
  { id: "images", name: "Image service", team: "Discovery", tier: 2, latencySlo: 500, availabilityTarget: 99.5 },
  { id: "notifications", name: "Notifications", team: "Messaging", tier: 2, latencySlo: 800, availabilityTarget: 99.5 },
  { id: "webhooks", name: "Webhooks", team: "Integrations", tier: 2, latencySlo: 1000, availabilityTarget: 99.5 },
  { id: "reports", name: "Reporting", team: "Insights", tier: 3, latencySlo: 2000, availabilityTarget: 99 },
];

export const title = "Search with the path";
export const lead = "Put a `TreeSearch` beside the tree: each find keeps the dimmed path above it, and a search without finds says so.";

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const TEAMS: Node[] = [...new Set(SERVICES.map((service) => service.team))].map((team) => ({
  id: team,
  name: team,
  children: SERVICES.filter((service) => service.team === team).map((service) => ({ id: service.id, name: service.name })),
}));

const READER: NodeReader<Node> = { key: (n) => n.id, children: (n) => n.children, label: (n) => n.name };

export default function SearchWithThePath() {
  const [term, setTerm] = useState("check");
  const tree = useTree(TEAMS, { reader: READER, search: term, onSearch: setTerm });

  return (
    <Stack gap={2} style={{ maxWidth: 320 }}>
      <TreeSearch tree={tree} aria-label="Search the services" size="sm" />
      <TreeView tree={tree} ariaLabel="Services by team">
        {(entry) => entry.node.name}
      </TreeView>
    </Stack>
  );
}
