import { Grid, Stat, Text } from "../../../src";
import type { LimitSet } from "../../../src";

export const title = "History and deviation from target";

/* A target is never violated but missed by an amount - it is not the edge of a
   region. The deviation is therefore a different number from the exceedance and
   is never filled from it.

   And no trend arrow: a direction out of two points of a noisy signal is noise
   with an arrowhead - and is read as information. The line shows the shape;
   whoever needs a direction needs a chart. */

const UTILISATION: LimitSet = {
  target: 85,
  limits: [
    { value: 70, side: "lower", severity: "warning" },
    { value: 55, side: "lower", severity: "alarm" },
  ],
};

const HISTORY = [78, 81, 79, 84, 83, 86, 82, 88, 91, 87, 84, 82];

export default function HistoryAndTarget() {
  return (
    <>
      <Grid minItemWidth="200px" gap={4}>
        <Stat label="Utilisation of line 1" value={82} unit="%" limits={UTILISATION} history={HISTORY} />
        <Stat
          label="Utilisation of line 2"
          value={64}
          unit="%"
          limits={UTILISATION}
          history={[...HISTORY].reverse()}
        />
      </Grid>
      <Text size="xs" tone="muted" style={{ marginTop: "var(--u-space-3)" }}>
        Line 2 lies in the warning and still below the target - two different statements.
      </Text>
    </>
  );
}
