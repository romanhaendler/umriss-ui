import { FormField, Grid, Stack, Switch, Text } from "../../../src";

export const title = "States and sizes";
export const lead = "Both sizes, off and on, each also `disabled`; an `error` on the surrounding `FormField` marks the switch invalid.";

export default function StatesAndSizes() {
  return (
    <Grid minItemWidth="220px" gap={5}>
      <Stack gap={3}>
        <Text size="xs" tone="muted">
          Medium
        </Text>
        <Switch label="Status page" />
        <Switch label="Error budget alerts" defaultChecked />
        <Switch label="Public API" disabled />
        <Switch label="Audit log" disabled defaultChecked />
      </Stack>
      <Stack gap={3}>
        <Text size="xs" tone="muted">
          Small
        </Text>
        <Switch size="sm" label="Status page" />
        <Switch size="sm" label="Error budget alerts" defaultChecked />
        <Switch size="sm" label="Public API" disabled />
        <Switch size="sm" label="Audit log" disabled defaultChecked />
      </Stack>
      <Stack gap={3}>
        <Text size="xs" tone="muted">
          Invalid, and a long label
        </Text>
        <FormField label="Paging" error="A tier 1 service has to page its on-call engineer.">
          <Switch label="Page on-call" />
        </FormField>
        <Switch label="Post every deployment of this service to the team channel, including the automatic rollbacks" defaultChecked />
      </Stack>
    </Grid>
  );
}
