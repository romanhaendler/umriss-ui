import { useEffect, useRef, useState } from "react";
import { Button, Stack, Stepper, Text } from "../../../src";

export const title = "Move on yourself";
export const lead =
  "The stepper has no keys or clicks of its own: your application sets `current`, behind two buttons or a done step's label, and moves the focus to the new step's heading.";

const LABELS = ["Choose people", "Set capacity", "Plan leave", "Confirm"];

export default function MoveOnYourself() {
  const [current, setCurrent] = useState(2);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  /* Not on the first render: the focus moves because a step changed. */
  useEffect(() => {
    if (moved.current) heading.current?.focus();
    moved.current = true;
  }, [current]);

  /* A done step's label is a button that goes back to it. */
  const steps = LABELS.map((label, index) => ({
    label:
      index < current ? (
        <Button size="sm" variant="plain" onClick={() => setCurrent(index)}>
          {label}
        </Button>
      ) : (
        label
      ),
  }));

  return (
    <Stack gap={4} style={{ maxWidth: 560 }}>
      <Stepper aria-label="Set up sprint 15" steps={steps} current={current} />
      <Text as="h3" size="lg" weight="semibold" ref={heading} tabIndex={-1} style={{ outline: "none" }}>
        {LABELS[current] ?? "Sprint 15 is running"}
      </Text>
      <Stack direction="row" gap={2}>
        <Button size="sm" variant="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          Back
        </Button>
        <Button size="sm" variant="primary" disabled={current === LABELS.length} onClick={() => setCurrent(current + 1)}>
          {current >= LABELS.length - 1 ? "Start the sprint" : "Next"}
        </Button>
      </Stack>
    </Stack>
  );
}
