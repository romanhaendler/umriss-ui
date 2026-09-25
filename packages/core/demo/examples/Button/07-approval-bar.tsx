import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Stack, Text } from "../../../src";
import { APPROVALS } from "@umriss-ui/demo/worlds/controlling";

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
