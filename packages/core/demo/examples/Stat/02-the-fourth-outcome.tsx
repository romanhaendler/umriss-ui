import { Grid, Stat, Text } from "../../../src";
import type { LimitSet } from "../../../src";

export const title = "The fourth outcome: unknown";

/* Four outcomes, ordered: in order, unknown, warning, alarm. The third is the
   important one, and the one most libraries lose.

   A missing or non-finite value is NOT in order. It is unknown - and that is a
   reason to look, not a reason to relax. Without this outcome the silent sensor
   below would look like a zero, and so like a cold, quiet plant. */

const FURNACE: LimitSet = {
  target: 800,
  limits: [
    { value: 760, side: "lower", severity: "warning" },
    { value: 860, side: "upper", severity: "alarm" },
  ],
};

export default function TheFourthOutcome() {
  return (
    <>
      <Grid minItemWidth="200px" gap={4}>
        <Stat label="Furnace 4 · sensor silent" value={null} unit="°C" limits={FURNACE} />
        <Stat label="Furnace 5 · no value" value={undefined} unit="°C" limits={FURNACE} />
        <Stat label="Furnace 6 · not finite" value={Number.NaN} unit="°C" limits={FURNACE} />
      </Grid>
      <Text size="xs" tone="muted" style={{ marginTop: "var(--u-space-3)" }}>
        All three say the same word. A zero here would stand for a cold plant.
      </Text>
    </>
  );
}
