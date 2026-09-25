import { Stat } from "../../../src";
import type { LimitSet } from "../../../src";
import { metrics } from "@umriss-ui/demo/worlds/operations";

export const title = "Add a history";
export const lead = "`history` draws the values before it as a line under the figure: the shape of the last hours, not a trend arrow.";

const CHECKOUT_P95: LimitSet = {
  limits: [
    { value: 240, side: "upper", severity: "warning" },
    { value: 300, side: "upper", severity: "alarm" },
  ],
};

/** The last two hours, every five minutes. */
const LAST = metrics("checkout").slice(-24);

export default function History() {
  return (
    <div style={{ maxWidth: 260 }}>
      <Stat
        label="p95 latency · Checkout"
        value={LAST.at(-1)?.p95}
        unit="ms"
        decimals={0}
        limits={CHECKOUT_P95}
        history={LAST.map((point) => point.p95)}
      />
    </div>
  );
}
