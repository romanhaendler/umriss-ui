import { FormField, Grid, Input } from "../../../src";

export const title = "States";

/* Not the fair-weather example: empty, filled, invalid, disabled, both sizes. A
   field looks different in four out of five cases from how it looks in the
   first, and whether a form is usable hangs on exactly that. */
export default function States() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Name" required>
        <Input placeholder="First and last name" autoComplete="name" />
      </FormField>
      <FormField label="Comment" hint="Compact size (sm).">
        <Input size="sm" placeholder="Optional" />
      </FormField>
      <FormField label="Short code" error="That short code is already taken.">
        <Input defaultValue="MW" />
      </FormField>
      <FormField label="Reference" hint="Deactivated.">
        <Input disabled value="R-1893" readOnly />
      </FormField>
    </Grid>
  );
}
