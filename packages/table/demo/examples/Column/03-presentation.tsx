import { Badge, Meter } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Presentation: children(value, row)";

/* The value is what the column is; `children` is how it looks.

   `children` receives the value, typed as the field - for the status therefore
   `"Running" | "Setup" | "Fault"` - and the row with it. Sorting still goes by
   the value: the load by the number, not by the bar. Nobody reads a
   presentation back. */

interface Machine {
  name: string;
  status: "Running" | "Setup" | "Fault";
  load: number;
}

const TONE = { Running: "success", Setup: "neutral", Fault: "danger" } as const;

const MACHINES: Machine[] = [
  { name: "Mill 2", status: "Running", load: 0.86 },
  { name: "Lathe 1", status: "Setup", load: 0.34 },
  { name: "Press 3", status: "Fault", load: 0.02 },
];

export default function Presentation() {
  const { Table, Column } = useTable(MACHINES, { rowKey: (m) => m.name });

  return (
    <Table ariaLabel="Machines">
      <Column value="name" label="Machine" rowHeader />
      <Column value="status" label="Status">
        {(status) => <Badge tone={TONE[status]}>{status}</Badge>}
      </Column>
      <Column value="load" label="Load">
        {(share, machine) => (
          <Meter value={share} tone={share > 0.8 ? "warning" : "accent"} label={`Load ${machine.name}`} showLabel />
        )}
      </Column>
    </Table>
  );
}
