import { useMemo, useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { AlarmList, alarmModel, acknowledge, useTableSelection } from "../../../src";
import type { Alarm, AlarmType } from "../../../src";

export const title = "Four lifecycle states, none of them disappears";

/* The lifecycle state is ONE field with four values and not a pair of booleans.
   A pair invites `if (active)`, and that filter loses the third case: it
   came, it went, and nobody saw it. That is precisely the one worth
   investigating (the row "Cell 4 · guard door open").

   The library GENERATES no alarms (ADR-0009). It receives them and owns what
   happens to them afterwards: acknowledging, sorting, counting.

   Sorted by priority, then acknowledgement, then time - the operator needs the
   worst, not the newest.

   The lifecycle and priority values stay German: they are the alarm model's,
   and `AlarmList.module.css` selects on `data-lifecycle` together with them.

   The list is a table of the same interface as every other; the selection is
   `useTableSelection`, the same hook. */

/* The reference is taken once at load time, so that the times are right for a
   human. The screenshot suite freezes the page's clock; `Date.now()` then
   yields the frozen moment, and the picture stays the same from run to run. */
const NOW = Date.now();
const MIN = 60_000;

const TYPES: AlarmType[] = [
  { id: "furnace-temp", label: "Furnace 3 · temperature above alarm limit", priority: "high" },
  { id: "press-pressure", label: "Press 2 · system pressure below target", priority: "high" },
  { id: "coolant", label: "Mill 3 · coolant level low", priority: "medium" },
  { id: "door", label: "Cell 4 · guard door open", priority: "low" },
];

const START: readonly Alarm[] = [
  { id: "a1", type: "furnace-temp", lifecycle: "active-unacknowledged", raised: NOW - 3 * MIN },
  { id: "a2", type: "coolant", lifecycle: "active-unacknowledged", raised: NOW - 21 * MIN },
  {
    id: "a3",
    type: "press-pressure",
    lifecycle: "active-acknowledged",
    raised: NOW - 96 * MIN,
    acknowledgedAt: NOW - 74 * MIN,
  },
  {
    id: "a4",
    type: "door",
    lifecycle: "resolved-unacknowledged",
    raised: NOW - 142 * MIN,
    resolved: NOW - 141 * MIN,
  },
];

export default function Lifecycle() {
  const [alarms, setAlarms] = useState<readonly Alarm[]>(START);

  const projection = useMemo(
    () => alarmModel({ alarms, types: TYPES, asOf: NOW }),
    [alarms],
  );
  const selection = useTableSelection(projection.filtered.map((r) => r.id));

  return (
    <Stack gap={3}>
      <AlarmList
        view={projection}
        selection={selection}
        asOf={NOW - 40_000}
        freshness={{ stale: 5 * MIN, lost: 30 * MIN }}
        onAcknowledge={(ids) => {
          setAlarms((current) => acknowledge(current, ids, NOW).alarms);
          selection.clear();
        }}
      />
      <Text size="xs" tone="muted">
        Tick and acknowledge: the state moves, the row stays.
      </Text>
    </Stack>
  );
}
