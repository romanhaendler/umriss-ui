import { Calculation, Given, Sum } from "../../../src";

export const title = "A deduction first";
export const lead =
  "The first operand of a sum stands without an operator – unless it lowers the sum: then it carries a minus like every other deduction. A folded line's formula starts with that minus too – \"A sum from data in a tree\" below shows one.";

const ROWS = [
  { id: "refund", name: "Refund, order 1184", amount: -30 },
  { id: "bonus", name: "Loyalty bonus", amount: 12 },
  { id: "voucher", name: "Voucher", amount: 5 },
];

export default function ADeductionFirst() {
  return (
    <Calculation aria-label="Customer account, March">
      <Sum label="Balance" unit="€" decimals={2}>
        {ROWS.map((row) => (
          <Given key={row.id} label={row.name} value={row.amount} unit="€" decimals={2} />
        ))}
      </Sum>
    </Calculation>
  );
}
