/* A keystroke in a cell editor of a grid builds nothing over all rows: the
   lines, the open details and the key lookups are kept while rows, columns,
   open details and footer stay as they are (ADR-0034). */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

interface Pump {
  id: string;
  name: string;
  flow: number;
}

const PUMPS: Pump[] = Array.from({ length: 1000 }, (_, i) => ({ id: `p${i}`, name: `Pump ${i}`, flow: i }));

describe("A keystroke in an open cell editor of a grid in a virtual window", () => {
  it("reads the key of no more rows than the window renders", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    const rowKey = vi.fn((p: Pump) => p.id);
    function Grid() {
      const { Table, Column } = useTable(PUMPS, { rowKey, virtual: true });
      return (
        <Table grid aria-label="Pumps" maxHeight="100px">
          <Column value="name" label="Pump" rowHeader />
          <Column value="flow" label="Flow" edit="number" />
        </Table>
      );
    }
    render(<Grid />);
    act(() => screen.getByText("3").closest<HTMLElement>("td")!.focus());
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    const input = document.activeElement as HTMLInputElement;
    fireEvent.change(input, { target: { value: "4" } });
    rowKey.mockClear();
    fireEvent.change(input, { target: { value: "45" } });
    expect(screen.getByDisplayValue("45")).toBeTruthy();
    expect(rowKey.mock.calls.length).toBeLessThan(200);
  });
});
