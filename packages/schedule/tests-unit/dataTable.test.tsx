/* The plan as a table, on demand: what a screen reader user meets through
   `useSchedule`. The plot is laid out as in readout.test.tsx (800 by 200
   pixels, 06-14 h of 17 March in view). */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, within } from "@testing-library/react";
import { useSchedule } from "../src";
import type { Subtask } from "../src";

const at = (hour: number, day = 17) => new Date(2026, 2, day, hour).getTime();
const WORK: Subtask[] = [
  { id: "late", task: "o1", lane: "paint", from: at(11), to: at(12), name: "Painting" },
  { id: "c1", task: "o1", lane: "press", from: at(8), to: at(10), name: "Cutting", leadIn: 30 * 60_000 },
  { id: "c2", task: "o2", lane: "press", from: at(9), to: at(11) },
  { id: "far", task: "o1", lane: "press", from: at(20), to: at(22), name: "Evening" },
  { id: "night", task: "o2", lane: "paint", from: at(13), to: at(2, 18), name: "Curing" },
  { id: "hall", task: "o2", lane: "store", from: at(7), to: at(8), name: "Stacking" },
];

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, width: 800, height: 200, right: 800, bottom: 200, toJSON: () => ({}),
  });
});
afterEach(() => vi.restoreAllMocks());

function Plan({ withTable = true }: { withTable?: boolean }) {
  const { Schedule, Lane, LaneGroup, Subtasks, DataTable } = useSchedule({ initialView: { domain: [at(6), at(14)], folded: ["depot"] } });
  return (
    <Schedule aria-label="Plan">
      <Lane id="press" label="Press" />
      <Lane id="paint" label="Paint shop" />
      <LaneGroup id="depot" label="Depot">
        <Lane id="store" label="Store" />
      </LaneGroup>
      <Subtasks data={WORK} tasks={[{ id: "o1", color: "red", name: "Order 1" }, { id: "o2", color: "blue", name: "Order 2" }]} />
      {withTable && <DataTable />}
    </Schedule>
  );
}

const key = (host: HTMLElement) => within(host).queryByRole("button", { name: /show data|hide data/i });
const cells = (row: HTMLElement) => within(row).getAllByRole("cell").map((cell) => cell.textContent);

describe("the plan as a table", () => {
  it("renders no key without the part", () => {
    const { container } = render(<Plan withTable={false} />);
    expect(key(container)).toBeNull();
  });

  it("holds a closed key that follows the plot in the tab order", () => {
    const { container } = render(<Plan />);
    const button = key(container)!;
    expect(button.textContent).toBe("Show data");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector("table")).toBeNull();
    const plot = container.querySelector("[role='application']")!;
    expect(plot.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("opens a table of the subtasks in view, in lane order, with dates, duration and findings in words", () => {
    const { container } = render(<Plan />);
    fireEvent.click(key(container)!);
    const button = key(container)!;
    expect(button.textContent).toBe("Hide data");
    const panel = document.getElementById(button.getAttribute("aria-controls")!)!;
    expect(panel.tabIndex).toBe(0);
    const table = within(panel).getByRole("table");
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Lane", "Task", "Subtask", "From", "To", "Duration", "Findings"]);
    expect(table.querySelector("caption")!.textContent).toContain("17/03 06:00");
    const rows = within(table).getAllByRole("row").slice(1);
    // Lane order: Press, Paint shop, then the folded group's Store; by start within a lane.
    expect(rows.map((row) => within(row).getByRole("rowheader").textContent)).toEqual(["Cutting", "c2", "Painting", "Curing", "Stacking"]);
    expect(cells(rows[0]!)).toEqual(["Press", "Order 1", "17/03 08:00", "17/03 10:00", "2 hrs, Lead-in 30 min", "Overlap with c2"]);
    expect(cells(rows[1]!).slice(0, 5)).toEqual(["Press", "Order 2", "17/03 09:00", "17/03 11:00", "2 hrs"]);
    expect(cells(rows[4]!)[0]).toBe("Store");
  });

  it("shows both dates of a subtask across midnight and leaves out one outside the span", () => {
    const { container } = render(<Plan />);
    fireEvent.click(key(container)!);
    const rows = within(container).getAllByRole("row");
    const curing = rows.find((row) => within(row).queryByRole("rowheader")?.textContent === "Curing")!;
    expect(cells(curing).slice(2, 5)).toEqual(["17/03 13:00", "18/03 02:00", "13 hrs"]);
    expect(rows.some((row) => row.textContent?.includes("Evening"))).toBe(false);
  });

  it("hides the plot and the lane headers from the tab order and the accessibility tree while open, and shows them again on close", () => {
    const { container } = render(<Plan />);
    const plot = container.querySelector("[role='application']")!;
    const headers = container.querySelector("[data-schedule-headers]")!;
    expect(plot.closest("[inert]")).toBeNull();
    fireEvent.click(key(container)!);
    expect(plot.closest("[inert]")).not.toBeNull();
    expect(headers.closest("[inert]")).not.toBeNull();
    fireEvent.click(key(container)!);
    expect(plot.closest("[inert]")).toBeNull();
    expect(container.querySelector("table")).toBeNull();
  });
});
