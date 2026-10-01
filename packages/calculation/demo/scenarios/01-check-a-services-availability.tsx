import { useState } from "react";
import { Badge, Card, CardBody, CardHeader, FormField, Grid, Select, Stack, Stat, Text } from "@umriss-ui/core";
import { Calculation, Difference, Given, Product, Quotient, Ref } from "../../src";

/* Data from the operations world, written out here so the example runs on its own. */

const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();
const MINUTE = 60_000;

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(17, 10, 30);

interface Service {
  id: string;
  name: string;
  team: string;
  /** 1 is customer-facing and pages at night; 3 waits for the morning. */
  tier: 1 | 2 | 3;
  /** The latency objective: the 95th percentile stays below this, in ms. */
  latencySlo: number;
  /** The availability promised for a month, in per cent. */
  availabilityTarget: number;
}

const SERVICES: readonly Service[] = [
  { id: "checkout", name: "Checkout", team: "Payments", tier: 1, latencySlo: 300, availabilityTarget: 99.95 },
  { id: "billing", name: "Billing", team: "Payments", tier: 1, latencySlo: 400, availabilityTarget: 99.9 },
  { id: "sign-in", name: "Sign-in", team: "Identity", tier: 1, latencySlo: 200, availabilityTarget: 99.95 },
  { id: "search", name: "Search", team: "Discovery", tier: 1, latencySlo: 250, availabilityTarget: 99.9 },
  { id: "images", name: "Image service", team: "Discovery", tier: 2, latencySlo: 500, availabilityTarget: 99.5 },
  { id: "notifications", name: "Notifications", team: "Messaging", tier: 2, latencySlo: 800, availabilityTarget: 99.5 },
  { id: "webhooks", name: "Webhooks", team: "Integrations", tier: 2, latencySlo: 1000, availabilityTarget: 99.5 },
  { id: "reports", name: "Reporting", team: "Insights", tier: 3, latencySlo: 2000, availabilityTarget: 99 },
];

interface Incident {
  id: string;
  title: string;
  service: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  opened: number;
  acknowledged?: number;
  resolved?: number;
  /** An engineer's id. */
  assignee: string;
}

const INCIDENTS: readonly Incident[] = [
  { id: "INC-1048", title: "Checkout slow, card payments time out", service: "checkout", severity: "SEV1", opened: at(17, 9, 42), acknowledged: at(17, 9, 46), assignee: "jonas" },
  { id: "INC-1047", title: "Webhook deliveries delayed", service: "webhooks", severity: "SEV3", opened: at(17, 7, 15), acknowledged: at(17, 8, 2), assignee: "ines" },
  { id: "INC-1046", title: "Thumbnails missing for new uploads", service: "images", severity: "SEV2", opened: at(16, 22, 5), acknowledged: at(16, 22, 11), resolved: at(17, 0, 40), assignee: "tomasz" },
  { id: "INC-1045", title: "Sign-in codes arrive late", service: "sign-in", severity: "SEV2", opened: at(16, 14, 20), acknowledged: at(16, 14, 24), resolved: at(16, 15, 5), assignee: "ada" },
  { id: "INC-1044", title: "Monthly report export fails", service: "reports", severity: "SEV3", opened: at(15, 10, 0), acknowledged: at(16, 9, 12), resolved: at(16, 11, 30), assignee: "felix" },
  { id: "INC-1043", title: "Search returns no results for some regions", service: "search", severity: "SEV1", opened: at(14, 18, 30), acknowledged: at(14, 18, 33), resolved: at(14, 19, 55), assignee: "leila" },
  { id: "INC-1042", title: "Duplicate reminder e-mails", service: "notifications", severity: "SEV3", opened: at(13, 8, 45), acknowledged: at(13, 9, 30), resolved: at(13, 13, 0), assignee: "sam" },
  { id: "INC-1041", title: "Invoices generated twice", service: "billing", severity: "SEV2", opened: at(12, 16, 10), acknowledged: at(12, 16, 18), resolved: at(12, 18, 40), assignee: "priya" },
];

/** The month so far: 1 March 00:00 to now, in minutes. */
const MONTH_MINUTES = (NOW - at(1, 0)) / MINUTE;

/** Minutes each service was down this month. With `MONTH_MINUTES` and the
    service's target, what an availability is worked out from. */
const DOWNTIME_MINUTES: Readonly<Record<string, number>> = {
  checkout: 34,
  billing: 18,
  "sign-in": 41,
  search: 85,
  images: 120,
  notifications: 12,
  webhooks: 210,
  reports: 95,
};

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
