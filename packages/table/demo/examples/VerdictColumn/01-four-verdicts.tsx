import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Four verdicts";

/* `VerdictColumn` reads a numeric value against a limit set and shows what comes
   out of it: ok, warning, alarm - and unknown, where no value is there. An
   unknown verdict is a verdict and not an absent value; the cell shows it as
   such.

   The verdict carries a shape and a word, not only a colour: tick, triangle,
   square, question mark, and for a screen reader the word. Where a limit is
   violated, the amount beyond it stands beside the value.

   The field names of the limit set stay German: it is the wire format
   @umriss-ui/core and @umriss-ui/charts agree on. */

interface Press {
  name: string;
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

const PRESSES: Press[] = [
  { name: "Press 1", pressure: 212.4 },
  { name: "Press 2", pressure: 231.8 },
  { name: "Press 3", pressure: 246.1 },
  { name: "Press 4", pressure: null },
];

export default function FourVerdicts() {
  const { Table, Column, VerdictColumn } = useTable(PRESSES, { rowKey: (p) => p.name });

  return (
    <Table ariaLabel="Presses">
      <Column value="name" label="Press" rowHeader />
      <VerdictColumn value="pressure" label="Pressure (bar)" limits={PRESSURE} format={{ decimals: 1 }} />
    </Table>
  );
}
