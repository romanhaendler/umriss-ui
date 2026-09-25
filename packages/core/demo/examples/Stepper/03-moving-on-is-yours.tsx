import { useState } from "react";
import { Button, Stack, Stepper } from "../../../src";

export const title = "Moving on is the caller's";

/* The stepper has no key of its own: it shows where a procedure stands, and
   the application decides when it moves on - after a check, a signature, a
   message from the machine. Here two buttons stand for that decision. Past
   the last step every step is done. */

const STEPS = [{ label: "Choose recipe" }, { label: "Check materials" }, { label: "Confirm" }];

export default function MovingOnIsYours() {
  const [current, setCurrent] = useState(1);

  return (
    <Stack gap={4} style={{ maxWidth: 480 }}>
      <Stepper aria-label="Start a batch" steps={STEPS} current={current} />
      <Stack direction="row" gap={2}>
        <Button size="sm" variant="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          Back
        </Button>
        <Button size="sm" variant="primary" disabled={current === STEPS.length} onClick={() => setCurrent(current + 1)}>
          {current >= STEPS.length - 1 ? "Start" : "Next"}
        </Button>
      </Stack>
    </Stack>
  );
}
