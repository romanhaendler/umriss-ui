/* Four trees over one filing, because the component's parts are one
   behaviour: the keys run on the flat list, and virtualisation shows only a
   window of it. The active node and the checks are two states (ADR-0003); the
   tree with checks and the one with an active node only show both.

   `data-role` is a selector the interaction suite reads. */

import { useMemo, useState } from "react";
import { Button, Grid, Stack, Text, TreeSearch, TreeView, useTree } from "../../../src";
import type { NodeReader } from "../../../src";

export const title = "Search, check and reveal in a large tree";

export const lead =
  "In a company's filing, checks cascade, a search keeps the path, locked years stay unchecked, and `revealNode` finds any of 240 nodes.";

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  /** May be seen but not chosen - a closed financial year, say. */
  locked?: boolean;
  /** The children have not been loaded yet. */
  unloaded?: boolean;
}

const FILING: TreeNode[] = [
  {
    id: "contracts",
    name: "Contracts",
    children: [
      {
        id: "framework",
        name: "Framework contracts",
        children: [
          { id: "fc-brandlow", name: "Brandlow Office Supply" },
          { id: "fc-nimbrel", name: "Nimbrel Software" },
          { id: "fc-corrin", name: "Corrin Travel" },
        ],
      },
      {
        id: "single",
        name: "Single orders",
        children: [
          { id: "so-4711", name: "Order 4711" },
          { id: "so-4712", name: "Order 4712" },
        ],
      },
      { id: "terminations", name: "Terminations", children: [] },
      { id: "external", name: "External mandates", locked: true },
    ],
  },
  {
    id: "documents",
    name: "Documents",
    children: [
      {
        id: "2026",
        name: "2026",
        children: [
          { id: "d-q1", name: "Quarter 1" },
          { id: "d-q2", name: "Quarter 2" },
        ],
      },
      { id: "2025", name: "2025", children: [{ id: "d-2025", name: "Annual accounts" }] },
      { id: "2024", name: "2024 (closed)", locked: true },
    ],
  },
  { id: "statutes", name: "Articles of association.pdf" },
  { id: "inbox", name: "Inbox", unloaded: true },
];

/* A large body for the reach: large enough that only a window of it stands in
   the document, and deep enough that "reveal" has to expand something. */
const MANY: TreeNode[] = Array.from({ length: 40 }, (_, i) => ({
  id: `f${i}`,
  name: `Folder ${i}`,
  children: Array.from({ length: 5 }, (_, k) => ({ id: `f${i}-${k}`, name: `Sheet ${i}.${k}` })),
}));

const READER: NodeReader<TreeNode> = {
  key: (e) => e.id,
  children: (e) => e.children,
  label: (e) => e.name,
  disabled: (e) => e.locked === true,
  unloaded: (e) => e.unloaded === true,
};

export default function SearchCheckAndReveal() {
  /* All three framework contracts: the branch above them is thereby fully
     checked, the branch above that only partly. Both states at a glance. */
  /* Loading belongs to the caller: the tree reports only that an unloaded
     branch was opened. Here a delay is simulated and the own copy of the data
     is then extended - the tree re-renders, and `unloaded` falls away with the
     data. */
  const [filing, setFiling] = useState<TreeNode[]>(FILING);
  const load = (node: TreeNode) => {
    if (node.id !== "inbox") return;
    window.setTimeout(() => {
      setFiling((previous) =>
        previous.map((n) =>
          n.id === "inbox"
            ? {
                ...n,
                unloaded: false,
                children: [
                  { id: "in-1", name: "Invoice INV-26-0318" },
                  { id: "in-2", name: "Query from Brandlow Office Supply" },
                  { id: "in-3", name: "Reminder from Fenwright Legal" },
                ],
              }
            : n,
        ),
      );
    }, 700);
  };

  const [checked, setChecked] = useState<ReadonlySet<string>>(
    () => new Set(["fc-brandlow", "fc-nimbrel", "fc-corrin", "framework"]),
  );

  const withChecks = useTree(filing, {
    reader: READER,
    checked,
    onChecked: setChecked,
    onLoadChildren: load,
    defaultExpanded: ["contracts", "framework", "documents"],
    defaultActive: "fc-nimbrel",
  });

  const activeOnly = useTree(filing, {
    reader: READER,
    defaultExpanded: ["documents", "2026"],
    defaultActive: "d-q2",
  });

  /* The same body, narrowed by a term: the find appears with the path that
     leads to it, and the path is dimmed. */
  const [term, setTerm] = useState("quarter");
  const searched = useTree(filing, {
    reader: READER,
    search: term,
    onSearch: setTerm,
  });

  const chosen = useMemo(() => [...checked].sort().join(", "), [checked]);

  const large = useTree(MANY, { reader: READER, virtual: { rowHeight: 26 } });
  const [last, setLast] = useState("-");

  return (
    <Stack gap={4}>
      <Grid minItemWidth="260px" gap={4}>
          <Stack gap={2}>
            <Text size="xs" tone="muted">
              With checks and a search
            </Text>
            <TreeSearch tree={withChecks} aria-label="Search the filing" size="sm" />
            <TreeView tree={withChecks} ariaLabel="Filing with a selection" checkable>
              {(e) => e.node.name}
            </TreeView>
            <Text size="xs" tone="muted">
              Checked: {chosen || "nothing"}
            </Text>
          </Stack>

          <Stack gap={2}>
            <Text size="xs" tone="muted">
              A search with the path
            </Text>
            <TreeSearch tree={searched} aria-label="Search the filing" size="sm" />
            <TreeView tree={searched} ariaLabel="Filing, searched">
              {(e) => e.node.name}
            </TreeView>
          </Stack>

          <Stack gap={2}>
            <Text size="xs" tone="muted">
              Reach: 40 folders of 5 sheets each, virtualised
            </Text>
            <Stack direction="row" gap={2} wrap>
              <Button size="sm" variant="ghost" onClick={() => large.expandAll()}>
                Expand all
              </Button>
              <Button size="sm" variant="ghost" onClick={() => large.collapseAll()}>
                Collapse all
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-role="reveal-deep"
                onClick={() => setLast(String(large.revealNode("f33-2") ?? "not found"))}
              >
                Reveal sheet 33.2
              </Button>
            </Stack>
            <TreeView tree={large} ariaLabel="Large body" style={{ height: 240 }}>
              {(e) => e.node.name}
            </TreeView>
            <Text size="xs" tone="muted">
              Last revealed: {last}
            </Text>
          </Stack>

          <Stack gap={2}>
            <Text size="xs" tone="muted">
              Active node only
            </Text>
            <TreeView tree={activeOnly} ariaLabel="Filing for navigation">
              {(e) => e.node.name}
            </TreeView>
            <Text size="xs" tone="muted">
              Active: {activeOnly.active ?? "nothing"}
            </Text>
          </Stack>
      </Grid>
    </Stack>
  );
}
