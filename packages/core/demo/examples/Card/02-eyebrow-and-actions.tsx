import { Badge, Button, Card, CardBody, CardHeader, Stack, Text } from "../../../src";

export const title = "Eyebrow and actions";
export const lead = "An `eyebrow` names the kind of thing above the title; `actions` stand on the right, a badge or a button or both.";

export default function EyebrowAndActions() {
  return (
    <Card style={{ maxWidth: 520 }}>
      <CardHeader
        eyebrow="Invoice"
        title="INV-26-0318 · Brandlow Office Supply"
        actions={
          <Stack direction="row" gap={2} align="center">
            <Badge tone="warning">Awaiting approval</Badge>
            <Button size="sm" variant="primary">
              Approve
            </Button>
          </Stack>
        }
      />
      <CardBody>
        <Text size="sm" tone="secondary">
          Facilities, CC-4400 · received 16 March, due 15 April · 2,321.98 € gross.
        </Text>
      </CardBody>
    </Card>
  );
}
