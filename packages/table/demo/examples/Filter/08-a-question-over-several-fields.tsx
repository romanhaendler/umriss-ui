import { Checkbox, Stack, Switch } from "@umriss-ui/core";
import { NOW, SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";
import type { Shipment } from "@umriss-ui/demo/worlds/logistics";
import { Pagination, Toolbar, rowFilter, useTable } from "../../../src";

export const title = "Ask a question over several fields";
export const lead = "\"Overdue\" is a window that has closed on a shipment not yet delivered - two fields and a moment. The condition carries what varies; `describe` puts it in the toolbar, where its cross lifts it.";

interface Overdue {
  /** The moment the windows are read against. */
  at: number;
  /** Count a failed attempt as overdue too. */
  failed: boolean;
}

/* What varies - the moment, the choice about failed attempts - stands in the
   condition, never in a closure over the component's state: the table sees a
   new condition, it cannot see a closure change. */
const overdue = rowFilter({
  id: "overdue",
  label: "Overdue",
  matches: (shipment: Shipment, o: Overdue) =>
    shipment.window[1] < o.at &&
    (shipment.status === "out for delivery" || (o.failed && shipment.status === "failed attempt")),
  describe: (o) => (o.failed ? "with failed attempts" : "not delivered"),
});

export default function QuestionOverSeveralFields() {
  const t = useTable(SHIPMENTS, {
    rowKey: (s) => s.id,
    rowFilters: [overdue],
    pageSize: 5,
    /* A view can start with it set, like any condition. */
    initialView: { conditions: { overdue: { at: NOW, failed: false } } },
  });
  const { Table, Column } = t;
  const condition = t.conditionOf(overdue);

  /* The demo reads its windows at a fixed "now"; an application takes Date.now(). */
  const set = (on: boolean, failed: boolean) => t.setFilter(overdue, on ? { at: NOW, failed } : null);

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={4} wrap>
        <Switch label="Overdue only" checked={condition !== null} onChange={(e) => set(e.target.checked, condition?.failed ?? false)} />
        <Checkbox
          label="Count failed attempts"
          disabled={condition === null}
          checked={condition?.failed ?? false}
          onChange={(e) => set(true, e.target.checked)}
        />
      </Stack>

      <Table ariaLabel="Shipments and their windows">
        <Toolbar />
        <Column value="id" label="Shipment" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="status" label="Status" filter="list" />
        <Pagination />
      </Table>
    </Stack>
  );
}
