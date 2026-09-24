import { useTable } from "../../../src";

export const title = "No value: the group that stands last";

/* Three quotations have no customer yet. They are not left out and not put
   under an empty heading: they form the group "No value", which stands last -
   in either direction, as absent values sort. Click the Customer header twice
   and the customers turn round; the group without one stays at the end. */

interface Quotation {
  id: string;
  customer: string | null;
  article: string;
  value: number;
}

const QUOTATIONS: Quotation[] = [
  { id: "Q-2201", customer: "Brenner GmbH", article: "Housing 40", value: 18_400 },
  { id: "Q-2202", customer: null, article: "Flange", value: 2_150 },
  { id: "Q-2203", customer: "Kessler AG", article: "Cover plate", value: 9_800 },
  { id: "Q-2204", customer: "Brenner GmbH", article: "Shaft 12", value: 31_000 },
  { id: "Q-2205", customer: null, article: "Bushing", value: 1_240 },
  { id: "Q-2206", customer: "Weiss Antriebe", article: "Bracket", value: 6_700 },
  { id: "Q-2207", customer: null, article: "Housing 60", value: 12_900 },
];

export default function NoValue() {
  const { Table, Column } = useTable(QUOTATIONS, { rowKey: (q) => q.id, defaultGrouping: "customer" });
  return (
    <Table ariaLabel="Quotations by customer">
      <Column value="customer" label="Customer" />
      <Column value="id" label="Quotation" rowHeader />
      <Column value="article" label="Article" />
      <Column value="value" label="Value (EUR)" format={{ decimals: 0 }} aggregate="sum" />
    </Table>
  );
}
