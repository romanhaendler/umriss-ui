import { Calculation, Given, Quotient } from "../../../src";

export const title = "A share with a target";

/* `format="percent"` presents a plain ratio as per cent - the quotient stays
   0.9604 in every operation. The target is assessed through core's
   `assess()` and stands beneath the number: missed, never violated. */
export default function ShareWithTarget() {
  return (
    <Calculation aria-label="First-pass yield, press 3">
      <Quotient label="First-pass yield" format="percent" target={0.95}>
        <Given label="Good parts" value={461} unit="pcs" />
        <Given label="Parts made" value={480} unit="pcs" />
      </Quotient>
    </Calculation>
  );
}
