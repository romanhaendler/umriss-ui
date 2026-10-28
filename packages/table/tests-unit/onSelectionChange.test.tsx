/* `onSelectionChange` hands the application the selected keys after each
   change, from an effect: a parent may store them in state without a loop. */

import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable, useTableSelection } from "../src";
import type { Table } from "../src";

const PUMPS = [
  { id: "p1", name: "Pump 1" },
  { id: "p2", name: "Pump 2" },
  { id: "p3", name: "Pump 3" },
  { id: "p4", name: "Pump 4" },
];

const IDS = PUMPS.map((p) => p.id);
let current: Table<(typeof PUMPS)[number]> | null = null;
const capture = (t: Table<(typeof PUMPS)[number]>) => {
  current = t;
};
function Pumps({ onSelectionChange, held = false }: { onSelectionChange: (keys: string[]) => void; held?: boolean }) {
  const own = useTableSelection(IDS);
  const t = useTable(PUMPS, { rowKey: (p) => p.id, onSelectionChange, ...(held ? { selection: own } : {}) });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame selectable aria-label="Pumps">
      <Column value="name" label="Pump" rowHeader />
    </Frame>
  );
}

const boxes = () => screen.getAllByRole("checkbox") as HTMLElement[];
const last = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls.at(-1)?.[0];

describe.each([false, true])("onSelectionChange (controlled: %s)", (held) => {
  it("reports ticking, select all, a shift range and clearing once each", () => {
    const fn = vi.fn();
    render(<Pumps onSelectionChange={fn} held={held} />);
    expect(fn).not.toHaveBeenCalled();

    fireEvent.click(boxes()[2]!); // row p2 (0 is the header box)
    expect(fn).toHaveBeenCalledTimes(1);
    expect(last(fn)).toEqual(["p2"]);

    fireEvent.click(boxes()[4]!, { shiftKey: true }); // p2..p4
    expect(fn).toHaveBeenCalledTimes(2);
    expect(last(fn)).toEqual(["p2", "p3", "p4"]);

    fireEvent.click(boxes()[0]!); // select all
    expect(fn).toHaveBeenCalledTimes(3);
    expect([...last(fn)].sort()).toEqual(["p1", "p2", "p3", "p4"]);

    fireEvent.click(boxes()[0]!); // clear
    expect(fn).toHaveBeenCalledTimes(4);
    expect(last(fn)).toEqual([]);
  });

  it("reports a change made through the API", () => {
    const fn = vi.fn();
    render(<Pumps onSelectionChange={fn} held={held} />);
    act(() => current!.selection.toggle("p3"));
    expect(last(fn)).toEqual(["p3"]);
  });
});

it("lets a parent store the keys in state without a loop", () => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  function Parent() {
    const [keys, setKeys] = useState<string[]>([]);
    return (
      <>
        <output>{keys.join(",")}</output>
        <Pumps onSelectionChange={setKeys} />
      </>
    );
  }
  render(<Parent />);
  fireEvent.click(boxes()[1]!);
  expect(screen.getByRole("status", { hidden: true }).textContent).toBe("p1");
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});
