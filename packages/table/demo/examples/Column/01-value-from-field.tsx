import { useTable } from "../../../src";

export const title = "Read a value from a field";
export const lead = "`value` names a field of the row, and the compiler offers only the fields there are; the field name is the column's id as well.";

interface Vehicle {
  plate: string;
  type: string;
  capacity: number;
}

const VEHICLES: Vehicle[] = [
  { plate: "FP 214 K", type: "van", capacity: 1200 },
  { plate: "FP 377 K", type: "e-van", capacity: 900 },
  { plate: "FP 118 R", type: "truck", capacity: 7500 },
];

export default function ValueFromField() {
  const { Table, Column } = useTable(VEHICLES, { rowKey: (v) => v.plate });

  return (
    <Table ariaLabel="Vehicles">
      <Column value="plate" label="Plate" rowHeader />
      <Column value="type" label="Type" />
      <Column value="capacity" label="Payload (kg)" />
    </Table>
  );
}
