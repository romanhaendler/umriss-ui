import { Grid, Meter, Stack, Text } from "../../../src";

export const title = "A fraction, and where its colour comes from";

/* `value` is a fraction from 0 to 1 and not a percentage - the conversion
   belongs in one place, not at every call site.

   The colour comes from an assessment and not from taste: the caller knows
   whether 90 per cent is good or bad, the component does not. And beside the
   bar stands the number, so that the colour is never the only information.

   `label` is mandatory as soon as it is not obvious: a role `meter` needs a
   name from the author - the percentage inside does not count for that, and
   neither does the column heading beside it. */
export default function Fraction() {
  return (
    <Stack gap={4}>
      <Grid minItemWidth="220px" gap={4}>
        <Stack gap={2}>
          <Text size="xs" tone="muted">
            Utilisation
          </Text>
          <Meter value={0.62} showLabel label="Utilisation of line 1" />
        </Stack>
        <Stack gap={2}>
          <Text size="xs" tone="muted">
            Close to the bound
          </Text>
          <Meter value={0.88} tone="warning" showLabel label="Utilisation of line 2" />
        </Stack>
        <Stack gap={2}>
          <Text size="xs" tone="muted">
            Above it
          </Text>
          <Meter value={0.97} tone="danger" showLabel label="Utilisation of line 3" />
        </Stack>
        <Stack gap={2}>
          <Text size="xs" tone="muted">
            Without the number beside it
          </Text>
          <Meter value={0.45} tone="accent" label="Progress of the import" />
        </Stack>
      </Grid>
      <Text size="xs" tone="muted">
        Values outside 0 to 1 are clamped - a bar running past its frame would be a statement about
        the layout and not about the value.
      </Text>
    </Stack>
  );
}
