import { useState } from "react";
import { Badge, Button, Drawer, Grid, Meter, ModalBody, ModalFooter, ModalHeader, Stack, Stat, Switch, Text } from "../../../src";
import type { LimitSet } from "../../../src";
import { DOWNTIME_MINUTES, MONTH_MINUTES, SERVICES, metrics } from "@umriss-ui/demo/worlds/operations";
import type { Service } from "@umriss-ui/demo/worlds/operations";

export const title = "Open a service's detail from its list";
export const lead = "The list stays in sight behind the backdrop; which service is open is your state, and the drawer only shows it.";

/** The latency objective as a rule: warn at 80 %, alarm at the objective itself. */
function latencyLimits(service: Service): LimitSet {
  return {
    limits: [
      { value: service.latencySlo * 0.8, side: "upper", severity: "warning" },
      { value: service.latencySlo, side: "upper", severity: "alarm" },
    ],
  };
}

/** How much of the month's allowed downtime is used up. */
function budgetUsed(service: Service): number {
  const allowed = MONTH_MINUTES * (1 - service.availabilityTarget / 100);
  return (DOWNTIME_MINUTES[service.id] ?? 0) / allowed;
}

export default function BesideAServiceList() {
  const [openId, setOpenId] = useState<string | null>(null);
  const service = SERVICES.find((one) => one.id === openId);
  const points = service ? metrics(service.id).slice(-24) : [];
  const used = service ? budgetUsed(service) : 0;

  return (
    <>
      <Grid minItemWidth="150px" gap={3}>
        {SERVICES.map((one) => (
          <Button key={one.id} onClick={() => setOpenId(one.id)}>
            {one.name}
          </Button>
        ))}
      </Grid>
      <Drawer open={service !== undefined} onClose={() => setOpenId(null)}>
        {service && (
          <>
            <ModalHeader title={service.name} description={`${service.team} · tier ${service.tier}`} />
            <ModalBody>
              <Stack gap={5}>
                <Stat
                  label="p95 latency, last two hours"
                  value={points.at(-1)?.p95}
                  unit="ms"
                  decimals={0}
                  limits={latencyLimits(service)}
                  history={points.map((point) => point.p95)}
                />
                <Stack gap={1}>
                  <Text size="xs" tone="muted">
                    Downtime budget used this month
                  </Text>
                  <Meter
                    value={used}
                    tone={used >= 1 ? "danger" : used >= 0.75 ? "warning" : "neutral"}
                    showLabel
                    label={`Downtime budget of ${service.name}`}
                  />
                  <Text size="xs" tone="muted">
                    {DOWNTIME_MINUTES[service.id]} min down, target {service.availabilityTarget} %
                  </Text>
                </Stack>
                <Stack gap={1} align="flex-start">
                  <Text size="xs" tone="muted">
                    Alerts
                  </Text>
                  <Badge tone={service.tier === 1 ? "accent" : "neutral"}>{service.tier === 1 ? "Pages at night" : "Waits for the morning"}</Badge>
                </Stack>
                <Switch label="Page the on-call engineer" defaultChecked={service.tier === 1} />
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setOpenId(null)}>Close</Button>
              <Button variant="primary" onClick={() => setOpenId(null)}>
                Open the runbook
              </Button>
            </ModalFooter>
          </>
        )}
      </Drawer>
    </>
  );
}
