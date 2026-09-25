import { useState } from "react";
import { FormField, NumberInput, Stack, Switch, Text } from "../../../src";

export const title = "Hand or automatic";

/* Controlled: the switch shows `checked` and reports the wish through
   `onChange`, and the caller decides what follows from it. Here the
   consequence stands right beside it - in automatic mode the controller holds
   the setpoint, and the field for the hand value steps back.

   A switch takes effect at once. Where a choice only counts after a Save
   button, a checkbox is the honest control: it does not promise that anything
   has happened yet. */
export default function HandOrAutomatic() {
  const [automatic, setAutomatic] = useState(true);
  const [speed, setSpeed] = useState<number | null>(1450);

  return (
    <Stack gap={4} style={{ maxWidth: 320 }}>
      <Switch
        label="Automatic mode"
        checked={automatic}
        onChange={(event) => setAutomatic(event.target.checked)}
      />
      <FormField label="Pump speed by hand, rpm" hint={automatic ? "The controller holds the speed." : undefined}>
        <NumberInput value={speed} onChange={setSpeed} min={0} max={2900} step={50} disabled={automatic} />
      </FormField>
      <Text size="xs" tone="muted">
        Mode: {automatic ? "automatic" : "hand"}
      </Text>
    </Stack>
  );
}
