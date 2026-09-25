import { useState } from "react";
import { Badge, Card, CardBody, CardHeader, FormField, Grid, Select, Stack, Stat, Text } from "@umriss-ui/core";
import { Calculation, Difference, Given, Product, Quotient, Ref } from "../../src";
import { DOWNTIME_MINUTES, INCIDENTS, MONTH_MINUTES, SERVICES } from "@umriss-ui/demo/worlds/operations";

export const title = "Check a service's availability for the month";

export const lead =
  "A team lead at Quillmere checks, before the monthly review, whether a service keeps its availability promise and how much error budget is left.";

export const callouts = [
  "The service is chosen here; every figure on the screen follows the choice.",
  "The tiles give the answer at a glance, read against the service's target.",
  "The calculation shows where the availability comes from: the month so far, minus the downtime, divided by the month. The verdict beside it is the same one the tile shows.",
  "The error budget is the downtime the target allows; what is left can turn negative, and then it is marked.",
  "The incidents of the week that touched the service stand beside the figures, so the downtime has names.",
];

export const builtFrom = [
  "calculation",
  "tree",
  "given",
  { name: "Select", page: "@umriss-ui/core#select" },
  { name: "Stat", page: "@umriss-ui/core#stat" },
  { name: "Card", page: "@umriss-ui/core#card" },
  { name: "Badge", page: "@umriss-ui/core#badge" },
];

const SEVERITY_TONE = { SEV1: "danger", SEV2: "warning", SEV3: "neutral" } as const;

export default function ServiceAvailability() {
  const [serviceId, setServiceId] = useState("checkout");
  const service = SERVICES.find((one) => one.id === serviceId) ?? SERVICES[0]!;
  const downtime = DOWNTIME_MINUTES[service.id] ?? 0;
  /* Targets are stated in per cent; the calculation works in ratios. */
  const target = service.availabilityTarget / 100;
  const availability = (MONTH_MINUTES - downtime) / MONTH_MINUTES;
  const allowed = MONTH_MINUTES * (1 - target);
  const incidents = INCIDENTS.filter((one) => one.service === service.id);

  return (
    <Stack gap={4}>
      <Stack direction="row" gap={4} align="end" wrap>
        <FormField label="Service" data-callout="1">
          <Select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
            {SERVICES.map((one) => (
              <option key={one.id} value={one.id}>
                {one.name}
              </option>
            ))}
          </Select>
        </FormField>
        <Text size="sm" tone="muted">
          {service.team} · tier {service.tier} · promised {service.availabilityTarget} % · 1 March to now
        </Text>
      </Stack>

      <Grid minItemWidth="200px" gap={4} data-callout="2">
        <Stat
          label="Availability this month"
          value={availability * 100}
          unit="%"
          decimals={3}
          limits={{ target: service.availabilityTarget, limits: [{ value: service.availabilityTarget, side: "lower", severity: "alarm" }] }}
        />
        <Stat label="Downtime" value={downtime} unit="min" />
        <Stat
          label="Error budget left"
          value={allowed - downtime}
          unit="min"
          decimals={1}
          limits={{ limits: [{ value: 0, side: "lower", severity: "alarm" }] }}
        />
      </Grid>

      <Grid minItemWidth="320px" gap={4}>
        <Card>
          <CardHeader title="How the availability comes about" />
          <CardBody data-callout="3">
            <Calculation aria-label={`Availability of ${service.name}, this month`}>
              <Quotient
                label="Availability"
                format="percent"
                decimals={3}
                target={target}
                limits={[{ value: target, side: "lower", severity: "alarm" }]}
              >
                <Difference label="Minutes up" unit="min">
                  <Given id="month" label="Minutes this month" value={MONTH_MINUTES} unit="min" source="1 March 00:00 to now" />
                  <Given label="Downtime" value={downtime} unit="min" source="Status page" />
                </Difference>
                <Ref to="month" />
              </Quotient>
            </Calculation>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Error budget" />
          <CardBody data-callout="4">
            <Calculation aria-label={`Error budget of ${service.name}, this month`}>
              <Difference label="Error budget left" unit="min" decimals={1} limits={[{ value: 0, side: "lower", severity: "alarm" }]}>
                <Product label="Error budget" unit="min" decimals={1}>
                  <Given label="Minutes this month" value={MONTH_MINUTES} unit="min" />
                  <Given label="Allowed unavailability" value={1 - target} format="percent" decimals={2} source="Service level agreement" />
                </Product>
                <Given label="Downtime" value={downtime} unit="min" source="Status page" />
              </Difference>
            </Calculation>
          </CardBody>
        </Card>
      </Grid>

      <Card>
        <CardHeader title="Incidents this week" />
        <CardBody data-callout="5">
          {incidents.length === 0 ? (
            <Text tone="muted">No incident touched {service.name} this week.</Text>
          ) : (
            <Stack gap={2}>
              {incidents.map((one) => (
                <Stack key={one.id} direction="row" gap={3} align="center" wrap>
                  <Badge tone={SEVERITY_TONE[one.severity]}>{one.severity}</Badge>
                  <Text mono size="sm">
                    {one.id}
                  </Text>
                  <Text size="sm">{one.title}</Text>
                  <Text size="sm" tone="muted">
                    {one.resolved === undefined ? "still open" : "resolved"}
                  </Text>
                </Stack>
              ))}
            </Stack>
          )}
        </CardBody>
      </Card>
    </Stack>
  );
}
