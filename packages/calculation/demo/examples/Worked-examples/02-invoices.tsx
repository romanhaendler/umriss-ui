import type { ReactElement } from "react";
import { Calculation, Chain, Difference, Given, Interim, Plus, Product, Ref, Sum } from "../../../src";

/* Data from the controlling world, written out here so the example runs on its own. */

const on = (month: number, day: number) => new Date(2026, month - 1, day).getTime();

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  /** A fraction: 0.1 is ten per cent off. */
  discount: number;
  /** A fraction: 0.19 or 0.07, or 0 where no VAT is charged. */
  vatRate: number;
}

interface Invoice {
  id: string;
  supplier: string;
  costCentre: string;
  received: number;
  due: number;
  status: "awaiting approval" | "approved" | "paid" | "rejected";
  lines: readonly InvoiceLine[];
}

const INVOICES: readonly Invoice[] = [
  {
    id: "INV-26-0318", supplier: "Brandlow Office Supply", costCentre: "CC-4400", received: on(3, 16), due: on(4, 15), status: "awaiting approval",
    lines: [
      { description: "Desk lamps, LED", quantity: 24, unitPrice: 48.9, discount: 0.1, vatRate: 0.19 },
      { description: "Printer paper, box of 5 reams", quantity: 40, unitPrice: 21.5, discount: 0, vatRate: 0.19 },
      { description: "Delivery", quantity: 1, unitPrice: 35, discount: 0, vatRate: 0.19 },
    ],
  },
  {
    id: "INV-26-0317", supplier: "Kettering & Shaw Events", costCentre: "CC-1200", received: on(3, 13), due: on(4, 12), status: "awaiting approval",
    lines: [
      { description: "Trade fair stand, 3 days", quantity: 1, unitPrice: 12_400, discount: 0.05, vatRate: 0.19 },
      { description: "Catering, per guest", quantity: 180, unitPrice: 18.5, discount: 0, vatRate: 0.07 },
    ],
  },
  {
    id: "INV-26-0309", supplier: "Nimbrel Software", costCentre: "CC-4300", received: on(3, 9), due: on(4, 8), status: "approved",
    lines: [
      { description: "Design tool licences, annual", quantity: 12, unitPrice: 540, discount: 0.15, vatRate: 0.19 },
      { description: "Onboarding session", quantity: 2, unitPrice: 890, discount: 0, vatRate: 0.19 },
    ],
  },
  {
    id: "INV-26-0302", supplier: "Fenwright Legal", costCentre: "CC-4100", received: on(3, 2), due: on(3, 16), status: "paid",
    lines: [{ description: "Contract review, hours", quantity: 14.5, unitPrice: 260, discount: 0, vatRate: 0.19 }],
  },
  {
    id: "INV-26-0226", supplier: "Corrin Travel", costCentre: "CC-1100", received: on(2, 26), due: on(3, 12), status: "paid",
    lines: [
      { description: "Rail tickets, sales conference", quantity: 22, unitPrice: 139, discount: 0, vatRate: 0.07 },
      { description: "Hotel, nights", quantity: 44, unitPrice: 112, discount: 0.08, vatRate: 0.07 },
    ],
  },
  {
    id: "INV-26-0221", supplier: "Stellbrook Consulting", costCentre: "CC-2100", received: on(2, 21), due: on(3, 23), status: "rejected",
    lines: [{ description: "Architecture review, days", quantity: 6, unitPrice: 1450, discount: 0, vatRate: 0 }],
  },
];

export const title = "Invoices with discount and VAT";
export const lead = "Each invoice is a chain from its lines, discounts and VAT by rate; as operands of one sum they fold to their totals.";

const OPEN = INVOICES.filter((invoice) => invoice.status === "awaiting approval" || invoice.status === "approved");
const percent = (rate: number) => `${Math.round(rate * 100)} %`;

/* A sum needs two operands; one stands for itself. */
const sumOf = (label: string, operands: ReactElement[]) =>
  operands.length === 1 ? operands[0] : (
    <Sum label={label} unit="€" decimals={2}>
      {operands}
    </Sum>
  );

function invoiceChain(invoice: Invoice) {
  const lineId = (index: number) => `${invoice.id}-line-${index}`;
  const rates = [...new Set(invoice.lines.map((line) => line.vatRate))];
  return (
    <Chain key={invoice.id}>
      {sumOf(
        `Net, ${invoice.id}`,
        invoice.lines.map((line, index) => {
          const amount = (
            <Product key={index} id={line.discount === 0 ? lineId(index) : `${lineId(index)}-list`} label={line.description} unit="€" decimals={2}>
              <Given label={`Quantity, ${line.description}`} value={line.quantity} />
              <Given label={`Unit price, ${line.description}`} value={line.unitPrice} unit="€" decimals={2} />
            </Product>
          );
          if (line.discount === 0) return amount;
          return (
            <Difference key={index} id={lineId(index)} label={`${line.description}, after discount`} unit="€" decimals={2}>
              {amount}
              <Product label={`Discount, ${line.description}`} unit="€" decimals={2}>
                <Given label={`Discount rate, ${line.description}`} value={line.discount} format="percent" />
                <Ref to={`${lineId(index)}-list`} />
              </Product>
            </Difference>
          );
        }),
      )}
      <Plus>
        {sumOf(
          `VAT, ${invoice.id}`,
          rates.map((rate) => {
            const lines = invoice.lines.flatMap((line, index) => (line.vatRate === rate ? [<Ref key={index} to={lineId(index)} />] : []));
            return (
              <Product key={rate} label={`VAT at ${percent(rate)}, ${invoice.id}`} unit="€" decimals={2}>
                <Given label={`VAT rate ${percent(rate)}`} value={rate} format="percent" />
                {sumOf(`Net at ${percent(rate)}, ${invoice.id}`, lines)}
              </Product>
            );
          }),
        )}
      </Plus>
      <Interim label={`${invoice.id}, ${invoice.supplier}`} unit="€" decimals={2} />
    </Chain>
  );
}

export default function Invoices() {
  return (
    <Calculation aria-label="Invoices to be paid, March">
      <Sum label="To be paid" unit="€" decimals={2}>
        {OPEN.map(invoiceChain)}
      </Sum>
    </Calculation>
  );
}
