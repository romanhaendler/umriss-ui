import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";
import type { CellEdit } from "../../../src";

export const title = "Check an edit before it is reported";
export const lead = "Each editing column gets the core field for its value; `validate` keeps the editor open with its message until the draft passes.";

type Role = "Developer" | "Designer" | "Product manager" | "QA engineer";

interface Person {
  id: string;
  name: string;
  team: string;
  capacity: number;
  role: Role;
  availableFrom: Date;
}

const PEOPLE: Person[] = [
  { id: "maya", name: "Maya Lindgren", team: "Web", capacity: 32, role: "Product manager", availableFrom: new Date(2026, 2, 2) },
  { id: "arjun", name: "Arjun Mehta", team: "Web", capacity: 40, role: "Developer", availableFrom: new Date(2026, 2, 23) },
  { id: "noah", name: "Noah Fischer", team: "Web", capacity: 24, role: "Designer", availableFrom: new Date(2026, 2, 16) },
  { id: "david", name: "David Kowalski", team: "Apps", capacity: 20, role: "QA engineer", availableFrom: new Date(2026, 2, 16) },
];

export default function ValidatedEdits() {
  const [people, setPeople] = useState(PEOPLE);
  const [last, setLast] = useState<CellEdit<Person> | null>(null);
  const { Table, Column } = useTable(people, { rowKey: (p) => p.id });

  const apply = (edit: CellEdit<Person>) => {
    setPeople((all) => all.map((p) => (p.id === edit.rowKey ? { ...p, [edit.columnId]: edit.value } : p)));
    setLast(edit);
  };

  return (
    <Stack gap={2}>
      <Table grid ariaLabel="Capacity" onCellEdit={apply}>
        <Column value="name" label="Person" rowHeader />
        <Column value="team" label="Team" />
        <Column
          value="capacity"
          label="Capacity"
          width={140}
          edit="number"
          validate={(value) =>
            value === null ? "A person needs a capacity" : value < 4 || value > 40 ? "Between 4 and 40 hours a week" : undefined
          }
        />
        <Column value="role" label="Role" edit="select" editOptions={["Developer", "Designer", "Product manager", "QA engineer"]} width={170} />
        <Column value="availableFrom" label="Available from" format="date" edit="date" width={160} />
      </Table>
      <Text size="xs" tone="muted">
        {last ? `Last edit: ${last.row.name}, ${last.columnId}` : "No edit yet."}
      </Text>
    </Stack>
  );
}
