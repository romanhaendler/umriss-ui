import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { MACHINES } from "@umriss-ui/demo/worlds/plant";
import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Pin columns to both sides";
export const lead = "`pin=\"start\"` or `\"end\"` keeps a column at that edge while the rest scrolls; people pin and unpin in the column menu too.";

/* The minimum width comes from the application's stylesheet: a table over
   the full width shares out the space it has, and nothing would scroll. */
const STYLE = `
.hourly-output table {
  min-width: 1500px;
}
`;

const HOURS = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17"];

interface Machine {
  name: string;
  area: string;
  output: number[];
  temperature: number | null;
}

const TEMPERATURE: LimitSet = {
  target: 60,
  limits: [
    { value: 72, side: "upper", severity: "warning" },
    { value: 80, side: "upper", severity: "alarm" },
  ],
};

const AREAS = ["Pressing", "Milling", "Hardening", "Assembly"];

const ROWS: Machine[] = MACHINES.map((name, i) => ({
  name,
  area: AREAS[Math.floor(i / 2)]!,
  output: HOURS.map((_, h) => 30 + ((i * 11 + h * 7) % 29)),
  temperature: i === 5 ? null : 52 + ((i * 9) % 31),
}));

export default function PinnedBothSides() {
  const { Table, Column, VerdictColumn, RowActions, Action } = useTable(ROWS, { rowKey: (m) => m.name });
  const [last, setLast] = useState("Nothing opened yet");

  return (
    <Stack gap={2}>
      <style>{STYLE}</style>
      <Table className="hourly-output" selectable ariaLabel="Output per hour">
        <Toolbar>
          <ColumnMenu />
        </Toolbar>
        <Column value="area" label="Area" width={110} />
        {HOURS.map((hour, h) => (
          <Column key={hour} id={`h${hour}`} label={`${hour}:00`} value={(m) => m.output[h]} aggregate="sum" width={80} />
        ))}
        <Column value="name" label="Machine" rowHeader pin="start" width={130} />
        <VerdictColumn value="temperature" label="Temperature (°C)" limits={TEMPERATURE} pin="end" aggregate="worst" width={150} />
        <RowActions>
          <Action onSelect={(m) => setLast(`${m.name} opened`)}>Open</Action>
        </RowActions>
      </Table>
      <Text size="xs" tone="muted">
        {last}
      </Text>
    </Stack>
  );
}
