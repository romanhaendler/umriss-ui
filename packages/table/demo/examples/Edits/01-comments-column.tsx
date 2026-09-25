import { useState } from "react";
import { useTable } from "../../../src";

export const title = "Edit a comments column";
export const lead = "`edit=\"text\"` lets a column edit; the table reports each edit through `onCellEdit` and the application writes it into its rows.";

interface Tour {
  id: string;
  driver: string;
  stops: number;
  comment: string;
}

const TOURS: Tour[] = [
  { id: "T-01", driver: "Martin Hale", stops: 11, comment: "" },
  { id: "T-02", driver: "Nadia Petrova", stops: 9, comment: "Van swapped at 10:40" },
  { id: "T-03", driver: "Owen Carter", stops: 5, comment: "" },
];

export default function CommentsColumn() {
  const [tours, setTours] = useState(TOURS);
  const { Table, Column } = useTable(tours, { rowKey: (t) => t.id });
  return (
    <Table
      grid
      ariaLabel="Today's tours"
      onCellEdit={({ rowKey, value }) => setTours((all) => all.map((t) => (t.id === rowKey ? { ...t, comment: String(value) } : t)))}
    >
      <Column value="id" label="Tour" rowHeader />
      <Column value="driver" label="Driver" />
      <Column value="stops" label="Stops" />
      <Column value="comment" label="Comment" edit="text" width={280} />
    </Table>
  );
}
