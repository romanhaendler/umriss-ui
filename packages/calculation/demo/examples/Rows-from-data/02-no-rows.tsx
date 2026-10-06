import { Calculation, Chain, Given, Interim, Minus, Plus, Sum } from "../../../src";

export const title = "No rows";
export const lead =
  "When the data holds no rows, the sum is zero and its line stays where it was: it has nothing to open and says \"no entries\" where its formula would stand, so a reader sees that there were none rather than wondering whether a line is missing.";

/* A month without allowances: the payroll system returns an empty list. */
const ALLOWANCES: readonly { id: string; name: string; amount: number }[] = [];

export default function NoRows() {
  return (
    <Calculation aria-label="Payslip, April">
      <Chain>
        <Given label="Gross salary" value={4200} unit="€" decimals={2} />
        <Plus>
          <Sum label="Allowances" unit="€" decimals={2}>
            {ALLOWANCES.map((allowance) => (
              <Given key={allowance.id} label={allowance.name} value={allowance.amount} unit="€" decimals={2} />
            ))}
          </Sum>
        </Plus>
        <Minus label="Income tax" value={612.5} unit="€" decimals={2} />
        <Interim label="Net salary" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
