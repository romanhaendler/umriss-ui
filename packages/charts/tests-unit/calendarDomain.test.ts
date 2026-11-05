/* A fixed domain is named on the wall clock; on a calendar axis it is mapped
   into working time like the data, a held zoom span is left alone. */

import { describe, expect, it } from "vitest";
import type { ChartScene } from "../src/scene";
import { domainOf, ownDomainOf } from "../src/sceneView";
import type { AxisConfig } from "../src/types";

const DAY = 86_400_000;
const HOUR = 3_600_000;
const MON = Date.UTC(2024, 0, 1);
const CALENDAR = [{ from: MON, to: MON + 5 * DAY }, { from: MON + 7 * DAY, to: MON + 12 * DAY }];

const scene = (spans: Record<string, readonly [number, number]> = {}) =>
  ({ categoriesAt: () => undefined, heldSpans: spans }) as unknown as ChartScene;
const axis = (extra: Partial<AxisConfig>) =>
  ({ id: "x", orientation: "x", domain: [MON + DAY + 6 * HOUR, MON + 2 * DAY + 14 * HOUR], ...extra }) as AxisConfig;

describe("a fixed domain on a calendar axis", () => {
  it("maps into working time", () => {
    expect(ownDomainOf(scene(), axis({ calendar: CALENDAR }))).toEqual([DAY + 6 * HOUR, 2 * DAY + 14 * HOUR]);
  });
  it("stays as it is without a calendar", () => {
    const a = axis({});
    expect(ownDomainOf(scene(), a)).toBe(a.domain);
  });
  it("leaves a held zoom span alone", () => {
    const a = axis({ calendar: CALENDAR, zoomable: true });
    expect(domainOf(scene({ x: [5, 9] }), a)).toEqual([5, 9]);
  });
});
