import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Grid, Stack, Text } from "../../../src";

export const title = "Cards on a dashboard";
export const lead = "Each block of a dashboard is a card in a grid; a card with nothing to show says so with an `EmptyState`.";

const INCIDENTS = [
  { id: "INC-1048", title: "Checkout slow, card payments time out", severity: "SEV1" },
  { id: "INC-1047", title: "Webhook deliveries delayed", severity: "SEV3" },
];

export default function CardsOnADashboard() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <Card>
        <CardHeader title="Open incidents" actions={<Badge tone="danger">{INCIDENTS.length}</Badge>} />
        <CardBody>
          <Stack gap={3}>
            {INCIDENTS.map((incident) => (
              <Stack key={incident.id} gap={1}>
                <Text size="xs" tone="muted">
                  {incident.id} · {incident.severity}
                </Text>
                <Text size="sm">{incident.title}</Text>
              </Stack>
            ))}
          </Stack>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="On call" />
        <CardBody>
          <Stack gap={2}>
            <Text size="sm">Primary: Jonas Keller</Text>
            <Text size="sm">Secondary: Ada Mwangi</Text>
            <Text size="xs" tone="muted">
              Handover tomorrow at 09:00
            </Text>
          </Stack>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Snoozed alerts" />
        <CardBody>
          <EmptyState
            title="Nothing snoozed"
            description="Alerts you snooze wait here until they wake."
            action={<Button size="sm">Open the alert list</Button>}
          />
        </CardBody>
      </Card>
    </Grid>
  );
}
