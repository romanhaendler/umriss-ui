import { Chart, Matrix, Tooltip, XAxis, YAxis } from "../../../src";
import { SERVICES, SUCCESS_BY_HOUR, type SuccessCell } from "@umriss-ui/demo/worlds/operations";

export const title = "Colour cells by their limits";
export const lead = "With `coloring` of kind `assessment` a cell takes the tone its limits give it: a bad hour everywhere reads differently from one bad service.";

export default function ByLimits() {
  return (
    <Chart data={SUCCESS_BY_HOUR} height={280} ariaLabel="Successful requests per service and hour yesterday, by limits">
      <XAxis accessor={(d: SuccessCell) => d.hour} ticks={[0, 6, 12, 18]} tickFormat={(v) => `${v}:00`} label="Hour" />
      <YAxis accessor={(d: SuccessCell) => d.service} ticks={SERVICES.map((_, i) => i)} tickFormat={(v) => SERVICES[v]?.name ?? ""} />
      <Matrix
        accessor={(d: SuccessCell) => d.service}
        value={(d: SuccessCell) => d.success}
        coloring={{
          kind: "assessment",
          limits: {
            limits: [
              { value: 99, side: "lower", severity: "warning" },
              { value: 98, side: "lower", severity: "alarm" },
            ],
          },
        }}
        name="Success rate"
      />
      <Tooltip mode="nearest" />
    </Chart>
  );
}
