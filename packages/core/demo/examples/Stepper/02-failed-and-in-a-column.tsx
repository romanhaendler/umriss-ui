import { Grid, Stepper } from "../../../src";

export const title = "A failed step, and steps in a column";

/* `failed` marks a step that went wrong - a cross instead of its number, the
   danger colour, and "failed" for a screen reader. It stays failed when the
   procedure has moved past it: a step that failed is not done.

   `orientation="vertical"` stands the steps in a column, where a description
   beneath each label has room - the phases of a recipe with their times. */

const PHASES = [
  { label: "Heat up", description: "To 72 °C, 12 minutes" },
  { label: "Hold", description: "72 °C for 15 seconds" },
  { label: "Cool down", description: "To 4 °C, 20 minutes" },
  { label: "Fill", description: "Into tank T3" },
];

export default function FailedAndInAColumn() {
  return (
    <Grid minItemWidth="260px" gap={6}>
      <Stepper aria-label="Pasteurisation" orientation="vertical" steps={PHASES} current={2} />
      <Stepper
        aria-label="Pasteurisation, batch 0412"
        orientation="vertical"
        steps={[PHASES[0]!, { ...PHASES[1]!, description: "Held at 69 °C - too low", failed: true }, PHASES[2]!, PHASES[3]!]}
        current={2}
      />
    </Grid>
  );
}
