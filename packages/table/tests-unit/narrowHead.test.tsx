/* A label wider than its column (ADR-0042): the column keeps its width, the
   label gives way and the arrow and the funnel stay. The widths themselves are
   the browser's; here the label's tip and the warning. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

interface Shipment {
  id: string;
  weight: number;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1", weight: 12.4 },
  { id: "FP-2", weight: 3.1 },
];

const LABEL = "Gross weight in kilograms";

function Shipments() {
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id });
  return (
    <Table ariaLabel="Shipments">
      <Column value="id" label="Shipment" rowHeader />
      <Column value="weight" label={LABEL} width={75} filter="range" />
    </Table>
  );
}

/* jsdom lays nothing out: the label is cut, or squeezed to nothing, in a
   table that is laid out - or in one that is not. */
function labelIs(width: number, laidOut = true) {
  const isLabel = (el: HTMLElement) => el.className.includes("headLabel");
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    return isLabel(this) ? 180 : 0;
  });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    if (!laidOut) return 0;
    return isLabel(this) ? width : 100;
  });
}

const label = () => screen.getAllByText(LABEL).find((el) => el.closest("th"))!;

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("a label wider than its column", () => {
  it("shows whole in the tip under the pointer", () => {
    vi.useFakeTimers();
    labelIs(40);
    render(<Shipments />);
    fireEvent.pointerOver(label());
    act(() => vi.advanceTimersByTime(400));
    expect(screen.getByRole("tooltip").textContent).toBe(LABEL);
  });

  it("shows whole in the tip at once when its sort button is reached", () => {
    vi.useFakeTimers();
    labelIs(40);
    render(<Shipments />);
    fireEvent.focusIn(screen.getByRole("button", { name: LABEL }));
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole("tooltip").textContent).toBe(LABEL);
  });

  it("stays away from the funnel beside it, which has a tip of its own", () => {
    vi.useFakeTimers();
    labelIs(40);
    render(<Shipments />);
    const sort = screen.getByRole("button", { name: LABEL });
    const funnel = Array.from(sort.closest("th")!.querySelectorAll("button")).find((b) => b !== sort)!;
    fireEvent.focusIn(funnel);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.queryAllByRole("tooltip").some((tip) => tip.textContent === LABEL)).toBe(false);
  });

  it("says nothing where the table is not laid out - in a closed panel, say", () => {
    labelIs(0, false);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Shipments />);
    expect(warn.mock.calls.filter(([message]) => String(message).includes(LABEL))).toHaveLength(0);
  });

  it("is counted whole when its column is fitted to its content", () => {
    function Resizable() {
      const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id });
      return (
        <Table ariaLabel="Shipments">
          <Column value="weight" label={LABEL} width={75} resizable />
        </Table>
      );
    }
    const { container } = render(<Resizable />);
    const head = container.querySelector<HTMLElement>('th[data-column="weight"]')!;
    /* The head shows 75 px, its label 40 of its 180. */
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
      return this.className.includes("headLabel") ? 180 : this === head ? 75 : 0;
    });
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
      return this.className.includes("headLabel") ? 40 : 0;
    });
    fireEvent.doubleClick(head.querySelector('[role="presentation"]')!);
    expect(head.style.width).toBe(`${75 + 140 + 1}px`);
  });

  it("says once in development when the width leaves no room for the label at all", () => {
    labelIs(0);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<Shipments />);
    rerender(<Shipments />);
    const said = warn.mock.calls.filter(([message]) => String(message).includes(LABEL));
    expect(said).toHaveLength(1);
  });
});
