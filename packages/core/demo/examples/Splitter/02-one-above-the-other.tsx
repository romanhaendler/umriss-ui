import { Badge, Card, Sparkline, Splitter, Stack, Text } from "../../../src";
import { metrics } from "@umriss-ui/demo/worlds/operations";

export const title = "One above the other";
export const lead = "Set `orientation` to `vertical` for a chart above its events; `min` and `max` keep either pane from vanishing under a drag.";

const P95 = metrics("checkout").map((point) => point.p95);

export default function OneAboveTheOther() {
  return (
    <Card style={{ height: 280, maxWidth: 560 }}>
      <Splitter orientation="vertical" defaultValue={60} min={20} max={75} separatorLabel="Latency" style={{ height: "100%" }}>
        <Stack gap={2} style={{ padding: 16, height: "100%" }}>
          <Text size="xs" tone="muted">
            Checkout · p95 latency today, ms
          </Text>
          <Sparkline data={P95} width={500} height={72} />
        </Stack>
        <Stack gap={2} style={{ padding: 16 }}>
          <Stack direction="row" gap={2} align="center">
            <Badge tone="danger">High</Badge>
            <Text size="sm">p95 latency above 300 ms since 09:41</Text>
          </Stack>
          <Stack direction="row" gap={2} align="center">
            <Badge>Resolved</Badge>
            <Text size="sm">Error rate above 2 %, 09:43 to 10:11</Text>
          </Stack>
        </Stack>
      </Splitter>
    </Card>
  );
}
