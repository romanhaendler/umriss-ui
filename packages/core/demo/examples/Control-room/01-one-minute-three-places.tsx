import { useMemo } from "react";
import { Grid, Stack, Stat } from "../../../src";
import { Chart, LimitBand, LimitLine, Line, Tooltip, XAxis, YAxis } from "@umriss-ui/charts";
import { AlarmList, alarmModel } from "@umriss-ui/table";
import { ALARM_TYPES, KILN, KILN_LIMITS, alarmsAt, plant, upTo } from "@umriss-ui/demo/worlds/plant";

export const title = "One minute, three places";

/* The first step: one minute of one shift - the minute the kiln crosses its
   alarm limit - read in three places. The trend draws it above the limit, the
   tile gives it the alarm verdict, the list holds the alarm the plant raised.
   None of the three is told about the others; all three read the same
   reading against the same limits, which is why they agree. */

const SHIFT = plant(17);
const CROSSING = SHIFT.readings.find((one) => one.kiln > KILN.alarm)!.minute;
/* The shift begins at 06:00 today. The screenshot suite freezes the page's
   clock, and "today" is then the same day on every run. */
const START = new Date(new Date().setHours(6, 0, 0, 0)).getTime();
const at = (minute: number) => START + minute * 60_000;

type Point = { t: number; kiln: number };

export default function OneMinuteThreePlaces() {
  const trend = useMemo<Point[]>(
    () => upTo(SHIFT.readings, CROSSING).map((one) => ({ t: at(one.minute), kiln: one.kiln })),
    [],
  );
  const alarms = useMemo(
    () => alarmModel({ alarms: alarmsAt(SHIFT, CROSSING, START), types: ALARM_TYPES, asOf: at(CROSSING) }),
    [],
  );
  const reading = SHIFT.readings[CROSSING]!;

  return (
    <Stack gap={4}>
      <Grid minItemWidth="220px" gap={4}>
        <Stat
          label="Kiln K1 · zone 3"
          value={reading.kiln}
          unit="°C"
          decimals={1}
          limits={KILN_LIMITS}
          history={upTo(SHIFT.readings, CROSSING).slice(-30).map((one) => one.kiln)}
        />
        <Chart data={trend} height={160} ariaLabel="Kiln zone 3 up to the crossing">
          <XAxis accessor={(d: Point) => d.t} time />
          <YAxis accessor={(d: Point) => d.kiln} domain={[1170, 1250]} label="°C" />
          <LimitBand from={KILN.tolerance[0]} to={KILN.tolerance[1]} severity="warning" label="Tolerance" />
          <LimitLine value={KILN.alarm} severity="alarm" label="Alarm limit" />
          <Line accessor={(d: Point) => d.kiln} name="Zone 3" />
          <Tooltip mode="x" />
        </Chart>
      </Grid>
      <AlarmList view={alarms} density="compact" />
    </Stack>
  );
}
