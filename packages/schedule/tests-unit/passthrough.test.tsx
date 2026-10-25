/* The pass-through guard of the schedule: the schedule is a composite - ref,
   class, style and the rest reach its root <div>; the name reaches the figure
   root and the plot (`aria-describedby` the plot alone, joined to its summary)
   - and its parts declare what it draws. The `Schedule` and the parts that
   `useSchedule` hands back are read from a harness, so that they stand among
   the exports the guard lists. */

import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import type { ReactNode } from "react";
import { render, renderHook } from "@testing-library/react";
import * as schedule from "../src";
import { useSchedule } from "../src";
import type { ScheduleHandle } from "../src";
import { passThroughGuard } from "../../demo/tests-support/passThroughGuard.tsx";
import type { PassThroughCase, Probe } from "../../demo/tests-support/passThroughGuard.tsx";

/* Untyped, as in core's guard: a part that does not take a ref yet fails this
   test by name instead of the type check. */
const p = (probe: Probe) => probe as object;

function Harness({ through, children }: { through?: object; children?: ReactNode }) {
  const s = useSchedule();
  return (
    <s.Schedule aria-label="Plan" {...through}>
      {children}
    </s.Schedule>
  );
}

const CASES: Record<string, PassThroughCase> = {
  Schedule: {
    render: (probe) => <Harness through={p(probe)} />,
    shape: "composite",
    named: (frame) => frame.querySelector('[role="application"]'),
    alsoLabelled: (frame) => frame,
  },
};

const { result, unmount } = renderHook(() => useSchedule());
const { Schedule, Lane, LaneGroup, Subtasks, Dependencies, BlockedTimes, Milestones } = result.current;
unmount();

const DECLARES = "declares what the schedule draws; no element of its own stands in the page";
passThroughGuard(
  "schedule",
  { ...schedule, Schedule, Lane, LaneGroup, Subtasks, Dependencies, BlockedTimes, Milestones },
  CASES,
  {
    Lane: DECLARES,
    LaneGroup: DECLARES,
    Subtasks: DECLARES,
    Dependencies: DECLARES,
    BlockedTimes: DECLARES,
    Milestones: DECLARES,
  },
);

describe("the root of the schedule", () => {
  it("ref is the root <div>, and it carries the test id", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Harness through={{ ref, "data-testid": "plan", id: "plan" }} />);
    expect(ref.current).toBe(container.querySelector("#plan"));
    expect(ref.current!.tagName).toBe("DIV");
    expect(ref.current!.getAttribute("data-testid")).toBe("plan");
  });

  it("joins a caller's aria-describedby to the summary, its own first", () => {
    const { container } = render(<Harness through={{ "aria-describedby": "note" }} />);
    const ids = container.querySelector('[role="application"]')!.getAttribute("aria-describedby")!.split(" ");
    expect(ids[0]).toBe("note");
    expect(ids).toHaveLength(2);
    expect(container.querySelector(`[id="${ids[1]}"]`)).not.toBeNull();
  });

  it("aria-labelledby names both elements", () => {
    const { container } = render(<Harness through={{ "aria-label": undefined, "aria-labelledby": "h" }} />);
    expect(container.querySelectorAll('[aria-labelledby="h"]')).toHaveLength(2);
  });
});

describe("the deprecated name", () => {
  it("ariaLabel still names the root and the plot, and warns once for two schedules", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <>
        <Harness through={{ "aria-label": undefined, ariaLabel: "Old" }} />
        <Harness through={{ "aria-label": undefined, ariaLabel: "Old" }} />
      </>,
    );
    expect(container.querySelectorAll('[aria-label="Old"]')).toHaveLength(4);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("ariaLabel is deprecated");
    warn.mockRestore();
  });
});

describe("the handle functions", () => {
  it("answer null before a schedule is mounted, and visibleDomain from the scene", () => {
    const { result: hook } = renderHook(() => useSchedule());
    expect(hook.current.positionAt(1, 1)).toBeNull();
    expect(hook.current.clientPointOf(0)).toBeNull();
    expect(hook.current.visibleDomain()).toHaveLength(2);
  });

  it("stay on the root element through a ref typed at the handle, and warn once on the first call", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ref = createRef<ScheduleHandle>();
    render(<Harness through={{ ref }} />);
    expect(ref.current!.visibleDomain()).toHaveLength(2);
    ref.current!.clientPointOf(0);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("useSchedule");
    warn.mockRestore();
  });
});
