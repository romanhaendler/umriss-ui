import { useState } from "react";
import { useTable } from "../../../src";

export const title = "Check a whole row before it is saved";
export const lead =
  "On Save every open cell runs its `validate`; each message stands beneath its field, and the row stays open until all of them pass. A click into another row is refused while the draft is open.";

interface Offer {
  id: string;
  product: string;
  unit: string;
  price: number | null;
  minimum: number | null;
  maximum: number | null;
}

const OFFERS: Offer[] = [
  { id: "o1", product: "Printer paper A4", unit: "box", price: 24.5, minimum: 5, maximum: 200 },
  { id: "o2", product: "Toner cartridge", unit: "piece", price: 68, minimum: 1, maximum: 40 },
  { id: "o3", product: "Desk lamp", unit: "piece", price: 39.9, minimum: 2, maximum: 25 },
];

const required = (label: string) => (value: number | null) => (value === null ? `${label} is required` : undefined);

export default function CheckAWholeRow() {
  const [offers, setOffers] = useState(OFFERS);
  const { Table, Column } = useTable(offers, { rowKey: (o) => o.id });
  return (
    <Table
      grid
      editMode="row"
      ariaLabel="Price list"
      onRowSave={({ rowKey, changes }) => setOffers((all) => all.map((o) => (o.id === rowKey ? { ...o, ...changes } : o)))}
    >
      <Column value="product" label="Product" rowHeader />
      <Column value="unit" label="Unit" width={80} />
      <Column
        value="price"
        label="Price"
        edit="number"
        width={130}
        validate={(value) => (value === null ? "A price is required" : value < 0 ? "Not below 0" : undefined)}
      />
      <Column value="minimum" label="Minimum order" edit="number" width={150} validate={required("A minimum order")} />
      <Column value="maximum" label="Maximum order" edit="number" width={150} validate={required("A maximum order")} />
    </Table>
  );
}
