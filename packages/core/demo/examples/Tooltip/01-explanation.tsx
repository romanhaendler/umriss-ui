import { Button, Stack, Text, Tooltip } from "../../../src";

export const title = "An explanation on pointer and on focus";

/* The tooltip appears on pointer contact AND on keyboard focus. Without the
   second it would not exist at all for a part of the users.

   It is therefore never the only source of a piece of information: what stands
   only in the tooltip stands nowhere for a touch device. */
export default function Explanation() {
  return (
    <Stack direction="row" gap={3} align="center" wrap>
      <Text size="sm" tone="secondary">
        Short descriptions appear on hover or on keyboard focus:
      </Text>
      <Tooltip content="Creates an independent copy of this view.">
        <Button size="sm">Duplicate</Button>
      </Tooltip>
      <Tooltip content="Will be taken into account on the next run." delay={0}>
        <Button size="sm" variant="ghost">
          Without a delay
        </Button>
      </Tooltip>
    </Stack>
  );
}
