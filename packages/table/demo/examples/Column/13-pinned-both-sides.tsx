import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Pinned to both sides";

/* A wide plant table: the machine that names the row is pinned to the start,
   its verdict to the end, and the twelve hours between them scroll. `pin`
   names the side; the pinned columns stand in a block at that end, whatever
   their place in the JSX, and the selection and the row actions stick with
   them. A shadow on a block's inner edge shows that something lies under it -
   and only then.

   The user can pin, move and unpin in the column menu; the view carries what
   deviates from the declaration.

   The minimum width comes from the application's stylesheet: a table over the
   full width distributes the space it has, and there would be nothing to
   scroll. */

const STYLE = `
.plant-table table {
  min-width: 1500px;
}
`;

const HOURS = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17"];

interface Machine {
  tag: string;
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

const AREAS = ["Pressing", "Welding", "Painting", "Assembly"];

const MACHINES: Machine[] = Array.from({ length: 8 }, (_, i) => ({
  tag: `M-${String(101 + i)}`,
  area: AREAS[i % AREAS.length]!,
  output: HOURS.map((_, h) => 30 + ((i * 11 + h * 7) % 29)),
  temperature: i === 5 ? null : 52 + ((i * 9) % 31),
}));

export default function PinnedBothSides() {
  const { Table, Column, VerdictColumn, RowActions, Action } = useTable(MACHINES, { rowKey: (m) => m.tag });
  const [last, setLast] = useState("Nothing opened yet");

  return (
    <Stack gap={2}>
      <style>{STYLE}</style>
      <Table className="plant-table" selectable ariaLabel="Output per hour">
        <Toolbar>
          <ColumnMenu />
        </Toolbar>
        <Column value="area" label="Area" width={110} />
        {HOURS.map((hour, h) => (
          <Column key={hour} id={`h${hour}`} label={`${hour}:00`} value={(m) => m.output[h]} aggregate="sum" width={80} />
        ))}
        <Column value="tag" label="Machine" rowHeader pin="start" width={110} />
        <VerdictColumn value="temperature" label="Temperature (°C)" limits={TEMPERATURE} pin="end" aggregate="worst" width={150} />
        <RowActions>
          <Action onSelect={(m) => setLast(`${m.tag} opened`)}>Open</Action>
        </RowActions>
      </Table>
      <Text size="xs" tone="muted">
        {last}
      </Text>
    </Stack>
  );
}
