import { useId, useState } from "react";
import { Badge, Card, CardBody, CardHeader, Divider, Stack, Switch, Text } from "../../../src";

export const title = "The functions of a filling line";

/* The full case: the functions of one line on one card, each a switch that
   acts at once, each with the sentence that says what it does. One of them is
   locked while the line runs - a disabled switch says "not now", and the
   sentence beside it says why, because a dimmed control alone explains
   nothing.

   The sentence describes its switch (`aria-describedby`), so a screen reader
   hears it too. The count in the head is derived from the switches and never
   stored beside them. */

interface LineFunction {
  id: string;
  label: string;
  description: string;
  lockedWhileRunning?: boolean;
}

const FUNCTIONS: LineFunction[] = [
  { id: "run", label: "Line running", description: "Starts and stops filler, capper and labeller together." },
  { id: "cip", label: "Cleaning in place", description: "Only while the line stands; it rinses for 42 minutes.", lockedWhileRunning: true },
  { id: "reject", label: "Reject underfilled bottles", description: "Below 498 ml a bottle leaves the line at the checkweigher." },
  { id: "sample", label: "Sample every 500th bottle", description: "The lab receives one bottle per 500 filled." },
  { id: "night", label: "Night setback of the conveyor lights", description: "Dims the lights from 22:00 to 06:00." },
];

export default function FunctionsOfALine() {
  const [on, setOn] = useState<Record<string, boolean>>({ run: true, reject: true, night: true });
  const base = useId();
  const count = FUNCTIONS.filter((f) => on[f.id]).length;

  return (
    <Card style={{ maxWidth: 520 }}>
      <CardHeader eyebrow="Line 3" title="Functions" actions={<Badge pill>{count} on</Badge>} />
      <CardBody>
        <Stack gap={3}>
          {FUNCTIONS.map((f, i) => {
            const locked = f.lockedWhileRunning === true && on.run === true;
            return (
              <Stack key={f.id} gap={3}>
                {i > 0 && <Divider />}
                <Stack gap={1}>
                  <Switch
                    label={f.label}
                    checked={on[f.id] === true}
                    disabled={locked}
                    aria-describedby={`${base}-${f.id}`}
                    onChange={(event) => setOn((previous) => ({ ...previous, [f.id]: event.target.checked }))}
                  />
                  <Text id={`${base}-${f.id}`} size="xs" tone="muted" style={{ paddingLeft: 36 }}>
                    {locked ? "Locked while the line runs. " : ""}
                    {f.description}
                  </Text>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </CardBody>
    </Card>
  );
}
