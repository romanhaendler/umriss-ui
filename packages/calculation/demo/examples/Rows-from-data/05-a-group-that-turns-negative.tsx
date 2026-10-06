import { Calculation, Chain, Given, Interim, Minus, Plus, Sum } from "../../../src";

export const title = "A group that turns negative";
export const lead =
  "Held by a `Plus`, a group whose total is negative stands as a minus with its number unsigned: \"− Corrections 36.00\". Opened, its derivation closes with the quantity itself, sign and all: \"= Corrections -36.00\". The line says what it does to the pay, the closing row what the corrections amount to.";

const CORRECTIONS = [
  { id: "night", name: "Night work bonus, February", amount: 84 },
  { id: "travel", name: "Overpaid travel, February", amount: -120 },
];

export default function AGroupThatTurnsNegative() {
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
