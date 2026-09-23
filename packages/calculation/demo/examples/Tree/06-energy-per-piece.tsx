import { Calculation, Given, Quotient, Sum } from "../../../src";

export const title = "Energy per piece, with a limit";

/* Three meters summed and divided by the good pieces. The limit is assessed
   through core's `assess()`: the verdict stands as a word beneath the number,
   never as a colour alone. */
export default function EnergyPerPiece() {
  return (
    <Calculation aria-label="Energy per good piece, hall 2">
      <Quotient
        label="Energy per good piece"
        unit="kWh/pc"
        decimals={3}
        limits={[{ value: 0.45, side: "upper", severity: "warning" }]}
      >
        <Sum label="Energy, hall 2" unit="kWh">
          <Given label="Presses" value={1840} unit="kWh" />
          <Given label="Compressed air" value={612} unit="kWh" />
          <Given label="Lighting and HVAC" value={295} unit="kWh" />
        </Sum>
        <Given label="Good pieces" value={5920} unit="pcs" />
      </Quotient>
    </Calculation>
  );
}
