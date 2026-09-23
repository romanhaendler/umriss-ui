import { Calculation, Given, Product, Quotient, Sum } from "../../../src";

export const title = "When the rounded figures do not add up";

/* Every operation uses the full value; rounding happens only on the screen.
   Three shares of 33.3 % each add up to 100 % - not to the 99.9 % a reader
   gets from the rounded figures. The line says so with "≈" and a note,
   instead of leaving the reader to find it. */
export default function Rounding() {
  return (
    <Calculation aria-label="Shares of the shift">
      <Sum label="All three lines" format="percent">
        {["Line 1", "Line 2", "Line 3"].map((line) => (
          <Quotient key={line} label={`Share of ${line}`} format="percent">
            <Product label={`Hours on ${line}`} unit="h">
              <Given label="Machines" value={2} />
              <Given label="Hours each" value={4} unit="h" />
            </Product>
            <Given label="Hours in the shift" value={24} unit="h" />
          </Quotient>
        ))}
      </Sum>
    </Calculation>
  );
}
