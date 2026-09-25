import { Badge, Stack, Text } from "../../../src";
import type { BadgeTone } from "../../../src";
import { WORK } from "@umriss-ui/demo/worlds/planning";
import type { WorkItem } from "@umriss-ui/demo/worlds/planning";

export const title = "Mark the state of each row";
export const lead = "In a list the badges line up in one column, so the eye runs down the states without reading every title.";

const TONE: Record<WorkItem["status"], BadgeTone> = {
  "to do": "neutral",
  "in progress": "accent",
  "in review": "warning",
  done: "success",
};

export default function InAList() {
  return (
    <Stack gap={2} style={{ maxWidth: 520 }}>
      {WORK.filter((item) => item.task === "portal").map((item) => (
        <Stack key={item.id} direction="row" gap={3} align="center">
          <Text as="span" size="sm" mono tone="muted">
            {item.id}
          </Text>
          <Text as="span" size="sm" style={{ flex: 1 }}>
            {item.name}
          </Text>
          <Badge tone={TONE[item.status]}>{item.status}</Badge>
        </Stack>
      ))}
    </Stack>
  );
}
