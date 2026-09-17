import { useTable } from "../../../src";

export const title = "format: a standard presentation by name";

/* `format` picks a presentation out of the provider's formats without writing
   `children`: `"percent"`, `"count"` and `{ decimals }` for numbers,
   `"date"`, `"time"` and `"dateTime"` for points in time.

   It is typed against the value - a date format on a number does not compile -
   and it keeps everything that hangs on the value: alignment, sorting, export,
   footer. Where more is needed than a name, it is `children`.

   Two columns over the same field need different ids: the second column over
   `start` names its own `id`, or both would carry the field name. */

interface Shift {
  shift: string;
  yield: number;
  parts: number;
  mean: number;
  start: Date;
}

const SHIFTS: Shift[] = [
  { shift: "Early", yield: 0.972, parts: 12480, mean: 31.9964, start: new Date(2026, 2, 17, 6, 0) },
  { shift: "Late", yield: 0.948, parts: 11902, mean: 32.0071, start: new Date(2026, 2, 17, 14, 0) },
  { shift: "Night", yield: 0.991, parts: 9315, mean: 32.0012, start: new Date(2026, 2, 17, 22, 0) },
];

export default function Format() {
  const { Table, Column } = useTable(SHIFTS, { rowKey: (s) => s.shift });

  return (
    <Table ariaLabel="Shifts">
      <Column value="shift" label="Shift" rowHeader />
      <Column value="yield" label="Yield" format="percent" />
      <Column value="parts" label="Parts" format="count" />
      <Column value="mean" label="Mean" format={{ decimals: 3 }} />
      <Column value="start" label="Day" format="date" />
      <Column id="time" value="start" label="Start" format="time" />
    </Table>
  );
}
