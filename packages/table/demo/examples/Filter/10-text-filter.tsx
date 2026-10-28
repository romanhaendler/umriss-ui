import { useTable } from "../../../src";

export const title = "Filter a text with operators";
export const lead = "`filter=\"text\"` offers contains, does not contain, starts with, ends with, equals and is empty - up to two terms joined by AND or OR, without regard to case.";

interface Supplier {
  id: string;
  name: string;
  city: string;
}

const SUPPLIERS: Supplier[] = [
  { id: "S-01", name: "Brandlow Office Supply", city: "Leeds" },
  { id: "S-02", name: "Kettering & Shaw Events", city: "Bristol" },
  { id: "S-03", name: "Nimbrel Software", city: "Leeds" },
  { id: "S-04", name: "Fenwright Legal", city: "York" },
  { id: "S-05", name: "Corrin Travel", city: "Bath" },
  { id: "S-06", name: "Stellbrook Consulting", city: "Bristol" },
];

export default function TextFilter() {
  /* Set from outside, the condition is plain JSON: "name starts with B or ends with g". */
  const { Table, Column } = useTable(SUPPLIERS, {
    rowKey: (s) => s.id,
    initialView: {
      conditions: {
        name: { join: "or", terms: [{ operator: "startsWith", value: "b" }, { operator: "endsWith", value: "g" }] },
      },
    },
  });

  return (
    <Table aria-label="Suppliers">
      <Column value="id" label="Id" rowHeader />
      <Column value="name" label="Name" filter="text" />
      <Column value="city" label="City" filter="list" />
    </Table>
  );
}
