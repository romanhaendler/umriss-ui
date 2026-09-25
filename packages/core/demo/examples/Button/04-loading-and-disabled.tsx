import { useState } from "react";
import { Button, Stack } from "../../../src";

export const title = "Loading and disabled";
export const lead = "Set `loading` while the action runs – it locks the button by itself; `disabled` says the action is not possible here at all.";

export default function LoadingAndDisabled() {
  const [running, setRunning] = useState(false);

  const deploy = () => {
    setRunning(true);
    window.setTimeout(() => setRunning(false), 1200);
  };

  return (
    <Stack direction="row" gap={3} wrap align="center">
      <Button variant="primary" loading={running} onClick={deploy}>
        Deploy
      </Button>
      <Button loading>Rolling back</Button>
      <Button disabled>Promote to production</Button>
      <Button variant="primary" disabled>
        Deploy
      </Button>
    </Stack>
  );
}
