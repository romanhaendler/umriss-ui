import { useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, FormField, Grid, Select, Stack, Text } from "@umriss-ui/core";
import { Calculation, Difference, Given, Product, Ref, Sum } from "../../src";
import { APPROVALS, COST_CENTRES, INVOICES } from "@umriss-ui/demo/worlds/controlling";
import type { InvoiceLine } from "@umriss-ui/demo/worlds/controlling";

export const title = "Check an invoice before approving it";

export const lead =
  "A cost-centre owner or the finance team at Carrow & Lisle checks what an invoice adds up to - discounts, VAT per rate - before signing it off.";

export const callouts = [
  "The invoices waiting for a signature; the header names the supplier, the cost centre and the due date.",
  "Every line is worked out from quantity, unit price and discount; a discounted line folds open to the share that is paid.",
  "VAT is charged per rate, on the net of the lines that carry it - never on the gross amount.",
  "Who has signed already and who is still to sign.",
  "The decision is taken beside the working, not on a total read somewhere else.",
];

export const builtFrom = [
  "calculation",
  "tree",
  "given",
  { name: "Select", page: "@umriss-ui/core#select" },
  { name: "Card", page: "@umriss-ui/core#card" },
  { name: "Badge", page: "@umriss-ui/core#badge" },
  { name: "Button", page: "@umriss-ui/core#button" },
  { name: "Alert", page: "@umriss-ui/core#alert" },
];

const WAITING = INVOICES.filter((one) => one.status === "awaiting approval");
const DECISION_TONE = { approved: "success", rejected: "danger", pending: "neutral" } as const;
const date = (at: number) => new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const percent = (rate: number) => `${Math.round(rate * 100)} %`;

/** One line's net amount: quantity × unit price, times the share paid after a
    discount. A function and not a component: the calculation reads its
    elements by their type, so a wrapper of one's own would not be recognised. */
function lineNet(line: InvoiceLine, id: string) {
  return (
    <Product key={id} id={id} label={line.description} unit="€" decimals={2}>
      <Given label="Quantity" value={line.quantity} />
      <Given label="Unit price" value={line.unitPrice} unit="€" decimals={2} />
      {line.discount > 0 && (
        <Difference label="Share paid" format="percent">
          <Given label="List price" value={1} format="percent" />
          <Given label="Discount" value={line.discount} format="percent" source="Framework agreement" />
        </Difference>
      )}
    </Product>
  );
}

export default function CheckAnInvoice() {
  const [invoiceId, setInvoiceId] = useState(WAITING[0]!.id);
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({});
  const invoice = WAITING.find((one) => one.id === invoiceId) ?? WAITING[0]!;
  const centre = COST_CENTRES.find((one) => one.id === invoice.costCentre)!;
  const approvals = APPROVALS.filter((one) => one.invoice === invoice.id);
  const next = approvals.find((one) => one.decision === "pending");
  const decision = decided[invoice.id];

  const lineIds = invoice.lines.map((_, i) => `line-${i}`);
  const rates = [...new Set(invoice.lines.map((line) => line.vatRate))].filter((rate) => rate > 0);
  /* The net a rate is charged on: the whole net where every line carries it,
     one line on its own, or the sum of the lines that do. */
  const netAt = (rate: number) => {
    const ids = lineIds.filter((_, i) => invoice.lines[i]!.vatRate === rate);
    if (ids.length === lineIds.length) return <Ref to="net" />;
    if (ids.length === 1) return <Ref to={ids[0]!} />;
    return (
      <Sum label={`Net at ${percent(rate)}`} unit="€" decimals={2}>
        {ids.map((id) => (
          <Ref key={id} to={id} />
        ))}
      </Sum>
    );
  };
  const vatAt = (rate: number) => (
    <Product key={rate} label={`VAT ${percent(rate)}`} unit="€" decimals={2}>
      {netAt(rate)}
      <Given label="Rate" value={rate} format="percent" />
    </Product>
  );

  return (
    <Stack gap={4}>
      <Stack direction="row" gap={4} align="end" wrap data-callout="1">
        <FormField label="Invoice">
          <Select value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)}>
            {WAITING.map((one) => (
              <option key={one.id} value={one.id}>
                {one.id} · {one.supplier}
              </option>
            ))}
          </Select>
        </FormField>
        <Text size="sm" tone="muted">
          {invoice.supplier} · {centre.id} {centre.name} · received {date(invoice.received)} · due {date(invoice.due)}
        </Text>
      </Stack>

      <Grid minItemWidth="320px" gap={4}>
        <Card>
          <CardHeader title="Amount due" />
          <CardBody>
            <Stack gap={2}>
              <Text size="sm" tone="muted" data-callout="2">
                Each line: quantity × unit price × the share paid after its discount.
              </Text>
              <Calculation aria-label={`Amount due, invoice ${invoice.id}`}>
                <Sum label="Amount due" unit="€" decimals={2}>
                  {invoice.lines.length === 1 ? (
                    lineNet(invoice.lines[0]!, "net")
                  ) : (
                    <Sum id="net" label="Net total" unit="€" decimals={2}>
                      {invoice.lines.map((line, i) => lineNet(line, lineIds[i]!))}
                    </Sum>
                  )}
                  {rates.length === 1 ? (
                    vatAt(rates[0]!)
                  ) : (
                    <Sum label="VAT" unit="€" decimals={2}>
                      {rates.map(vatAt)}
                    </Sum>
                  )}
                </Sum>
              </Calculation>
              <Text size="sm" tone="muted" data-callout="3">
                VAT {rates.map(percent).join(" and ")}, each on the lines that carry it.
              </Text>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Approval" />
          <CardBody>
            <Stack gap={4}>
              <Stack gap={2} data-callout="4">
                {approvals.map((one) => (
                  <Stack key={one.step} direction="row" gap={3} align="center" wrap>
                    <Badge tone={DECISION_TONE[one.decision]}>{one.decision}</Badge>
                    <Text size="sm">
                      {one.step === "finance" ? "Finance" : "Cost centre"} · {one.approver}
                      {one.at !== undefined && ` · ${date(one.at)}`}
                    </Text>
                  </Stack>
                ))}
              </Stack>
              {decision === undefined ? (
                <Stack direction="row" gap={2} data-callout="5">
                  <Button variant="primary" onClick={() => setDecided({ ...decided, [invoice.id]: "approved" })}>
                    Approve as {next?.approver ?? "approver"}
                  </Button>
                  <Button variant="danger" onClick={() => setDecided({ ...decided, [invoice.id]: "rejected" })}>
                    Reject
                  </Button>
                </Stack>
              ) : (
                <Alert tone={decision === "approved" ? "success" : "danger"} title={`${invoice.id} ${decision}`} data-callout="5">
                  {decision === "approved" ? "It moves on to the next signature." : "The supplier is told why."}
                </Alert>
              )}
            </Stack>
          </CardBody>
        </Card>
      </Grid>
    </Stack>
  );
}
