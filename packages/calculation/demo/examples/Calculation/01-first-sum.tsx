import { Calculation, Given, Sum } from "../../../src";

export const title = "Two numbers and a sum";
export const lead = "Two givens and the operator that joins them; the result stands beneath its operands, above a double rule.";

export default function FirstSum() {
  return (
    <Calculation aria-label="Parcels out of North depot, Tuesday">
      <Sum label="Parcels out, North depot" unit="parcels">
        <Given label="Morning tours" value={512} unit="parcels" />
        <Given label="Afternoon tours" value={488} unit="parcels" />
      </Sum>
    </Calculation>
  );
}
