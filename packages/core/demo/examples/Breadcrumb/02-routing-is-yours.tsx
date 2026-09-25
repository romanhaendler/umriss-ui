import { useState } from "react";
import { Breadcrumb, Button, Stack, Text } from "../../../src";

export const title = "Routing is yours";

/* The breadcrumb navigates nowhere by itself. With `href` alone the browser
   follows the link; with `onSelect` the caller routes - a link keeps its
   address for a middle click and a new tab, and a plain click runs the
   caller's function instead. A level with `onSelect` and no `href` is a
   button, as here. The trail is state: choosing a level cuts it back to
   there. */

const PATH = ["Plant Nord", "Hall B", "Line 3", "Filler F1", "Valve 12"];

export default function RoutingIsYours() {
  const [depth, setDepth] = useState(PATH.length);
  const trail = PATH.slice(0, depth);

  return (
    <Stack gap={3} align="flex-start">
      <Breadcrumb items={trail.map((label, i) => ({ label, onSelect: () => setDepth(i + 1) }))} />
      <Text size="xs" tone="muted">
        Page: {trail[trail.length - 1]}
      </Text>
      <Button size="sm" disabled={depth === PATH.length} onClick={() => setDepth(PATH.length)}>
        Back to Valve 12
      </Button>
    </Stack>
  );
}
