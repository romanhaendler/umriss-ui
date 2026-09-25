import { useMemo, useState } from "react";
import { useTable } from "../../../src";

export const title = "Grid mode with everything else: groups, pinned columns, two thousand rows";

/* Grid mode is a mode of the one table, and everything else keeps working in
   it. Grouped, the grid is a treegrid, and a group header is a line the arrows
   walk like a row - its label spans several columns, and walking down through
   it lands in the column the walk came from. A fold is a control of its
   cell: Enter, then Enter again folds.

   The Active cell holds on to its row and its column, not to what is
   rendered. It follows a sorted row, and in a virtual window the arrows walk
   to rows that were never rendered: the grid scrolls them in. Ctrl+End goes
   to the footer two thousand rows down.

   The rows are generated with a fixed seed: every run yields the same ones. */

interface Point {
  id: string;
  tag: string;
  area: string;
  setpoint: number;
  measured: number;
  note: string;
}

const AREAS = ["Intake", "Filtration", "Dosing", "Storage", "Distribution"] as const;

function generate(count: number): Point[] {
  let seed = 20260924;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  return Array.from({ length: count }, (_, i) => {
    const setpoint = Math.round(next() * 800) / 10;
    return {
      id: `x${i}`,
      tag: `XT-${String(i + 1).padStart(4, "0")}`,
      area: AREAS[Math.floor(next() * AREAS.length)]!,
      setpoint,
      measured: Math.round((setpoint + (next() - 0.5) * 6) * 10) / 10,
      note: "",
    };
  });
}

export default function TheWholeGrid() {
  const generated = useMemo(() => generate(2000), []);
  const [points, setPoints] = useState(generated);
  const { Table, Column } = useTable(points, {
    rowKey: (p) => p.id,
    defaultGrouping: "area",
    defaultSort: { column: "tag", direction: "asc" },
    virtual: { rowHeight: 37 },
  });
  return (
    <Table
      grid
      selectable
      stickyHeader
      maxHeight="360px"
      ariaLabel="Measuring points"
      onCellEdit={({ rowKey, columnId, value }) =>
        setPoints((all) => all.map((p) => (p.id === rowKey ? { ...p, [columnId]: value } : p)))
      }
    >
      <Column value="tag" label="Point" rowHeader pin="start" width={120} />
      <Column value="area" label="Area" />
      <Column
        value="setpoint"
        label="Setpoint"
        format={{ decimals: 1 }}
        edit="number"
        validate={(value) => (value === null || value < 0 || value > 100 ? "Between 0 and 100" : undefined)}
        width={140}
      />
      <Column value="measured" label="Measured" format={{ decimals: 1 }} aggregate="avg" width={130} />
      <Column value="note" label="Note" edit="text" width={260} />
    </Table>
  );
}
