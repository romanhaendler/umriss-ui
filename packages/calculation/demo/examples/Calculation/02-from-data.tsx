import { Calculation, Given, Quotient, Sum } from "../../../src";

export const title = "Built from data";

/* `.map` inside an operator: the cost items come from a list, and each one
   becomes an operand. What `.map` returns are elements the calculation can
   read - a component of your own wrapping `<Given>` would not be, and fails
   with a message saying so. */

const COST_ITEMS = [
  { name: "Material", amount: 1840 },
  { name: "Energy", amount: 312.5 },
  { name: "Labour", amount: 960 },
  { name: "Tooling wear", amount: 145 },
];

export default function FromData() {
  return (
    <Calculation aria-label="Cost per piece, order A-2041">
      <Quotient label="Cost per piece" unit="€" decimals={2} limits={[{ value: 7.5, side: "upper", severity: "warning" }]}>
        <Sum label="Order cost" unit="€">
          {COST_ITEMS.map((item) => (
            <Given key={item.name} label={item.name} value={item.amount} unit="€" />
          ))}
        </Sum>
        <Given label="Good pieces" value={420} unit="pcs" />
      </Quotient>
    </Calculation>
  );
}
