import { Calculation, Chain, Given, Interim, Minus, Plus, Product, Ref, Sum } from "../../../src";

export const title = "A payslip";

/* A chain as a payslip reads: the gross salary, each deduction on a line of
   its own with its minus, and the net salary only once they all stand. A
   chain in view never folds - it is the working itself.

   What a reader should see only on request goes into ONE line as a tree: the
   four social security contributions are a `<Sum>` held by a `<Minus>`. The
   line shows their total and the formula it hides; a click opens the four
   beneath it, each computed from its rate and the gross salary. */

const CONTRIBUTIONS = [
  { name: "Pension insurance", rate: 0.093 },
  { name: "Unemployment insurance", rate: 0.013 },
  { name: "Health insurance", rate: 0.082 },
  { name: "Long-term care insurance", rate: 0.017 },
];

export default function Payslip() {
  return (
    <Calculation aria-label="Payslip, March">
      <Chain>
        <Given id="gross" label="Gross salary" value={4200} unit="€" decimals={2} />
        <Minus label="Income tax" value={612.5} unit="€" decimals={2} />
        <Minus label="Church tax" value={49} unit="€" decimals={2} />
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
        <Interim label="Net salary" unit="€" decimals={2} />
        <Minus label="Capital-forming benefits" value={40} unit="€" decimals={2} />
        <Plus label="Travel allowance" value={60} unit="€" decimals={2} />
        <Interim label="Amount paid out" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
