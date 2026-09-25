import { Search, Toolbar, useTable } from "../../../src";

export const title = "Total a column";
export const lead = "`aggregate=\"sum\"` and `\"avg\"` fill the footer over what search and filters leave; an average counts only the values present.";

interface Tour {
  id: string;
  depot: string;
  km: number;
  stops: number;
  load: number | null;
}

const TOURS: Tour[] = [
  { id: "T-01", depot: "North depot", km: 84, stops: 11, load: 0.72 },
  { id: "T-02", depot: "North depot", km: 91, stops: 9, load: 0.64 },
  { id: "T-03", depot: "North depot", km: 152, stops: 5, load: 0.88 },
  { id: "T-04", depot: "Riverside depot", km: 77, stops: 10, load: null },
  { id: "T-05", depot: "Riverside depot", km: 102, stops: 8, load: 0.58 },
];

export default function SumAndAverage() {
  const { Table, Column } = useTable(TOURS, { rowKey: (t) => t.id });
  return (
    <Table ariaLabel="Tours">
      <Toolbar>
        <Search placeholder="Search depot" />
      </Toolbar>
      <Column value="id" label="Tour" rowHeader />
      <Column value="depot" label="Depot" />
      <Column value="km" label="Distance (km)" aggregate="sum" />
      <Column value="stops" label="Stops" aggregate="sum" />
      <Column value="load" label="Load" format="percent" aggregate="avg" />
    </Table>
  );
}
