import { FormField, Grid, MultiSelect } from "../../../src";

export const title = "Empty, invalid, disabled";

/* Disabled means "do not change", not "gone": a value already chosen stays
   visible even when its row is disabled. */

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", disabled: true },
];

export default function States() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Empty">
        <MultiSelect value={[]} onChange={() => {}} options={OPTIONS} placeholder="Nothing chosen" />
      </FormField>
      <FormField label="Invalid" error="Choose at least one area.">
        <MultiSelect value={[]} onChange={() => {}} options={OPTIONS} placeholder="Choose areas" />
      </FormField>
      <FormField label="Disabled" hint="What is chosen stays visible.">
        <MultiSelect value={["a", "c"]} onChange={() => {}} options={OPTIONS} disabled />
      </FormField>
    </Grid>
  );
}
