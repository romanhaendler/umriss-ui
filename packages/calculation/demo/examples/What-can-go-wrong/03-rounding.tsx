import { Calculation, Given, Quotient, Sum } from "../../../src";

export const title = "Rounded figures that do not add up";
export const lead = "Operations use full values and only the screen rounds; where the rounded operands miss the rounded result, the line says so with ≈.";

const PEOPLE = ["Arjun Mehta", "Chloe Durand", "Eva Novak"];

export default function Rounding() {
  return (
    <Calculation aria-label="Shares of the booking app release">
      <Sum label="All three" format="percent">
        {PEOPLE.map((person) => (
          <Quotient key={person} label={`Share, ${person}`} format="percent">
            <Given label={`Hours, ${person}`} value={12} unit="h" />
            <Given label="Hours on the release" value={36} unit="h" />
          </Quotient>
        ))}
      </Sum>
    </Calculation>
  );
}
