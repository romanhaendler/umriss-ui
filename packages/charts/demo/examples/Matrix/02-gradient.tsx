import { Chart, Matrix, Tooltip, XAxis, YAxis } from "../../../src";
import { SERVICES, SUCCESS_BY_HOUR, type SuccessCell } from "@umriss-ui/demo/worlds/operations";

export const title = "Colour cells along a gradient";
export const lead = "Without `coloring` the cells run along `DEFAULT_GRADIENT` from the lowest value to the highest; a cell without a value stays a hole.";

export default function Gradient() {
  return (
    <Chart data={SUCCESS_BY_HOUR} height={280} ariaLabel="Successful requests per service and hour yesterday, as a gradient">
      <XAxis accessor={(d: SuccessCell) => d.hour} ticks={[0, 6, 12, 18]} tickFormat={(v) => `${v}:00`} label="Hour" />
      <YAxis accessor={(d: SuccessCell) => d.service} ticks={SERVICES.map((_, i) => i)} tickFormat={(v) => SERVICES[v]?.name ?? ""} />
      <Matrix accessor={(d: SuccessCell) => d.service} value={(d: SuccessCell) => d.success} name="Success rate" />
      <Tooltip mode="nearest" />
    </Chart>
  );
}
