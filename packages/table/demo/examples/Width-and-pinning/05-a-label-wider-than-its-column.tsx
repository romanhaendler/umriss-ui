import { useTable } from "../../../src";

export const title = "A label wider than its column";
export const lead = "A column with a `width` is that wide, whatever its label says. The label ends in an ellipsis; the sort arrow and the filter stay.";

interface Shipment {
  id: string;
  weight: number;
  carrier: string;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", weight: 12.4, carrier: "Northline" },
  { id: "FP-1004223", weight: 3.1, carrier: "Eastway" },
  { id: "FP-1004236", weight: 48, carrier: "Northline" },
];

export default function ALabelWiderThanItsColumn() {
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id, defaultSort: { column: "weight", direction: "desc" } });

  return (
    <Table ariaLabel="Shipments in narrow columns">
      <Column value="id" label="Shipment" rowHeader width={120} />
      <Column value="weight" label="Gross weight in kilograms" width={75} />
      <Column value="carrier" label="Carrier responsible for delivery" width={75} filter="list" />
    </Table>
  );
}
