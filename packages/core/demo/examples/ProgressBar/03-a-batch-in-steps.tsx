import { useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Divider, ProgressBar, Stack, Text } from "../../../src";

export const title = "A batch in its steps";

/* The full case: a batch of lemonade runs through four steps, each with its
   own bar, and the whole batch beside them. A step that has not begun shows
   0, the running one its share, and the step waiting on the lab is
   indeterminate - it runs, but the lab says when it is done, not the line.
   The overall share is derived from the steps and never stored.

   "Advance" stands in for the plant's messages. */

interface Step {
  name: string;
  litres: number;
}

const STEPS: Step[] = [
  { name: "Dissolve the sugar", litres: 3000 },
  { name: "Mix", litres: 12000 },
  { name: "Lab release", litres: 0 },
  { name: "Fill", litres: 12000 },
];

/** The litres done per step after `ticks` messages from the plant. */
function doneAfter(ticks: number): number[] {
  const done = [0, 0, 0, 0];
  let left = ticks;
  STEPS.forEach((step, i) => {
    const needed = step.litres === 0 ? 2 : 4;
    const taken = Math.min(left, needed);
    done[i] = (taken / needed) * (step.litres || 1);
    left -= taken;
  });
  return done;
}

export default function ABatchInSteps() {
  const [ticks, setTicks] = useState(6);
  const done = doneAfter(ticks);
  const share = (i: number) => done[i]! / (STEPS[i]!.litres || 1);
  const overall = STEPS.reduce((sum, _, i) => sum + share(i), 0) / STEPS.length;
  const running = STEPS.findIndex((_, i) => share(i) < 1);

  return (
    <Card style={{ maxWidth: 560 }}>
      <CardHeader
        eyebrow="Batch 2026-0317-B"
        title="Lemonade, 12,000 l"
        actions={<Badge>{running === -1 ? "Done" : `Step ${running + 1} of ${STEPS.length}`}</Badge>}
      />
      <CardBody>
        <Stack gap={4}>
          <ProgressBar value={overall} label="The whole batch" showLabel />
          <Divider />
          {STEPS.map((step, i) => {
            const waitingOnLab = step.litres === 0 && i === running;
            return (
              <Stack key={step.name} gap={1}>
                <Text size="sm">{step.name}</Text>
                {waitingOnLab ? (
                  <ProgressBar label={step.name} />
                ) : (
                  <ProgressBar
                    value={share(i)}
                    label={step.name}
                    showLabel
                    valueText={step.litres > 0 ? `${Math.round(done[i]!).toLocaleString("en")} of ${step.litres.toLocaleString("en")} l` : undefined}
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
