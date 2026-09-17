import { Alert, Stack } from "../../../src";

export const title = "Tones";

/* Five tones, and the difference is not only colour: `warning` and `danger`
   get the role `alert` and interrupt the screen reader at once. For a success
   message that would be rude; for an error it is right. */
export default function Tones() {
  return (
    <Stack gap={3}>
      <Alert tone="neutral" title="State of the data">
        This view shows the state as of 12 August. The next import runs tonight.
      </Alert>
      <Alert tone="accent" title="New: sharing views">
        A table's state now stands in the address bar and can be passed on as a link.
      </Alert>
      <Alert tone="success" title="Import finished">
        1,204 records were imported without an error.
      </Alert>
      <Alert tone="warning" title="Two fields still need attention">
        The cost centre is missing, and the period lies in the past.
      </Alert>
      <Alert tone="danger" title="Import failed">
        The far end did not answer within 30 seconds. Nothing was changed.
      </Alert>
    </Stack>
  );
}
