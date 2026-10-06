import { Calculation, Chain, Given, Interim, Minus, Plus, Sum } from "../../../src";

export const title = "Rows of any count";
export const lead =
  "Hand a `Sum` the rows of an array, as they come from the data, and hold it in a `Plus` or `Minus`: the rows fold into one line, and the interim after it takes their total.";

/* Data from a payroll system, written out here so the example runs on its own. */
const ALLOWANCES = [
  { id: "night", name: "Night work bonus", amount: 84 },
  { id: "holiday", name: "Holiday pay", amount: 120 },
  { id: "on-call", name: "On-call allowance", amount: 45 },
];

export default function RowsOfAnyCount() {
  return (
    <Calculation aria-label="Payslip, March">
      <Chain>
        <Given label="Gross salary" value={4200} unit="€" decimals={2} />
        <Plus>
          <Sum label="Allowances" unit="€" decimals={2}>
            {ALLOWANCES.map((allowance) => (
              <Given key={allowance.id} label={allowance.name} value={allowance.amount} unit="€" decimals={2} />
            ))}
          </Sum>
        </Plus>
        <Minus label="Income tax" value={668.4} unit="€" decimals={2} />
        <Interim label="Net salary" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
