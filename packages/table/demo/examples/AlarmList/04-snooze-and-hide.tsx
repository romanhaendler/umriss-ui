import { useMemo, useState } from "react";
import { Button, Stack } from "@umriss-ui/core";
import { AlarmList, acknowledge, alarmModel, isHidden, snooze, useTableSelection } from "../../../src";
import type { Alarm } from "../../../src";
import { ALERT_TYPES, ALERTS, NOW } from "@umriss-ui/demo/worlds/operations";

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
