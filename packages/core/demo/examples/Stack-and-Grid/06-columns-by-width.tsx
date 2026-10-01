import { Card, CardBody, Grid, Stack, Text } from "../../../src";

/* Data from the controlling world, written out here so the example runs on its own. */
interface CostCentre {
  id: string;
  name: string;
  owner: string;
  /** The budget of one month. */
  monthlyBudget: number;
}

const COST_CENTRES: readonly CostCentre[] = [
  { id: "CC-1100", name: "Sales", owner: "Helen Marsh", monthlyBudget: 142_000 },
  { id: "CC-1200", name: "Marketing", owner: "Rafael Ortiz", monthlyBudget: 68_000 },
  { id: "CC-2100", name: "Engineering", owner: "Anika Sørensen", monthlyBudget: 188_000 },
  { id: "CC-2200", name: "Design", owner: "Paul Whitaker", monthlyBudget: 54_000 },
  { id: "CC-3100", name: "Customer service", owner: "Grace Obi", monthlyBudget: 61_000 },
  { id: "CC-4100", name: "Finance", owner: "Martina Vogel", monthlyBudget: 47_000 },
  { id: "CC-4200", name: "People", owner: "Daniel Frost", monthlyBudget: 39_000 },
  { id: "CC-4300", name: "IT", owner: "Kenji Arai", monthlyBudget: 83_000 },
  { id: "CC-4400", name: "Facilities", owner: "Olga Ivanova", monthlyBudget: 72_000 },
];

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
