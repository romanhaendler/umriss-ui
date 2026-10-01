import { useMemo, useState } from "react";
import { Button, Stack } from "@umriss-ui/core";
import { AlarmList, acknowledge, alarmModel, isHidden, snooze, useTableSelection } from "../../../src";
import type { Alarm, AlarmType } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(17, 10, 30);

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

export const title = "Snooze and hide";

export const lead = "Snoozed, suppressed and disabled alerts stay in the list, drawn neutral; with `onHiddenOnlyChange` their count becomes a switch.";

const MIN = 60_000;

/* During the planned search reindex the application suppresses its latency alert. */
const START: readonly Alarm[] = [
  ...ALERTS,
  { id: "a-8", type: "search-latency", lifecycle: "active-unacknowledged", raised: NOW - 12 * MIN, availability: "suppressed" },
];

export default function SnoozeAndHide() {
  const [alerts, setAlerts] = useState<readonly Alarm[]>(START);
  const [hiddenOnly, setHiddenOnly] = useState(false);

  const view = useMemo(
    () =>
      alarmModel(
        { alarms: alerts, types: ALERT_TYPES, asOf: NOW },
        hiddenOnly ? { filter: (row) => isHidden(row.availability) } : {},
      ),
    [alerts, hiddenOnly],
  );
  const selection = useTableSelection(view.filtered.map((row) => row.id));

  return (
    <Stack gap={3}>
      <AlarmList
        view={view}
        selection={selection}
        hiddenOnly={hiddenOnly}
        onHiddenOnlyChange={setHiddenOnly}
        onAcknowledge={(ids) => {
          setAlerts((current) => acknowledge(current, ids, NOW).alarms);
          selection.clear();
        }}
      />
      <div>
        <Button
          size="sm"
          disabled={selection.selected.size === 0}
          onClick={() => {
            setAlerts((current) =>
              current.map((a) => (selection.selected.has(a.id) ? snooze(a, NOW + 60 * MIN, "Jonas Keller") : a)),
            );
            selection.clear();
          }}
        >
          Snooze for an hour
        </Button>
      </div>
    </Stack>
  );
}
