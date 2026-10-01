import { useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, FormField, Grid, Select, Stack, Text } from "@umriss-ui/core";
import { Calculation, Difference, Given, Product, Ref, Sum } from "../../src";

/* Data from the controlling world, written out here so the example runs on its own. */

const on = (month: number, day: number) => new Date(2026, month - 1, day).getTime();

interface CostCentre {
  id: string;
  name: string;
  owner: string;
  /** The budget of one month. */
  monthlyBudget: number;
}

const COST_CENTRES: readonly CostCentre[] = [
  { id: "CC-1100", name: "Sales", owner: "Helen Marsh", monthlyBudget: 142_000 },
  { id: "CC-1200", name: "Marketing", owner: "Rafael Ortiz", monthlyBudget: 68_000 },
  { id: "CC-2100", name: "Engineering", owner: "Anika Sørensen", monthlyBudget: 188_000 },
  { id: "CC-2200", name: "Design", owner: "Paul Whitaker", monthlyBudget: 54_000 },
  { id: "CC-3100", name: "Customer service", owner: "Grace Obi", monthlyBudget: 61_000 },
  { id: "CC-4100", name: "Finance", owner: "Martina Vogel", monthlyBudget: 47_000 },
  { id: "CC-4200", name: "People", owner: "Daniel Frost", monthlyBudget: 39_000 },
  { id: "CC-4300", name: "IT", owner: "Kenji Arai", monthlyBudget: 83_000 },
  { id: "CC-4400", name: "Facilities", owner: "Olga Ivanova", monthlyBudget: 72_000 },
];

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

interface Approval {
  invoice: string;
  step: "cost centre" | "finance";
  approver: string;
  decision: "approved" | "rejected" | "pending";
  at?: number;
  comment?: string;
}

/** Two signatures an invoice needs: its cost centre's owner, then finance. */
const APPROVALS: readonly Approval[] = [
  { invoice: "INV-26-0318", step: "cost centre", approver: "Olga Ivanova", decision: "pending" },
  { invoice: "INV-26-0317", step: "cost centre", approver: "Rafael Ortiz", decision: "approved", at: on(3, 16) },
  { invoice: "INV-26-0317", step: "finance", approver: "Martina Vogel", decision: "pending" },
  { invoice: "INV-26-0309", step: "cost centre", approver: "Kenji Arai", decision: "approved", at: on(3, 10) },
  { invoice: "INV-26-0309", step: "finance", approver: "Martina Vogel", decision: "approved", at: on(3, 11) },
  { invoice: "INV-26-0302", step: "cost centre", approver: "Martina Vogel", decision: "approved", at: on(3, 3) },
  { invoice: "INV-26-0302", step: "finance", approver: "Martina Vogel", decision: "approved", at: on(3, 3) },
  { invoice: "INV-26-0226", step: "cost centre", approver: "Helen Marsh", decision: "approved", at: on(2, 27) },
  { invoice: "INV-26-0226", step: "finance", approver: "Martina Vogel", decision: "approved", at: on(3, 2) },
  { invoice: "INV-26-0221", step: "cost centre", approver: "Anika Sørensen", decision: "rejected", at: on(2, 24), comment: "Not ordered - the review was cancelled in January." },
];

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
const percent = (rate: number) => `${Math.round(rate * 100)}\u00a0%`;

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
                <Stack direction="row" gap={2} wrap data-callout="5">
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
