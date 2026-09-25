import { Button, Stack, Tooltip } from "../../../src";

export const title = "Delay";
export const lead = "`delay` is 300 ms by default so a passing pointer shows nothing; set it to 0 where the reader hovers on purpose.";

export default function Delay() {
  return (
    <Stack direction="row" gap={3}>
      <Tooltip content="Appears after 300 ms.">
        <Button size="sm">Default delay</Button>
      </Tooltip>
      <Tooltip content="Appears at once." delay={0}>
        <Button size="sm">Without a delay</Button>
      </Tooltip>
    </Stack>
  );
}
