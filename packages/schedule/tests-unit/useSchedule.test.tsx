/* useSchedule - the schedule is declared through a hook, as the table is
   (ADR-0048, charts-bound-to-rows 08). */

import { describe, expect, it } from "vitest";
import { render, renderHook } from "@testing-library/react";
import { useSchedule } from "../src";

describe("useSchedule", () => {
  it("hands back the same parts on every render - no lane or layer is remounted", () => {
    const { result, rerender } = renderHook(() => useSchedule());
    const first = result.current;
    rerender();
    for (const name of ["Schedule", "Lane", "LaneGroup", "Subtasks", "Dependencies", "BlockedTimes"] as const) {
      expect(result.current[name], name).toBe(first[name]);
    }
  });

  it("hands back the same object while the view stays - a dependency on it does not run again", () => {
    const { result, rerender } = renderHook(() => useSchedule());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("draws what its parts declare", () => {
    function Plan() {
      const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: [0, 3_600_000] } });
      return (
        <Schedule ariaLabel="Plan of week 12">
          <Lane id="press" label="Press" />
          <Subtasks data={[]} tasks={[]} />
        </Schedule>
      );
    }
    const { container } = render(<Plan />);
    expect(container.textContent).toContain("Press");
  });
});
