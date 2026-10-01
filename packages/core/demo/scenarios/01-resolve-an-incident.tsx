import { useMemo, useState } from "react";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  FormField,
  Grid,
  Heading,
  Menu,
  MenuItem,
  MenuSeparator,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Stack,
  Stat,
  Stepper,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  TagGroup,
  Text,
  Textarea,
  ToastProvider,
  useToast,
} from "../../src";
import type { LimitSet } from "../../src";
import { Chart, LimitLine, Line, Tooltip, XAxis, YAxis } from "@umriss-ui/charts";
import { AlarmList, alarmModel, useTableSelection } from "@umriss-ui/table";

/* Data from the operations world, written out here so the example runs on its own. */
/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

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

interface Engineer {
  id: string;
  name: string;
  team: string;
}

const ENGINEERS: readonly Engineer[] = [
  { id: "priya", name: "Priya Raman", team: "Payments" },
  { id: "jonas", name: "Jonas Keller", team: "Payments" },
  { id: "ada", name: "Ada Mwangi", team: "Identity" },
  { id: "tomasz", name: "Tomasz Nowak", team: "Discovery" },
  { id: "leila", name: "Leila Haddad", team: "Discovery" },
  { id: "sam", name: "Sam Okafor", team: "Messaging" },
  { id: "ines", name: "Ines Duarte", team: "Integrations" },
  { id: "felix", name: "Felix Brandt", team: "Insights" },
];

interface OnCall {
  id: string;
  engineer: string;
  rotation: "primary" | "secondary";
  from: number;
  to: number;
}

/** Monday 16 to Monday 23 March, handed over every morning at 09:00: the
    secondary of one day is the primary of the next. */
const ONCALL: readonly OnCall[] = Array.from({ length: 7 }, (_, day) => [
  { rotation: "primary" as const, engineer: ENGINEERS[day % ENGINEERS.length]!.id },
  { rotation: "secondary" as const, engineer: ENGINEERS[(day + 1) % ENGINEERS.length]!.id },
].map(({ rotation, engineer }) => ({
  id: `${rotation}-${16 + day}`,
  engineer,
  rotation,
  from: at(16 + day, 9),
  to: at(17 + day, 9),
}))).flat();

interface MetricPoint {
  t: number;
  /** Median and 95th percentile latency, in ms. */
  p50: number;
  p95: number;
  /** Failed requests, in per cent. */
  errorRate: number;
  /** Requests per minute. */
  requests: number;
}

/** Requests per minute at the busiest hour, by tier. */
const VOLUME = { 1: 900, 2: 400, 3: 120 } as const;

/** A service's latency and error rate every five minutes of today, from
    midnight up to now. Busy by day, quiet at night; Checkout's 95th percentile
    climbs well past its objective from 09:40 to 10:10, and its errors with it. */
function metrics(serviceId: string): MetricPoint[] {
  const index = SERVICES.findIndex((one) => one.id === serviceId);
  const service = SERVICES[index];
  if (service === undefined) throw new Error(`No service "${serviceId}".`);
  const r = random(1000 + index * 37);
  const points: MetricPoint[] = [];
  let drift = 0;
  for (let t = at(17, 0); t <= NOW; t += 5 * MINUTE) {
    const hour = (t - at(17, 0)) / (60 * MINUTE);
    const load = 0.35 + 0.65 * Math.max(0, Math.sin((Math.PI * (hour - 5)) / 16));
    drift = 0.8 * drift + (r() - 0.5) * 0.08;
    const base = service.latencySlo * (0.45 + 0.2 * load + drift);
    const surge = serviceId === "checkout" && t >= at(17, 9, 40) && t < at(17, 10, 10) ? 1.9 : 1;
    const p95 = Math.round(base * surge * (1 + r() * 0.08));
    points.push({
      t,
      p50: Math.round(p95 * (0.42 + r() * 0.06)),
      p95,
      errorRate: Math.round((0.05 + r() * 0.12 + (surge > 1 ? 2.4 + r() : 0)) * 100) / 100,
      requests: Math.round(VOLUME[service.tier] * load * (1 + (r() - 0.5) * 0.1)),
    });
  }
  return points;
}

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

