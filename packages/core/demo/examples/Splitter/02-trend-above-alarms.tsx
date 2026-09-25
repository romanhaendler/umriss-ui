import { Badge, Card, Sparkline, Splitter, Stack, Text } from "../../../src";

export const title = "A trend above, its alarms below";

/* `orientation="vertical"` stacks the panes, and the arrows up and down move
   the line. `min` and `max` keep either pane from vanishing under a drag -
   the trend never falls below a fifth of the room, the alarms never below a
   quarter. `separatorLabel` names the line after the pane it sizes, as the
   APG asks: a screen reader says "Trend, 60". */

const COURSE = [182, 184, 183, 187, 190, 189, 193, 197, 196, 201, 204, 203, 206, 205, 208];

export default function TrendAboveAlarms() {
  return (
    <Card style={{ height: 280, maxWidth: 560 }}>
      <Splitter orientation="vertical" defaultValue={60} min={20} max={75} separatorLabel="Trend" style={{ height: "100%" }}>
        <Stack gap={2} style={{ padding: 16, height: "100%" }}>
          <Text size="xs" tone="muted">
            Kiln 2 · zone temperature, °C
          </Text>
          <Sparkline data={COURSE} width={500} height={72} />
        </Stack>
        <Stack gap={2} style={{ padding: 16 }}>
          <Stack direction="row" gap={2} align="center">
            <Badge tone="warning">High</Badge>
            <Text size="sm">TIC-204 above 205 °C</Text>
          </Stack>
          <Stack direction="row" gap={2} align="center">
            <Badge>Info</Badge>
            <Text size="sm">Burner 3 switched to low fire</Text>
          </Stack>
        </Stack>
      </Splitter>
    </Card>
  );
}
