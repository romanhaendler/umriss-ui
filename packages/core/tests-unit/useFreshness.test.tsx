/* The hook re-reads the wall clock on every tick, so a clock step shows up
   within one cadence. The fake clock keeps its timers running while the wall
   time is set - the way a real clock steps - which is what these cases rely on. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFreshness } from "../src/lib/useFreshness";
import { cadence } from "../src/lib/freshness";

const AGES = { stale: 60_000, lost: 3_600_000 };
const START = new Date("2026-06-01T12:00:00Z").getTime();
const CADENCE = cadence(AGES);

beforeEach(() => vi.useFakeTimers({ now: START }));
afterEach(() => vi.useRealTimers());

describe("useFreshness after the wall clock steps", () => {
  it("is lost within one cadence after the clock steps an hour forward", () => {
    const { result } = renderHook(() => useFreshness(START, AGES));
    expect(result.current.freshness).toBe("fresh");
    act(() => {
      vi.setSystemTime(START + 3_600_000);
      vi.advanceTimersByTime(CADENCE);
    });
    expect(result.current.freshness).toBe("lost");
  });

  it("is fresh again within one cadence after the clock steps five minutes back", () => {
    const { result } = renderHook(() => useFreshness(START, AGES));
    act(() => vi.advanceTimersByTime(120_000));
    expect(result.current.freshness).toBe("stale");
    act(() => {
      vi.setSystemTime(START - 300_000);
      vi.advanceTimersByTime(CADENCE);
    });
    expect(result.current.freshness).toBe("fresh");
  });
});
