import { useState } from "react";
import { Breadcrumb, Button, Card, CardBody, FormField, Grid, Heading, Slider, Stack, Text } from "../../../src";

/* Data from the controlling world, written out here so the example runs on its own. */
const on = (month: number, day: number) => new Date(2026, month - 1, day).getTime();

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

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  /** A fraction: 0.1 is ten per cent off. */
  discount: number;
  /** A fraction: 0.19 or 0.07, or 0 where no VAT is charged. */
  vatRate: number;
}

interface Invoice {
  id: string;
  supplier: string;
  costCentre: string;
  received: number;
  due: number;
  status: "awaiting approval" | "approved" | "paid" | "rejected";
  lines: readonly InvoiceLine[];
}

const INVOICES: readonly Invoice[] = [
  {
    id: "INV-26-0318", supplier: "Brandlow Office Supply", costCentre: "CC-4400", received: on(3, 16), due: on(4, 15), status: "awaiting approval",
    lines: [
      { description: "Desk lamps, LED", quantity: 24, unitPrice: 48.9, discount: 0.1, vatRate: 0.19 },
      { description: "Printer paper, box of 5 reams", quantity: 40, unitPrice: 21.5, discount: 0, vatRate: 0.19 },
      { description: "Delivery", quantity: 1, unitPrice: 35, discount: 0, vatRate: 0.19 },
    ],
  },
  {
    id: "INV-26-0317", supplier: "Kettering & Shaw Events", costCentre: "CC-1200", received: on(3, 13), due: on(4, 12), status: "awaiting approval",
    lines: [
      { description: "Trade fair stand, 3 days", quantity: 1, unitPrice: 12_400, discount: 0.05, vatRate: 0.19 },
      { description: "Catering, per guest", quantity: 180, unitPrice: 18.5, discount: 0, vatRate: 0.07 },
    ],
  },
  {
    id: "INV-26-0309", supplier: "Nimbrel Software", costCentre: "CC-4300", received: on(3, 9), due: on(4, 8), status: "approved",
    lines: [
      { description: "Design tool licences, annual", quantity: 12, unitPrice: 540, discount: 0.15, vatRate: 0.19 },
      { description: "Onboarding session", quantity: 2, unitPrice: 890, discount: 0, vatRate: 0.19 },
    ],
  },
  {
    id: "INV-26-0302", supplier: "Fenwright Legal", costCentre: "CC-4100", received: on(3, 2), due: on(3, 16), status: "paid",
    lines: [{ description: "Contract review, hours", quantity: 14.5, unitPrice: 260, discount: 0, vatRate: 0.19 }],
  },
  {
    id: "INV-26-0226", supplier: "Corrin Travel", costCentre: "CC-1100", received: on(2, 26), due: on(3, 12), status: "paid",
    lines: [
      { description: "Rail tickets, sales conference", quantity: 22, unitPrice: 139, discount: 0, vatRate: 0.07 },
      { description: "Hotel, nights", quantity: 44, unitPrice: 112, discount: 0.08, vatRate: 0.07 },
    ],
  },
  {
    id: "INV-26-0221", supplier: "Stellbrook Consulting", costCentre: "CC-2100", received: on(2, 21), due: on(3, 23), status: "rejected",
    lines: [{ description: "Architecture review, days", quantity: 6, unitPrice: 1450, discount: 0, vatRate: 0 }],
  },
];

export const title = "Browse down and back up";
export const lead = "Each level opens the next and the trail is the way back; narrow it with the slider to watch the fold measure itself.";

interface Place {
  name: string;
  children?: Place[];
}

const DIVISIONS = [
  { prefix: "CC-1", name: "Commercial" },
  { prefix: "CC-2", name: "Product" },
  { prefix: "CC-3", name: "Service" },
  { prefix: "CC-4", name: "Administration" },
];

/* The company, its divisions, their cost centres, each centre's invoices and
   each invoice's lines. */
const COMPANY: Place = {
  name: "Carrow & Lisle",
  children: DIVISIONS.map((division) => ({
    name: division.name,
    children: COST_CENTRES.filter((centre) => centre.id.startsWith(division.prefix)).map((centre) => ({
      name: `${centre.name}, ${centre.id}`,
      children: INVOICES.filter((invoice) => invoice.costCentre === centre.id).map((invoice) => ({
        name: `${invoice.id} · ${invoice.supplier}`,
        children: invoice.lines.map((line) => ({ name: line.description })),
      })),
    })),
  })),
};

/** The places from the company down to the first one of this name. */
function pathTo(name: string, path: Place[]): Place[] | undefined {
  const here = path[path.length - 1]!;
  if (here.name === name) return path;
  for (const child of here.children ?? []) {
    const found = pathTo(name, [...path, child]);
    if (found) return found;
  }
  return undefined;
}

export default function BrowseDownAndBackUp() {
  const [path, setPath] = useState<Place[]>(() => pathTo("Desk lamps, LED", [COMPANY]) ?? [COMPANY]);
  const [width, setWidth] = useState(640);
  const here = path[path.length - 1]!;

  return (
    <Stack gap={4}>
      <FormField label="Width of the trail" style={{ maxWidth: 360 }}>
        <Slider min={200} max={640} step={20} value={width} onChange={setWidth} format={(v) => `${v} px`} />
      </FormField>
      <Card>
        <CardBody>
          <Stack gap={4}>
            <div style={{ width, maxWidth: "100%" }}>
              <Breadcrumb
                items={path.map((place, i) => ({ label: place.name, onSelect: () => setPath(path.slice(0, i + 1)) }))}
              />
            </div>
            <Heading level={3} size="lg">
              {here.name}
            </Heading>
            {here.children && here.children.length > 0 ? (
              <Grid minItemWidth="180px" gap={2}>
                {here.children.map((child) => (
                  <Button key={child.name} onClick={() => setPath([...path, child])}>
                    {child.name}
                  </Button>
                ))}
              </Grid>
            ) : (
              <Text size="sm" tone="muted">
                Nothing further below {here.name}.
              </Text>
            )}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
