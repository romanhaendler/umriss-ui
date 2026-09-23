import { Calculation, Given, Sum } from "../../../src";

export const title = "Two numbers and a sum";

/* The smallest calculation there is: two givens and the operator that joins
   them. The result stands beneath its operands under a rule, and the double
   rule says that this is where the calculation ends. Nothing here is typed in
   twice - the 1,000 is computed by the calculation, never handed to it. */
export default function FirstSum() {
  return (
    <Calculation aria-label="Output of press 3, Tuesday">
      <Sum label="Output, Tuesday" unit="pcs">
        <Given label="Early shift" value={512} unit="pcs" />
        <Given label="Late shift" value={488} unit="pcs" />
      </Sum>
    </Calculation>
  );
}
