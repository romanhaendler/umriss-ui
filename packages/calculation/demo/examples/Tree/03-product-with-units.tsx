import { Calculation, Given, Product } from "../../../src";

export const title = "A product with units";

/* A unit is a label the caller writes; nothing converts or checks it. The
   product of kW and h is written as kWh because the caller says so - the
   calculation does no unit algebra, and does not pretend to. `decimals` fixes
   the places shown; the operation uses the full value. */
export default function ProductWithUnits() {
  return (
    <Calculation aria-label="Energy of the furnace, one shift">
      <Product label="Energy, one shift" unit="kWh" decimals={1}>
        <Given label="Mean power" value={86.35} unit="kW" />
        <Given label="Hours at temperature" value={7.25} unit="h" />
      </Product>
    </Calculation>
  );
}
