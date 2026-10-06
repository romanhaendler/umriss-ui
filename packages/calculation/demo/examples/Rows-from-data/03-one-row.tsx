import { Calculation, Chain, Given, Interim, Minus, Plus, Sum } from "../../../src";

export const title = "One row";
export const lead =
  "A sum of one row is still a group: its line keeps its name and folds, and opens onto that one row, closing with \"= Allowances\". The statement keeps its shape as the data changes, and an opened group stays open.";

/* A month with a single allowance. */
const ALLOWANCES = [{ id: "night", name: "Night work bonus", amount: 84 }];

export default function OneRow() {
  return (
    <Calculation aria-label="Payslip, May">
      <Chain>
        <Given label="Gross salary" value={4200} unit="€" decimals={2} />
        <Plus>
          <Sum label="Allowances" unit="€" decimals={2}>
            {ALLOWANCES.map((allowance) => (
              <Given key={allowance.id} label={allowance.name} value={allowance.amount} unit="€" decimals={2} />
            ))}
          </Sum>
        </Plus>
        <Minus label="Income tax" value={631.9} unit="€" decimals={2} />
        <Interim label="Net salary" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
