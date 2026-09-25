/* Eight machines across twenty-four hours at a glance. Above by assessment - the
   same limits that colour a tile - below across a gradient.

   A bad HOUR everywhere looks different from a bad MACHINE, and exactly that
   difference is the reason for the form. Where nothing was measured, a hole
   stays. */

import { Chart, Matrix, Tooltip, XAxis, YAxis } from "../../../src";
import { MACHINES, matrixData, type CellPoint } from "@umriss-ui/demo/worlds/plant";

export const title = "Matrix";

export default function MatrixExample() {
  return (
    <div className="side-by-side">
      <Chart data={matrixData} height={260} ariaLabel="OEE per machine and hour, by assessment">
        <XAxis
          accessor={(d: CellPoint) => d.hour}
          ticks={[0, 6, 12, 18]}
          tickFormat={(v) => `${v}:00`}
          label="Hour"
        />
        <YAxis
          accessor={(d: CellPoint) => d.machine}
          ticks={MACHINES.map((_, i) => i)}
          tickFormat={(v) => MACHINES[v] ?? ""}
        />
        <Matrix
          accessor={(d: CellPoint) => d.machine}
          value={(d: CellPoint) => d.oee}
          coloring={{
            kind: "assessment",
            limits: {
              limits: [
                { value: 70, side: "lower", severity: "warning" },
                { value: 40, side: "lower", severity: "alarm" },
              ],
            },
          }}
          name="OEE"
        />
        <Tooltip mode="nearest" />
      </Chart>
      <Chart data={matrixData} height={260} ariaLabel="OEE per machine and hour, as a gradient">
        <XAxis
          accessor={(d: CellPoint) => d.hour}
          ticks={[0, 6, 12, 18]}
          tickFormat={(v) => `${v}:00`}
          label="Hour"
        />
        <YAxis
          accessor={(d: CellPoint) => d.machine}
          ticks={MACHINES.map((_, i) => i)}
          tickFormat={(v) => MACHINES[v] ?? ""}
        />
        <Matrix accessor={(d: CellPoint) => d.machine} value={(d: CellPoint) => d.oee} name="OEE" />
        <Tooltip mode="nearest" />
      </Chart>
    </div>
  );
}
