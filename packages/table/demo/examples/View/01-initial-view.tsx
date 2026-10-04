import { useState } from "react";
import { Button, Stack, Text } from "@umriss-ui/core";
import { ColumnMenu, Search, Toolbar, useTable } from "../../../src";
import type { TableView } from "../../../src";

export const title = "Keep and restore a view";
export const lead = "`onViewChange` reports search, sort, hidden columns and widths as one view; hand one back through `initialView` and the table goes to it, no `key` needed. Sort, hide, drag a width, then restore.";

const START_VIEW: TableView = {
  sort: [{ column: "amount", direction: "desc" }],
  hidden: ["costCentre"],
};

interface Invoice {
  id: string;
  supplier: string;
  costCentre: string;
  amount: number;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", supplier: "Brandlow Office Supply", costCentre: "Facilities", amount: 1951.24 },
  { id: "INV-26-0317", supplier: "Kettering & Shaw Events", costCentre: "Marketing", amount: 15110 },
  { id: "INV-26-0309", supplier: "Nimbrel Software", costCentre: "IT", amount: 7288 },
  { id: "INV-26-0302", supplier: "Fenwright Legal", costCentre: "Finance", amount: 3770 },
];

export default function InitialView() {
  /* The application keeps the view the table reports; handing it another one
     is all it takes to restore. */
  const [view, setView] = useState(START_VIEW);
  const [kept, setKept] = useState<TableView | null>(null);
  const t = useTable(INVOICES, { rowKey: (i) => i.id, initialView: view, onViewChange: setView });
  const { Table, Column } = t;

  return (
    <Stack gap={3}>
      <Table ariaLabel="Invoices">
        <Toolbar>
          <Search placeholder="Invoice or supplier" />
          <ColumnMenu />
        </Toolbar>
        <Column value="id" label="Invoice" rowHeader />
        <Column value="supplier" label="Supplier" resizable />
        <Column value="costCentre" label="Cost centre" />
        <Column value="amount" label="Amount (€)" format={{ decimals: 2 }} />
      </Table>
      <Stack gap={1}>
        <Text as="span" size="sm" tone="secondary">
          What the application would keep
        </Text>
        {/* JSON has no space to break at: without this it ran past a phone's card. */}
        <Text as="code" size="sm" mono data-role="view" style={{ overflowWrap: "anywhere" }}>
          {JSON.stringify(t.view)}
        </Text>
      </Stack>
      <Stack direction="row" gap={2} wrap>
        <Button size="sm" onClick={() => setKept(view)}>
          Keep this view
        </Button>
        <Button size="sm" variant="ghost" disabled={kept === null} onClick={() => kept && setView(kept)}>
          Restore the kept view
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setView(START_VIEW)}>
          Back to the beginning
        </Button>
      </Stack>
    </Stack>
  );
}
