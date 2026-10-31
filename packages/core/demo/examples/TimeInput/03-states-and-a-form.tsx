import { Button, FormField, Grid, Stack, TimeInput } from "../../../src";

export const title = "States and a form";
export const lead = "Disabled and with an error; with a `name` it posts `HH:mm`, and a reset puts the start time back.";

export default function StatesAndAForm() {
  return (
    <Stack gap={5}>
      <Grid minItemWidth="220px" gap={6}>
        <FormField label="Handover" hint="Fixed by the roster.">
          <TimeInput defaultValue="14:00" disabled />
        </FormField>
        <FormField label="Last call" error="Must be after the shift starts.">
          <TimeInput defaultValue="05:30" />
        </FormField>
      </Grid>
      <form>
        <Stack direction="row" gap={3} align="end">
          <FormField label="Start">
            <TimeInput name="start" defaultValue="08:15" />
          </FormField>
          <Button type="reset" variant="ghost">Reset</Button>
        </Stack>
      </form>
    </Stack>
  );
}
