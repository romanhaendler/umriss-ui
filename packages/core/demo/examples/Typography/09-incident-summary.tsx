import { Badge, Card, CardBody, Heading, Link, Stack, Text } from "../../../src";
import { ENGINEERS, INCIDENTS, SERVICES } from "@umriss-ui/demo/worlds/operations";

export const title = "Set an incident summary";
export const lead = "The pieces together in a detail panel: a caps label, a heading, mono identifiers and times, body text, a muted footnote and links.";

const incident = INCIDENTS[0]!;
const service = SERVICES.find((s) => s.id === incident.service)!;
const assignee = ENGINEERS.find((e) => e.id === incident.assignee)!;
const time = (t: number) =>
  new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function IncidentSummary() {
  return (
    <Card>
      <CardBody>
        <Stack gap={3}>
          <Stack direction="row" gap={2} align="center">
            <Text size="xs" tracking="caps" tone="muted">
              {service.team} · {service.name}
            </Text>
            <Badge tone="danger">{incident.severity}</Badge>
          </Stack>
          <Heading level={3} size="lg">
            {incident.title}
          </Heading>
          <Text size="sm">
            Opened <Text as="span" mono>{time(incident.opened)}</Text>, acknowledged{" "}
            <Text as="span" mono>{time(incident.acknowledged!)}</Text> by {assignee.name}. The p95
            latency is above its {service.latencySlo} ms objective since 09:40.
          </Text>
          <Text size="sm">
            <Link href="#/typography">Open the latency chart</Link> ·{" "}
            <Link href="https://status.example.org" external>
              Payment provider status
            </Link>
          </Text>
          <Text size="xs" tone="muted">
            <Text as="span" size="xs" mono>
              {incident.id}
            </Text>{" "}
            · still open
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
}
