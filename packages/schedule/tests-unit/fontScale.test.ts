/* A reader's larger root font size grows the lanes and spreads the axis labels
   by the same ratio; at the default size nothing moves. */

import { describe, expect, it, vi } from "vitest";
import { HOUR, MINUTE } from "@umriss-ui/charts";
import { ScheduleScene } from "../src/scene";
import { SceneData } from "../src/sceneData";
import { SceneView } from "../src/sceneView";
import { fontScaleOf } from "../src/timeAxis";

function view(): SceneView {
  const data = new SceneData(() => {});
  data.registerLane({ id: "a", label: "A" });
  data.registerLane({ id: "b", label: "B" });
  data.rebuild();
  const v = new SceneView(data);
  v.width = 800;
  v.setOptions({ ...v.options, laneHeight: 40 });
  v.domain = [0, (800 * 10 * MINUTE) / 56];
  return v;
}

describe("fontScaleOf", () => {
  it("is 1 at and below the default root font size", () => {
    expect(fontScaleOf(16)).toBe(1);
    expect(fontScaleOf(12)).toBe(1);
    expect(fontScaleOf(Number.NaN)).toBe(1);
  });
  it("is the ratio above it", () => {
    expect(fontScaleOf(32)).toBe(2);
  });
});

describe("a larger root font size", () => {
  it("leaves lanes and step as they are at the default size", () => {
    const v = view();
    v.setFontScale(1);
    v.layout();
    expect(v.rows.height).toBe(80);
    expect(v.step()).toBe(15 * MINUTE);
  });
  it("multiplies the lane height", () => {
    const v = view();
    v.setFontScale(2);
    v.layout();
    expect(v.rows.height).toBe(160);
  });
  it("widens the tick step so the labels keep their room", () => {
    const v = view();
    v.setFontScale(2);
    expect(v.step()).toBeGreaterThan(15 * MINUTE);
  });
});

describe("the scene's font scale", () => {
  function scene(): ScheduleScene {
    const s = new ScheduleScene({ domain: [0, 8 * HOUR] });
    s.registerLane({ id: "a", label: "A" });
    s.setOptions({ ...s.view.options, laneHeight: 40 });
    s.bind(document.createElement("div"), document.createElement("div"), document.createElement("canvas"), document.createElement("canvas"));
    s.resize(800, 200);
    return s;
  }
  it("publishes the scale in the snapshot", () => {
    const s = scene();
    expect(s.getSnapshot().fontScale).toBe(1);
    s.setFontScale(2);
    expect(s.getSnapshot().fontScale).toBe(2);
  });
  it("lays out once for a change and not at all for none", () => {
    const s = scene();
    const layout = vi.spyOn(s.view, "layout");
    s.setFontScale(2);
    expect(layout).toHaveBeenCalledTimes(1);
    s.setFontScale(2);
    expect(layout).toHaveBeenCalledTimes(1);
  });
  it("rounds lane and head heights to whole pixels", () => {
    const v = view();
    v.setOptions({ ...v.options, laneHeight: 44 });
    v.setFontScale(1.1);
    v.layout();
    expect(Number.isInteger(v.rows.height)).toBe(true);
  });
});
