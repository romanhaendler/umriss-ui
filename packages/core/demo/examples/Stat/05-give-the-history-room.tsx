import { Grid, Stat } from "../../../src";
import type { LimitSet } from "../../../src";
import { metrics } from "@umriss-ui/demo/worlds/operations";

export const title = "Give the history room";
export const lead = "A tile of 380 px and more puts its history beside the figures, as high as they are; a narrower one keeps it beneath. The tile decides by its own width.";

const P95: LimitSet = {
  limits: [
    { value: 240, side: "upper", severity: "warning" },
    { value: 300, side: "upper", severity: "alarm" },
  ],
};

const ERRORS: LimitSet = {
  limits: [
    { value: 1, side: "upper", severity: "warning" },
    { value: 2, side: "upper", severity: "alarm" },
  ],
};

/** Checkout since six this morning, every five minutes. */
const MORNING = metrics("checkout").slice(-54);

export default function GiveTheHistoryRoom() {
  return (
    <Grid minItemWidth="380px" gap={4}>
      <Stat
        label="p95 latency · Checkout · since 06:00"
        value={MORNING.at(-1)?.p95}
        unit="ms"
        decimals={0}
        limits={P95}
        history={MORNING.map((point) => point.p95)}
      />
      <Stat
        label="Error rate · Checkout · since 06:00"
        value={MORNING.at(-1)?.errorRate}
        unit="%"
        decimals={2}
        limits={ERRORS}
        history={MORNING.map((point) => point.errorRate)}
      />
    </Grid>
  );
}
