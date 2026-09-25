import { Card, CardBody, Grid, Stack, Text } from "../../../src";

export const title = "Fixed columns";
export const lead = "Use `columns` where the layout decides the count, such as three figures that always stand side by side.";

const FIGURES = [
  { label: "Marketing budget, March", value: "68,000 €" },
  { label: "Forecast, March", value: "77,500 €" },
  { label: "Over budget", value: "9,500 €" },
];

export default function FixedColumns() {
  return (
    <Grid columns={3} gap={3}>
      {FIGURES.map((figure) => (
        <Card key={figure.label}>
          <CardBody>
            <Stack gap={1}>
              <Text size="xs" tone="muted">
                {figure.label}
              </Text>
              <Text weight="medium">{figure.value}</Text>
            </Stack>
          </CardBody>
        </Card>
      ))}
    </Grid>
  );
}
