import { Alert, Badge, Button, Card, CardBody, CardHeader, Grid, Input, Stack, Stat } from "../../../src";
import type { LimitSet } from "../../../src";

export const title = "Print the page";
export const lead =
  "Nothing to set: under `@media print` the page prints as a reader wants it. Overlays, toasts and the skip link stay off the sheet, cards keep a hard edge instead of a shadow, a dark application prints in the light theme, and a verdict keeps its word beside its colour. Press the button and look at the preview.";

const P95: LimitSet = {
  limits: [
    { value: 240, side: "upper", severity: "warning" },
    { value: 300, side: "upper", severity: "alarm" },
  ],
};

export default function PrintThePage() {
  return (
    <Stack gap={4}>
      <Button variant="secondary" size="sm" onClick={() => window.print()} style={{ alignSelf: "flex-start" }}>
        Print this page
      </Button>
      <Card>
        <CardHeader eyebrow="Carrow & Lisle" title="Checkout, week 44" actions={<Badge tone="warning">Review</Badge>} />
        <CardBody>
          <Stack gap={3}>
            <Alert tone="warning" title="p95 latency over its limit">
              Two of the three samples are past 240 ms.
            </Alert>
            <Grid minItemWidth="180px" gap={3}>
              <Stat label="p95 at 08:00" value={187} unit="ms" decimals={0} limits={P95} />
              <Stat label="p95 at 09:35" value={262} unit="ms" decimals={0} limits={P95} />
              <Stat label="p95 at 09:50" value={498} unit="ms" decimals={0} limits={P95} />
            </Grid>
            <Input aria-label="Reviewer" defaultValue="R. Haendler" />
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
