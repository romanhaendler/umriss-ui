import { ProgressBar } from "../../../src";

export const title = "How far a job has come";
export const lead = "A `value` from 0 to 1 and a `label` naming what progresses; `showLabel` puts the percentage beside the bar.";

export default function HowFar() {
  return (
    <div style={{ maxWidth: 420 }}>
      <ProgressBar value={0.42} label="Import of the March invoices" showLabel />
    </div>
  );
}
