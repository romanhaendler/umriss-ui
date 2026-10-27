/* The two date names with seconds are typed like the other date names: on a
   point in time, and nowhere else. Compiled by `typecheck`; the lines under
   `@ts-expect-error` must yield an error. */

import { useTable } from "../src";
import type { Table } from "../src";

interface Event {
  id: string;
  at: Date;
  count: number;
}

declare const events: Event[];

export function Formats() {
  const t: Table<Event> = useTable(events, { rowKey: (e) => e.id });
  const { Table: Frame, Column } = t;
  return (
    <Frame>
      <Column value="at" label="At" format="dateTimeWithSeconds" />
      <Column value="at" id="clock" label="Clock" format="timeWithSeconds" />
      {/* @ts-expect-error a number column takes no date format */}
      <Column value="count" label="Count" format="dateTimeWithSeconds" />
      {/* @ts-expect-error a number column takes no date format */}
      <Column value="count" label="Count" format="timeWithSeconds" />
    </Frame>
  );
}
