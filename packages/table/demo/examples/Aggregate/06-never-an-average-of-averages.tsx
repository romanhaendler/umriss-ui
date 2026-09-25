import { useTable } from "../../../src";

export const title = "Weight a rate by its rows";
export const lead = "Averaging rates weighs a small tour like a large one; divide the sums with an aggregate of your own, and header and footer are right.";

interface Tour {
  id: string;
  depot: string;
  parcels: number;
  failed: number;
}

const TOURS: Tour[] = [
  { id: "T-01", depot: "North depot", parcels: 410, failed: 5 },
  { id: "T-02", depot: "North depot", parcels: 380, failed: 3 },
  { id: "T-03", depot: "North depot", parcels: 12, failed: 3 },
  { id: "T-04", depot: "Riverside depot", parcels: 520, failed: 6 },
  { id: "T-05", depot: "Riverside depot", parcels: 460, failed: 4 },
];

const rate = (t: Tour) => t.failed / t.parcels;

export default function NeverAnAverageOfAverages() {
  const { Table, Column } = useTable(TOURS, { rowKey: (t) => t.id, defaultGrouping: "depot" });
  return (
    <Table ariaLabel="Failed deliveries by depot">
      <Column value="depot" label="Depot" />
      <Column value="id" label="Tour" rowHeader />
      <Column value="parcels" label="Parcels" format="count" aggregate="sum" share={false} />
      <Column value="failed" label="Failed" aggregate="sum" share={false} />
      <Column id="rateAveraged" value={rate} label="Rate, averaged" format="percent" aggregate="avg" />
      <Column
        id="rate"
        value={rate}
        label="Rate, weighted"
        format="percent"
        aggregate={(_, tours) => tours.reduce((s, t) => s + t.failed, 0) / tours.reduce((s, t) => s + t.parcels, 0)}
      />
    </Table>
  );
}
