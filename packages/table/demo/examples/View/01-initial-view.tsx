import { useState } from "react";
import { Button, Stack, Text } from "@umriss-ui/core";
import { ColumnMenu, Search, Toolbar, useTable } from "../../../src";
import type { TableView } from "../../../src";

export const title = "Keep and restore a view";
export const lead = "`t.view` holds search, sort, hidden columns and widths; hand it back through `initialView` with a new `key`. Sort, hide, drag a width.";

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

function InvoiceList({ start, restart }: { start: TableView; restart: (view: TableView) => void }) {
  const t = useTable(INVOICES, { rowKey: (i) => i.id, initialView: start });
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
        <Text as="code" size="sm" mono data-role="view">
          {JSON.stringify(t.view)}
        </Text>
      </Stack>
      <Stack direction="row" gap={2} wrap>
        <Button size="sm" onClick={() => restart(t.view)}>
          Start again with this view
        </Button>
        <Button size="sm" variant="ghost" onClick={() => restart(START_VIEW)}>
          Back to the beginning
        </Button>
      </Stack>
    </Stack>
  );
}

export default function InitialView() {
  const [start, setStart] = useState(START_VIEW);
  const [generation, setGeneration] = useState(0);

  return (
    <InvoiceList
      key={generation}
      start={start}
      restart={(view) => {
        setStart(view);
        setGeneration((n) => n + 1);
      }}
    />
  );
}
