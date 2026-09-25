import { useState } from "react";
import { Badge, Button, Card, Grid, Sparkline, Splitter, Stack, Stat, Text } from "../../../src";
import { ALERTS, ALERT_TYPES, SERVICES, metrics } from "@umriss-ui/demo/worlds/operations";

export const title = "Three panes";
export const lead = "Nest a splitter in a pane for a list, its detail and the detail's alerts; name each separator after the pane it sizes.";

const TIER_ONE = SERVICES.filter((service) => service.tier === 1);

export default function ThreePanes() {
  const [chosen, setChosen] = useState("checkout");
  const service = TIER_ONE.find((s) => s.id === chosen) ?? TIER_ONE[0]!;
  const p95 = metrics(service.id).map((point) => point.p95);
  const alerts = ALERTS.filter(
    (alert) => alert.type.startsWith(`${service.id}-`) && alert.lifecycle.startsWith("active"),
  );

  return (
    <Card style={{ height: 340 }}>
      <Splitter defaultValue={26} min={20} max={45} separatorLabel="Services" style={{ height: "100%" }}>
        <Stack gap={1} style={{ padding: 12 }}>
          <Text size="xs" tone="muted" style={{ padding: "0 8px 4px" }}>
            Tier 1
          </Text>
          {TIER_ONE.map((s) => (
            <Button
              key={s.id}
              size="sm"
              variant={s.id === chosen ? "secondary" : "ghost"}
              aria-pressed={s.id === chosen}
              onClick={() => setChosen(s.id)}
            >
              {s.name}
            </Button>
          ))}
        </Stack>
        <Splitter orientation="vertical" defaultValue={62} min={30} max={75} separatorLabel={`${service.name} latency`} style={{ height: "100%" }}>
          <Grid minItemWidth="180px" gap={4} style={{ padding: 16 }}>
            <Stat
              label={`${service.name} · p95`}
              value={p95[p95.length - 1]}
              unit="ms"
              limits={{ limits: [{ value: service.latencySlo, side: "upper", severity: "warning" }] }}
            />
            <Stack gap={2}>
              <Text size="xs" tone="muted">
                Today
              </Text>
              <Sparkline data={p95} width={180} height={48} />
            </Stack>
          </Grid>
          <Stack gap={2} style={{ padding: 16 }}>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <Stack key={alert.id} direction="row" gap={2} align="center">
                  <Badge tone="warning">Active</Badge>
                  <Text size="sm">{ALERT_TYPES.find((type) => type.id === alert.type)?.label}</Text>
                </Stack>
              ))
            ) : (
              <Text size="sm" tone="muted">
                No active alerts for {service.name}.
              </Text>
            )}
          </Stack>
        </Splitter>
      </Splitter>
    </Card>
  );
}
