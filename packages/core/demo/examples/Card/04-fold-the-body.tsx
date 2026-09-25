import { Badge, Card, CardBody, CardHeader, Stack, Text } from "../../../src";

export const title = "Fold the body";
export const lead = "Set `collapsible` and the head becomes the button for the body; `defaultCollapsed` starts it folded.";

const LATE = [
  { stop: "Stop 4 · Marlow & Finch Books", window: "08:00–10:00", arrival: "10:35" },
  { stop: "Stop 9 · Ashcombe Dental", window: "10:00–12:00", arrival: "12:40" },
];

export default function FoldTheBody() {
  return (
    <Card collapsible defaultCollapsed style={{ maxWidth: 520 }}>
      <CardHeader eyebrow="Tour T-01" title="Late stops" actions={<Badge pill>{LATE.length}</Badge>} />
      <CardBody>
        <Stack gap={2}>
          {LATE.map((late) => (
            <Text key={late.stop} size="sm">
              {late.stop} - window {late.window}, planned {late.arrival}
            </Text>
          ))}
        </Stack>
      </CardBody>
    </Card>
  );
}
