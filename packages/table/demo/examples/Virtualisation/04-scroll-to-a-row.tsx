import { useMemo, useState } from "react";
import { Button, Stack } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Bring a row into view from outside";
export const lead = "`scrollToRow(key)` scrolls a row of the table into view from anywhere, also one that is not rendered yet; in grid mode `focusCell(key, column)` puts the focus on one of its cells. Both return `false` for a row the table does not show.";

interface Tag {
  id: string;
  name: string;
  value: number;
}

const ALARMS = ["TAG-00042", "TAG-07500", "TAG-10000"];

export default function ScrollToARow() {
  const tags = useMemo<Tag[]>(
    () => Array.from({ length: 10_000 }, (_, i) => ({ id: `TAG-${String(i + 1).padStart(5, "0")}`, name: `Sensor ${i + 1}`, value: (i * 37) % 100 })),
    [],
  );
  const { Table, Column, scrollToRow, focusCell } = useTable(tags, { rowKey: (t) => t.id, virtual: true });
  const [picked, setPicked] = useState(ALARMS[1]!);

  return (
    <Stack gap={2}>
      <Stack direction="row" gap={1}>
        {ALARMS.map((id) => (
          <Button
            key={id}
            variant="secondary"
            onClick={() => {
              setPicked(id);
              scrollToRow(id);
            }}
          >
            {`Show ${id}`}
          </Button>
        ))}
        <Button variant="secondary" onClick={() => focusCell(picked, "value")}>
          {`Focus the value of ${picked}`}
        </Button>
      </Stack>
      <Table grid maxHeight="240px" stickyHeader aria-label="Tags">
        <Column value="id" label="Tag" rowHeader />
        <Column value="name" label="Name" />
        <Column value="value" label="Value" />
      </Table>
    </Stack>
  );
}
