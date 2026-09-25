import { useState } from "react";
import { Alert, Button, Card, CardBody, CardHeader, ProgressBar, Stack, Stepper, Text } from "../../../src";

export const title = "A filler's changeover";

/* The full case: a changeover from one bottle format to the next, with the
   stepper at the head of the card and the current step's detail beneath it -
   how far it has come, and what the operator does next. When the machine
   reports a fault, the step is marked failed where it stands; the message
   says what went wrong and offers the one way on. The stepper only shows it:
   whether a failed step is repeated or skipped is the application's rule. */

const STEPS = [
  { label: "Stop line" },
  { label: "Drain" },
  { label: "Change parts", description: "Format 0.5 l → 1.0 l" },
  { label: "Clean", description: "CIP, 20 minutes" },
  { label: "Release" },
];

export default function AChangeover() {
  const [fault, setFault] = useState(false);
  const current = 3;
  const steps = STEPS.map((step, index) => (index === current && fault ? { ...step, failed: true } : step));

  return (
    <Card style={{ maxWidth: 720 }}>
      <CardHeader
        eyebrow="Filler F1 · line 3"
        title="Changeover to 1.0 l"
        actions={
          <Button size="sm" variant="ghost" onClick={() => setFault(true)} disabled={fault}>
            Report a fault
          </Button>
        }
      />
      <CardBody>
        <Stack gap={5}>
          <Stepper aria-label="Changeover" steps={steps} current={current} />
          {fault ? (
            <Alert
              tone="danger"
              title="Cleaning stopped"
              actions={
                <Button size="sm" variant="secondary" onClick={() => setFault(false)}>
                  Repeat the step
                </Button>
              }
            >
              The return temperature fell below 75 °C after 8 minutes.
            </Alert>
          ) : (
            <Stack gap={2}>
              <Text size="sm">Cleaning in place - 8 of 20 minutes</Text>
              <ProgressBar value={0.4} label="Cleaning" valueText="8 of 20 minutes" />
            </Stack>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}
