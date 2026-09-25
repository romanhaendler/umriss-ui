import { useMemo, useState } from "react";
import { useTable } from "../../../src";

export const title = "Combine grid mode with groups, pinning and many rows";
export const lead = "Grid mode keeps everything else: a group header is a line the arrows walk, and in a virtual window the keys reach unrendered rows.";

interface Parcel {
  id: string;
  parcel: string;
  depot: string;
  weight: number;
  declared: number;
  note: string;
}

const DEPOTS = ["North depot", "Riverside depot", "East Gate depot"] as const;

/* A linear congruential generator: the same seed yields the same rows. */
function generate(count: number): Parcel[] {
  let seed = 20260924;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  return Array.from({ length: count }, (_, i) => ({
    id: `x${i}`,
    parcel: `FP-${String(1_004_210 + i)}`,
    depot: DEPOTS[Math.floor(next() * DEPOTS.length)]!,
    weight: Math.round(next() * 300) / 10,
    declared: Math.round(next() * 50_000) / 100,
    note: "",
  }));
}

export default function TheWholeGrid() {
  const generated = useMemo(() => generate(2000), []);
  const [parcels, setParcels] = useState(generated);
  const { Table, Column } = useTable(parcels, {
    rowKey: (p) => p.id,
    defaultGrouping: "depot",
    defaultSort: { column: "parcel", direction: "asc" },
    virtual: { rowHeight: 37 },
  });
  return (
    <Table
      grid
      selectable
      stickyHeader
      maxHeight="360px"
      ariaLabel="Parcels by depot"
      onCellEdit={({ rowKey, columnId, value }) =>
        setParcels((all) => all.map((p) => (p.id === rowKey ? { ...p, [columnId]: value } : p)))
      }
    >
      <Column value="parcel" label="Parcel" rowHeader pin="start" width={130} />
      <Column value="depot" label="Depot" />
      <Column
        value="weight"
        label="Weight (kg)"
        format={{ decimals: 1 }}
        edit="number"
        validate={(value) => (value === null || value <= 0 || value > 31.5 ? "Between 0 and 31.5 kg" : undefined)}
        width={140}
      />
      <Column value="declared" label="Declared value (€)" format={{ decimals: 2 }} aggregate="sum" width={170} />
      <Column value="note" label="Note" edit="text" width={260} />
    </Table>
  );
}
