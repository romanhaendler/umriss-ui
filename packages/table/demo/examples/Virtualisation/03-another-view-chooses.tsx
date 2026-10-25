import { useMemo, useState } from "react";
import { Button, Stack } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Another view chooses a row";
export const lead = "When `currentRow` becomes the key of a row outside the window, the table renders that row and scrolls it in. Focus stays where it was.";

interface Parcel {
  id: string;
  town: string;
  weight: number;
}

export default function AnotherViewChooses() {
  const parcels = useMemo<Parcel[]>(
    () => Array.from({ length: 2000 }, (_, i) => ({ id: `P-${String(i + 1).padStart(4, "0")}`, town: `Town ${1 + ((i * 7) % 40)}`, weight: 1 + ((i * 13) % 30) })),
    [],
  );
  const [current, setCurrent] = useState<string | null>(null);
  const { Table, Column } = useTable(parcels, { rowKey: (p) => p.id, virtual: true });

  return (
    <Stack gap={2} align="start">
      <Stack direction="row" gap={2}>
        <Button onClick={() => setCurrent("P-1500")}>Choose parcel 1,500</Button>
        <Button onClick={() => setCurrent("P-0001")}>Choose parcel 1</Button>
      </Stack>
      <Table stickyHeader maxHeight="300px" aria-label="Parcels" currentRow={current} onCurrentRowChange={(key) => setCurrent(key)}>
        <Column value="id" label="Parcel" rowHeader />
        <Column value="town" label="Town" />
        <Column value="weight" label="Weight (kg)" />
      </Table>
    </Stack>
  );
}
