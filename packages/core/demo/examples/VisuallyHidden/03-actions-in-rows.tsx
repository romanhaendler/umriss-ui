import { Button, Stack, Text, VisuallyHidden } from "../../../src";
import { COST_CENTRES } from "@umriss-ui/demo/worlds/controlling";

export const title = "Name the same action in every row";
export const lead = "Twenty \"Edit budget\" buttons sound alike to a screen reader; append each row's name hidden and each says what it edits.";

export default function ActionsInRows() {
  return (
    <Stack gap={2} style={{ maxWidth: 420 }}>
      {COST_CENTRES.slice(0, 4).map((centre) => (
        <Stack key={centre.id} direction="row" gap={3} align="center" justify="space-between">
          <Text size="sm">
            {centre.name} <Text as="span" size="xs" tone="muted">{centre.owner}</Text>
          </Text>
          <Button size="sm" variant="ghost">
            Edit budget
            <VisuallyHidden> of {centre.name}</VisuallyHidden>
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}
