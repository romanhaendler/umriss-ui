import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useTable } from "../src";
import type { Table } from "../src";

type P = { id: string; name: string };
const ALL: P[] = ["p1", "p2", "p3", "p4"].map((id) => ({ id, name: id }));
let cur: Table<P> | null = null;
function Host({ rows, fn }: { rows: P[]; fn: (k: string[]) => void }) {
  const t = useTable(rows, { rowKey: (p) => p.id, onSelectionChange: fn });
  cur = t;
  return (
    <t.Table selectable aria-label="x">
      <t.Column value="name" label="Name" rowHeader />
    </t.Table>
  );
}

it("rows deleted from the data leave the selection and the application hears it", () => {
  const fn = vi.fn();
  const { rerender } = render(<Host rows={ALL} fn={fn} />);
  fireEvent.click(screen.getAllByRole("checkbox")[0]!); // all
  expect(fn.mock.calls.at(-1)![0]).toHaveLength(4);
  rerender(<Host rows={ALL.slice(0, 1)} fn={fn} />); // bulk delete p2..p4
  act(() => {});
  expect(cur!.selection.selected.size).toBe(1); // actual: 4 ghost keys
  expect(fn.mock.calls.at(-1)![0]).toEqual(["p1"]); // actual: never told
});
