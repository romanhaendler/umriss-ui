import { Grid, Stat } from "../../../src";
import type { LimitSet } from "../../../src";

export const title = "Show a value nobody has";
export const lead = "A `null`, missing or non-finite value is judged unknown and says so – never a zero, never “in order”.";

const ERROR_RATE: LimitSet = {
  limits: [
    { value: 1, side: "upper", severity: "warning" },
    { value: 2, side: "upper", severity: "alarm" },
  ],
};

export default function Unknown() {
  return (
    <Grid minItemWidth="200px" gap={4}>
      <Stat label="Error rate · Sign-in · no data" value={null} unit="%" limits={ERROR_RATE} />
      <Stat label="Error rate · Search · not reported" value={undefined} unit="%" limits={ERROR_RATE} />
      <Stat label="Error rate · Reporting · no requests" value={0 / 0} unit="%" limits={ERROR_RATE} />
    </Grid>
  );
}
