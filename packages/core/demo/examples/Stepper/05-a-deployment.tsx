import { useState } from "react";
import { Alert, Button, Card, CardBody, CardHeader, ProgressBar, Stack, Stepper, Text } from "../../../src";

export const title = "A deployment";
export const lead = "At a card's head the stepper shows where a rollout stands; a failed step is marked in place and an alert offers the way on.";

const STEPS = [
  { label: "Build" },
  { label: "Test" },
  { label: "Canary", description: "5 % of traffic, 15 minutes" },
  { label: "Roll out", description: "All regions" },
  { label: "Verify" },
];

export default function ADeployment() {
  const [failed, setFailed] = useState(false);
  const current = 2;
  const steps = STEPS.map((step, index) => (index === current && failed ? { ...step, failed: true } : step));

  return (
    <Card style={{ maxWidth: 720 }}>
      <CardHeader
        eyebrow="Checkout · release 2026.03.17-2"
        title="Cap payment retries at one"
        actions={
          <Button size="sm" variant="ghost" onClick={() => setFailed(true)} disabled={failed}>
            Fail the canary
          </Button>
        }
      />
      <CardBody>
        <Stack gap={5}>
          <Stepper aria-label="Deployment" steps={steps} current={current} />
          {failed ? (
            <Alert
              tone="danger"
              title="Canary stopped"
              actions={
                <Button size="sm" variant="secondary" onClick={() => setFailed(false)}>
                  Retry the canary
                </Button>
              }
            >
              The error rate on the canary rose to 2.4 %, above the 1 % the rollout allows.
            </Alert>
          ) : (
            <Stack gap={2}>
              <Text size="sm">Canary on 5 % of traffic - 6 of 15 minutes</Text>
              <ProgressBar value={0.4} label="Canary" valueText="6 of 15 minutes" />
            </Stack>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}
