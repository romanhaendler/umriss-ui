import { useEffect, useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";
import type { TableView } from "../../../src";

export const title = "Keep the view in the URL";
export const lead = "`onViewChange` writes `t.view` as JSON into a query parameter, `initialView` reads it at mount and `popstate` calls `setView`; the date range comes back as a `Date`, and no JSON compare is needed, because `setView` compares by content. A query parameter and not the hash, since the demo's hash is its router. Set a filter and reload.";

const PARAM = "view";

const START_VIEW: TableView = {
  conditions: { due: { from: new Date(2026, 2, 10), to: new Date(2026, 3, 10) } },
};

interface Invoice {
  id: string;
  supplier: string;
  due: Date;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", supplier: "Brandlow Office Supply", due: new Date(2026, 3, 15) },
  { id: "INV-26-0317", supplier: "Kettering & Shaw Events", due: new Date(2026, 3, 12) },
  { id: "INV-26-0309", supplier: "Nimbrel Software", due: new Date(2026, 3, 8) },
  { id: "INV-26-0302", supplier: "Fenwright Legal", due: new Date(2026, 2, 16) },
  { id: "INV-26-0226", supplier: "Corrin Travel", due: new Date(2026, 2, 12) },
  { id: "INV-26-0221", supplier: "Stellbrook Consulting", due: new Date(2026, 2, 3) },
];

const stored = (): TableView => {
  try {
    const raw = new URL(window.location.href).searchParams.get(PARAM);
    return raw ? (JSON.parse(raw) as TableView) : START_VIEW;
  } catch {
    return START_VIEW;
  }
};

export default function ViewInTheUrl() {
  const [start] = useState(stored);
  const [written, setWritten] = useState(() => new URL(window.location.href).searchParams.get(PARAM) ?? "");
  const t = useTable(INVOICES, {
    rowKey: (i) => i.id,
    initialView: start,
    onViewChange: (view) => {
      const url = new URL(window.location.href);
      const json = JSON.stringify(view);
      url.searchParams.set(PARAM, json);
      window.history.replaceState(window.history.state, "", url);
      setWritten(json);
    },
  });
  const { Table, Column, setView } = t;

  useEffect(() => {
    const onPop = () => setView(stored());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  });

  return (
    <Stack gap={3}>
      <Table aria-label="Invoices">
        <Column value="id" label="Invoice" rowHeader />
        <Column value="supplier" label="Supplier" />
        <Column value="due" label="Due" filter="range" format="date" />
      </Table>
      <Stack gap={1}>
        <Text as="span" size="sm" tone="secondary">
          The query parameter {PARAM}
        </Text>
        <Text as="code" size="sm" mono data-role="url-view" style={{ overflowWrap: "anywhere" }}>
          {written || "(not written yet)"}
        </Text>
      </Stack>
    </Stack>
  );
}
