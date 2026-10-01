import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Stack, Text } from "../../../src";

/* Data from the controlling world, written out here so the example runs on its own. */
const on = (month: number, day: number) => new Date(2026, month - 1, day).getTime();

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

export const title = "Build an approval bar";
export const lead = "One primary action, the alternatives quieter beside it, the destructive one set apart, and every button busy while its request runs.";

type Decision = "approve" | "return" | "reject";

const DONE: Record<Decision, string> = {
  approve: "Approved - passed on to finance.",
  return: "Sent back to the requester.",
  reject: "Rejected.",
};

export default function ApprovalBar() {
  const approval = APPROVALS[0]!;
  const [running, setRunning] = useState<Decision | null>(null);
  const [decided, setDecided] = useState<Decision | null>(null);

  const decide = (decision: Decision) => {
    setRunning(decision);
    window.setTimeout(() => {
      setRunning(null);
      setDecided(decision);
    }, 1000);
  };

  const busy = running !== null || decided !== null;

  return (
    <Card>
      <CardHeader eyebrow="Approval" title={`Invoice ${approval.invoice}`} />
      <CardBody>
        <Stack gap={4}>
          <Text size="sm" tone="secondary">
            {decided === null ? `Waiting for ${approval.approver}, ${approval.step} step` : DONE[decided]}
          </Text>
          <Stack direction="row" gap={3} wrap align="center">
            <Button variant="primary" loading={running === "approve"} disabled={busy} onClick={() => decide("approve")}>
              Approve
            </Button>
            <Button loading={running === "return"} disabled={busy} onClick={() => decide("return")}>
              Send back
            </Button>
            <span style={{ flex: 1 }} />
            <Button variant="danger" loading={running === "reject"} disabled={busy} onClick={() => decide("reject")}>
              Reject
            </Button>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}
