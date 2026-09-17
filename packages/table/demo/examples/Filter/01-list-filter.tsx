import { useTable } from "../../../src";

export const title = "filter=“list”: a filter with the values that occur";

/* `filter="list"` puts a filter into the header that offers the values which
   occur in the column - in all the rows the pre-filter admits, so that an option
   does not vanish the moment it is deselected. An absent value is an option of
   its own.

   What currently restricts stands as a condition in the table toolbar - the
   table puts one there even where none stands in the JSX - with the ratio of
   matches to the whole set, a cross per condition and "Reset" for all of them. A
   click on a condition opens its filter. The toolbar stands there before
   anything restricts: the table does not move when the first condition arrives.
   What a filter means in the trade the table does not decide: it lets through
   what is chosen. */

interface Fault {
  number: string;
  line: string;
  cause: string | null;
}

const FAULTS: Fault[] = [
  { number: "S-301", line: "Line 1", cause: "Tool breakage" },
  { number: "S-302", line: "Line 2", cause: "Material shortage" },
  { number: "S-303", line: "Line 1", cause: null },
  { number: "S-304", line: "Line 3", cause: "Tool breakage" },
  { number: "S-305", line: "Line 2", cause: "Sensor fault" },
];

export default function ListFilter() {
  const { Table, Column } = useTable(FAULTS, { rowKey: (f) => f.number });

  return (
    <Table ariaLabel="Faults">
      <Column value="number" label="Fault" rowHeader />
      <Column value="line" label="Line" filter="list" />
      <Column value="cause" label="Cause" filter="list" />
    </Table>
  );
}
