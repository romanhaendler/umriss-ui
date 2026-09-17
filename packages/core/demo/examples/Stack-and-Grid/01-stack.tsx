import { Button, Card, CardBody, Stack, Text } from "../../../src";

export const title = "Stack: spacing out of tokens";

/* `gap` is a step on the four-unit scale and not a pixel count. That is the
   whole difference: spacings out of a scale stay in proportion to one another,
   spacings out of numbers stop doing so after the third developer.

   `align` and `justify` pass `alignItems` and `justifyContent` through
   unchanged - for the rest of flexbox there is flexbox. */
export default function StackExample() {
  return (
    <Stack gap={4}>
      <Stack direction="row" gap={2} align="center">
        <Text size="xs" tone="muted" style={{ width: 60 }}>
          gap 2
        </Text>
        <Button size="sm">One</Button>
        <Button size="sm">Two</Button>
        <Button size="sm">Three</Button>
      </Stack>
      <Stack direction="row" gap={5} align="center">
        <Text size="xs" tone="muted" style={{ width: 60 }}>
          gap 5
        </Text>
        <Button size="sm">One</Button>
        <Button size="sm">Two</Button>
        <Button size="sm">Three</Button>
      </Stack>
      <Card>
        <CardBody>
          <Stack direction="row" gap={3} justify="space-between" align="center">
            <Text size="sm">justify=&quot;space-between&quot;</Text>
            <Button size="sm" variant="primary">
              Right
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
