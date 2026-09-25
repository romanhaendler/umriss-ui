import { useMemo, useState } from "react";
import { AlarmList, acknowledge, alarmModel, useTableSelection } from "../../../src";
import type { Alarm } from "../../../src";
import { ALERT_TYPES, ALERTS, NOW } from "@umriss-ui/demo/worlds/operations";

export const title = "Acknowledge alerts";

export const lead = "Pass a `selection` and `onAcknowledge`, then apply `acknowledge` to your own state: the row changes state and stays in the list.";

export default function AcknowledgeAlerts() {
  const [alerts, setAlerts] = useState<readonly Alarm[]>(ALERTS);
  const view = useMemo(() => alarmModel({ alarms: alerts, types: ALERT_TYPES, asOf: NOW }), [alerts]);
  const selection = useTableSelection(view.filtered.map((row) => row.id));

  return (
    <AlarmList
      view={view}
      selection={selection}
      onAcknowledge={(ids) => {
        setAlerts((current) => acknowledge(current, ids, NOW).alarms);
        selection.clear();
      }}
    />
  );
}
