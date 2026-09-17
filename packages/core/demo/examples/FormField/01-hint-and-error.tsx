import { FormField, Grid, Input } from "../../../src";

export const title = "Hint, error and required";

/* `FormField` does the wiring a screen reader needs: the label points at the
   field, the hint hangs off it as a description, and an `error` marks the field
   as invalid at the same time - the caller need not set `invalid` in addition
   and cannot forget it either.

   The error REPLACES the hint. Both at once would be two sentences under one
   field, one of which is no longer true. */
export default function HintAndError() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Cost centre" hint="Four digits, as in the chart of accounts.">
        <Input placeholder="4711" />
      </FormField>
      <FormField
        label="Cost centre"
        hint="Four digits, as in the chart of accounts."
        error="4711 does not exist in the chart of accounts."
      >
        <Input defaultValue="4711" />
      </FormField>
      <FormField label="Project name" required>
        <Input placeholder="e.g. Juno" />
      </FormField>
    </Grid>
  );
}
