import { useMemo, useState } from "react";
import { Button, Grid, Stack, Stat, Switch, Text } from "@umriss-ui/core";
import { AlarmList, acknowledge, alarmModel, isHidden, snooze, useTableSelection } from "../../src";
import type { Alarm, AlarmType } from "../../src";

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

const ALERT_TYPES: readonly AlarmType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "high" },
  { id: "checkout-errors", label: "Checkout · error rate above 2\u00a0%", priority: "high" },
  { id: "webhooks-queue", label: "Webhooks · queue older than 5 min", priority: "medium" },
  { id: "search-latency", label: "Search · p95 latency above 250 ms", priority: "medium" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
  { id: "reports-job", label: "Reporting · nightly job late", priority: "low" },
];

/** The alerts as they stand at 10:30. */
const ALERTS: readonly Alarm[] = [
  { id: "a-1", type: "checkout-latency", lifecycle: "active-acknowledged", raised: at(17, 9, 41), acknowledgedAt: at(17, 9, 46) },
  { id: "a-2", type: "checkout-errors", lifecycle: "resolved-unacknowledged", raised: at(17, 9, 43), resolved: at(17, 10, 11) },
  { id: "a-3", type: "webhooks-queue", lifecycle: "active-acknowledged", raised: at(17, 7, 12), acknowledgedAt: at(17, 8, 2) },
  { id: "a-4", type: "search-latency", lifecycle: "active-unacknowledged", raised: at(17, 10, 24) },
  { id: "a-5", type: "search-latency", lifecycle: "resolved-acknowledged", raised: at(17, 8, 5), resolved: at(17, 8, 9), acknowledgedAt: at(17, 8, 6) },
  { id: "a-6", type: "images-disk", lifecycle: "active-unacknowledged", raised: at(17, 6, 0), availability: "snoozed", snooze: { until: at(17, 14), by: "Tomasz Nowak" } },
  { id: "a-7", type: "reports-job", lifecycle: "active-unacknowledged", raised: at(17, 4, 30), availability: "disabled" },
];

export const title = "Work through the alerts";

export const lead =
  "The on-call engineer at Quillmere opens the alert list, takes the worst first, acknowledges what they have seen and snoozes what can wait.";

export const callouts = [
  "Who carries the pager right now, and how many alerts still wait for someone to see them.",
  "The list sorts by priority, then acknowledgement, then time: the unacknowledged search latency stands above the older checkout alert. A resolved alert nobody acknowledged stays until someone does.",
  "Snoozed and disabled alerts stay in the list, drawn neutral with their state; the switch shows only them.",
  "Tick rows and acknowledge them in one go, or snooze them for an hour under the engineer's name.",
];

export const builtFrom = [
  "alarmlist",
  { name: "Stat", page: "@umriss-ui/core#stat" },
  { name: "Switch", page: "@umriss-ui/core#switch" },
  { name: "Button", page: "@umriss-ui/core#button" },
];

const MIN = 60_000;
/* The feed's freshness counts from page load, the rest from the world's moment. */
const LOADED = Date.now();

const onCall = (rotation: "primary" | "secondary") => {
  const turn = ONCALL.find((one) => one.rotation === rotation && one.from <= NOW && NOW < one.to);
  return ENGINEERS.find((e) => e.id === turn?.engineer)?.name ?? "nobody";
};

export default function WorkThroughTheAlerts() {
  const [alerts, setAlerts] = useState<readonly Alarm[]>(ALERTS);
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const primary = onCall("primary");

  const view = useMemo(
    () =>
      alarmModel(
        { alarms: alerts, types: ALERT_TYPES, asOf: NOW },
        hiddenOnly ? { filter: (row) => isHidden(row.availability) } : {},
      ),
    [alerts, hiddenOnly],
  );
  const selection = useTableSelection(view.filtered.map((row) => row.id));
  const waiting = alerts.filter((a) => a.lifecycle.endsWith("-unacknowledged") && !isHidden(a.availability ?? "in-service")).length;

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
            <Text size="sm">{primary}, primary</Text>
            <Text size="sm" tone="secondary">
              {onCall("secondary")}, secondary
            </Text>
          </Stack>
        </Grid>
      </div>

      <div data-callout="2">
        <AlarmList
          view={view}
          selection={selection}
          asOf={LOADED - 40_000}
          freshness={{ stale: 5 * MIN, lost: 30 * MIN }}
          hiddenOnly={hiddenOnly}
          onAcknowledge={(ids) => {
            setAlerts((current) => acknowledge(current, ids, NOW).alarms);
            selection.clear();
          }}
        />
      </div>

      <Stack direction="row" gap={3} align="center" wrap>
        <span data-callout="3">
          <Switch label="Hidden alerts only" checked={hiddenOnly} onChange={(e) => setHiddenOnly(e.target.checked)} />
        </span>
        <span data-callout="4">
          <Button
            size="sm"
            disabled={selection.selected.size === 0}
            onClick={() => {
              setAlerts((current) =>
                current.map((a) => (selection.selected.has(a.id) ? snooze(a, NOW + 60 * MIN, primary) : a)),
              );
              selection.clear();
            }}
          >
            Snooze for an hour
          </Button>
        </span>
        <Text size="xs" tone="muted">
          A snooze ends by the clock and comes back with its lifecycle.
        </Text>
      </Stack>
    </Stack>
  );
}
