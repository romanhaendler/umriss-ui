import { useMemo, useState } from "react";
import { Button, Stack, Text } from "@umriss-ui/core";
import { AlarmBanner, AlarmList, acknowledge, alarmModel } from "../../../src";
import { useTableSelection } from "@umriss-ui/table";
import type { Alarm, AlarmType } from "../../../src";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const ALERT_TYPES: readonly AlarmType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "critical" },
  { id: "search-latency", label: "Search · p95 latency above 250 ms", priority: "medium" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
];

const START: readonly Alarm[] = [
  { id: "a-1", type: "search-latency", lifecycle: "active-unacknowledged", raised: at(10, 24) },
  { id: "a-2", type: "images-disk", lifecycle: "active-unacknowledged", raised: at(6, 0) },
];

export const title = "A critical alert arrives";

export const lead = "Put the focus on a row's box, then add a critical alert. The banner changes and speaks it once; the list re-sorts, and the focus stays where it was.";

export default function ACriticalAlertArrives() {
  const [alerts, setAlerts] = useState<readonly Alarm[]>(START);
  const [asOf, setAsOf] = useState(at(10, 30));
  const [horn, setHorn] = useState("silent");
  const view = useMemo(() => alarmModel({ alarms: alerts, types: ALERT_TYPES, asOf }), [alerts, asOf]);
  const selection = useTableSelection(view.filtered.map((row) => row.id));

  return (
    <Stack gap={3}>
      <AlarmBanner
        view={view}
        onAcknowledge={(ids) => setAlerts((current) => acknowledge(current, ids, asOf).alarms)}
        onAnnunciate={(event) => setHorn(event.kind === "new" ? `sounding for priority ${event.priority}` : "silent")}
      />
      <Text>The application's horn is {horn}.</Text>
      <AlarmList
        view={view}
        selection={selection}
        onAcknowledge={(ids) => {
          setAlerts((current) => acknowledge(current, ids, asOf).alarms);
          selection.clear();
        }}
      />
      <div>
        <Button
          size="sm"
          onClick={() => {
            setAsOf((time) => time + 60_000);
            setAlerts((current) => [...current, { id: `c-${current.length}`, type: "checkout-latency", lifecycle: "active-unacknowledged", raised: asOf }]);
          }}
        >
          Add a critical alert
        </Button>
      </div>
    </Stack>
  );
}
