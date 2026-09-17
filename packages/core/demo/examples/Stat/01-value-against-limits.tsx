import { Grid, Stat } from "../../../src";
import type { LimitSet } from "../../../src";

export const title = "A value, read against its limits";

/* The display gets no tone but a RULE. It colours itself out of the verdict,
   and it says the verdict as a word too - colour alone carries no meaning.

   A limit is a number, a side and a severity. Two limits of opposite sides and
   equal severity enclose a tolerance band; the band is derived and never an
   input, so that the one-sided rule - the normal case - needs no `null` at the
   other edge.

   The field names inside a `LimitSet` stay as they are: the limit model is a
   wire format that @umriss-ui/core and @umriss-ui/charts agree on, and it moves
   in both packages at once or not at all. */

const FURNACE: LimitSet = {
  target: 800,
  limits: [
    { value: 760, side: "lower", severity: "warning" },
    { value: 820, side: "upper", severity: "warning" },
    { value: 860, side: "upper", severity: "alarm" },
  ],
};

export default function ValueAgainstLimits() {
  return (
    <Grid minItemWidth="200px" gap={4}>
      <Stat label="Furnace 1" value={798} unit="°C" limits={FURNACE} />
      <Stat label="Furnace 2" value={834} unit="°C" limits={FURNACE} />
      <Stat label="Furnace 3" value={871} unit="°C" limits={FURNACE} />
      <Stat label="Units this shift" value={1284} decimals={0} />
    </Grid>
  );
}
