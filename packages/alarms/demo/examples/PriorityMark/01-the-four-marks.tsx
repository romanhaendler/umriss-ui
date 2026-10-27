import { Stack, Text } from "@umriss-ui/core";
import { PriorityMark } from "../../../src";
import type { Availability, LifecycleState, Priority } from "../../../src";

const PRIORITIES: readonly Priority[] = ["critical", "high", "medium", "low"];

const STATES: readonly { label: string; lifecycle: LifecycleState; availability?: Availability }[] = [
  { label: "Unacknowledged", lifecycle: "active-unacknowledged" },
  { label: "Acknowledged", lifecycle: "active-acknowledged" },
  { label: "Returned", lifecycle: "resolved-unacknowledged" },
  { label: "Shelved", lifecycle: "active-unacknowledged", availability: "snoozed" },
];

export const title = "The four marks";

export const lead = "Pass `priority`, and the alarm's `lifecycle` and `availability`: the unacknowledged mark flashes, the others stand still, and a shelved one is neutral.";

export default function TheFourMarks() {
  return (
    <Stack gap={3}>
      {STATES.map((state) => (
        <Stack key={state.label} direction="row" gap={4} align="center">
          <Text as="span" size="sm" tone="secondary" style={{ width: "8rem" }}>
            {state.label}
          </Text>
          {PRIORITIES.map((priority) => (
            <PriorityMark key={priority} priority={priority} lifecycle={state.lifecycle} availability={state.availability} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
