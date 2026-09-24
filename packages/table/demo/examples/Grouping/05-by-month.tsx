import { useTable } from "../../../src";

export const title = "By month: group=\"month\"";

/* A delivery date grouped as it is would give every day a group of its own.
   `group="month"` brings each date to the start of its month - one word,
   no function. "day", "week" (ISO, Monday first) and "year" work the same
   way. The cells keep their full date; the span names the month. */

interface Delivery {
  id: string;
  customer: string;
  due: Date;
  pallets: number;
}

const DELIVERIES: Delivery[] = [
  { id: "D-8810", customer: "Brenner GmbH", due: new Date(2026, 8, 28), pallets: 6 },
  { id: "D-8811", customer: "Kessler AG", due: new Date(2026, 8, 30), pallets: 2 },
  { id: "D-8812", customer: "Hartmann KG", due: new Date(2026, 9, 2), pallets: 9 },
  { id: "D-8813", customer: "Brenner GmbH", due: new Date(2026, 9, 14), pallets: 4 },
  { id: "D-8814", customer: "Weiss Antriebe", due: new Date(2026, 9, 21), pallets: 3 },
  { id: "D-8815", customer: "Vogt Maschinen", due: new Date(2026, 10, 4), pallets: 7 },
  { id: "D-8816", customer: "Kessler AG", due: new Date(2026, 10, 18), pallets: 5 },
];

export default function ByMonth() {
  const { Table, Column } = useTable(DELIVERIES, { rowKey: (d) => d.id, defaultGrouping: "due" });
  return (
    <Table ariaLabel="Deliveries by month">
      <Column value="due" label="Due" format="date" group="month" />
      <Column value="id" label="Delivery" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="pallets" label="Pallets" aggregate="sum" />
    </Table>
  );
}
