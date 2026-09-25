import { Meter } from "../../../src";

export const title = "A share";
export const lead = "A `value` from 0 to 1, a `label` naming what is measured, and `showLabel` for the percentage beside the bar.";

export default function AShare() {
  return (
    <div style={{ maxWidth: 320 }}>
      <Meter value={0.8} label="Capacity booked, Arjun Mehta" showLabel />
    </div>
  );
}
