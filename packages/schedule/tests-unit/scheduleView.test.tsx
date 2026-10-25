/* The schedule holds its own view (ADR-0047, component-view 07): a start
   through `initialView`, read once, every change the planner makes reported
   once through `onViewChange`, and `setView` and the setters on what `useSchedule` hands back. jsdom lays out nothing, so every
   element is given the plot's size: 800 by 200 pixels. */

import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSchedule } from "../src";
import type { ScheduleOptions, ScheduleView, Subtask } from "../src";

const at = (hour: number) => new Date(2026, 2, 17).getTime() + hour * 3_600_000;
const WORK: Subtask[] = [
  { id: "c", task: "o1", lane: "press", from: at(8), to: at(10), leadIn: 30 * 60_000 },
  { id: "p", task: "o1", lane: "paint", from: at(11), to: at(12) },
];
const TASKS = [{ id: "o1", color: "red" }];

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, width: 800, height: 200, right: 800, bottom: 200, toJSON: () => ({}),
  });
});
afterEach(() => vi.restoreAllMocks());

type Hook = ReturnType<typeof useSchedule>;
let hook: Hook;
/* Through a function: a component may not assign what lies outside it. */
const capture = (s: Hook) => {
  hook = s;
};

function Plan(options: ScheduleOptions) {
  const s = useSchedule(options);
  capture(s);
  const { Schedule, Lane, LaneGroup, Subtasks } = s;
  return (
    <Schedule aria-label="Plan of Tuesday">
      <LaneGroup id="hall" label="Hall">
        <Lane id="press" label="Press" />
        <Lane id="paint" label="Paint shop" />
      </LaneGroup>
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}

const lanes = (host: HTMLElement) => host.querySelectorAll("[data-schedule-headers] [data-lane]").length;

describe("the span in view", () => {
  it("is the subtasks' extent while the view names none, and the view says nothing of it", () => {
    render(<Plan />);
    expect(hook.visibleDomain()).toEqual([at(7.5), at(12)]);
    expect(hook.view).toEqual({});
  });

  it("is the view's span where it names one", () => {
    render(<Plan initialView={{ domain: [at(6), at(14)] }} />);
    expect(hook.visibleDomain()).toEqual([at(6), at(14)]);
    expect(hook.view).toEqual({ domain: [at(6), at(14)] });
  });

  it("moves through setDomain, and back to the extent with null", () => {
    render(<Plan />);
    act(() => hook.setDomain([at(9), at(10)]));
    expect(hook.visibleDomain()).toEqual([at(9), at(10)]);
    expect(hook.view).toEqual({ domain: [at(9), at(10)] });
    act(() => hook.setDomain(null));
    expect(hook.visibleDomain()).toEqual([at(7.5), at(12)]);
    expect(hook.view).toEqual({});
  });
});

describe("a view set", () => {
  it("goes to a whole view, and a view with the content already shown changes nothing", () => {
    render(<Plan initialView={{ domain: [at(6), at(14)] }} />);
    act(() => hook.setDomain([at(9), at(10)]));
    act(() => hook.setView({ domain: [at(9), at(10)] }));
    expect(hook.visibleDomain()).toEqual([at(9), at(10)]);
    act(() => hook.setView({ domain: [at(7), at(13)], folded: ["hall"] }));
    expect(hook.visibleDomain()).toEqual([at(7), at(13)]);
    expect(hook.view).toEqual({ domain: [at(7), at(13)], folded: ["hall"] });
  });

  it("puts back what it leaves out", () => {
    render(<Plan initialView={{ domain: [at(6), at(14)], folded: ["hall"] }} />);
    act(() => hook.setView({}));
    expect(hook.view).toEqual({});
    expect(hook.visibleDomain()).toEqual([at(7.5), at(12)]);
  });

  it("is not reported, and a later change of the planner's is", () => {
    const keep = vi.fn();
    render(<Plan initialView={{ domain: [at(6), at(14)] }} onViewChange={keep} />);
    act(() => hook.setDomain([at(9), at(10)]));
    expect(keep).toHaveBeenCalledTimes(1);
    act(() => hook.setView({ domain: [at(7), at(13)] }));
    expect(keep).toHaveBeenCalledTimes(1);
    act(() => hook.setDomain([at(9), at(11)]));
    expect(keep).toHaveBeenLastCalledWith({ domain: [at(9), at(11)] });
  });

  it("loses the groups no LaneGroup declares", () => {
    const { container } = render(<Plan initialView={{ folded: ["gone", "hall"] }} />);
    expect(hook.view).toEqual({ folded: ["hall"] });
    expect(lanes(container)).toBe(0);
  });
});

describe("onViewChange", () => {
  it("is not called for the view the schedule starts with", () => {
    const report = vi.fn();
    render(<Plan initialView={{ domain: [at(6), at(14)] }} onViewChange={report} />);
    expect(report).not.toHaveBeenCalled();
  });

  it("is not called for the start losing a group no LaneGroup declares - only once the planner changes something", () => {
    const report = vi.fn();
    render(<Plan initialView={{ folded: ["gone", "hall"] }} onViewChange={report} />);
    expect(report).not.toHaveBeenCalled();
    act(() => hook.setDomain([at(9), at(10)]));
    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenLastCalledWith({ domain: [at(9), at(10)], folded: ["hall"] });
  });

  it("is called once per change, always with the whole view", () => {
    const report = vi.fn();
    const { container } = render(<Plan initialView={{ domain: [at(6), at(14)] }} onViewChange={report} />);
    act(() => hook.setDomain([at(9), at(10)]));
    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenLastCalledWith({ domain: [at(9), at(10)] });
    fireEvent.click(container.querySelector("[data-group='hall'] button")!);
    expect(report).toHaveBeenCalledTimes(2);
    expect(report).toHaveBeenLastCalledWith({ domain: [at(9), at(10)], folded: ["hall"] });
  });

  it("hears a pan once per frame, however many wheel steps it took", async () => {
    const report = vi.fn();
    const { container } = render(<Plan initialView={{ domain: [at(6), at(14)] }} onViewChange={report} />);
    const root = container.querySelector<HTMLElement>("[role='figure']")!;
    /* 800 pixels for eight hours: a hundred pixels are an hour. */
    for (let step = 0; step < 3; step++) fireEvent.wheel(root, { deltaX: 100 });
    await act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenLastCalledWith({ domain: [at(9), at(17)] });
  });
});

describe("folding through the setters", () => {
  it("folds one group, every group, and none", () => {
    const { container } = render(<Plan />);
    expect(lanes(container)).toBe(2);
    act(() => hook.toggleGroup("hall"));
    expect(lanes(container)).toBe(0);
    expect(hook.view).toEqual({ folded: ["hall"] });
    act(() => hook.unfoldAll());
    expect(lanes(container)).toBe(2);
    expect(hook.view).toEqual({});
    act(() => hook.foldAll());
    expect(hook.view).toEqual({ folded: ["hall"] });
  });

  it("keeps the parts the same while the view changes - nothing is remounted", () => {
    render(<Plan />);
    const first = hook;
    act(() => hook.toggleGroup("hall"));
    for (const name of ["Schedule", "Lane", "LaneGroup", "Subtasks", "Dependencies", "BlockedTimes", "Milestones"] as const) {
      expect(hook[name], name).toBe(first[name]);
    }
  });
});

describe("two schedules in step", () => {
  let upperNow: Hook;
  let lowerNow: Hook;
  const both = (one: Hook, other: Hook) => {
    upperNow = one;
    lowerNow = other;
  };
  function Two() {
    const start: ScheduleView = { domain: [at(6), at(14)] };
    const upper: Hook = useSchedule({ initialView: start, onViewChange: (v) => lowerNow.setView(v) });
    const lower: Hook = useSchedule({ initialView: start, onViewChange: (v) => upperNow.setView(v) });
    both(upper, lower);
    const { Schedule: Upper, Lane: UpperLane } = upper;
    const { Schedule: Lower, Lane: LowerLane } = lower;
    return (
      <>
        <Upper aria-label="Diesel">
          <UpperLane id="truck" />
        </Upper>
        <Lower aria-label="Electric">
          <LowerLane id="van" />
        </Lower>
      </>
    );
  }

  it("follow each other through the view, without a remount", () => {
    const { container } = render(<Two />);
    const plots = [...container.querySelectorAll("[data-schedule-plot]")];
    act(() => upperNow.setDomain([at(9), at(11)]));
    expect(lowerNow.view).toEqual({ domain: [at(9), at(11)] });
    act(() => lowerNow.setDomain([at(10), at(12)]));
    expect(upperNow.view).toEqual({ domain: [at(10), at(12)] });
    expect([...container.querySelectorAll("[data-schedule-plot]")]).toEqual(plots);
  });
});
