import { useState } from "react";
import { FormField, NumberInput, Stack, Switch } from "../../../src";

export const title = "Let the switch decide what follows";
export const lead = "Control it with `checked` and `onChange` when other fields depend on it; here autoscaling takes the instance count away.";

export default function LetTheSwitchDecide() {
  const [autoscaling, setAutoscaling] = useState(true);
  const [instances, setInstances] = useState<number | null>(6);

  return (
    <Stack gap={4} style={{ maxWidth: 320 }}>
      <Switch label="Autoscaling" checked={autoscaling} onChange={(event) => setAutoscaling(event.target.checked)} />
      <FormField label="Instances" hint={autoscaling ? "Set by autoscaling, between 2 and 24." : "Fixed by hand."}>
        <NumberInput value={instances} onChange={setInstances} min={1} max={24} decimals={0} disabled={autoscaling} />
      </FormField>
    </Stack>
  );
}
