import { Button, Stack, Text, VisuallyHidden } from "../../../src";

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

export const title = "Name the same action in every row";
export const lead = "Twenty \"Edit budget\" buttons sound alike to a screen reader; append each row's name hidden and each says what it edits.";

export default function ActionsInRows() {
  return (
    <Stack gap={2} style={{ maxWidth: 420 }}>
      {COST_CENTRES.slice(0, 4).map((centre) => (
        <Stack key={centre.id} direction="row" gap={3} align="center" justify="space-between">
          <Text size="sm">
            {centre.name} <Text as="span" size="xs" tone="muted">{centre.owner}</Text>
          </Text>
          <Button size="sm" variant="ghost">
            Edit budget
            <VisuallyHidden> of {centre.name}</VisuallyHidden>
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}
