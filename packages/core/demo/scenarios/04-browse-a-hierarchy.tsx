/* The tree - a demonstration and not a run of examples.

   Flattening, keyboard movement and virtualisation are ONE behaviour: the
   movement runs on the flat list, and the virtualisation shows only a window of
   it. Four separate miniatures would have documented four features and kept
   quiet about the component.

   Deliberately a filing structure and not "node A / node B": the indeterminate
   state only makes sense when what stands above it is something a person would
   want to check.

   Both states are shown side by side because they are different (ADR-0003): on
   the left the tree with checks and a search, on the right the same data with an
   active node only - and beside it, what is checked.

   The `data-role` attribute is a selector the interaction suite reads; it moved
   with that suite in english-and-umriss-ui 16, emitter and reader together. */

import { useMemo, useState } from "react";
import { Button, Grid, Stack, Text, TreeSearch, TreeView, useTree } from "../../src";
import type { NodeReader } from "../../src";

export const title = "Browse a large hierarchy";

export const lead =
  "Someone looking for one item among thousands searches, expands and selects in one tree.";

export const callouts = [];

export const builtFrom = ["treeview"];

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
          { id: "fc-north", name: "Nordwerk GmbH" },
          { id: "fc-south", name: "Suedbahn AG" },
          { id: "fc-east", name: "Ostmarkt eG" },
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
  { id: "statutes", name: "Statutes.pdf" },
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

export default function Demonstration() {
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
                  { id: "in-1", name: "Letter of 12 March" },
                  { id: "in-2", name: "Query from Nordwerk" },
                  { id: "in-3", name: "Invoice 2026-114" },
                ],
              }
            : n,
        ),
      );
    }, 700);
  };

  const [checked, setChecked] = useState<ReadonlySet<string>>(
    () => new Set(["fc-north", "fc-south", "fc-east", "framework"]),
  );

  const withChecks = useTree(filing, {
    reader: READER,
    checked,
    onChecked: setChecked,
    onLoadChildren: load,
    defaultExpanded: ["contracts", "framework", "documents"],
    defaultActive: "fc-south",
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
      <Text size="sm" tone="secondary">
        Expandable and collapsible, cascading checks with an indeterminate state, a search with
        the path, a keyboard following the pattern for lists and grids - and a large body of which
        only a window stands in the document.
      </Text>
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
