import { Calculation, Chain, Given, Interim, Minus, Plus, Product, Ref, Sum } from "../../../src";

export const title = "Fold a group of lines into one";
export const lead = "A chain in view never folds; to show items only on request, put them into one line as a tree: a `Sum` held by a `Minus`.";

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
