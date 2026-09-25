import { useState } from "react";
import { Breadcrumb, Button, Card, CardBody, FormField, Grid, Heading, Slider, Stack, Text } from "../../../src";
import { COST_CENTRES, INVOICES } from "@umriss-ui/demo/worlds/controlling";

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
