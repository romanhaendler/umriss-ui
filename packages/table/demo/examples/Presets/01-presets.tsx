import { Stack } from "@umriss-ui/core";
import { column, useTable } from "../../../src";

export const title = "Share a column between tables";
export const lead = "`column<P>()` makes a preset bound to a property, not to a row kind; spread it into any table whose rows have that field.";

/* The compiler checks the spread: a row without a numeric `amount` is
   refused. With more than one field, name the field too -
   `column<{ amount: number; id: string }, "amount">(…)`. */
const amount = column<{ amount: number }>({ value: "amount", label: "Amount (€)", format: { decimals: 2 }, aggregate: "sum" });

interface Invoice {
  id: string;
  amount: number;
}

interface Budget {
  costCentre: string;
  amount: number;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", amount: 1951.24 },
  { id: "INV-26-0309", amount: 7288 },
];

const BUDGETS: Budget[] = [
  { costCentre: "Marketing", amount: 68_000 },
  { costCentre: "IT", amount: 83_000 },
];

function Invoices() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id });
  return (
    <Table ariaLabel="Invoices">
      <Column value="id" label="Invoice" rowHeader />
      <Column {...amount} />
    </Table>
  );
}

function Budgets() {
  const { Table, Column } = useTable(BUDGETS, { rowKey: (b) => b.costCentre });
  return (
    <Table ariaLabel="Monthly budgets">
      <Column value="costCentre" label="Cost centre" rowHeader />
      <Column {...amount} label="Monthly budget (€)" />
    </Table>
  );
}

export default function Presets() {
  return (
    <Stack gap={4}>
      <Invoices />
      <Budgets />
    </Stack>
  );
}
