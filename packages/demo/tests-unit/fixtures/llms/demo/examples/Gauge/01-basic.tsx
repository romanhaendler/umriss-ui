/* One gauge. */

import { Gauge } from "../../../src";

export const title = "A basic gauge";

export const lead = "Pass the `value`; the needle points at it.";

export default function Basic() {
  return <Gauge value={42} />;
}
