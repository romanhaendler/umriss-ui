import { Alert, Stack } from "../../../src";

export const title = "Tones";
export const lead = "Pick the `tone` by what the reader has to do; `warning` and `danger` also interrupt a screen reader at once.";

export default function Tones() {
  return (
    <Stack gap={3}>
      <Alert tone="neutral" title="Maintenance window tonight">
        Search is read-only from 23:00 to 23:30 while the index is rebuilt.
      </Alert>
      <Alert tone="accent" title="New: latency by region">
        Each service's page now splits its 95th percentile by region.
      </Alert>
      <Alert tone="success" title="Billing is back within its objective">
        The 95th percentile has stayed below 400 ms for the last hour.
      </Alert>
      <Alert tone="warning" title="Webhook deliveries are delayed">
        The oldest message in the queue is seven minutes old. Deliveries still go out.
      </Alert>
      <Alert tone="danger" title="Checkout is failing card payments">
        About 3 % of payments have timed out since 09:42. INC-1048 is open.
      </Alert>
    </Stack>
  );
}
