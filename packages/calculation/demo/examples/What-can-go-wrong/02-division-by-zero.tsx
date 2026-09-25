import { Calculation, Given, Product, Quotient, Sum } from "../../../src";

export const title = "A division by zero";
export const lead = "A tour that delivered nothing has no cost per parcel – not zero, not infinity; the quotient is absent with its own reason.";

export default function DivisionByZero() {
  return (
    <Calculation aria-label="Planned cost of tomorrow's parcels, tour T-07">
      <Product label="Cost of tomorrow's 80 parcels" unit="€" decimals={2}>
        <Quotient label="Cost per parcel, tour T-07" unit="€/parcel" decimals={2}>
          <Sum label="Cost of tour T-07" unit="€" decimals={2}>
            <Given label="Driver, standby" value={69} unit="€" decimals={2} />
            <Given label="E-van, one day" value={72} unit="€" decimals={2} />
          </Sum>
          <Given label="Parcels delivered" value={0} unit="parcels" />
        </Quotient>
        <Given label="Parcels planned for tomorrow" value={80} unit="parcels" />
      </Product>
    </Calculation>
  );
}
