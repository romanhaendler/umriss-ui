import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  FormField,
  Grid,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  RadioGroup,
  Stack,
  Stat,
  Stepper,
  Text,
  Textarea,
  ToastProvider,
  useToast,
} from "../../src";
import type { LimitSet } from "../../src";

/* Data from the controlling world, written out here so the example runs on its own. */
/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

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

/** The year's months, as `"2026-01"` … `"2026-12"`. */
const MONTHS: readonly string[] = Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, "0")}`);

/** The months whose books are closed: they have an actual. */
const CLOSED_MONTHS = 2;

interface LedgerRow {
  costCentre: string;
  month: string;
  budget: number;
  /** `null` while the month is open. */
  actual: number | null;
  forecast: number;
}

/* Where a cost centre lands against its budget, as a factor: Marketing's
   spring campaign overspends, IT's delayed licences underspend. */
const TENDENCY: Readonly<Record<string, number>> = { "CC-1200": 1.14, "CC-4300": 0.88 };

/** Budget, actual and forecast of every cost centre in every month. */
const LEDGER: readonly LedgerRow[] = COST_CENTRES.flatMap((centre, c) => {
  const r = random(310 + c);
  const tendency = TENDENCY[centre.id] ?? 1;
  return MONTHS.map((month, m) => {
    /* December pays the bonuses, August is the quiet month. */
    const season = m === 11 ? 1.12 : m === 7 ? 0.9 : 1;
    const budget = Math.round(centre.monthlyBudget * season);
    const forecast = Math.round((budget * (tendency + (r() - 0.5) * 0.06)) / 100) * 100;
    const actual = m < CLOSED_MONTHS ? Math.round(forecast * (1 + (r() - 0.5) * 0.08)) : null;
    return { costCentre: centre.id, month, budget, actual, forecast };
  });
});

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

export const title = "Approve spending against a budget";

export const lead =
  "The finance controller at Carrow & Lisle signs off incoming invoices, each read against what its cost centre has left for the quarter.";

export const callouts = [
  "The queue holds the invoices waiting for finance; one still waiting for its cost centre stays visible but cannot be chosen.",
  "The lines show quantity, price, discount and VAT, and add up to the totals below them.",
  "The tiles read the quarter's spending against the budget, before and after this invoice, and say the verdict in a word.",
  "The stepper shows who has signed and whose turn it is.",
  "Approving asks once more, and says by how much the invoice takes the cost centre over its budget.",
  "Rejecting needs a reason, which goes back to the cost centre's owner.",
];

export const builtFrom = ["radiogroup", "card", "badge", "stat", "stepper", "confirmdialog", "modal", "formfield", "textarea", "toast"];

const ME = "Martina Vogel";
const QUARTER = ["2026-01", "2026-02", "2026-03"];

const euro = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" });
const day = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const net = (invoice: Invoice) =>
  invoice.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice * (1 - line.discount), 0);
const vat = (invoice: Invoice) =>
  invoice.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice * (1 - line.discount) * line.vatRate, 0);

/* The quarter so far: the closed months' actuals and March's forecast. */
function quarter(costCentre: string) {
  const rows = LEDGER.filter((row) => row.costCentre === costCentre && QUARTER.includes(row.month));
  return {
    budget: rows.reduce((sum, row) => sum + row.budget, 0),
    spent: rows.reduce((sum, row) => sum + (row.actual ?? row.forecast), 0),
  };
}

const AGAINST_BUDGET: LimitSet = {
  target: 100,
  limits: [
    { value: 100, side: "upper", severity: "warning" },
    { value: 110, side: "upper", severity: "alarm" },
  ],
};

const WAITING = INVOICES.filter((one) => one.status === "awaiting approval");

type Decision = "approved" | "rejected";

function Content() {
  const { toast } = useToast();
  const [chosen, setChosen] = useState("INV-26-0317");
  const [decisions, setDecisions] = useState<Readonly<Record<string, Decision>>>({});
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [tried, setTried] = useState(false);

  const invoice = INVOICES.find((one) => one.id === chosen)!;
  const centre = COST_CENTRES.find((one) => one.id === invoice.costCentre)!;
  const signatures = APPROVALS.filter((one) => one.invoice === invoice.id);
  const pending = signatures.find((one) => one.decision === "pending");
  const decided = decisions[invoice.id];
  const { budget, spent } = quarter(centre.id);
  const before = (spent / budget) * 100;
  const after = ((spent + net(invoice)) / budget) * 100;

  const decide = (decision: Decision) => {
    setDecisions((all) => ({ ...all, [invoice.id]: decision }));
    setConfirming(false);
    setRejecting(false);
    toast({
      title: `${invoice.id} ${decision}`,
      description: decision === "approved" ? "It goes to the next payment run." : `${centre.owner} has been told why.`,
      tone: decision === "approved" ? "success" : "neutral",
    });
  };

  const steps = [
    ...signatures.map((one) => ({
      label: one.step === "finance" ? "Finance" : "Cost centre",
      description: one.decision === "pending" ? (decided ? "You, today" : one.approver) : `${one.approver}, ${day(one.at!)}`,
      failed: one.decision === "rejected" || (one.decision === "pending" && decided === "rejected"),
    })),
    { label: "Payment", description: `Due ${day(invoice.due)}` },
  ];
  const current = decided === "approved" ? signatures.length : signatures.findIndex((one) => one.decision === "pending");

  return (
    <Stack direction="row" gap={4} align="flex-start" wrap>
      <Card style={{ flex: "1 1 240px", maxWidth: 340 }}>
        <CardHeader title="Waiting for finance" />
        <CardBody>
          <div data-callout="1">
            <RadioGroup
              aria-label="Invoices waiting for approval"
              value={chosen}
              onChange={setChosen}
              options={WAITING.map((one) => {
                const step = APPROVALS.find((a) => a.invoice === one.id && a.decision === "pending");
                const mine = step?.approver === ME;
                return {
                  value: one.id,
                  label: `${one.id} · ${one.supplier}`,
                  description: decisions[one.id]
                    ? `${decisions[one.id] === "approved" ? "Approved" : "Rejected"} by you`
                    : mine
                      ? `${euro.format(net(one))} net, due ${day(one.due)}`
                      : `Waiting for the cost centre, ${step?.approver}`,
                  disabled: !mine,
                };
              })}
            />
          </div>
        </CardBody>
      </Card>

      <Card style={{ flex: "3 1 420px" }}>
        <CardHeader
          eyebrow={`${centre.name} · ${centre.id}`}
          title={
            <Stack direction="row" gap={2} align="center">
              {invoice.supplier}
              {decided && <Badge tone={decided === "approved" ? "success" : "danger"}>{decided === "approved" ? "Approved" : "Rejected"}</Badge>}
            </Stack>
          }
          actions={
            <Stack direction="row" gap={2}>
              <Button size="sm" variant="secondary" data-callout="6" disabled={decided !== undefined || pending?.approver !== ME} onClick={() => setRejecting(true)}>
                Reject
              </Button>
              <Button size="sm" variant="primary" data-callout="5" disabled={decided !== undefined || pending?.approver !== ME} onClick={() => setConfirming(true)}>
                Approve
              </Button>
            </Stack>
          }
        />
        <CardBody>
          <Stack gap={4}>
            <Stepper aria-label="Signatures" data-callout="4" steps={steps} current={current} />

            <div data-callout="2" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--u-text-sm)" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--u-color-text-secondary)" }}>
                    <th style={{ fontWeight: 500, padding: "4px 8px 4px 0" }}>Line</th>
                    <th style={{ fontWeight: 500, padding: "4px 8px", textAlign: "right" }}>Qty</th>
                    <th style={{ fontWeight: 500, padding: "4px 8px", textAlign: "right" }}>Unit price</th>
                    <th style={{ fontWeight: 500, padding: "4px 8px", textAlign: "right" }}>Discount</th>
                    <th style={{ fontWeight: 500, padding: "4px 8px", textAlign: "right" }}>VAT</th>
                    <th style={{ fontWeight: 500, padding: "4px 0 4px 8px", textAlign: "right" }}>Net</th>
                  </tr>
                </thead>
                <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                  {invoice.lines.map((line) => (
                    <tr key={line.description} style={{ borderTop: "1px solid var(--u-hairline-strong)" }}>
                      <td style={{ padding: "6px 8px 6px 0" }}>{line.description}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>{line.quantity}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>{euro.format(line.unitPrice)}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>{line.discount === 0 ? "-" : `${Math.round(line.discount * 100)}\u00a0%`}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>{`${Math.round(line.vatRate * 100)}\u00a0%`}</td>
                      <td style={{ padding: "6px 0 6px 8px", textAlign: "right" }}>
                        {euro.format(line.quantity * line.unitPrice * (1 - line.discount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Stack gap={1} align="flex-end" style={{ marginTop: 8 }}>
                <Text size="sm" tone="secondary">
                  Net {euro.format(net(invoice))} · VAT {euro.format(vat(invoice))}
                </Text>
                <Text weight="semibold">Total {euro.format(net(invoice) + vat(invoice))}</Text>
              </Stack>
            </div>

            <Grid minItemWidth="180px" gap={4} data-callout="3">
              <Stat label={`${centre.name} · Q1 so far`} value={before} unit="% of budget" decimals={1} limits={AGAINST_BUDGET} />
              <Stat label="With this invoice" value={after} unit="% of budget" decimals={1} limits={AGAINST_BUDGET} />
              <Stat label="Q1 budget" value={budget} unit="€" decimals={0} />
            </Grid>
          </Stack>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => decide("approved")}
        title={after > 100 ? `Approve ${invoice.id} over budget?` : `Approve ${invoice.id}?`}
        description={
          after > 100
            ? `${centre.name} stands at ${before.toFixed(1)} % of its first-quarter budget; this invoice takes it to ${after.toFixed(1)} %, ${euro.format(spent + net(invoice) - budget)} over.`
            : `${euro.format(net(invoice) + vat(invoice))} goes to the next payment run.`
        }
        confirmLabel="Approve"
      />

      <Modal open={rejecting} onClose={() => setRejecting(false)} size="sm">
        <ModalHeader title={`Reject ${invoice.id}`} description={`The reason goes to ${centre.owner}, who owns ${centre.name}.`} />
        <ModalBody>
          <FormField label="Reason" required error={tried && reason.trim() === "" ? "Say why, so the owner can act on it." : undefined}>
            <Textarea autoGrow maxRows={6} value={reason} onChange={(event) => setReason(event.target.value)} />
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setRejecting(false)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              setTried(true);
              if (reason.trim() !== "") decide("rejected");
            }}
          >
            Reject
          </Button>
        </ModalFooter>
      </Modal>
    </Stack>
  );
}

/* `useToast` needs a `ToastProvider` above it; at the root of an application
   one provider serves every screen. */
export default function ApproveSpending() {
  return (
    <ToastProvider>
      <Content />
    </ToastProvider>
  );
}
