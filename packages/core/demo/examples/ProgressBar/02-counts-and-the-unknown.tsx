import { Grid, ProgressBar, Stack, Text } from "../../../src";

export const title = "A count, and a task without an end in sight";

/* Where a count says it better than a share, `valueText` is what a screen
   reader hears - "3 of 12 pallets" - and the visible text beside the bar says
   the same. Without a `value` the bar is indeterminate: the task runs, and
   nobody knows how far it is. It has no figure, so it shows none.

   And the difference to the `Meter`: a meter reads a measured value against
   limits and takes its colour from that verdict. A progress bar only counts
   towards an end - a batch at 90 per cent is not a warning - so it has no
   tone. */
export default function CountsAndTheUnknown() {
  return (
    <Grid minItemWidth="240px" gap={5}>
      <Stack gap={2}>
        <Text size="sm">3 of 12 pallets wrapped</Text>
        <ProgressBar value={3 / 12} label="Wrapping of order 4711" valueText="3 of 12 pallets" />
      </Stack>
      <Stack gap={2}>
        <Text size="sm">Connecting to the controller …</Text>
        <ProgressBar label="Connecting to the controller" />
      </Stack>
    </Grid>
  );
}
