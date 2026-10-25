/* useSchedule - the schedule is declared through a hook, as the table is
   (ADR-0048, charts-bound-to-rows 08). */

import { describe, expect, it } from "vitest";
import { act, render, renderHook } from "@testing-library/react";
import { useSchedule, type ScheduleParts, type ScheduleView } from "../src";

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
        <Schedule aria-label="Plan of week 12">
          <Lane id="press" label="Press" />
          <Subtasks data={[]} tasks={[]} />
        </Schedule>
      );
    }
    const { container } = render(<Plan />);
    expect(container.textContent).toContain("Press");
  });
});

describe("useSchedule view", () => {
  const hook = (initialView?: ScheduleView, onViewChange?: (v: ScheduleView) => void) =>
    renderHook((p: { initialView?: ScheduleView }) => useSchedule({ initialView: p.initialView, onViewChange }), {
      initialProps: { initialView },
    });

  it("reads initialView once - a later one is ignored", () => {
    const { result, rerender } = hook({ domain: [0, 100] });
    rerender({ initialView: { domain: [200, 300] } });
    expect(result.current.view.domain).toEqual([0, 100]);
  });

  it("goes to a view with setView", () => {
    const { result } = hook();
    act(() => result.current.setView({ domain: [10, 20] }));
    expect(result.current.view.domain).toEqual([10, 20]);
    act(() => result.current.setView({}));
    expect(result.current.view.domain).toBeUndefined();
  });

  it("does not report setView through onViewChange, but reports what the planner does after it", () => {
    const seenViews: ScheduleView[] = [];
    const { result } = hook(undefined, (v) => seenViews.push(v));
    act(() => result.current.setDomain([1, 2]));
    expect(seenViews).toEqual([{ domain: [1, 2] }]);
    act(() => result.current.setView({ domain: [3, 4] }));
    expect(seenViews).toHaveLength(1);
    act(() => result.current.setDomain([5, 6]));
    expect(seenViews).toEqual([{ domain: [1, 2] }, { domain: [5, 6] }]);
  });

  it("keeps two schedules linked both ways in step; the other reports nothing", () => {
    const toA: ScheduleView[] = [];
    const toB: ScheduleView[] = [];
    type Hooked = ReturnType<typeof renderHook<ScheduleParts, unknown>>;
    const a: Hooked = renderHook(() => useSchedule({ onViewChange: (v) => (toB.push(v), b.result.current.setView(v)) }));
    const b: Hooked = renderHook(() => useSchedule({ onViewChange: (v) => (toA.push(v), a.result.current.setView(v)) }));
    act(() => a.result.current.setDomain([1, 2]));
    expect(b.result.current.view.domain).toEqual([1, 2]);
    expect(toB).toHaveLength(1);
    expect(toA).toHaveLength(0);
    act(() => b.result.current.setDomain([3, 4]));
    expect(a.result.current.view.domain).toEqual([3, 4]);
    expect(toA).toHaveLength(1);
    expect(toB).toHaveLength(1);
  });
});
