import { useMemo } from "react";
import { useTable } from "../../../src";

export const title = "Twenty thousand readings by machine › shift";

/* A measurement log of twenty thousand readings, virtualised and grouped by
   machine and shift. The window counts lines - bands and rows alike -, so the
   scrollbar is as long as what is unfolded. The bands stick one below the
   other while their group scrolls, and the shift stays beside its readings.
   The shift is no column: `GroupBy` derives it from the timestamp. */

interface Reading {
  id: string;
  machine: string;
  at: Date;
  torque: number;
  temperature: number;
}

const MACHINES = ["Press 1", "Press 2", "Press 3", "Lathe 4", "Lathe 5", "Mill 6", "Mill 7", "Robot 8"] as const;

/* mulberry32: the same seed yields the same readings on every run. */
function generate(count: number): Reading[] {
  let seed = 20260924;
  const next = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  /* Three days, one reading every thirteen seconds, in the order they came. */
  const start = new Date(2026, 8, 21, 6).getTime();
  return Array.from({ length: count }, (_, i) => ({
    id: `r${i}`,
    machine: MACHINES[Math.floor(next() * MACHINES.length)]!,
    at: new Date(start + i * 13_000),
    torque: Math.round(400 + next() * 250) / 10,
    temperature: Math.round(550 + next() * 300) / 10,
  }));
}

const shiftOf = (d: Date) => (d.getHours() < 6 || d.getHours() >= 22 ? "Night" : d.getHours() < 14 ? "Early" : "Late");

export default function TwentyThousand() {
  const readings = useMemo(() => generate(20_000), []);
  const { Table, Column, GroupBy } = useTable(readings, {
    rowKey: (r) => r.id,
    defaultGrouping: ["machine", "shift"],
    virtual: { rowHeight: 37 },
  });
  return (
    <Table ariaLabel="Readings" maxHeight="480px" stickyHeader>
      <Column value="machine" label="Machine" />
      <Column value="at" label="Measured" format="dateTime" aggregate="range" />
      <Column value="torque" label="Torque (Nm)" format={{ decimals: 1 }} aggregate="avg" />
      <Column value="temperature" label="Temperature (°C)" format={{ decimals: 1 }} aggregate="max" />
      <GroupBy id="shift" value={(r) => shiftOf(r.at)} label="Shift" />
    </Table>
  );
}
