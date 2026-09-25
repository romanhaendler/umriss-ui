import { Calculation, Chain, Given, Interim, Plus, Product } from "../../../src";

export const title = "A limit violated deep inside";
export const lead = "A folded line holding a worse verdict says so quietly – without taking the colour itself, since its own number is not the one in alarm.";

const ERROR_LIMITS = [
  { value: 0.01, side: "upper" as const, severity: "warning" as const },
  { value: 0.02, side: "upper" as const, severity: "alarm" as const },
];

export default function LimitInside() {
  return (
    <Calculation aria-label="Payments at risk, this morning">
      <Chain>
        <Product label="At risk, Billing" unit="€" decimals={2}>
          <Given label="Error rate, Billing" value={0.004} format="percent" limits={ERROR_LIMITS} />
          <Given label="Payments, Billing" value={24800} unit="€" decimals={2} />
        </Product>
        <Plus>
          <Product label="At risk, Checkout" unit="€" decimals={2}>
            <Given label="Error rate, Checkout" value={0.026} format="percent" limits={ERROR_LIMITS} />
            <Given label="Payments, Checkout" value={19650} unit="€" decimals={2} />
          </Product>
        </Plus>
        <Interim label="Payments at risk" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
