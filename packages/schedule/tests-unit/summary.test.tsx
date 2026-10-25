/* The summary a plot is described by, for the plan the server renders without
   it: after mount it counts the lanes and subtasks in view. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { useSchedule } from "../src";
import type { Milestone, Subtask } from "../src";

const at = (hour: number) => new Date(2026, 2, 17, hour).getTime();
const WORK: Subtask[] = [
  { id: "c", task: "o1", lane: "press", from: at(8), to: at(10), name: "Cutting" },
  { id: "p", task: "o1", lane: "paint", from: at(11), to: at(12), name: "Painting" },
];
const MILESTONES: Milestone[] = [{ id: "m", lane: "press", at: at(12), label: "Release" }];

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, width: 800, height: 200, right: 800, bottom: 200, toJSON: () => ({}),
  });
});
afterEach(() => vi.restoreAllMocks());

function Plan() {
  const { Schedule, Lane, Subtasks, Milestones } = useSchedule({ initialView: { domain: [at(6), at(14)] } });
  return (
    <Schedule aria-label="Production plan" now={at(9)}>
      <Lane id="press" label="Press" />
      <Lane id="paint" label="Paint shop" />
      <Subtasks data={WORK} tasks={[{ id: "o1", color: "red", name: "Order 1" }]} />
      <Milestones data={MILESTONES} />
    </Schedule>
  );
}

describe("the schedule's summary after mount", () => {
  it("counts the lanes and subtasks in view for the plan", () => {
    const { getByRole, container } = render(<Plan />);
    const describedBy = getByRole("application").getAttribute("aria-describedby");
    const summary = container.ownerDocument.getElementById(describedBy ?? "");
    expect(summary?.textContent).toContain("2 lanes, 2 subtasks in view");
    expect(summary?.textContent).toContain("1 milestone");
  });
});
