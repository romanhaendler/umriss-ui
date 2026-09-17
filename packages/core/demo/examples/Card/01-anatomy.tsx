import { Badge, Card, CardBody, CardHeader, Stack, Text } from "../../../src";

export const title = "Head, body and actions";

/* The card is the surface almost everything stands on. The head carries a
   title, optionally an eyebrow label above it, and on the right an area for
   buttons or badges; the body carries the content.

   The divider under the head is not the normal case: with ordinary content the
   whitespace carries the hierarchy on its own. It belongs to `flush` - where
   the body goes edge to edge, the head needs an edge of its own. */
export default function Anatomy() {
  return (
    <Stack gap={4}>
      <Card>
        <CardHeader eyebrow="Production" title="Line 1 - filling" actions={<Badge tone="success">Running</Badge>} />
        <CardBody>
          <Text size="sm" tone="secondary">
            The body carries the content. The card does not know what stands in it.
          </Text>
        </CardBody>
      </Card>

      <Card>
        <CardHeader divider eyebrow="Log" title="With a divider" />
        <CardBody>
          <Text size="sm" tone="secondary">
            The line under the head is not the normal case. With ordinary content the whitespace
            carries the hierarchy on its own; it becomes necessary only where the body goes edge to
            edge - a table, or a log that runs right up to the border. That is what{" "}
            <code>flush</code> is for, and the example below shows it.
          </Text>
        </CardBody>
      </Card>
    </Stack>
  );
}
