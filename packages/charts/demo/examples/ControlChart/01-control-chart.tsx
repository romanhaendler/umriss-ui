import { Chart, ControlChart, LimitLine, Tooltip, XAxis, YAxis } from "../../../src";
import { plant, type Sample } from "@umriss-ui/demo/worlds/plant";

export const title = "Chart a process against its control limits";
export const lead = "In the plant: `origin` names the reference window the limits come from; the burner's overshoot breaks them while every tile stays in specification.";

/* A tile measured off the belt every ten minutes of the early shift. */
const SAMPLES = plant(7).samples;

/* The first fifteen samples, 06:00 to 08:20: the kiln demonstrably ran in
   control. Never the samples that happen to be visible (ADR-0008). */
const REFERENCE_WINDOW = { kind: "referenceWindow", from: 0, to: 15 } as const;

export default function ControlChartExample() {
  return (
    <Chart data={SAMPLES} height={300} ariaLabel="Control chart of the tile length after firing">
      <XAxis accessor={(d: Sample) => d.minute} label="Minute of the shift" />
      <YAxis accessor={(d: Sample) => d.length} label="mm" />
      {/* Specification limits are chosen, control limits are computed. */}
      <LimitLine value={602.5} severity="alarm" label="USL" />
      <LimitLine value={597.5} severity="alarm" label="LSL" />
      <ControlChart
        accessor={(d: Sample) => d.length}
        data={SAMPLES}
        origin={REFERENCE_WINDOW}
        name="Tile length"
        labelUpper="UCL"
        labelLower="LCL"
        violationName="Tile length - rule violation"
      />
      <Tooltip mode="x" />
    </Chart>
  );
}
