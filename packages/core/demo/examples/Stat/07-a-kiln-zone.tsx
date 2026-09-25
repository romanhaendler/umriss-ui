import { Grid, Stat } from "../../../src";
import { KILN_LIMITS, plant } from "@umriss-ui/demo/worlds/plant";

export const title = "Watch a kiln zone";
export const lead = "One limit set with a target and limits on both sides: the tolerance band between the warnings is derived, never passed.";

const { readings } = plant(17);

/** The last hour of the shift so far, minute by minute. */
function lastHour(until: number) {
  return readings.filter((one) => one.minute > until - 60 && one.minute <= until).map((one) => one.kiln);
}

export default function AKilnZone() {
  return (
    <Grid minItemWidth="220px" gap={4}>
      {[120, 170, 180].map((minute) => {
        const hour = lastHour(minute);
        return (
          <Stat
            key={minute}
            label={`Kiln K1 · zone 3 · ${String(6 + Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`}
            value={hour.at(-1)}
            unit="°C"
            decimals={0}
            limits={KILN_LIMITS}
            history={hour}
          />
        );
      })}
    </Grid>
  );
}
