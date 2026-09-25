import { FormField, Grid, Input } from "../../../src";

export const title = "Sizes";
export const lead = "Use `size=\"sm\"` in dense forms and table rows, where the field stands beside small buttons.";

export default function Sizes() {
  return (
    <Grid minItemWidth="220px" gap={4}>
      <FormField label="Tour" hint="Medium, the default.">
        <Input defaultValue="T-01 North" />
      </FormField>
      <FormField label="Tour" hint="Small.">
        <Input size="sm" defaultValue="T-01 North" />
      </FormField>
    </Grid>
  );
}
