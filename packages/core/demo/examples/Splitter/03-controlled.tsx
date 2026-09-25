import { useState } from "react";
import { Button, Card, Splitter, Stack, Text } from "../../../src";

export const title = "Controlled, and remembered";

/* The share belongs to the caller here: `value` and `onChange`, and the
   caller may keep it - in the user's settings, so that the layout is the one
   they left. `onChange` reports a share already inside the bounds, by pointer
   and by key alike. The keys beside it set the share from outside; the line
   follows, as any controlled field does. */
export default function Controlled() {
  const [share, setShare] = useState(50);

  return (
    <Stack gap={3} style={{ maxWidth: 560 }}>
      <Stack direction="row" gap={2} align="center">
        <Button size="sm" variant="secondary" onClick={() => setShare(30)}>
          Narrow list
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setShare(50)}>
          Half and half
        </Button>
        <Text size="xs" tone="muted" style={{ fontVariantNumeric: "tabular-nums" }}>
          List: {share.toFixed(1)} %
        </Text>
      </Stack>
      <Card style={{ height: 180 }}>
        <Splitter value={share} onChange={setShare} min={20} max={80} separatorLabel="Order list" style={{ height: "100%" }}>
          <div style={{ padding: 16 }}>
            <Text size="sm">Order list</Text>
          </div>
          <div style={{ padding: 16 }}>
            <Text size="sm">Order 4711-03</Text>
          </div>
        </Splitter>
      </Card>
    </Stack>
  );
}
