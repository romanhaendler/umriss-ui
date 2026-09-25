import { useState } from "react";
import { Button, Stack, Stepper } from "../../../src";

export const title = "Move on yourself";
export const lead = "The stepper has no keys of its own: your application sets `current` after its own check, here behind two buttons.";

const STEPS = [{ label: "Choose people" }, { label: "Set capacity" }, { label: "Plan leave" }, { label: "Confirm" }];

export default function MoveOnYourself() {
  const [current, setCurrent] = useState(1);

  return (
    <Stack gap={4} style={{ maxWidth: 560 }}>
      <Stepper aria-label="Set up sprint 15" steps={STEPS} current={current} />
      <Stack direction="row" gap={2}>
        <Button size="sm" variant="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          Back
        </Button>
        <Button size="sm" variant="primary" disabled={current === STEPS.length} onClick={() => setCurrent(current + 1)}>
          {current >= STEPS.length - 1 ? "Start the sprint" : "Next"}
        </Button>
      </Stack>
    </Stack>
  );
}
