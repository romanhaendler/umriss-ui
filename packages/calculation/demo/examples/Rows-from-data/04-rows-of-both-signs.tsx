import { Calculation, Chain, Given, Interim, Minus, Plus, Sum } from "../../../src";

export const title = "Rows of both signs";
export const lead =
  "Rows that add and rows that take away go into one `Sum` as they come, each with its own sign. Every line shows its contribution: the direction as its operator, the number without a sign – a correction of −120 stands as \"− 120.00\", never as \"+ -120.00\".";

/* Corrections from a payroll system: positive adds to the pay, negative takes from it. */
const CORRECTIONS = [
  { id: "night", name: "Night work bonus, February", amount: 84 },
  { id: "travel", name: "Overpaid travel, February", amount: -120 },
  { id: "rounding", name: "Rounding", amount: 0.03 },
];

export default function RowsOfBothSigns() {
  return (
    <Calculation aria-label="Payslip, March">
      <Chain>
        <Given label="Gross salary" value={4200} unit="€" decimals={2} />
        <Minus label="Income tax" value={612.5} unit="€" decimals={2} />
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
