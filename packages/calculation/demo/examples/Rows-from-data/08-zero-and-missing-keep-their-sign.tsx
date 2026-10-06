import { Calculation, Chain, Given, Interim, Minus, Plus, Sum } from "../../../src";

export const title = "Zero and missing keep their sign";
export const lead =
  "A row worth zero has no direction, and a missing row has no number: both keep the operator they are written with. The missing row makes the group and everything after it absent, with the reason – never zero.";

const CORRECTIONS: readonly { id: string; name: string; amount: number | null }[] = [
  { id: "night", name: "Night work bonus, February", amount: 84 },
  { id: "travel", name: "Travel, February", amount: 0 },
  { id: "overtime", name: "Overtime, February", amount: null },
];

export default function ZeroAndMissingKeepTheirSign() {
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
