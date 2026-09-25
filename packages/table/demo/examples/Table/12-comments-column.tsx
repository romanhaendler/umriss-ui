import { useState } from "react";
import { useTable } from "../../../src";

export const title = "Editing: a comments column";

/* One column that edits: `edit="text"` gives it the core `Input`. Enter, F2
   or simply typing on the cell starts the edit; Enter commits, Escape
   cancels, Tab commits and moves on to the next cell that edits.

   The table applies nothing. It reports the edit through `onCellEdit` - the
   row's key, the column and the value - and the application writes it into
   its rows; the cell shows the comment once the rows carry it. An application
   that keeps the comment on a server writes it there first.

   To try it: Tab into the table, walk to a comment, type. */

interface Shift {
  id: string;
  line: string;
  output: number;
  comment: string;
}

const SHIFTS: Shift[] = [
  { id: "s1", line: "Line 1", output: 1840, comment: "" },
  { id: "s2", line: "Line 2", output: 1215, comment: "Tool change at 10:40" },
  { id: "s3", line: "Line 3", output: 1990, comment: "" },
];

export default function CommentsColumn() {
  const [shifts, setShifts] = useState(SHIFTS);
  const { Table, Column } = useTable(shifts, { rowKey: (s) => s.id });
  return (
    <Table
      grid
      ariaLabel="Shift report"
      onCellEdit={({ rowKey, value }) =>
        setShifts((all) => all.map((s) => (s.id === rowKey ? { ...s, comment: String(value) } : s)))
      }
    >
      <Column value="line" label="Line" rowHeader />
      <Column value="output" label="Output" format="count" />
      <Column value="comment" label="Comment" edit="text" width={280} />
    </Table>
  );
}
