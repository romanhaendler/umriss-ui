import { useState } from "react";
import { Stack, Text, useFormats } from "@umriss-ui/core";
import { useTable } from "../../../src";
import type { CellEdit } from "../../../src";

export const title = "Editing: a setpoint list";

/* Each column that edits gets the core field for its value: `"number"` the
   `NumberInput`, `"select"` the `Select` over `editOptions`, `"date"` the
   `DatePicker`, whose pick commits at once.

   `validate` checks a draft before it is reported. Its message keeps the
   editor open and stands beneath the field, as a `FormField` shows it; the
   draft is checked again as it is corrected. A setpoint outside the loop's
   range never reaches `onCellEdit` - and what the application does with one
   that does is its own decision: here it applies it and writes it down.

   To try it: walk to a setpoint, type 120, Enter; then 85. */

type Mode = "Auto" | "Manual" | "Cascade";

interface Loop {
  tag: string;
  service: string;
  setpoint: number;
  low: number;
  high: number;
  unit: string;
  mode: Mode;
  reviewed: Date;
}

const LOOPS: Loop[] = [
  { tag: "TIC-101", service: "Reactor jacket", setpoint: 82, low: 60, high: 95, unit: "°C", mode: "Auto", reviewed: new Date(2026, 2, 2) },
  { tag: "PIC-102", service: "Reactor head", setpoint: 2.4, low: 1, high: 3.5, unit: "bar", mode: "Auto", reviewed: new Date(2026, 1, 16) },
  { tag: "FIC-201", service: "Feed", setpoint: 14, low: 5, high: 20, unit: "m³/h", mode: "Cascade", reviewed: new Date(2026, 2, 9) },
  { tag: "LIC-301", service: "Buffer tank", setpoint: 55, low: 20, high: 80, unit: "%", mode: "Manual", reviewed: new Date(2026, 0, 27) },
];

export default function SetpointList() {
  const formats = useFormats();
  const [loops, setLoops] = useState(LOOPS);
  const [last, setLast] = useState<CellEdit<Loop> | null>(null);
  const { Table, Column } = useTable(loops, { rowKey: (l) => l.tag });

  const apply = (edit: CellEdit<Loop>) => {
    setLoops((all) => all.map((l) => (l.tag === edit.rowKey ? { ...l, [edit.columnId]: edit.value } : l)));
    setLast(edit);
  };

  return (
    <Stack gap={2}>
      <Table grid ariaLabel="Setpoints" onCellEdit={apply}>
        <Column value="tag" label="Loop" rowHeader />
        <Column value="service" label="Service" />
        <Column
          value="setpoint"
          label="Setpoint"
          format={{ decimals: 1 }}
          width={140}
          edit="number"
          validate={(value, loop) =>
            value === null
              ? "A loop needs a setpoint"
              : value < loop.low || value > loop.high
                ? `Between ${formats.number(loop.low)} and ${formats.number(loop.high)} ${loop.unit}`
                : undefined
          }
        />
        <Column value="unit" label="Unit" sortable={false} />
        <Column value="mode" label="Mode" edit="select" editOptions={["Auto", "Manual", "Cascade"]} width={130} />
        <Column value="reviewed" label="Reviewed" format="date" edit="date" width={150} />
      </Table>
      <Text size="xs" tone="muted">
        {last ? `Last edit: ${last.row.tag}, ${last.columnId}` : "No edit yet."}
      </Text>
    </Stack>
  );
}
