import { FormField, Grid, RadioGroup } from "../../../src";

export const title = "States";
export const lead = "With no `defaultValue` nothing is chosen yet; errors come from the `FormField`, and `disabled` on the group locks every option.";

const KINDS = [
  { value: "annual", label: "Annual leave" },
  { value: "sick", label: "Sick leave" },
  { value: "training", label: "Training, counted as working time but blocked for project work" },
];

export default function States() {
  return (
    <Grid minItemWidth="240px" gap={5}>
      <FormField label="Kind of absence" error="Choose the kind of absence.">
        <RadioGroup options={KINDS} />
      </FormField>
      <FormField label="Kind of absence" hint="Approved, no longer editable.">
        <RadioGroup options={KINDS} defaultValue="annual" disabled />
      </FormField>
      <FormField label="Kind of absence" hint="Small size.">
        <RadioGroup size="sm" options={KINDS} defaultValue="training" />
      </FormField>
    </Grid>
  );
}
