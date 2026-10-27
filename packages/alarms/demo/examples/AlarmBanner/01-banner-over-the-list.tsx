import { useMemo, useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { AlarmBanner, AlarmList, acknowledge, alarmModel } from "../../../src";
import { useTableSelection } from "@umriss-ui/table";
import type { Alarm, AlarmType } from "../../../src";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(10, 30);

const ALERT_TYPES: readonly AlarmType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "critical" },
  { id: "checkout-errors", label: "Checkout · error rate above 2 %", priority: "high" },
  { id: "search-latency", label: "Search · p95 latency above 250 ms", priority: "medium" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
];

const START: readonly Alarm[] = [
  { id: "a-1", type: "checkout-latency", lifecycle: "active-unacknowledged", raised: at(10, 24) },
  { id: "a-2", type: "checkout-errors", lifecycle: "active-unacknowledged", raised: at(10, 21) },
  { id: "a-3", type: "search-latency", lifecycle: "active-unacknowledged", raised: at(9, 50) },
  { id: "a-4", type: "images-disk", lifecycle: "active-unacknowledged", raised: at(6, 0) },
];

export const title = "A banner over the list";

export const lead = "Both read the same alerts: acknowledge the worst one in the banner, or the ticked ones in the list, and both change. The banner takes the view without a filter, so a filter on the list never hides the worst alert from it.";

export default function BannerOverTheList() {
  const [alerts, setAlerts] = useState<readonly Alarm[]>(START);
  const view = useMemo(() => alarmModel({ alarms: alerts, types: ALERT_TYPES, asOf: NOW }), [alerts]);
  const selection = useTableSelection(view.filtered.map((row) => row.id));
  const [opened, setOpened] = useState(0);
  const apply = (ids: readonly string[]) => {
    setAlerts((current) => acknowledge(current, ids, NOW).alarms);
    selection.clear();
  };

  return (
    <Stack gap={3}>
      <AlarmBanner view={view} onAcknowledge={apply} onOpen={() => setOpened((n) => n + 1)} />
      <Text>The list was asked for {opened} times.</Text>
      <AlarmList view={view} selection={selection} onAcknowledge={apply} />
    </Stack>
  );
}
