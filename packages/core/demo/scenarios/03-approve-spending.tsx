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
  useToast,
} from "../../src";
import type { LimitSet } from "../../src";
import { APPROVALS, COST_CENTRES, INVOICES, LEDGER } from "@umriss-ui/demo/worlds/controlling";
import type { Invoice } from "@umriss-ui/demo/worlds/controlling";

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

export default function ApproveSpending() {
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
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>{line.discount === 0 ? "-" : `${Math.round(line.discount * 100)} %`}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>{Math.round(line.vatRate * 100)} %</td>
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
