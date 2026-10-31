/* A rowKey may return a number: selection, the current row, expanded rows and
   open branches carry it as returned, and 1 and "1" stay two keys. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src";
import type { Table } from "../src";

interface Pump {
  id: number | string;
  name: string;
  kids?: Pump[];
}

const PUMPS: Pump[] = [
  { id: 1, name: "One" },
  { id: "1", name: "Text one" },
  { id: 2, name: "Two", kids: [{ id: 21, name: "Child" }] },
];

let latest: Table<Pump, false, number | string> | null = null;
const capture = (t: Table<Pump, false, number | string>) => {
  latest = t;
};

function Pumps({ onSelect, onCurrent }: { onSelect: (keys: (number | string)[]) => void; onCurrent: (key: number | string) => void }) {
  const t = useTable(PUMPS, { rowKey: (p) => p.id, onSelectionChange: onSelect, childRows: (p) => p.kids });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame selectable onCurrentRowChange={onCurrent} aria-label="Pumps">
      <Column value="name" label="Pump" rowHeader />
    </Frame>
  );
}

describe("numeric row keys", () => {
  it("the selection and the current row report the key as returned", () => {
    const onSelect = vi.fn();
    const onCurrent = vi.fn();
    render(<Pumps onSelect={onSelect} onCurrent={onCurrent} />);
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes[1]!);
    expect(onSelect.mock.calls.at(-1)?.[0]).toEqual([1]);
    fireEvent.click(boxes[2]!);
    expect(onSelect.mock.calls.at(-1)?.[0]).toEqual([1, "1"]);
    fireEvent.click(screen.getByText("Text one"));
    expect(onCurrent).toHaveBeenCalledWith("1", PUMPS[1]);
  });

  it("an open branch with a number key stays open as a number", () => {
    render(<Pumps onSelect={() => undefined} onCurrent={() => undefined} />);
    expect(latest!.branches).toEqual([]);
    act(() => latest!.toggleBranch(2));
    expect(latest!.branches).toEqual([2]);
  });
});
