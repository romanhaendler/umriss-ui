import { useState } from "react";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Keep a list: add, change and delete rows";
export const lead =
  "`onRowAdd` puts up \"New row\" in the toolbar - an empty row draft above the rows, whatever the sort; `newRow` gives its first values. `onRowDelete` adds a Delete that asks inside its row. The application owns the rows: it inserts, changes and removes them itself.";

type Kind = "Spare part" | "Consumable" | "Tool";

interface Item {
  id: string;
  name: string;
  kind: Kind;
  stock: number | null;
  location: string;
}

const ITEMS: Item[] = [
  { id: "i1", name: "Burner nozzle 4 mm", kind: "Spare part", stock: 6, location: "Store A-3" },
  { id: "i2", name: "Refractory mortar", kind: "Consumable", stock: 14, location: "Yard" },
  { id: "i3", name: "Thermocouple type K", kind: "Spare part", stock: 3, location: "Store A-1" },
  { id: "i4", name: "Torque wrench 40-200 Nm", kind: "Tool", stock: 2, location: "Workshop" },
];

let next = ITEMS.length;

export default function KeepAList() {
  const [items, setItems] = useState(ITEMS);
  const { Table, Column } = useTable(items, { rowKey: (i) => i.id });
  return (
    <Table
      grid
      editMode="row"
      ariaLabel="Stores"
      newRow={() => ({ kind: "Spare part", stock: 0 })}
      onRowSave={({ rowKey, changes }) => setItems((all) => all.map((i) => (i.id === rowKey ? { ...i, ...changes } : i)))}
      onRowAdd={({ values }) => setItems((all) => [...all, { id: `i${++next}`, ...(values as Omit<Item, "id">) }])}
      onRowDelete={({ rowKey }) => setItems((all) => all.filter((i) => i.id !== rowKey))}
    >
      <Toolbar>
        <Search />
      </Toolbar>
      <Column value="name" label="Item" rowHeader edit="text" validate={(value) => (value ? undefined : "An item needs a name")} />
      <Column value="kind" label="Kind" edit="select" editOptions={["Spare part", "Consumable", "Tool"]} width={150} />
      <Column value="stock" label="In stock" edit="number" width={110} validate={(value) => (value === null || value < 0 ? "0 or more" : undefined)} />
      <Column value="location" label="Location" edit="text" width={150} />
    </Table>
  );
}
