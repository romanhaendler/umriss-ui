import { FileInput, FormField, Grid } from "../../../src";

export const title = "States";
export const lead = "An `error` on the `FormField` colours the zone and is read as its description; `disabled` takes neither dialog nor drop.";

export default function States() {
  return (
    <Grid minItemWidth="280px" gap={6}>
      <FormField label="Postmortem" error="Attach the postmortem before closing INC-1048.">
        <FileInput accept=".pdf,.md" />
      </FormField>
      <FormField label="Runbook" hint="Locked while the incident is open.">
        <FileInput accept=".pdf,.md" disabled />
      </FormField>
    </Grid>
  );
}
