import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";
import type { RowSave } from "../../../src";

export const title = "Save a row on purpose";
export const lead =
  "`editMode=\"row\"` opens every cell of a row that edits at once. Nothing is reported until Save or Enter; `onRowSave` hands over only the columns that changed.";

interface Shift {
  id: string;
  line: string;
  crew: string;
  lead: string;
  hours: number;
}

const SHIFTS: Shift[] = [
  { id: "S-1", line: "Kiln 1", crew: "Early", lead: "Ines Duarte", hours: 8 },
  { id: "S-2", line: "Kiln 2", crew: "Late", lead: "Tomasz Wrona", hours: 8 },
  { id: "S-3", line: "Press", crew: "Night", lead: "Amira Haddad", hours: 10 },
];

export default function SaveARowOnPurpose() {
  const [shifts, setShifts] = useState(SHIFTS);
  const [last, setLast] = useState<RowSave<Shift> | null>(null);
  const { Table, Column } = useTable(shifts, { rowKey: (s) => s.id });

  const save = (saved: RowSave<Shift>) => {
    setShifts((all) => all.map((s) => (s.id === saved.rowKey ? { ...s, ...saved.changes } : s)));
    setLast(saved);
  };

  return (
    <Stack gap={2}>
      <Table grid editMode="row" ariaLabel="Shifts" onRowSave={save}>
        <Column value="line" label="Line" rowHeader />
        <Column value="crew" label="Crew" edit="select" editOptions={["Early", "Late", "Night"]} width={140} />
        <Column value="lead" label="Shift lead" edit="text" />
        <Column value="hours" label="Hours" edit="number" width={110} />
      </Table>
      <Text size="xs" tone="muted">
        {last ? `Saved ${last.row.line}: ${Object.keys(last.changes).join(", ")}` : "Nothing saved yet."}
      </Text>
    </Stack>
  );
}
