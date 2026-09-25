import { Badge, Button, Card, CardBody, Divider, Grid, Heading, Stack, Text } from "../../../src";

export const title = "A tour summary";
export const lead = "Stacks and grids nest: a column holds a header row, a grid of key figures and a row of actions.";

const FIGURES = [
  { label: "Vehicle", value: "FP 214 K · van" },
  { label: "Driver", value: "Martin Hale" },
  { label: "Stops", value: "11, two late" },
  { label: "Distance", value: "86 km" },
  { label: "Leaves", value: "07:00, North depot" },
  { label: "Back", value: "13:40" },
];

export default function ATourSummary() {
  return (
    <Card style={{ maxWidth: 640 }}>
      <CardBody>
        <Stack gap={4}>
          <Stack direction="row" gap={3} align="center" justify="space-between">
            <Heading level={3} size="lg">
              Tour T-01
            </Heading>
            <Badge tone="warning">2 stops late</Badge>
          </Stack>
          <Grid minItemWidth="160px" gap={4}>
            {FIGURES.map((figure) => (
              <Stack key={figure.label} gap={1}>
                <Text size="xs" tone="muted">
                  {figure.label}
                </Text>
                <Text size="sm">{figure.value}</Text>
              </Stack>
            ))}
          </Grid>
          <Divider />
          <Stack direction="row" gap={2} justify="flex-end">
            <Button size="sm" variant="ghost">
              Call the driver
            </Button>
            <Button size="sm" variant="primary">
              Reorder stops
            </Button>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}
