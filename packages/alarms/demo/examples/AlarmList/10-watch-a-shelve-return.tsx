import { useMemo, useState } from "react";
import { Button, Stack } from "@umriss-ui/core";
import { AlarmList, acknowledge, alarmModel, snooze } from "../../../src";
import { useTableSelection } from "@umriss-ui/table";
import type { Alarm, AlarmType } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

const MIN = 60_000;

const ALERT_TYPES: readonly AlarmType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "critical" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
];

/* The disk alert was acknowledged, then shelved until 10:45 for a clean-up that has not happened. */
const START: readonly Alarm[] = [
  { id: "a-1", type: "checkout-latency", lifecycle: "active-acknowledged", raised: at(17, 10, 12), acknowledgedAt: at(17, 10, 14) },
  snooze(
    { id: "a-2", type: "images-disk", lifecycle: "active-acknowledged", raised: at(17, 6, 0), acknowledgedAt: at(17, 6, 5) },
    at(17, 10, 45),
    "Tomasz Nowak",
    "Clean-up planned",
  ),
];

export const title = "Watch a shelve return";

export const lead = "The list reads no clock: the as-of time is yours. Tick it past the shelve's end and an alert still in alarm comes back unacknowledged, counted, and ready to acknowledge.";

export default function WatchAShelveReturn() {
  const [alerts, setAlerts] = useState<readonly Alarm[]>(START);
  const [asOf, setAsOf] = useState(at(17, 10, 30));

  const view = useMemo(() => alarmModel({ alarms: alerts, types: ALERT_TYPES, asOf }), [alerts, asOf]);
  const selection = useTableSelection(view.filtered.map((row) => row.id));

  return (
    <Stack gap={3}>
      <AlarmList
        view={view}
        selection={selection}
        onAcknowledge={(ids) => {
          setAlerts((current) => acknowledge(current, ids, asOf).alarms);
          selection.clear();
        }}
      />
      <div>
        <Button size="sm" onClick={() => setAsOf((time) => time + 15 * MIN)}>
          Let 15 minutes pass
        </Button>
      </div>
    </Stack>
  );
}
