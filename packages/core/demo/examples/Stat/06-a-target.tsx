import { Grid, Stat } from "../../../src";
import type { LimitSet } from "../../../src";

export const title = "Measure against a target";
export const lead = "A `target` is missed by an amount, never violated: the tile shows the signed deviation beside its verdict from the limits.";

/** February's spend in k€, against each centre's monthly budget as target; over by 5 % warns, by 15 % alarms. */
function budget(monthly: number): LimitSet {
  return {
    target: monthly,
    limits: [
      { value: monthly * 1.05, side: "upper", severity: "warning" },
      { value: monthly * 1.15, side: "upper", severity: "alarm" },
    ],
  };
}

export default function ATarget() {
  return (
    <Grid minItemWidth="200px" gap={4}>
      <Stat label="Sales · February" value={138.9} unit="k€" decimals={1} limits={budget(142)} />
      <Stat label="Marketing · February" value={74.3} unit="k€" decimals={1} limits={budget(68)} />
      <Stat label="IT · February" value={96.1} unit="k€" decimals={1} limits={budget(83)} />
    </Grid>
  );
}
