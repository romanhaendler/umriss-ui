import { useState } from "react";
import { Card, CardBody, ColorPicker, FormField, Grid, Stack, Text } from "../../../src";

export const title = "The series colours of a trend";
export const lead =
  "A property panel beside the chart it sets. `onValueChange` runs on every move of the square or the strip and on every arrow key, so the lines follow while the reader drags; Escape and Cancel put the colour back. The square takes the arrows (Shift for ten steps), the strip the arrows and Page Up and Page Down.";

const ZONES = [
  { id: "z1", name: "Zone 1", color: "#2563eb", points: "0,60 20,52 40,56 60,40 80,44 100,30 120,34" },
  { id: "z2", name: "Zone 2", color: "#059669", points: "0,70 20,66 40,60 60,62 80,50 100,52 120,46" },
  { id: "z3", name: "Zone 3", color: "#d97706", points: "0,40 20,44 40,30 60,34 80,22 100,26 120,18" },
] as const;

export default function SeriesOfATrend() {
  const [colours, setColours] = useState<Record<string, string | null>>(Object.fromEntries(ZONES.map((zone) => [zone.id, zone.color])));

  return (
    <Grid minItemWidth="260px" gap={4}>
      <Card>
        <CardBody>
          <Stack gap={3}>
            {ZONES.map((zone) => (
              <FormField key={zone.id} label={zone.name}>
                <ColorPicker value={colours[zone.id]} onValueChange={(next) => setColours((all) => ({ ...all, [zone.id]: next }))} />
              </FormField>
            ))}
          </Stack>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Stack gap={2}>
            <Text size="sm" tone="muted">
              Furnace temperature, last 6 h
            </Text>
            <svg viewBox="0 0 120 80" role="img" aria-label="Three lines, one per zone" style={{ display: "block", width: "100%" }}>
              {ZONES.map((zone) => (
                <polyline key={zone.id} points={zone.points} fill="none" stroke={colours[zone.id] ?? "currentColor"} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              ))}
            </svg>
          </Stack>
        </CardBody>
      </Card>
    </Grid>
  );
}
