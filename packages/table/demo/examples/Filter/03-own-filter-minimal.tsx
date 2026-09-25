import { Checkbox } from "@umriss-ui/core";
import { columnFilter, useTable } from "../../../src";

export const title = "Write the smallest filter of your own";
export const lead = "`columnFilter` takes `matches`, `describe` and the `Input` for the panel; the header funnel, the panel and the condition come from the table.";

/* Fixed so the example looks the same every day; an application would
   write `new Date()`. `setCondition(null)` lifts the condition. */
const TODAY = new Date(2026, 2, 17);

const overdue = columnFilter<Date, true>({
  matches: (due) => due.getTime() < TODAY.getTime(),
  Input: ({ condition, setCondition }) => (
    <Checkbox label="Overdue only" checked={condition === true} onChange={(event) => setCondition(event.target.checked ? true : null)} />
  ),
  describe: () => "overdue",
});

interface Invoice {
  id: string;
  supplier: string;
  due: Date;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", supplier: "Brandlow Office Supply", due: new Date(2026, 3, 15) },
  { id: "INV-26-0309", supplier: "Nimbrel Software", due: new Date(2026, 3, 8) },
  { id: "INV-26-0226", supplier: "Corrin Travel", due: new Date(2026, 2, 12) },
  { id: "INV-26-0302", supplier: "Fenwright Legal", due: new Date(2026, 2, 16) },
  { id: "INV-26-0221", supplier: "Stellbrook Consulting", due: new Date(2026, 2, 23) },
];

export default function OwnFilterMinimal() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id });

  return (
    <Table ariaLabel="Invoices">
      <Column value="id" label="Invoice" rowHeader />
      <Column value="supplier" label="Supplier" />
      <Column value="due" label="Due" format="date" filter={overdue} />
    </Table>
  );
}
