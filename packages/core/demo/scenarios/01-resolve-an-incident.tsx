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
  useToast,
} from "../../src";
import type { LimitSet } from "../../src";
import { Chart, LimitLine, Line, Tooltip, XAxis, YAxis } from "@umriss-ui/charts";
import { AlarmList, alarmModel, useTableSelection } from "@umriss-ui/table";
import { ALERTS, ALERT_TYPES, ENGINEERS, INCIDENTS, NOW, ONCALL, SERVICES, metrics } from "@umriss-ui/demo/worlds/operations";
import type { Alert, MetricPoint } from "@umriss-ui/demo/worlds/operations";

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

export default function IncidentConsole() {
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
