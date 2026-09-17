/* Two kinds of limit, and they look different because they mean different
   things.

   The SPECIFICATION limits (dashed, coloured) are chosen: what the customer
   assumes. The CONTROL limits (solid, neutral) are calculated: what this process
   normally does - and out of a named reference window, never out of what happens
   to be visible (ADR-0008). From value 62 the process drifts; the run rule fires
   long before a point leaves the specification. */

import { Chart, ControlChart, LimitLine, Tooltip, XAxis, YAxis } from "../../../src";
import { measurementData, type Measurement } from "../../data";

export const title = "Control chart";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

/* The control limits come out of the first 60 per cent of the series - the
   period in which the process demonstrably ran in control. */
const REFERENCE_WINDOW = { kind: "referenceWindow", from: 0, to: 54 } as const;

export default function ControlChartExample() {
  return (
    <Chart data={measurementData} height={300} ariaLabel="Control chart of a feature inspection">
      <XAxis accessor={(d: Measurement) => d.n} label="Inspection" />
      <YAxis accessor={(d: Measurement) => d.value} label="mm" />
      <LimitLine value={13.2} severity="alarm" label="USL" />
      <LimitLine value={11.8} severity="alarm" label="LSL" />
      <ControlChart
        accessor={(d: Measurement) => d.value}
        data={measurementData}
        origin={REFERENCE_WINDOW}
        name="Feature Ø"
        labelUpper="UCL"
        labelLower="LCL"
        violationName="Feature Ø - rule violation"
      />
      <Tooltip mode="x" />
    </Chart>
  );
}
