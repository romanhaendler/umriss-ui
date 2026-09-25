import { Calculation, Given, Quotient, Sum } from "../../../src";

export const title = "Hold a figure to its limits";
export const lead = "`limits` are assessed through core's `assess()`; the verdict stands as a word beneath the number, never as a colour alone.";

export default function Limits() {
  return (
    <Calculation aria-label="Cost per stop, tour T-03">
      <Quotient
        label="Cost per stop, tour T-03"
        unit="€/stop"
        decimals={2}
        limits={[
          { value: 60, side: "upper", severity: "warning" },
          { value: 100, side: "upper", severity: "alarm" },
        ]}
      >
        <Sum label="Cost of tour T-03" unit="€" decimals={2}>
          <Given label="Driver" value={216.2} unit="€" decimals={2} />
          <Given label="Diesel" value={71.37} unit="€" decimals={2} />
          <Given label="Truck, one day" value={145} unit="€" decimals={2} />
        </Sum>
        <Given label="Stops" value={5} unit="stops" />
      </Quotient>
    </Calculation>
  );
}
