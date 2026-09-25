import { INVOICES } from "@umriss-ui/demo/worlds/controlling";
import { useTable } from "../../../src";

export const title = "Filter a column";
export const lead = "`filter=\"list\"` puts a filter in the header that offers the values occurring in the column; the Filter page shows the other kinds.";

const ROWS = INVOICES.map((invoice) => ({
  id: invoice.id,
  supplier: invoice.supplier,
  costCentre: invoice.costCentre,
  status: invoice.status,
  due: new Date(invoice.due),
}));

export default function FilterAColumn() {
  const { Table, Column } = useTable(ROWS, { rowKey: (i) => i.id });

  return (
    <Table ariaLabel="Incoming invoices">
      <Column value="id" label="Invoice" rowHeader />
      <Column value="supplier" label="Supplier" />
      <Column value="costCentre" label="Cost centre" filter="list" />
      <Column value="status" label="Status" filter="list" />
      <Column value="due" label="Due" format="date" />
    </Table>
  );
}
