import { Calculation, Chain, Given, Interim, Plus, Product, Quotient, Ref, Sum, Times } from "../../../src";

export const title = "The cost per piece of a production order";

/* Everything at once, as an order is actually costed. The bill of material
   and the routing come from data; each becomes a tree of its own - quantity
   times price, minutes times the machine's rate per minute - and the two
   trees are lines of the costing sheet. Setup is spread over the lot size,
   the scrap surcharge and the overheads refer back to named interims, and the
   sheet ends in a net and a gross price.

   The scrap rate is three days old: its line says so, beside the number, and
   keeps its verdict. Some fifty quantities, and the reader sees five lines
   until they choose to see more. */

const BILL_OF_MATERIAL = [
  { part: "Steel sheet 2 mm", quantity: 1.84, unit: "kg", price: 1.35 },
  { part: "Tube 40×2", quantity: 0.62, unit: "m", price: 4.1 },
  { part: "Hinge", quantity: 2, unit: "pcs", price: 1.9 },
  { part: "Gas spring", quantity: 1, unit: "pcs", price: 6.4 },
  { part: "Screw M8×20", quantity: 8, unit: "pcs", price: 0.07 },
  { part: "Powder, RAL 7016", quantity: 0.21, unit: "kg", price: 9.8 },
];

const ROUTING = [
  { station: "Laser cutting", minutes: 2.4, rate: 96 },
  { station: "Bending", minutes: 1.8, rate: 72 },
  { station: "Welding", minutes: 4.2, rate: 84 },
  { station: "Powder coating", minutes: 1.5, rate: 60 },
  { station: "Assembly", minutes: 3.0, rate: 54 },
];

const AGES = { stale: 24 * 3_600_000, lost: 14 * 24 * 3_600_000 };

export default function CostPerPiece() {
  return (
    <Calculation aria-label="Cost per piece, order A-2041, lot of 250">
      <Chain>
        <Sum id="material" label="Direct material" unit="€" decimals={2}>
          {BILL_OF_MATERIAL.map((line) => (
            <Product key={line.part} label={line.part} unit="€" decimals={2}>
              <Given label={`Quantity, ${line.part}`} value={line.quantity} unit={line.unit} />
              <Given label={`Price, ${line.part}`} value={line.price} unit={`€/${line.unit}`} />
            </Product>
          ))}
        </Sum>
        <Plus>
          <Product label="Material overhead" unit="€" decimals={2}>
            <Given label="Material overhead rate" value={0.12} format="percent" source="Cost centre accounting 2026" />
            <Ref to="material" />
          </Product>
        </Plus>
        <Interim label="Material cost" unit="€" decimals={2} />
        <Plus>
          <Sum label="Machine time" unit="€" decimals={2}>
            {ROUTING.map((step) => (
              <Product key={step.station} label={step.station} unit="€" decimals={2}>
                <Given label={`Minutes, ${step.station.toLowerCase()}`} value={step.minutes} unit="min" />
                <Quotient label={`Rate per minute, ${step.station.toLowerCase()}`} unit="€/min" decimals={3}>
                  <Given label={`Machine hour rate, ${step.station.toLowerCase()}`} value={step.rate} unit="€/h" />
                  <Given label="Minutes per hour" value={60} unit="min/h" />
                </Quotient>
              </Product>
            ))}
          </Sum>
        </Plus>
        <Plus>
          <Quotient label="Setup per piece" unit="€" decimals={2}>
            <Product label="Setup cost" unit="€" decimals={2}>
              <Given label="Setup time" value={1.5} unit="h" />
              <Given label="Setup rate" value={78} unit="€/h" />
            </Product>
            <Given label="Lot size" value={250} unit="pcs" />
          </Quotient>
        </Plus>
        <Interim id="production" label="Production cost" unit="€" decimals={2} />
        <Plus>
          <Product label="Scrap surcharge" unit="€" decimals={2}>
            <Given
              label="Scrap rate"
              value={0.032}
              format="percent"
              source="MES, last 30 days"
              asOf={new Date(2026, 2, 14, 6, 0)}
              ages={AGES}
            />
            <Ref to="production" />
          </Product>
        </Plus>
        <Plus>
          <Product label="Administration and sales overhead" unit="€" decimals={2}>
            <Given label="Overhead rate" value={0.14} format="percent" source="Cost centre accounting 2026" />
            <Ref to="production" />
          </Product>
        </Plus>
        <Interim label="Cost price" unit="€" decimals={2} />
        <Times label="Profit mark-up" value={1.1} />
        <Interim label="Net price per piece" unit="€" decimals={2} target={85} />
        <Times label="VAT factor" value={1.19} />
        <Interim label="Gross price per piece" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
