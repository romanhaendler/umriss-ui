import { useMemo, useState } from "react";
import { Button, Text } from "@umriss-ui/core";
import { Pagination, Search, Toolbar, useTable } from "../../../src";

export const title = "Fill a pane";

export const lead = "In a parent of definite height the table is exactly as tall as the parent - with no rows, five or a hundred. Toolbar on top, the pager at the bottom edge, and the surface under the last row stays blank. In a parent without a height the table is as tall as its rows, as ever.";

interface Stop {
  id: string;
  street: string;
  parcels: number;
}

const COUNTS = [0, 5, 100] as const;
const HEIGHTS = [260, 360, 480] as const;

export default function FillAPane() {
  const [count, setCount] = useState<number>(5);
  const [height, setHeight] = useState<number>(360);
  const [bounded, setBounded] = useState(false);
  const stops = useMemo<Stop[]>(
    () => Array.from({ length: count }, (_, i) => ({ id: `ST-${String(i + 1).padStart(4, "0")}`, street: `Dock ${1 + (i % 24)}`, parcels: 1 + ((i * 7) % 9) })),
    [count],
  );
  const { Table, Column, framed } = useTable(stops, { rowKey: (s) => s.id, pageSize: 5 });

  return (
    <div style={{ display: "grid", gap: "var(--u-space-3)" }}>
      <div style={{ display: "flex", gap: "var(--u-space-2)", flexWrap: "wrap", alignItems: "center" }}>
        {COUNTS.map((n) => (
          <Button key={n} size="sm" variant={n === count ? "primary" : "secondary"} onClick={() => setCount(n)}>
            {`${n} rows`}
          </Button>
        ))}
        {HEIGHTS.map((h) => (
          <Button key={h} size="sm" variant={h === height ? "primary" : "secondary"} onClick={() => setHeight(h)}>
            {`${h} px`}
          </Button>
        ))}
        <Button size="sm" variant={bounded ? "primary" : "secondary"} aria-pressed={bounded} onClick={() => setBounded(!bounded)}>
          maxHeight 200 px
        </Button>
      </div>
      <div data-pane style={{ height }}>
        <Table aria-label="Stops" maxHeight={bounded ? "200px" : undefined}>
          <Toolbar>
            <Search placeholder="Stop or dock" />
          </Toolbar>
          <Column value="id" label="Stop" rowHeader />
          <Column value="street" label="Dock" />
          <Column value="parcels" label="Parcels" />
          <Pagination />
        </Table>
      </div>
      <Text size="xs" tone="muted">{`The pane is ${height} px tall; the table ${framed ? "fills it" : "is as tall as its rows"}.${bounded ? " A maxHeight of your own wins." : ""}`}</Text>
    </div>
  );
}
