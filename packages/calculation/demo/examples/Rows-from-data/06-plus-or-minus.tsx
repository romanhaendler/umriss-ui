import { Calculation, Chain, Given, Interim, Minus, Plus, Product, Ref, Sum } from "../../../src";

export const title = "Plus or Minus";
export const lead =
  "`Plus` and `Minus` say how a quantity enters, the number says its sign. Signed rows from data go into `Plus`: their signs do the rest. A quantity that is positive by nature and taken away here – income tax, a sum of contributions – goes into `Minus`, so that it keeps its sign where it closes and wherever it is referenced.";

const CONTRIBUTIONS = [
  { name: "Pension insurance", rate: 0.093 },
  { name: "Health insurance", rate: 0.082 },
];

const CORRECTIONS = [
  { id: "night", name: "Night work bonus, February", amount: 84 },
  { id: "travel", name: "Overpaid travel, February", amount: -120 },
];

export default function PlusOrMinus() {
  return (
    <Calculation aria-label="Payslip, March">
      <Chain>
        <Given id="gross" label="Gross salary" value={4200} unit="€" decimals={2} />
        <Minus label="Income tax" value={612.5} unit="€" decimals={2} />
        <Minus>
          <Sum label="Social security contributions" unit="€" decimals={2}>
            {CONTRIBUTIONS.map((contribution) => (
              <Product key={contribution.name} label={contribution.name} unit="€" decimals={2}>
                <Given label={`Rate, ${contribution.name.toLowerCase()}`} value={contribution.rate} format="percent" />
                <Ref to="gross" />
              </Product>
            ))}
          </Sum>
        </Minus>
        <Plus>
          <Sum label="Corrections" unit="€" decimals={2}>
            {CORRECTIONS.map((correction) => (
              <Given key={correction.id} label={correction.name} value={correction.amount} unit="€" decimals={2} />
            ))}
          </Sum>
        </Plus>
        <Interim label="Net salary" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
