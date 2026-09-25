import { Stat } from "../../../src";

export const title = "A figure";
export const lead = "A `label`, a `value` and its `unit`; without limits the figure is neutral, as it should be for a number nobody judged.";

export default function AFigure() {
  return (
    <div style={{ maxWidth: 240 }}>
      <Stat label="Requests per minute · Checkout" value={812} decimals={0} />
    </div>
  );
}
