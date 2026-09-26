import { useState } from "react";
import { useTable } from "../../../src";

export const title = "Check a whole row before it is saved";
export const lead =
  "On Save every open cell runs its `validate`; each message stands beneath its field, and the row stays open until all of them pass. A click into another row is refused while the draft is open.";

interface Loop {
  id: string;
  tag: string;
  unit: string;
  setpoint: number | null;
  low: number | null;
  high: number | null;
}

const LOOPS: Loop[] = [
  { id: "l1", tag: "TIC-101", unit: "°C", setpoint: 820, low: 780, high: 860 },
  { id: "l2", tag: "PIC-204", unit: "bar", setpoint: 4.2, low: 3.5, high: 5 },
  { id: "l3", tag: "FIC-310", unit: "m³/h", setpoint: 12, low: 8, high: 16 },
];

const required = (label: string) => (value: number | null) => (value === null ? `${label} is required` : undefined);

export default function CheckAWholeRow() {
  const [loops, setLoops] = useState(LOOPS);
  const { Table, Column } = useTable(loops, { rowKey: (l) => l.id });
  return (
    <Table
      grid
      editMode="row"
      ariaLabel="Control loops"
      onRowSave={({ rowKey, changes }) => setLoops((all) => all.map((l) => (l.id === rowKey ? { ...l, ...changes } : l)))}
    >
      <Column value="tag" label="Loop" rowHeader />
      <Column value="unit" label="Unit" width={80} />
      <Column
        value="setpoint"
        label="Setpoint"
        edit="number"
        width={130}
        validate={(value) => (value === null ? "A setpoint is required" : value < 0 ? "Not below 0" : undefined)}
      />
      <Column value="low" label="Low limit" edit="number" width={130} validate={required("A low limit")} />
      <Column value="high" label="High limit" edit="number" width={130} validate={required("A high limit")} />
    </Table>
  );
}
