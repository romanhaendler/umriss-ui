import { Stack } from "@umriss-ui/core";
import { column, useTable } from "../../../src";

export const title = "Presets: column<P>() and spread";

/* A column that fits many tables becomes a preset - bound to a property, not to
   a row kind. `quantity` fits every row with a numeric `quantity`: orders and
   deliveries alike. Individual entries can be overridden at the place of use.

   And the compiler checks it. A row without `quantity` it refuses:

     const { Column } = useTable(customers, …);
     <Column {...quantity} />   // Error: 'quantity' is missing in Customer

   Where the preset has more than one field, the field name is named along with
   it - `column<{ quantity: number; number: string }, "quantity">(…)` - because
   TypeScript stops inferring a type argument as soon as another one is
   named. */

const quantity = column<{ quantity: number }>({ value: "quantity", label: "Quantity", format: "count", aggregate: "sum" });

interface Order {
  number: string;
  quantity: number;
}

interface Delivery {
  deliveryNote: string;
  quantity: number;
}

const ORDERS: Order[] = [
  { number: "A-2041", quantity: 120 },
  { number: "A-2042", quantity: 48 },
];

const DELIVERIES: Delivery[] = [
  { deliveryNote: "LS-8801", quantity: 60 },
  { deliveryNote: "LS-8802", quantity: 60 },
];

function Orders() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number });
  return (
    <Table ariaLabel="Orders">
      <Column value="number" label="Order" rowHeader />
      <Column {...quantity} />
    </Table>
  );
}

function Deliveries() {
  const { Table, Column } = useTable(DELIVERIES, { rowKey: (d) => d.deliveryNote });
  return (
    <Table ariaLabel="Deliveries">
      <Column value="deliveryNote" label="Delivery note" rowHeader />
      <Column {...quantity} label="Delivered" />
    </Table>
  );
}

export default function Presets() {
  return (
    <Stack gap={4}>
      <Orders />
      <Deliveries />
    </Stack>
  );
}
