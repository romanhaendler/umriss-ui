import { useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Divider, ProgressBar, Stack, Text } from "../../../src";

export const title = "Follow a job through its steps";
export const lead = "One bar per step and one for the whole, derived from the steps; the step waiting on a person runs without a figure.";

interface Step {
  name: string;
  /** Items to work through; 0 for a step that waits on someone. */
  items: number;
  unit: string;
}

const STEPS: Step[] = [
  { name: "Import the bank statements", items: 4, unit: "accounts" },
  { name: "Match payments to invoices", items: 312, unit: "payments" },
  { name: "Controller's sign-off", items: 0, unit: "" },
  { name: "Post to the ledger", items: 9, unit: "cost centres" },
];

/** The share done per step after `ticks` updates from the server. */
function sharesAfter(ticks: number): number[] {
  let left = ticks;
  return STEPS.map((step) => {
    const needed = step.items === 0 ? 2 : 4;
    const taken = Math.min(left, needed);
    left -= taken;
    return taken / needed;
  });
}

export default function ACloseInSteps() {
  const [ticks, setTicks] = useState(6);
  const shares = sharesAfter(ticks);
  const overall = shares.reduce((sum, share) => sum + share, 0) / STEPS.length;
  const running = shares.findIndex((share) => share < 1);

  return (
    <Card style={{ maxWidth: 560 }}>
      <CardHeader
        eyebrow="Month-end close"
        title="February 2026"
        actions={<Badge>{running === -1 ? "Done" : `Step ${running + 1} of ${STEPS.length}`}</Badge>}
      />
      <CardBody>
        <Stack gap={4}>
          <ProgressBar value={overall} label="The whole close" showLabel />
          <Divider />
          {STEPS.map((step, i) => {
            const share = shares[i]!;
            const waiting = step.items === 0 && i === running;
            return (
              <Stack key={step.name} gap={1}>
                <Text size="sm">{step.name}</Text>
                {waiting ? (
                  <ProgressBar label={step.name} />
                ) : (
                  <ProgressBar
                    value={share}
                    label={step.name}
                    showLabel
                    valueText={step.items > 0 ? `${Math.round(share * step.items)} of ${step.items} ${step.unit}` : undefined}
                  />
                )}
              </Stack>
            );
          })}
          <Stack direction="row" gap={2}>
            <Button onClick={() => setTicks((t) => Math.min(t + 1, 14))}>Advance</Button>
            <Button variant="ghost" onClick={() => setTicks(0)}>
              Start again
            </Button>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}
