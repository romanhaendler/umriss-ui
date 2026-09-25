import { Card, CardBody, Grid, Stack, Text } from "../../../src";
import { COST_CENTRES } from "@umriss-ui/demo/worlds/controlling";

export const title = "Columns by width";
export const lead = "Set `minItemWidth` instead and the grid fits as many columns as stay readable; it wins over `columns`.";

export default function ColumnsByWidth() {
  return (
    <Grid minItemWidth="200px" gap={3}>
      {COST_CENTRES.map((centre) => (
        <Card key={centre.id}>
          <CardBody>
            <Stack gap={1}>
              <Text size="xs" tone="muted">
                {centre.id} · {centre.owner}
              </Text>
              <Text weight="medium">{centre.name}</Text>
              <Text size="sm" tone="secondary">
                {centre.monthlyBudget.toLocaleString("en")} € a month
              </Text>
            </Stack>
          </CardBody>
        </Card>
      ))}
    </Grid>
  );
}
