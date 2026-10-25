import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "The current row";
export const lead = "`currentRow` marks the row you hold and `onCurrentRowChange` reports a click on one - or Enter on the focused machine name. The current row and the selection are independent: choosing a row ticks nothing, and ticking moves nothing.";

interface Machine {
  id: string;
  name: string;
  line: string;
  state: string;
}

const MACHINES: Machine[] = [
  { id: "M-101", name: "Press 4", line: "Line 1", state: "Running" },
  { id: "M-102", name: "Lathe 2", line: "Line 1", state: "Stopped" },
  { id: "M-201", name: "Mill 7", line: "Line 2", state: "Running" },
  { id: "M-202", name: "Grinder 1", line: "Line 2", state: "Service" },
  { id: "M-301", name: "Welder 3", line: "Line 3", state: "Running" },
];

export default function TheCurrentRow() {
  const [current, setCurrent] = useState<string | null>("M-201");
  const { Table, Column } = useTable(MACHINES, { rowKey: (m) => m.id });
  const machine = MACHINES.find((m) => m.id === current);

  return (
    <Stack direction="row" gap={4} align="start" wrap>
      <Table selectable aria-label="Machines" currentRow={current} onCurrentRowChange={(key) => setCurrent(key)}>
        <Column value="name" label="Machine" rowHeader />
        <Column value="line" label="Line" />
        <Column value="state" label="State" />
      </Table>
      <Stack gap={1}>
        <Text size="sm" weight="medium">
          {machine ? machine.name : "No machine chosen"}
        </Text>
        {machine && (
          <Text size="xs" tone="muted">
            {machine.id} on {machine.line}, {machine.state.toLowerCase()}.
          </Text>
        )}
      </Stack>
    </Stack>
  );
}
