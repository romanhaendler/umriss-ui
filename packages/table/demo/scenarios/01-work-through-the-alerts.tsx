import { useState } from "react";
import { Badge, Button, Grid, Stack, Stat, Text, useFormats } from "@umriss-ui/core";
import { useTable } from "../../src";

/* Data from the operations world, written out here so the example runs on its own. */
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(17, 10, 30);

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

type Priority = "high" | "medium" | "low";

interface Alert {
  id: string;
  raised: number;
  priority: Priority;
  message: string;
  state: "Active" | "Resolved";
  acknowledgedAt?: number;
}

const TONE = { high: "danger", medium: "warning", low: "neutral" } as const;
const RANK = { high: 0, medium: 1, low: 2 } as const;

/** Worst first: by priority, then what nobody has acknowledged, then the newest. */
const WORST_FIRST = [
  { column: "priority", direction: "asc" },
  { column: "acknowledged", direction: "asc" },
  { column: "raised", direction: "desc" },
] as const;

/** The alerts as they stand at 10:30. */
const ALERTS: readonly Alert[] = [
  { id: "a-1", raised: at(17, 9, 41), priority: "high", message: "Checkout · p95 latency above 300 ms", state: "Active", acknowledgedAt: at(17, 9, 46) },
  { id: "a-2", raised: at(17, 9, 43), priority: "high", message: "Checkout · error rate above 2\u00a0%", state: "Resolved" },
  { id: "a-3", raised: at(17, 7, 12), priority: "medium", message: "Webhooks · queue older than 5 min", state: "Active", acknowledgedAt: at(17, 8, 2) },
  { id: "a-4", raised: at(17, 10, 24), priority: "medium", message: "Search · p95 latency above 250 ms", state: "Active" },
  { id: "a-5", raised: at(17, 8, 5), priority: "medium", message: "Search · p95 latency above 250 ms", state: "Resolved", acknowledgedAt: at(17, 8, 6) },
];

export const title = "Work through the alerts";

export const lead =
  "The on-call engineer at Quillmere opens the alert list, takes the worst first and acknowledges what they have seen.";

export const callouts = [
  "Who carries the pager right now, and how many alerts still wait for someone to see them.",
  "The alerts stand worst first: by priority, then what nobody has acknowledged, then the newest. A resolved alert nobody acknowledged stays until someone does.",
  "Tick rows and acknowledge them in one go.",
];

export const builtFrom = [
  "first-table",
  { name: "Stat", page: "@umriss-ui/core#stat" },
  { name: "Badge", page: "@umriss-ui/core#badge" },
  { name: "Button", page: "@umriss-ui/core#button" },
];

const onCall = (rotation: "primary" | "secondary") => {
  const turn = ONCALL.find((one) => one.rotation === rotation && one.from <= NOW && NOW < one.to);
  return ENGINEERS.find((e) => e.id === turn?.engineer)?.name ?? "nobody";
};

export default function WorkThroughTheAlerts() {
  const formats = useFormats();
  const [alerts, setAlerts] = useState<readonly Alert[]>(ALERTS);
  const t = useTable(alerts, { rowKey: (a) => a.id, defaultSort: WORST_FIRST });
  const { Table, Column } = t;
  const waiting = alerts.filter((a) => a.acknowledgedAt === undefined).length;
  const time = (instant: number) => formats.time(new Date(instant), false);

  return (
    <Stack gap={4}>
      <div data-callout="1">
        <Grid minItemWidth="180px" gap={3}>
          <Stat label="Unacknowledged" value={waiting} />
          <Stat label="Open incidents" value={INCIDENTS.filter((i) => i.resolved === undefined).length} />
          <Stack gap={1}>
            <Text size="xs" tone="muted">
              On call
            </Text>
            <Text size="sm">{onCall("primary")}, primary</Text>
            <Text size="sm" tone="secondary">
              {onCall("secondary")}, secondary
            </Text>
          </Stack>
        </Grid>
      </div>

      <div data-callout="2">
        <Table selectable ariaLabel="Alerts">
          <Column value="raised" label="Raised">
            {(raised) => time(raised)}
          </Column>
          <Column value="priority" label="Priority" sortValue={(priority) => RANK[priority]}>
            {(priority) => <Badge tone={TONE[priority]}>{priority}</Badge>}
          </Column>
          <Column value="message" label="Alert" rowHeader />
          <Column value="state" label="State" />
          <Column id="acknowledged" label="Acknowledged" value={(a) => a.acknowledgedAt ?? 0}>
            {(_, a) => (a.acknowledgedAt === undefined ? "No" : time(a.acknowledgedAt))}
          </Column>
        </Table>
      </div>

      <span data-callout="3">
        <Button
          size="sm"
          disabled={t.selection.selected.size === 0}
          onClick={() => {
            setAlerts((current) =>
              current.map((a) => (t.selection.selected.has(a.id) ? { ...a, acknowledgedAt: a.acknowledgedAt ?? NOW } : a)),
            );
            t.selection.clear();
          }}
        >
          Acknowledge
        </Button>
      </span>
    </Stack>
  );
}
