import { FormField, Grid, Stack, Switch, Text } from "../../../src";

export const title = "States and sizes";

/* Every state a switch can be in, side by side: off, on, disabled in both
   positions, the small size of a dense form or a table row - and invalid,
   which a `FormField` with an error sets by itself, so the word stands beside
   the red edge. Disabled dims the whole control, track and label, and reacts
   to nothing. */
export default function States() {
  return (
    <Grid minItemWidth="220px" gap={5}>
      <Stack gap={3}>
        <Text size="xs" tone="muted">
          Medium
        </Text>
        <Switch label="Off" />
        <Switch label="On" defaultChecked />
        <Switch label="Disabled, off" disabled />
        <Switch label="Disabled, on" disabled defaultChecked />
      </Stack>
      <Stack gap={3}>
        <Text size="xs" tone="muted">
          Small
        </Text>
        <Switch size="sm" label="Off" />
        <Switch size="sm" label="On" defaultChecked />
        <Switch size="sm" label="Disabled, off" disabled />
        <Switch size="sm" label="Disabled, on" disabled defaultChecked />
      </Stack>
      <Stack gap={3}>
        <Text size="xs" tone="muted">
          In a form field
        </Text>
        <FormField label="Remote access" error="Remote access is needed for the service contract.">
          <Switch label="Allow" />
        </FormField>
      </Stack>
    </Grid>
  );
}
