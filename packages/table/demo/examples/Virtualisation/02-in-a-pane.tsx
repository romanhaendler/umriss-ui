import { useMemo } from "react";
import { Text } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Inside a pane of fixed height";
export const lead = "In a parent of definite height the table stays within it: the toolbar keeps its place, the rows scroll, and `virtual` renders only the window - no `maxHeight` needed.";

interface Stop {
  id: string;
  street: string;
  parcels: number;
}

export default function InAPane() {
  const stops = useMemo<Stop[]>(
    () => Array.from({ length: 300 }, (_, i) => ({ id: `ST-${String(i + 1).padStart(4, "0")}`, street: `Dock ${1 + (i % 24)}`, parcels: 1 + ((i * 7) % 9) })),
    [],
  );
  const { Table, Column } = useTable(stops, { rowKey: (s) => s.id, virtual: true });

  return (
    <div data-pane style={{ height: 320, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "1 1 0", minHeight: 0 }}>
        <Table stickyHeader ariaLabel="Stops">
          <Toolbar>
            <Search placeholder="Stop or dock" />
          </Toolbar>
          <Column value="id" label="Stop" rowHeader />
          <Column value="street" label="Dock" />
          <Column value="parcels" label="Parcels" />
        </Table>
      </div>
      <Text size="xs" tone="muted">The pane is 320 px tall.</Text>
    </div>
  );
}
