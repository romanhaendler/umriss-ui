import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "The worst verdict of a group";

/* A verdict column knows one aggregate: `aggregate="worst"`, the worst
   verdict among its rows, shown the way the cell shows it. The hall's band
   carries the worst of all its presses; fold a press and its line still says
   that one of its readings went into alarm - folding costs detail, never a
   finding. */

interface Reading {
  id: string;
  hall: string;
  machine: string;
  at: string;
  pressure: number | null;
}

const PRESSURE: LimitSet = {
  target: 210,
  limits: [
    { value: 225, side: "upper", severity: "warning" },
    { value: 240, side: "upper", severity: "alarm" },
    { value: 190, side: "lower", severity: "warning" },
  ],
};

const READINGS: Reading[] = [
  { id: "P1-0600", hall: "Hall A", machine: "Press 1", at: "06:00", pressure: 211.8 },
  { id: "P1-0700", hall: "Hall A", machine: "Press 1", at: "07:00", pressure: 214.2 },
  { id: "P1-0800", hall: "Hall A", machine: "Press 1", at: "08:00", pressure: 209.5 },
  { id: "P2-0600", hall: "Hall A", machine: "Press 2", at: "06:00", pressure: 222.4 },
  { id: "P2-0700", hall: "Hall A", machine: "Press 2", at: "07:00", pressure: 231.8 },
  { id: "P2-0800", hall: "Hall A", machine: "Press 2", at: "08:00", pressure: 227.0 },
  { id: "P3-0600", hall: "Hall B", machine: "Press 3", at: "06:00", pressure: 236.9 },
  { id: "P3-0700", hall: "Hall B", machine: "Press 3", at: "07:00", pressure: 246.1 },
  { id: "P3-0800", hall: "Hall B", machine: "Press 3", at: "08:00", pressure: null },
];

export default function WorstVerdict() {
  const { Table, Column, VerdictColumn } = useTable(READINGS, { rowKey: (r) => r.id, defaultGrouping: ["hall", "machine"] });
  return (
    <Table ariaLabel="Pressure by hall and press">
      <Column value="machine" label="Machine" />
      <Column value="hall" label="Hall" />
      <Column value="at" label="Hour" rowHeader />
      <VerdictColumn value="pressure" label="Pressure (bar)" limits={PRESSURE} format={{ decimals: 1 }} aggregate="worst" />
    </Table>
  );
}
