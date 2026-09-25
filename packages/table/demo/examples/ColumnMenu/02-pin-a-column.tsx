import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Pin a column";

export const lead = "The pin keys in the menu hold a column at the start or the end while the months scroll sideways – try pinning the year.";

interface CostCentre {
  name: string;
  months: number[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Thousands of euros per month. */
const CENTRES: CostCentre[] = [
  { name: "Sales", months: [141, 139, 138, 144, 142, 140, 136, 131, 143, 145, 147, 150] },
  { name: "Marketing", months: [66, 71, 79, 83, 70, 68, 64, 60, 74, 77, 81, 90] },
  { name: "Customer service", months: [60, 61, 59, 62, 61, 63, 60, 58, 61, 62, 60, 64] },
];

export default function PinAColumn() {
  const { Table, Column } = useTable(CENTRES, { rowKey: (c) => c.name });

  return (
    <Table ariaLabel="Cost centres by month">
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <Column value="name" label="Cost centre" rowHeader width={180} />
      {MONTHS.map((month, i) => (
        <Column key={month} id={month} label={month} value={(c) => c.months[i] ?? null} width={80} />
      ))}
      <Column id="year" label="Year" value={(c) => c.months.reduce((a, b) => a + b, 0)} width={90} />
    </Table>
  );
}
