import { AlarmList, alarmModel } from "../../../src";
import { ALERT_TYPES, ALERTS, NOW } from "@umriss-ui/demo/worlds/operations";

export const title = "Show the alerts";

export const lead = "Hand your alerts and their types to `alarmModel` and its projection to `AlarmList` as `view`; the worst stands first.";

const view = alarmModel({ alarms: ALERTS, types: ALERT_TYPES, asOf: NOW });

export default function ShowTheAlerts() {
  return <AlarmList view={view} />;
}
