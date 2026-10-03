import { useState } from "react";
import { Button, Checkbox, Select, Stack } from "@umriss-ui/core";
import { useTable } from "../../../src";
import type { TableRef } from "../../../src";

export const title = "Sort, arrange and export from controls of your own";
export const lead = "`t.toggleSort`, `t.toggleColumn` and `t.setOrder` change what the headers and the column menu change; `t.sort`, `t.hidden` and `t.order` say how it stands. `t.asCsv()` is the text an export writes.";

interface Service {
  id: string;
  name: string;
  team: string;
  tier: number;
  latencySlo: number;
}

const SERVICES: Service[] = [
  { id: "checkout", name: "Checkout", team: "Payments", tier: 1, latencySlo: 300 },
  { id: "sign-in", name: "Sign-in", team: "Identity", tier: 1, latencySlo: 200 },
  { id: "search", name: "Search", team: "Discovery", tier: 1, latencySlo: 250 },
  { id: "notifications", name: "Notifications", team: "Messaging", tier: 2, latencySlo: 800 },
  { id: "reporting", name: "Reporting", team: "Platform", tier: 3, latencySlo: 2000 },
];

/** The columns the panel arranges, by id - the row header stays where it is. */
const COLUMNS = [
  { id: "team", label: "Team" },
  { id: "tier", label: "Tier" },
  { id: "latencySlo", label: "Latency objective (ms)" },
] as const;

/* Written once for every table of the application. In manual mode the table
   holds one page of the server's, and that is all `asCsv` can write - so the
   button says so instead of pretending to copy the whole list. */
function CopyAsCsv({ of }: { of: TableRef }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      onClick={() => {
        void navigator.clipboard.writeText(of.asCsv()).then(() => setCopied(true));
      }}
    >
      {copied ? "Copied" : of.manual ? "Copy this page as CSV" : "Copy as CSV"}
    </Button>
  );
}

export default function SortArrangeAndExport() {
  const t = useTable(SERVICES, { rowKey: (s) => s.id, defaultSort: { column: "tier", direction: "asc" } });
  const { Table, Column } = t;
  /* Empty until somebody arranges: then the natural order. */
  const order = t.order.length > 0 ? t.order.filter((id) => COLUMNS.some((c) => c.id === id)) : COLUMNS.map((c) => c.id);
  const sorted = t.sort[0];

  const moveLeft = (id: string) => {
    const at = order.indexOf(id);
    t.setOrder(["name", ...order.slice(0, at - 1), id, order[at - 1]!, ...order.slice(at + 1)]);
  };

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center" wrap>
        <Select size="sm" aria-label="Sort by" value={sorted?.column ?? ""} onChange={(event) => t.toggleSort(event.target.value)}>
          <option value="name">Service</option>
          {COLUMNS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
        <Button size="sm" variant="ghost" onClick={() => sorted && t.toggleSort(sorted.column)}>
          {sorted?.direction === "desc" ? "Descending" : "Ascending"}
        </Button>
        <CopyAsCsv of={t} />
      </Stack>
      <Stack direction="row" gap={3} align="center" wrap>
        {order.map((id, i) => {
          const label = COLUMNS.find((c) => c.id === id)!.label;
          return (
            <Stack key={id} direction="row" gap={1} align="center">
              <Button size="sm" variant="ghost" aria-label={`Move ${label} to the left`} disabled={i === 0} onClick={() => moveLeft(id)}>
                ←
              </Button>
              <Checkbox label={label} checked={!t.hidden.includes(id)} onChange={() => t.toggleColumn(id)} />
            </Stack>
          );
        })}
      </Stack>
      <Table ariaLabel="Services">
        <Column value="name" label="Service" rowHeader />
        <Column value="team" label="Team" />
        <Column value="tier" label="Tier" />
        <Column value="latencySlo" label="Latency objective (ms)" />
      </Table>
    </Stack>
  );
}
