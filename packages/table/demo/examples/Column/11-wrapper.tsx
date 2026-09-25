import { Badge } from "@umriss-ui/core";
import { useTable } from "../../../src";
import type { Table } from "../../../src";

export const title = "Wrap a column in a component";
export const lead = "A column that brings its presentation becomes a component; it takes the table as `of`, typed with a row kind, and uses its `Column`.";

/* A wrapper generic over its rows does not compile - TypeScript does not
   resolve the overloads against an open row type - and one without `of`
   compiles but is unchecked. */

interface Incident {
  id: string;
  severity: "SEV1" | "SEV2" | "SEV3";
}

const TONE = { SEV1: "danger", SEV2: "warning", SEV3: "neutral" } as const;

const INCIDENTS: Incident[] = [
  { id: "INC-1048", severity: "SEV1" },
  { id: "INC-1047", severity: "SEV3" },
  { id: "INC-1046", severity: "SEV2" },
];

function SeverityColumn({ of }: { of: Table<Incident> }) {
  return (
    <of.Column value="severity" label="Severity">
      {(severity) => <Badge tone={TONE[severity]}>{severity}</Badge>}
    </of.Column>
  );
}

export default function Wrapper() {
  const t = useTable(INCIDENTS, { rowKey: (i) => i.id });
  const { Table, Column } = t;

  return (
    <Table ariaLabel="Incidents">
      <Column value="id" label="Incident" rowHeader />
      <SeverityColumn of={t} />
    </Table>
  );
}
