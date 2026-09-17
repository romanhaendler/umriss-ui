import { useState } from "react";
import { Button, Stack } from "../../../src";

export const title = "Loading and disabled";

/* `loading` disables the button itself - the caller need not set `disabled` in
   addition and cannot forget it either. The difference from `disabled` is the
   statement: disabled means "not possible here", loading means "running right
   now". */
export default function LoadingAndDisabled() {
  const [running, setRunning] = useState(false);

  const apply = () => {
    setRunning(true);
    window.setTimeout(() => setRunning(false), 1200);
  };

  return (
    <Stack direction="row" gap={3} wrap align="center">
      <Button variant="primary" loading={running} onClick={apply}>
        Apply
      </Button>
      <Button loading>Running</Button>
      <Button disabled>Not available</Button>
      <Button variant="primary" disabled>
        Not available
      </Button>
    </Stack>
  );
}
