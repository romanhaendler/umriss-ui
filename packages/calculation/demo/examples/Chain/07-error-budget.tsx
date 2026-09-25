import { Calculation, Chain, Given, Interim, Minus, Product } from "../../../src";

export const title = "Hold an interim to its limits";
export const lead = "An `Interim` takes `target` and `limits` like any quantity; here the error budget left is assessed against two lower limits.";

export default function ErrorBudget() {
  return (
    <Calculation aria-label="Error budget of Checkout, March">
      <Chain>
        <Product label="Error budget, March" unit="min" decimals={1}>
          <Given label="Minutes in March" value={44640} unit="min" />
          <Given label="Allowed downtime" value={0.0005} format="percent" decimals={2} />
        </Product>
        <Minus label="INC-1039, payment provider timeouts" value={9} unit="min" decimals={1} />
        <Minus label="INC-1036, failed deploy" value={4} unit="min" decimals={1} />
        <Minus label="INC-1048, card payments time out" value={21} unit="min" decimals={1} />
        <Interim
          label="Budget left"
          unit="min"
          decimals={1}
          limits={[
            { value: 5, side: "lower", severity: "warning" },
            { value: 0, side: "lower", severity: "alarm" },
          ]}
        />
      </Chain>
    </Calculation>
  );
}
