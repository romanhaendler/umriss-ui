import { useState } from "react";
import { Stack, TreeSearch, TreeView, useTree } from "../../../src";
import type { NodeReader } from "../../../src";
import { SERVICES } from "@umriss-ui/demo/worlds/operations";

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
