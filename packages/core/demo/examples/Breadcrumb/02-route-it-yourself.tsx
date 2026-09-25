import { useState } from "react";
import { Breadcrumb, Button, Stack, Text } from "../../../src";

export const title = "Route it yourself";
export const lead = "Give a level `onSelect` and your router runs instead of the browser; with an `href` beside it, a middle click still opens a tab.";

const PATH = ["North depot", "Tour T-01", "Stop 4", "Shipment FP-1004249"];

export default function RouteItYourself() {
  const [depth, setDepth] = useState(PATH.length);
  const trail = PATH.slice(0, depth);

  return (
    <Stack gap={3} align="flex-start">
      <Breadcrumb items={trail.map((label, i) => ({ label, onSelect: () => setDepth(i + 1) }))} />
      <Text size="xs" tone="muted">
        Page: {trail[trail.length - 1]}
      </Text>
      <Button size="sm" disabled={depth === PATH.length} onClick={() => setDepth(PATH.length)}>
        Back to the shipment
      </Button>
    </Stack>
  );
}
