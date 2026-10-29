import { useMemo } from "react";
import { ColumnGroup, useTable } from "../../../src";

export const title = "Column groups over virtual rows";
export const lead = "Two thousand rows, rendered a window at a time: both head rows stay in the sticky head, and a screen reader still counts each row within the whole set.";

interface Reading {
  id: string;
  mon: number;
  tue: number;
  wed: number;
}

export default function GroupsOverVirtualRows() {
  const readings = useMemo<Reading[]>(
    () => Array.from({ length: 2000 }, (_, i) => ({ id: `R-${String(i + 1).padStart(4, "0")}`, mon: i % 17, tue: (i * 3) % 19, wed: (i * 7) % 23 })),
    [],
  );
  const { Table, Column } = useTable(readings, { rowKey: (r) => r.id, virtual: true });

  return (
    <Table stickyHeader maxHeight="300px" aria-label="Readings">
      <Column value="id" label="Reading" rowHeader />
      <ColumnGroup label="Week 1">
        <Column value="mon" label="Mon" numeric />
        <Column value="tue" label="Tue" numeric />
        <Column value="wed" label="Wed" numeric />
      </ColumnGroup>
    </Table>
  );
}
