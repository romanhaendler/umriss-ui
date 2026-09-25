import { Grid, Stat } from "../../../src";
import type { LimitSet } from "../../../src";

export const title = "Read a value against its limits";
export const lead = "Pass `limits` – a value, a side and a severity each – and the tile takes its colour and its verdict word from them.";

/** Checkout's latency objective: warn from 240 ms, alarm from 300 ms. */
const CHECKOUT_P95: LimitSet = {
  limits: [
    { value: 240, side: "upper", severity: "warning" },
    { value: 300, side: "upper", severity: "alarm" },
  ],
};

export default function AgainstLimits() {
  return (
    <Grid minItemWidth="200px" gap={4}>
      <Stat label="p95 latency at 08:00" value={187} unit="ms" decimals={0} limits={CHECKOUT_P95} />
      <Stat label="p95 latency at 09:35" value={262} unit="ms" decimals={0} limits={CHECKOUT_P95} />
      <Stat label="p95 latency at 09:50" value={498} unit="ms" decimals={0} limits={CHECKOUT_P95} />
    </Grid>
  );
}
