import { useTable } from "../../../src";

export const title = "Without children: the value type decides";

/* A column without `children` looks the way its value says - out of the
   provider's formats:

   - Text stands as it is, on the left; sorted in the provider's collation.
   - A number stands right-aligned with tabular figures; it has a footer.
   - A point in time stands as date and time; sorted by the time.
   - A truth value stands as a word; false before true.
   - An absent value stands as a muted dash, the same in every column.

   It is decided at runtime, at the column's first value present. A value
   without a textual form - a field, an object - demands `children`, and the
   compiler says so already. */

interface Row {
  text: string;
  number: number;
  moment: Date;
  truth: boolean;
  absent: number | null;
}

const ROWS: Row[] = [
  { text: "Flange DN 50", number: 1240.5, moment: new Date(2026, 2, 17, 9, 5), truth: true, absent: null },
  { text: "Bearing cap", number: 18, moment: new Date(2026, 2, 16, 14, 30), truth: false, absent: 3 },
];

export default function Defaults() {
  const { Table, Column } = useTable(ROWS, { rowKey: (r) => r.text });

  return (
    <Table ariaLabel="Defaults per value type">
      <Column value="text" label="Text" rowHeader />
      <Column value="number" label="Number" />
      <Column value="moment" label="Point in time" />
      <Column value="truth" label="Truth value" />
      <Column value="absent" label="Absent" />
    </Table>
  );
}
