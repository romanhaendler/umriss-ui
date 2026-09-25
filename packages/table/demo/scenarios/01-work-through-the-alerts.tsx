import { useMemo, useState } from "react";
import { Button, Grid, Stack, Stat, Switch, Text } from "@umriss-ui/core";
import { AlarmList, acknowledge, alarmModel, isHidden, snooze, useTableSelection } from "../../src";
import type { Alarm } from "../../src";
import { ALERT_TYPES, ALERTS, ENGINEERS, INCIDENTS, NOW, ONCALL } from "@umriss-ui/demo/worlds/operations";

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
          asOf={NOW}
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
