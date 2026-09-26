import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";
import type { RowSave } from "../../../src";

export const title = "Save a row on purpose";
export const lead =
  "`editMode=\"row\"` opens every cell of a row that edits at once. Nothing is reported until Save or Enter; `onRowSave` hands over only the columns that changed.";

interface Project {
  id: string;
  name: string;
  phase: string;
  owner: string;
  days: number;
}

const PROJECTS: Project[] = [
  { id: "P-1", name: "Checkout redesign", phase: "Build", owner: "Ines Duarte", days: 40 },
  { id: "P-2", name: "Mobile app", phase: "Discovery", owner: "Tomasz Wrona", days: 15 },
  { id: "P-3", name: "Data warehouse", phase: "Launch", owner: "Amira Haddad", days: 60 },
];

export default function SaveARowOnPurpose() {
  const [projects, setProjects] = useState(PROJECTS);
  const [last, setLast] = useState<RowSave<Project> | null>(null);
  const { Table, Column } = useTable(projects, { rowKey: (p) => p.id });

  const save = (saved: RowSave<Project>) => {
    setProjects((all) => all.map((p) => (p.id === saved.rowKey ? { ...p, ...saved.changes } : p)));
    setLast(saved);
  };

  return (
    <Stack gap={2}>
      <Table grid editMode="row" ariaLabel="Projects" onRowSave={save}>
        <Column value="name" label="Project" rowHeader />
        <Column value="phase" label="Phase" edit="select" editOptions={["Discovery", "Build", "Launch"]} width={140} />
        <Column value="owner" label="Owner" edit="text" />
        <Column value="days" label="Budget (days)" edit="number" width={130} />
      </Table>
      <Text size="xs" tone="muted">
        {last ? `Saved ${last.row.name}: ${Object.keys(last.changes).join(", ")}` : "Nothing saved yet."}
      </Text>
    </Stack>
  );
}
