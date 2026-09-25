import type { ReactElement } from "react";
import { INVOICES } from "@umriss-ui/demo/worlds/controlling";
import type { Invoice } from "@umriss-ui/demo/worlds/controlling";
import { Calculation, Chain, Difference, Given, Interim, Plus, Product, Ref, Sum } from "../../../src";

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
