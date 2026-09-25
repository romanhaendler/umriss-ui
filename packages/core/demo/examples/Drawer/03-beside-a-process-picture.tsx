import { useState } from "react";
import {
  Badge,
  Button,
  Drawer,
  Grid,
  Meter,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  Stat,
  Switch,
  Text,
} from "../../../src";
import type { LimitSet } from "../../../src";

export const title = "The detail beside a process picture";

/* The full case: a row of machines stands for the process picture, and a
   click on one opens its detail at the edge - the picture stays in sight
   behind the scrim, so the operator keeps the place he came from. The drawer
   holds what one machine says about itself: its reading against its limits,
   its load, and the one function that may be switched from here. The machine
   that is open is the caller's state; the drawer only shows it. */

interface Machine {
  id: string;
  name: string;
  temperature: number;
  load: number;
  state: string;
}

const MACHINES: Machine[] = [
  { id: "f1", name: "Filler F1", temperature: 21.4, load: 0.82, state: "Running" },
  { id: "c1", name: "Capper C1", temperature: 38.9, load: 0.64, state: "Running" },
  { id: "l1", name: "Labeller L1", temperature: 47.2, load: 0.91, state: "Running" },
  { id: "p1", name: "Palletiser P1", temperature: 24.0, load: 0.2, state: "Waiting" },
];

const MOTOR: LimitSet = {
  limits: [
    { value: 45, side: "upper", severity: "warning" },
    { value: 55, side: "upper", severity: "alarm" },
  ],
};

export default function BesideAProcessPicture() {
  const [openId, setOpenId] = useState<string | null>(null);
  const machine = MACHINES.find((m) => m.id === openId);

  return (
    <>
      <Grid minItemWidth="150px" gap={3}>
        {MACHINES.map((m) => (
          <Button key={m.id} onClick={() => setOpenId(m.id)}>
            {m.name}
          </Button>
        ))}
      </Grid>
      <Drawer open={machine !== undefined} onClose={() => setOpenId(null)}>
        {machine && (
          <>
            <ModalHeader title={machine.name} description="Line 3, hall B" />
            <ModalBody>
              <Stack gap={5}>
                <Stack gap={1} align="flex-start">
                  <Text size="xs" tone="muted">
                    State
                  </Text>
                  <Badge>{machine.state}</Badge>
                </Stack>
                <Stat label="Motor temperature" value={machine.temperature} unit="°C" limits={MOTOR} />
                <Stack gap={1}>
                  <Text size="xs" tone="muted">
                    Load over the shift
                  </Text>
                  <Meter value={machine.load} label={`Load of ${machine.name}`} />
                </Stack>
                <Switch label="Lubrication in automatic mode" defaultChecked />
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setOpenId(null)}>Close</Button>
              <Button variant="primary" onClick={() => setOpenId(null)}>
                Open the maintenance log
              </Button>
            </ModalFooter>
          </>
        )}
      </Drawer>
    </>
  );
}
