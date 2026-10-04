import { useState } from "react";
import { Button, Card, Splitter, Stack, Text } from "../../../src";

export const title = "Keep the share";
export const lead = "Control `value` with `onChange` to keep the share in the user's settings, or to set it from a button. Focus the separator and the arrow keys move it by `step`, here ten per cent at a time.";

export default function KeepTheShare() {
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
          People: {share.toFixed(1)} %
        </Text>
      </Stack>
      <Card style={{ height: 180 }}>
        <Splitter value={share} onChange={setShare} min={20} max={80} step={10} separatorLabel="People" style={{ height: "100%" }}>
          <div style={{ padding: 16 }}>
            <Text size="sm">People of the Web team</Text>
          </div>
          <div style={{ padding: 16 }}>
            <Text size="sm">Chloe Durand · 40 h a week · 34 h planned in sprint 14</Text>
          </div>
        </Splitter>
      </Card>
    </Stack>
  );
}
