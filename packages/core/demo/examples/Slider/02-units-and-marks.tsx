import { FormField, Grid, Slider } from "../../../src";

export const title = "Units and marks";
export const lead = "`format` writes the value for the readout and the screen reader; `marks` show reference values, with a word where one has a `label`.";

export default function UnitsAndMarks() {
  return (
    <Grid minItemWidth="260px" gap={6}>
      <FormField label="Alert above error rate">
        <Slider
          min={0}
          max={5}
          step={0.1}
          defaultValue={1.5}
          format={(v) => `${v.toFixed(1)} %`}
          marks={[0, { value: 1, label: "Objective" }, 5]}
        />
      </FormField>
      <FormField label="Log retention" hint="30 days, fixed by the data protection policy.">
        <Slider min={7} max={90} defaultValue={30} disabled showValue={false} marks={[7, 30, 90]} />
      </FormField>
    </Grid>
  );
}