/** A kind of alert, shaped as `@umriss-ui/table`'s alarm list reads it. */
interface AlertType {
  id: string;
  label: string;
  priority: "high" | "medium" | "low";
}

const ALERT_TYPES: readonly AlertType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "high" },
  { id: "checkout-errors", label: "Checkout · error rate above 2\u00a0%", priority: "high" },
  { id: "webhooks-queue", label: "Webhooks · queue older than 5 min", priority: "medium" },
  { id: "search-latency", label: "Search · p95 latency above 250 ms", priority: "medium" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
  { id: "reports-job", label: "Reporting · nightly job late", priority: "low" },
];

/** One alert, shaped as `@umriss-ui/table`'s alarm list reads it. */
type Alert = {
  id: string;
  type: string;
  lifecycle: "active-unacknowledged" | "active-acknowledged" | "resolved-unacknowledged" | "resolved-acknowledged";
  raised: number;
  resolved?: number;
  acknowledgedAt?: number;
} & (
  | { availability?: "in-service" | "suppressed" | "disabled"; snooze?: undefined }
  | { availability: "snoozed"; snooze: { until: number; by: string } }
);

/** The alerts as they stand at 10:30. */
const ALERTS: readonly Alert[] = [
  { id: "a-1", type: "checkout-latency", lifecycle: "active-acknowledged", raised: at(17, 9, 41), acknowledgedAt: at(17, 9, 46) },
  { id: "a-2", type: "checkout-errors", lifecycle: "resolved-unacknowledged", raised: at(17, 9, 43), resolved: at(17, 10, 11) },
  { id: "a-3", type: "webhooks-queue", lifecycle: "active-acknowledged", raised: at(17, 7, 12), acknowledgedAt: at(17, 8, 2) },
  { id: "a-4", type: "search-latency", lifecycle: "active-unacknowledged", raised: at(17, 10, 24) },
  { id: "a-5", type: "search-latency", lifecycle: "resolved-acknowledged", raised: at(17, 8, 5), resolved: at(17, 8, 9), acknowledgedAt: at(17, 8, 6) },
  { id: "a-6", type: "images-disk", lifecycle: "active-unacknowledged", raised: at(17, 6, 0), availability: "snoozed", snooze: { until: at(17, 14), by: "Tomasz Nowak" } },
  { id: "a-7", type: "reports-job", lifecycle: "active-unacknowledged", raised: at(17, 4, 30), availability: "disabled" },
];

export const title = "Resolve an incident";

export const lead =
  "The engineer on call at Quillmere works an open incident from this console: check the service has recovered, clear its alerts, and close it with a summary.";

export const callouts = [
  "The stepper says where the incident stands, each step as a word; resolving it moves the stepper on.",
  "The tiles read the latest five minutes against the service's objectives and say the verdict in a word, not only in colour.",
  "The trend shows the half hour above the latency objective, and that it has held below it since 10:10.",
  "The alerts that belong to the incident stand in the list; acknowledging one records who knew when.",
  "Resolving asks for a cause and a summary, and a toast confirms it without covering the console.",
];

export const builtFrom = [
  "breadcrumb",
  "badge",
  "tag",
  "stepper",
  "stat",
  "tabs",
  "menu",
  "modal",
  "formfield",
  "select",
  "textarea",
  "checkbox",
  "toast",
  { name: "Line", page: "@umriss-ui/charts#line" },
  { name: "AlarmList", page: "@umriss-ui/table#alarmlist" },
];

const INCIDENT = INCIDENTS.find((one) => one.id === "INC-1048")!;
const SERVICE = SERVICES.find((one) => one.id === INCIDENT.service)!;
const nameOf = (id: string) => ENGINEERS.find((one) => one.id === id)?.name ?? id;
const time = (t: number) => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/* Who is on call right now: the rota hands over at 09:00. */
const onCall = (rotation: "primary" | "secondary") =>
  nameOf(ONCALL.find((one) => one.rotation === rotation && one.from <= NOW && NOW < one.to)!.engineer);

