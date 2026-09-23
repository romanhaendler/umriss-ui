import { Calculation, Chain, Given, Interim, Minus, Plus } from "../../../src";

export const title = "An energy balance with limits";

/* Interims take targets and limits like any quantity. The balance of a hall:
   what came in, what went out, and what is left unaccounted for - a number
   that should be small. Its limit is assessed; the verdict stands beneath it
   as a word. */
export default function EnergyBalance() {
  return (
    <Calculation aria-label="Energy balance, hall 2, week 12">
      <Chain>
        <Given label="Grid supply" value={48200} unit="kWh" />
        <Plus label="Photovoltaics" value={6150} unit="kWh" />
        <Interim label="Energy in" unit="kWh" />
        <Minus label="Presses" value={31480} unit="kWh" />
        <Minus label="Compressed air" value={9820} unit="kWh" />
        <Minus label="Heating and ventilation" value={8870} unit="kWh" />
        <Minus label="Lighting" value={2210} unit="kWh" />
        <Interim
          label="Unaccounted for"
          unit="kWh"
          limits={[
            { value: 1500, side: "upper", severity: "warning" },
            { value: 3000, side: "upper", severity: "alarm" },
          ]}
        />
      </Chain>
    </Calculation>
  );
}
