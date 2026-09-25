import { Card, CardBody, Stack, Tag } from "../../../src";

export const title = "Wrapping";
export const lead = "Set `wrap` where a row may hold more than fits, so a long run of labels breaks onto the next line.";

const SERVICES = ["Checkout", "Billing", "Sign-in", "Search", "Image service", "Notifications", "Webhooks", "Reporting"];

export default function Wrapping() {
  return (
    <Card style={{ maxWidth: 320 }}>
      <CardBody>
        <Stack direction="row" gap={2} wrap>
          {SERVICES.map((name) => (
            <Tag key={name}>{name}</Tag>
          ))}
        </Stack>
      </CardBody>
    </Card>
  );
}
