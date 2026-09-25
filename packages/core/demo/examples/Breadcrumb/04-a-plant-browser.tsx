import { useState } from "react";
import { Breadcrumb, Button, Card, CardBody, FormField, Grid, Heading, Slider, Stack, Text } from "../../../src";

export const title = "A plant browser";

/* The full case: a plant, its halls, lines, machines and parts, browsed one
   level down at a time. The breadcrumb is the way back up, and routing stays
   the caller's - every level's `onSelect` cuts the path to it. The slider
   narrows the place the trail stands in, so the fold can be watched as it is
   measured: a level goes into the menu only when it no longer fits. */

interface Place {
  name: string;
  children?: Place[];
}

const PLANT: Place = {
  name: "Plant Nord",
  children: [
    {
      name: "Hall A - syrup room",
      children: [{ name: "Mixing station 1" }, { name: "Mixing station 2" }],
    },
    {
      name: "Hall B - filling",
      children: [
        {
          name: "Line 3",
          children: [
            {
              name: "Filler F1",
              children: [{ name: "Valve block 2", children: [{ name: "Valve 12" }, { name: "Valve 13" }] }],
            },
            { name: "Capper C1" },
            { name: "Labeller L1" },
          ],
        },
        { name: "Line 4" },
      ],
    },
  ],
};

/** The places from the plant down to the one named. */
function pathTo(name: string, path: Place[]): Place[] | undefined {
  const here = path[path.length - 1]!;
  if (here.name === name) return path;
  for (const child of here.children ?? []) {
    const found = pathTo(name, [...path, child]);
    if (found) return found;
  }
  return undefined;
}

export default function APlantBrowser() {
  const [path, setPath] = useState<Place[]>(() => pathTo("Valve 12", [PLANT]) ?? [PLANT]);
  const [width, setWidth] = useState(640);
  const here = path[path.length - 1]!;

  return (
    <Stack gap={4}>
      <FormField label="Width of the trail" style={{ maxWidth: 360 }}>
        <Slider
          min={200}
          max={640}
          step={20}
          value={width}
          onChange={setWidth}
          format={(v) => `${v} px`}
          showValue
        />
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
            {here.children ? (
              <Grid minItemWidth="160px" gap={2}>
                {here.children.map((child) => (
                  <Button key={child.name} onClick={() => setPath([...path, child])}>
                    {child.name}
                  </Button>
                ))}
              </Grid>
            ) : (
              <Text size="sm" tone="muted">
                {here.name} has no parts listed here.
              </Text>
            )}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
