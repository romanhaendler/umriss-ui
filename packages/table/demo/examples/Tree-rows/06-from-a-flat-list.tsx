import { useMemo } from "react";
import { useTable } from "../../../src";

export const title = "From a flat list";
export const lead = "Data from a database often comes flat, each record with its parent's id. A few lines nest it; the table takes the nested rows.";

interface CostCentre {
  id: string;
  parent: string | null;
  name: string;
  amount: number;
}

const FLAT: CostCentre[] = [
  { id: "1000", parent: null, name: "Administration", amount: 820 },
  { id: "1100", parent: "1000", name: "Accounting", amount: 310 },
  { id: "1110", parent: "1100", name: "Payroll", amount: 120 },
  { id: "1200", parent: "1000", name: "Legal", amount: 190 },
  { id: "2000", parent: null, name: "Production", amount: 4_300 },
  { id: "2100", parent: "2000", name: "Assembly", amount: 2_600 },
];

type Nested = CostCentre & { children?: Nested[] };

/** Nests a flat list by its parent ids - the roots are those without one. */
function nest(flat: readonly CostCentre[]): Nested[] {
  const byId = new Map<string, Nested>(flat.map((c) => [c.id, { ...c }]));
  const roots: Nested[] = [];
  for (const c of byId.values()) {
    const parent = c.parent === null ? undefined : byId.get(c.parent);
    if (parent) (parent.children ??= []).push(c);
    else roots.push(c);
  }
  return roots;
}

export default function FromAFlatList() {
  const rows = useMemo(() => nest(FLAT), []);
  const { Table, Column } = useTable(rows, { rowKey: (c) => c.id, childRows: (c) => c.children, defaultBranches: 1 });
  return (
    <Table ariaLabel="Cost centres">
      <Column value="name" label="Name" rowHeader />
      <Column value="id" label="Cost centre" />
      <Column value="amount" label="Amount (k€)" />
    </Table>
  );
}
