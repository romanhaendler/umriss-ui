import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";
import type { CellEdit } from "../../../src";

export const title = "Edit a date and time, and a yes or no";
export const lead = "`edit=\"dateTime\"` keeps the time of day and the provider's zone; `edit=\"boolean\"` is a checkbox in the cell - a click or Space toggles it and commits.";

interface Run {
  id: string;
  job: string;
  start: Date;
  approved: boolean;
}

const RUNS: Run[] = [
  { id: "r1", job: "Batch 4711", start: new Date(2026, 2, 17, 1, 30), approved: false },
  { id: "r2", job: "Batch 4712", start: new Date(2026, 2, 17, 14, 15), approved: true },
  { id: "r3", job: "Batch 4713", start: new Date(2026, 2, 18, 6, 0), approved: false },
];

export default function DatesTimesAndSwitches() {
  const [runs, setRuns] = useState(RUNS);
  const [last, setLast] = useState<CellEdit<Run> | null>(null);
  const { Table, Column } = useTable(runs, { rowKey: (r) => r.id });

  const apply = (edit: CellEdit<Run>) => {
    setRuns((all) => all.map((r) => (r.id === edit.rowKey ? { ...r, [edit.columnId]: edit.value } : r)));
    setLast(edit);
  };

  return (
    <Stack gap={2}>
      <Table grid aria-label="Runs" onCellEdit={apply}>
        <Column value="job" label="Job" rowHeader />
        <Column value="start" label="Start" format="dateTime" edit="dateTime" width={200} />
        <Column value="approved" label="Approved" edit="boolean" width={120} />
      </Table>
      <Text size="xs" tone="muted">
        {last ? `Last edit: ${last.row.job}, ${last.columnId}` : "No edit yet."}
      </Text>
    </Stack>
  );
}