const LATENCY: LimitSet = {
  limits: [
    { value: SERVICE.latencySlo * 0.85, side: "upper", severity: "warning" },
    { value: SERVICE.latencySlo, side: "upper", severity: "alarm" },
  ],
};
const ERRORS: LimitSet = {
  limits: [
    { value: 1, side: "upper", severity: "warning" },
    { value: 2, side: "upper", severity: "alarm" },
  ],
};

/* From 08:00: enough before the incident to see what normal looks like. */
const TODAY = metrics(SERVICE.id).filter((one) => one.t >= NOW - 150 * 60_000);
const LATEST = TODAY[TODAY.length - 1]!;

const STEPS = [
  { label: "Detected", description: time(INCIDENT.opened) },
  { label: "Acknowledged", description: `${time(INCIDENT.acknowledged!)} by ${nameOf(INCIDENT.assignee)}` },
  { label: "Mitigated", description: "Rolled back the payment client, 10:08" },
  { label: "Resolved" },
];

/* The alerts of the services this incident touches. */
const OWN = new Set(["checkout-latency", "checkout-errors"]);

function Content() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<readonly Alert[]>(() => ALERTS.filter((one) => OWN.has(one.type)));
  const [resolved, setResolved] = useState<number | null>(null);
  const [resolving, setResolving] = useState(false);
  const [cause, setCause] = useState("");
  const [summary, setSummary] = useState("");
  const [tried, setTried] = useState(false);

  const view = useMemo(() => alarmModel({ alarms: [...alerts], types: ALERT_TYPES, asOf: NOW }), [alerts]);
  const selection = useTableSelection(view.filtered.map((row) => row.id));

  const acknowledge = (ids: readonly string[]) => {
    setAlerts((before) =>
      before.map((one) =>
        ids.includes(one.id) && one.lifecycle.endsWith("-unacknowledged")
          ? { ...one, lifecycle: one.lifecycle.replace("-unacknowledged", "-acknowledged") as Alert["lifecycle"], acknowledgedAt: NOW }
          : one,
      ),
    );
    selection.clear();
  };

  const resolve = () => {
    setTried(true);
    if (cause === "" || summary.trim() === "") return;
    setResolved(NOW);
    setResolving(false);
    toast({ title: `${INCIDENT.id} resolved`, description: "The status page and the incident channel have been told.", tone: "success" });
  };

  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <Breadcrumb items={[{ label: "Incidents", href: "#/scenarios" }, { label: INCIDENT.id }]} />
        <Stack direction="row" gap={3} align="center" justify="space-between" wrap>
          <Stack direction="row" gap={2} align="center" wrap>
            <Badge tone="danger">{INCIDENT.severity}</Badge>
            <Heading level={2} size="lg">
              {INCIDENT.title}
            </Heading>
          </Stack>
          <Stack direction="row" gap={2}>
            <Menu
              align="end"
              trigger={
                <Button size="sm" variant="secondary">
                  More
                </Button>
              }
            >
              <MenuItem onSelect={() => toast({ title: `${onCall("secondary")} has been paged` })}>
                Page the secondary
              </MenuItem>
              <MenuItem onSelect={() => toast({ title: "Link to the incident copied" })}>Copy the link</MenuItem>
              <MenuSeparator />
              <MenuItem onSelect={() => toast({ title: "Raised to SEV1 already", tone: "warning" })}>
                Escalate
              </MenuItem>
            </Menu>
            <Button
              size="sm"
              variant="primary"
              data-callout="5"
              disabled={resolved !== null}
              onClick={() => setResolving(true)}
            >
              {resolved === null ? "Resolve" : "Resolved"}
            </Button>
          </Stack>
        </Stack>
        <TagGroup aria-label="Affected">
          <Tag>{SERVICE.name}</Tag>
          <Tag>Team {SERVICE.team}</Tag>
          <Tag>Tier {SERVICE.tier}</Tag>
        </TagGroup>
        <Text size="sm" tone="secondary">
          Assigned to {nameOf(INCIDENT.assignee)} · on call: {onCall("primary")}, secondary {onCall("secondary")}
        </Text>
      </Stack>

      <Stepper
        aria-label="Where the incident stands"
        data-callout="1"
        steps={STEPS.map((step, i) => (i === 3 && resolved !== null ? { ...step, description: time(resolved) } : step))}
        current={resolved === null ? 3 : 4}
      />

      <Grid minItemWidth="200px" gap={4} data-callout="2">
        <Stat
          label={`${SERVICE.name} · p95 latency`}
          value={LATEST.p95}
          unit="ms"
          decimals={0}
          limits={LATENCY}
          history={TODAY.map((one) => one.p95)}
        />
        <Stat
          label={`${SERVICE.name} · error rate`}
          value={LATEST.errorRate}
          unit="%"
          decimals={2}
          limits={ERRORS}
          history={TODAY.map((one) => one.errorRate)}
        />
        <Stat label="Requests" value={LATEST.requests} unit="/min" decimals={0} history={TODAY.map((one) => one.requests)} />
      </Grid>

      <Card data-callout="3">
        <CardHeader title="p95 latency since 08:00" />
        <CardBody>
          <Chart data={TODAY} height={200} ariaLabel={`${SERVICE.name}, p95 latency since 08:00`}>
            <XAxis accessor={(d: MetricPoint) => d.t} time />
            <YAxis accessor={(d: MetricPoint) => d.p95} domain={[0, 700]} label="ms" />
            <LimitLine value={SERVICE.latencySlo} severity="alarm" label="Objective" />
            <Line accessor={(d: MetricPoint) => d.p95} name="p95" format={(v) => `${Math.round(v)} ms`} />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>

      <Tabs defaultValue="alerts">
        <TabList aria-label="About the incident">
          <Tab value="alerts">Alerts</Tab>
          <Tab value="earlier">Earlier incidents</Tab>
        </TabList>
        <TabPanel value="alerts">
          <div data-callout="4">
            <AlarmList view={view} selection={selection} density="compact" onAcknowledge={acknowledge} />
          </div>
        </TabPanel>
        <TabPanel value="earlier">
          <Stack gap={2}>
            {INCIDENTS.filter((one) => one.resolved !== undefined).map((one) => (
              <Stack key={one.id} direction="row" gap={3} align="center">
                <Badge tone={one.severity === "SEV1" ? "danger" : one.severity === "SEV2" ? "warning" : "neutral"}>
                  {one.severity}
                </Badge>
                <Text size="sm" mono>
                  {one.id}
                </Text>
                <Text size="sm">{one.title}</Text>
              </Stack>
            ))}
          </Stack>
        </TabPanel>
      </Tabs>

      <Modal open={resolving} onClose={() => setResolving(false)}>
        <ModalHeader title={`Resolve ${INCIDENT.id}`} description="The summary goes to the status page and starts the review." />
        <ModalBody>
          <Stack gap={4}>
            <FormField label="Cause" required error={tried && cause === "" ? "Choose what caused it." : undefined}>
              <Select value={cause} onChange={(event) => setCause(event.target.value)}>
                <option value="" disabled>
                  Choose a cause
                </option>
                <option value="deploy">A deploy</option>
                <option value="dependency">A dependency</option>
                <option value="capacity">Capacity</option>
                <option value="config">A configuration change</option>
              </Select>
            </FormField>
            <FormField
              label="Summary"
              required
              error={tried && summary.trim() === "" ? "Say in a sentence what happened." : undefined}
            >
              <Textarea
                autoGrow
                maxRows={6}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="What happened, and what brought it back"
              />
            </FormField>
            <Checkbox label="Post to the status page" defaultChecked />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setResolving(false)}>Cancel</Button>
          <Button variant="primary" onClick={resolve}>
            Resolve
          </Button>
        </ModalFooter>
      </Modal>
    </Stack>
  );
}

/* `useToast` needs a `ToastProvider` above it; at the root of an application
   one provider serves every screen. */
export default function IncidentConsole() {
  return (
    <ToastProvider>
      <Content />
    </ToastProvider>
  );
}
