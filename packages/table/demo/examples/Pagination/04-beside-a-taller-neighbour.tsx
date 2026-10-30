import { useState } from "react";
import { Button, Text } from "@umriss-ui/core";
import { Pagination, useTable } from "../../../src";

export const title = "Beside a taller neighbour";

export const lead = "A table in a stretched grid row fills the row, and asks of it only the height of its page - never its rows. When the neighbour grows the table grows with it; when it shrinks the row shrinks back.";

interface Stop {
  id: string;
  street: string;
}

const STOPS: Stop[] = Array.from({ length: 100 }, (_, i) => ({ id: `ST-${String(i + 1).padStart(4, "0")}`, street: `Dock ${1 + (i % 24)}` }));
const HEIGHTS = [200, 500, 700] as const;

export default function BesideATallerNeighbour() {
  const [height, setHeight] = useState<number>(200);
  const { Table, Column } = useTable(STOPS, { rowKey: (s) => s.id, pageSize: 10 });

  return (
    <div style={{ display: "grid", gap: "var(--u-space-3)" }}>
      <div style={{ display: "flex", gap: "var(--u-space-2)" }}>
        {HEIGHTS.map((h) => (
          <Button key={h} size="sm" variant={h === height ? "primary" : "secondary"} onClick={() => setHeight(h)}>
            {`Neighbour ${h} px`}
          </Button>
        ))}
      </div>
      <div data-row style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--u-space-4)" }}>
        <div data-cell>
          <Table aria-label="Stops">
            <Column value="id" label="Stop" rowHeader />
            <Column value="street" label="Dock" />
            <Pagination />
          </Table>
        </div>
        <div data-neighbour style={{ height, borderRadius: "var(--u-radius-md)", boxShadow: "var(--u-edge)", padding: "var(--u-space-3)" }}>
          <Text size="xs" tone="muted">{`A neighbour ${height} px tall.`}</Text>
        </div>
      </div>
    </div>
  );
}
