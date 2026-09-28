import { useState } from "react";
import { useTable } from "../../../src";

export const title = "Edit a dense table";
export const lead =
  "`density=\"compact\"` holds for a row draft too: its fields and buttons are a step smaller, and a row with actions stands as tall as one without.";

interface Room {
  id: string;
  name: string;
  seats: number;
  floor: number;
}

const ROOMS: Room[] = [
  { id: "r1", name: "Harbour", seats: 8, floor: 2 },
  { id: "r2", name: "Orchard", seats: 12, floor: 3 },
  { id: "r3", name: "Lantern", seats: 4, floor: 3 },
];

export default function EditADenseTable() {
  const [rooms, setRooms] = useState(ROOMS);
  const { Table, Column } = useTable(rooms, { rowKey: (r) => r.id });
  return (
    <Table
      grid
      editMode="row"
      density="compact"
      ariaLabel="Meeting rooms"
      onRowSave={({ rowKey, changes }) => setRooms((all) => all.map((r) => (r.id === rowKey ? { ...r, ...changes } : r)))}
      onRowDelete={({ rowKey }) => setRooms((all) => all.filter((r) => r.id !== rowKey))}
    >
      <Column value="name" label="Room" rowHeader edit="text" />
      <Column value="seats" label="Seats" edit="number" width={120} />
      <Column value="floor" label="Floor" edit="number" width={120} />
    </Table>
  );
}
