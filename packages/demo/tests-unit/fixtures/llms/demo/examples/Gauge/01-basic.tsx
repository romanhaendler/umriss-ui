/* One gauge. */

import { Gauge } from "../../../src";

export const title = "A basic gauge";

export default function Basic() {
  return <Gauge value={42} />;
}
