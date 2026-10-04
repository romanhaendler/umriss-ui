import { useTable } from "../../../src";

export const title = "Stripes across a wide table";
export const lead = "`striped` shades every other row, so the eye keeps a long row on its line across eight columns, and on a phone while it scrolls sideways.";

interface Shipment {
  id: string;
  customer: string;
  street: string;
  city: string;
  tour: string;
  driver: string;
  parcels: number;
  weight: number;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies", street: "14 Orchard Lane", city: "Ashford", tour: "T-01", driver: "Tomasz Nowak", parcels: 6, weight: 1140 },
  { id: "FP-1004223", customer: "Oakridge Pharmacy", street: "2 Station Road", city: "Wye", tour: "T-01", driver: "Tomasz Nowak", parcels: 2, weight: 420 },
  { id: "FP-1004236", customer: "Brixley Cycles", street: "88 High Street", city: "Charing", tour: "T-02", driver: "Leila Haddad", parcels: 4, weight: 310 },
  { id: "FP-1004249", customer: "Pellham Hardware", street: "5 Forge Yard", city: "Lenham", tour: "T-02", driver: "Leila Haddad", parcels: 9, weight: 1620 },
  { id: "FP-1004262", customer: "Corrin Travel", street: "31 Bank Street", city: "Ashford", tour: "T-03", driver: "Jonas Keller", parcels: 1, weight: 12 },
  { id: "FP-1004275", customer: "Nimbrel Software", street: "7 Kennington Road", city: "Willesborough", tour: "T-03", driver: "Jonas Keller", parcels: 3, weight: 95 },
];

export default function StripesAcrossAWideTable() {
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id });

  return (
    <Table striped stickyRowHeader ariaLabel="Shipments with their addresses">
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="street" label="Street" />
      <Column value="city" label="Town" />
      <Column value="tour" label="Tour" />
      <Column value="driver" label="Driver" />
      <Column value="parcels" label="Parcels" />
      <Column value="weight" label="Weight (kg)" />
    </Table>
  );
}
