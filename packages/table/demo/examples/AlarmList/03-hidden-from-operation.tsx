import { useMemo, useState } from "react";
import { Button, Stack, Text } from "@umriss-ui/core";
import { AlarmList, acknowledge, alarmModel, isHidden, snooze, useTableSelection } from "../../../src";
import type { Alarm, AlarmType } from "../../../src";

export const title = "Hidden, never absent";

/* ISA-18.2 knows three special states beside the lifecycle: snoozed by a
   person, suppressed by the application's logic, disabled for maintenance.
   They are a second field, `availability`, and never a fifth lifecycle value:
   a snoozed alarm keeps its lifecycle, and comes back with it.

   None of them removes a row. A hidden alarm is drawn neutrally - no edge, its
   priority a word without its colour - with its state as a word, and the bar
   counts them. The count is a switch here because the application takes it:
   the view is the table's own `filter`, the list only shows the switch.

   A snooze has an end and a name. It returns by the model's clock: at the
   as-of time that reaches its end the row is in service again, with no timer.

   The application performs the transitions - `snooze`, `unsnooze`,
   `disable`, `enable` - one alarm in, one out. */

/* The reference is taken once at load time, so that the times are right for a
   human. The screenshot suite freezes the page's clock; `Date.now()` then
   yields the frozen moment, and the picture stays the same from run to run. */
const NOW = Date.now();
const MIN = 60_000;

const TYPES: AlarmType[] = [
  { id: "furnace-temp", label: "Furnace 3 · temperature above alarm limit", priority: "high" },
  { id: "vibration", label: "Fan 2 · vibration high", priority: "high" },
  { id: "low-flow", label: "Pump 4 · flow low", priority: "medium" },
  { id: "level", label: "Tank 1 · level sensor fault", priority: "low" },
];

const START: readonly Alarm[] = [
  { id: "a1", type: "furnace-temp", lifecycle: "active-unacknowledged", raised: NOW - 3 * MIN },
  {
    id: "a2",
    type: "vibration",
    lifecycle: "active-acknowledged",
    raised: NOW - 52 * MIN,
    acknowledgedAt: NOW - 50 * MIN,
    availability: "snoozed",
    snooze: { until: NOW + 40 * MIN, by: "M. Keller" },
  },
  /* The pump is off; its low flow is expected. The plant's logic writes this
     one, and the model has no transition for it. */
  {
    id: "a3",
    type: "low-flow",
    lifecycle: "active-unacknowledged",
    raised: NOW - 18 * MIN,
    availability: "suppressed",
  },
  {
    id: "a4",
    type: "level",
    lifecycle: "active-acknowledged",
    raised: NOW - 300 * MIN,
    acknowledgedAt: NOW - 290 * MIN,
    availability: "disabled",
  },
];

export default function HiddenAlarms() {
  const [alarms, setAlarms] = useState<readonly Alarm[]>(START);
  const [hiddenOnly, setHiddenOnly] = useState(false);

  const projection = useMemo(
    () =>
      alarmModel(
        { alarms, types: TYPES, asOf: NOW },
        hiddenOnly ? { filter: (row) => isHidden(row.availability) } : {},
      ),
    [alarms, hiddenOnly],
  );
  const selection = useTableSelection(projection.filtered.map((r) => r.id));

  return (
    <Stack gap={3}>
      <AlarmList
        view={projection}
        selection={selection}
        hiddenOnly={hiddenOnly}
        onHiddenOnlyChange={setHiddenOnly}
        onAcknowledge={(ids) => {
          setAlarms((current) => acknowledge(current, ids, NOW).alarms);
          selection.clear();
        }}
      />
      <Stack direction="row" gap={3} align="center">
        <Button
          size="sm"
          disabled={selection.selected.size === 0}
          onClick={() => {
            setAlarms((current) =>
              current.map((alarm) => (selection.selected.has(alarm.id) ? snooze(alarm, NOW + 30 * MIN, "J. Weber") : alarm)),
            );
            selection.clear();
          }}
        >
          Snooze for 30 minutes
        </Button>
        <Text size="xs" tone="muted">
          Snoozed, the row stays - neutral, with its end and its name.
        </Text>
      </Stack>
    </Stack>
  );
}
