/* The reader's own zone with no zone named: the same rules as a named one on
   the day the clock goes back. Reader's zone Europe/Berlin (vitest.config.ts),
   25 October 2026: a day of 25 hours, 02:00 CEST then 02:00 CET. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { HOUR } from "@umriss-ui/charts";
import { DEFAULT_FORMATS } from "@umriss-ui/core";
import { ScheduleScene } from "../src/scene";
import type { SceneOptions } from "../src/sceneView";
import { fineTicks, timeText } from "../src/timeAxis";

const t = (iso: string) => Date.parse(iso);
const domain: [number, number] = [t("2026-10-25T00:00:00+02:00"), t("2026-10-25T06:00:00+01:00")];

afterEach(() => vi.useRealTimers());

describe("with no zone named", () => {
  it("keeps a two-hour step on even hours on both sides of the change", () => {
    const hours = fineTicks(domain, 2 * HOUR).map((tick) => new Date(tick.wallClock).getHours());
    expect(hours).toEqual([0, 2, 2, 4, 6]);
  });

  it("writes the offset inside the doubled hour only", () => {
    expect(timeText(DEFAULT_FORMATS, t("2026-10-25T02:00:00+02:00"))).toBe("02:00 GMT+2");
    expect(timeText(DEFAULT_FORMATS, t("2026-10-25T02:30:00+01:00"))).toBe("02:30 GMT+1");
    expect(timeText(DEFAULT_FORMATS, t("2026-10-25T03:00:00+01:00"))).toBe("03:00");
  });

  it("shows today as the whole 25-hour day", () => {
    vi.useFakeTimers({ now: t("2026-10-25T12:00:00+01:00") });
    const options: SceneOptions = {
      laneHeight: 44,
      calendar: [],
      zoomLimits: { min: HOUR, max: 100 * HOUR },
      snap: HOUR,
      intents: [],
      now: null,
      route: "curve",
      attach: "centre",
      ends: "dot",
    };
    const scene = new ScheduleScene();
    scene.setOptions(options);
    scene.bind(document.createElement("div"), document.createElement("div"), document.createElement("canvas"), document.createElement("canvas"));
    scene.resize(800, 100);
    const [from, to] = scene.visibleDomain();
    expect(from).toBe(t("2026-10-25T00:00:00+02:00"));
    expect(to).toBe(t("2026-10-26T00:00:00+01:00"));
  });
});
