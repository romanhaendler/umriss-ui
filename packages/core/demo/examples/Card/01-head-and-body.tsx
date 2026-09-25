import { Card, CardBody, CardHeader, Text } from "../../../src";

export const title = "Head and body";
export const lead = "A `CardHeader` names the block, a `CardBody` holds whatever belongs to it; the card knows nothing of its content.";

export default function HeadAndBody() {
  return (
    <Card style={{ maxWidth: 480 }}>
      <CardHeader title="Checkout" />
      <CardBody>
        <Text size="sm" tone="secondary">
          Payments team · tier 1 · 95th percentile below 300 ms, 99.95 % available a month.
        </Text>
      </CardBody>
    </Card>
  );
}
