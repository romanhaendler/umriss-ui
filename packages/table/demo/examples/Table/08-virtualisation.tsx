import { useMemo } from "react";
import { Badge, Stack, Text, useFormats } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Virtualisation: twenty thousand rows";

/* `virtual` instead of a paging bar: what stands in the scroll area is
   rendered, and two filler rows keep the scrollbar at its full length.
   `rowHeight` - the option belongs to @umriss-ui/core - is the initial value;
   it is measured again at the first rendered row as soon as there is one.

   Everything else stays as it was. Sorting and searching act on all rows,
   "select all" on the filtered set, header and row header stick. The keyboard
   reaches rows that were never rendered: click into a row, then the arrow keys,
   Home and End. Beside virtualisation there are no pages - a `Pagination` would
   stay empty here.

   The rows are generated, with a fixed seed: every run yields the same ones. The
   minimum width comes from the application's stylesheet - `width` is an initial
   width - so that header and row header have something to stick against
   sideways as well. */

const STYLE = `
.readings-table table {
  min-width: 1300px;
}
`;

interface Reading {
  id: string;
  tag: string;
  station: string;
  value: number;
  unit: string;
  tolerance: number;
  load: number;
  status: "Normal" | "Elevated" | "Critical";
  note: string;
}

const STATIONS = ["North", "East", "South", "West", "Centre", "Harbour", "Ring", "Valley"] as const;
const UNITS = ["kWh", "m³/h", "bar", "°C"] as const;
const NOTES = ["Routine measurement", "Recalibrated", "Sensor replaced", "Reported by the plant", "Captured automatically"] as const;
const STATES = ["Normal", "Normal", "Normal", "Elevated", "Critical"] as const;
const TONE = { Normal: "success", Elevated: "warning", Critical: "danger" } as const;

const pick = <T,>(field: readonly T[], share: number): T => field[Math.floor(share * field.length) % field.length]!;

/* A linear congruential generator: the same seed yields the same sequence. */
function generate(count: number): Reading[] {
  let seed = 20260823;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  return Array.from({ length: count }, (_, i) => ({
    id: `m${i}`,
    tag: `MW-${String(i + 1).padStart(5, "0")}`,
    station: pick(STATIONS, next()),
    value: Math.round(next() * 9000) / 10,
    unit: pick(UNITS, next()),
    tolerance: Math.round(next() * 50) / 10,
    load: Math.round(next() * 100) / 100,
    status: pick(STATES, next()),
    note: pick(NOTES, next()),
  }));
}

export default function Virtualisation() {
  const readings = useMemo(() => generate(20_000), []);
  const formats = useFormats();
  const t = useTable(readings, {
    rowKey: (r) => r.id,
    defaultSort: { column: "tag", direction: "asc" },
    virtual: { rowHeight: 37 },
  });
  const { Table, Column } = t;

  return (
    <Stack gap={2}>
      <style>{STYLE}</style>
      <Table
        className="readings-table"
        selectable
        stickyHeader
        stickyRowHeader
        maxHeight="340px"
        ariaLabel="Readings"
      >
        <Toolbar>
          <Search placeholder="Tag or station" />
        </Toolbar>
        <Column value="tag" label="Tag" rowHeader width={130} />
        <Column value="station" label="Station" width={120} />
        <Column value="value" label="Reading" format={{ decimals: 1 }} width={120} />
        <Column value="unit" label="Unit" width={100} />
        <Column value="tolerance" label="Tolerance" format={{ decimals: 1 }} width={110} />
        <Column value="load" label="Load" format="percent" width={120} />
        <Column value="status" label="Status" width={120}>
          {(status) => <Badge tone={TONE[status]}>{status}</Badge>}
        </Column>
        <Column value="note" label="Note" width={220} />
      </Table>
      <Text size="xs" tone="muted" mono>
        {t.visible.length} of {formats.count(t.filtered.length)} rendered · {t.selection.count} selected
      </Text>
    </Stack>
  );
}
