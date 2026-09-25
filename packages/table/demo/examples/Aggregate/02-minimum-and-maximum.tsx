import { useTable } from "../../../src";

export const title = "Find the extremes";
export const lead = "`\"min\"` and `\"max\"` take the extremes of numbers and dates alike, written in the column's format.";

interface Incident {
  id: string;
  toAcknowledge: number;
  opened: Date;
}

const at = (day: number, hours: number, minutes: number) => new Date(2026, 2, day, hours, minutes);

const INCIDENTS: Incident[] = [
  { id: "INC-1048", toAcknowledge: 4, opened: at(17, 9, 42) },
  { id: "INC-1047", toAcknowledge: 47, opened: at(17, 7, 15) },
  { id: "INC-1046", toAcknowledge: 6, opened: at(16, 22, 5) },
  { id: "INC-1045", toAcknowledge: 4, opened: at(16, 14, 20) },
  { id: "INC-1044", toAcknowledge: 1392, opened: at(15, 10, 0) },
];

export default function MinimumAndMaximum() {
  const { Table, Column } = useTable(INCIDENTS, { rowKey: (i) => i.id });
  return (
    <Table ariaLabel="Time to acknowledge">
      <Column value="id" label="Incident" rowHeader />
      <Column value="toAcknowledge" label="Minutes to acknowledge" aggregate="max" />
      <Column value="opened" label="Opened" format="dateTime" aggregate="min" />
    </Table>
  );
}
