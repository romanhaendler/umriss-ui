import { useState } from "react";
import { Badge, Button, Card, Grid, Sparkline, Splitter, Stack, Stat, Text } from "../../../src";
import type { LimitSet } from "../../../src";

export const title = "A line's screen in three panes";

/* The full case: a splitter inside a splitter. The stations stand on the
   left; on the right the chosen station's values above its alarms. Each line
   is named after the pane it sizes, so a screen reader tells the two apart,
   and each keeps its own bounds - the station list never narrower than a
   fifth, the alarms never shorter than a quarter.

   The stations are buttons of the caller's: the splitter lays out, it does
   not choose. */

const ZONE: LimitSet = {
  target: 200,
  limits: [
    { value: 185, side: "lower", severity: "warning" },
    { value: 205, side: "upper", severity: "warning" },
    { value: 215, side: "upper", severity: "alarm" },
  ],
};

const STATIONS = [
  { id: "kiln-1", name: "Kiln 1", value: 198, course: [196, 197, 199, 198, 197, 198, 199, 198], alarm: null },
  { id: "kiln-2", name: "Kiln 2", value: 208, course: [196, 199, 201, 203, 204, 206, 207, 208], alarm: "TIC-204 above 205 °C" },
  { id: "kiln-3", name: "Kiln 3", value: 191, course: [195, 194, 193, 193, 192, 191, 191, 191], alarm: null },
];

export default function ALineScreen() {
  const [chosen, setChosen] = useState("kiln-2");
  const station = STATIONS.find((s) => s.id === chosen) ?? STATIONS[0]!;

  return (
    <Card style={{ height: 340 }}>
      <Splitter defaultValue={26} min={20} max={45} separatorLabel="Stations" style={{ height: "100%" }}>
        <Stack gap={1} style={{ padding: 12 }}>
          <Text size="xs" tone="muted" style={{ padding: "0 8px 4px" }}>
            Line 3
          </Text>
          {STATIONS.map((s) => (
            <Button
              key={s.id}
              size="sm"
              variant={s.id === chosen ? "secondary" : "ghost"}
              aria-pressed={s.id === chosen}
              onClick={() => setChosen(s.id)}
            >
              {s.name}
            </Button>
          ))}
        </Stack>
        <Splitter orientation="vertical" defaultValue={62} min={30} max={75} separatorLabel={`${station.name} values`} style={{ height: "100%" }}>
          <Grid minItemWidth="180px" gap={4} style={{ padding: 16 }}>
            <Stat label={`${station.name} · zone`} value={station.value} unit="°C" limits={ZONE} />
            <Stack gap={2}>
              <Text size="xs" tone="muted">
                Last eight minutes
              </Text>
              <Sparkline data={station.course} width={180} height={48} />
            </Stack>
          </Grid>
          <Stack gap={2} style={{ padding: 16 }}>
            {station.alarm ? (
              <Stack direction="row" gap={2} align="center">
                <Badge tone="warning">High</Badge>
                <Text size="sm">{station.alarm}</Text>
              </Stack>
            ) : (
              <Text size="sm" tone="muted">
                No alarms for {station.name}.
              </Text>
            )}
          </Stack>
        </Splitter>
      </Splitter>
    </Card>
  );
}
