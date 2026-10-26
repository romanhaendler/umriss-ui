import { Calculation, Given, Product, Sum } from "../../../src";

export const title = "Say how far the source vouches for a number";
export const lead = "`quality` marks a given whose source doubts it. Every line built on it carries the worst quality of its operands, so the result says it too - and a folded line shows it without being opened.";

export default function HowFarTheSourceVouches() {
  return (
    <Calculation aria-label="Heat used, boiler house, week 12">
      <Sum label="Heat used" unit="kWh" decimals={0}>
        <Product label="Boiler 1" unit="kWh" decimals={0}>
          <Given label="Flow" value={38.5} unit="m³" quality="uncertain" source="Heat meter 1, due for calibration" />
          <Given label="Energy per m³" value={11.6} unit="kWh/m³" decimals={1} />
        </Product>
        <Given label="Boiler 2" value={402} unit="kWh" source="Heat meter 2" />
      </Sum>
    </Calculation>
  );
}
