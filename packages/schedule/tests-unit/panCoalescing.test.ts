/* A pan or a zoom costs the layout once per frame, however many events the
   frame holds - and whatever reads the view in between sees the current one. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HOUR } from "@umriss-ui/charts";
import { ScheduleScene } from "../src/scene";
import { pathInView, type DependencyPath } from "../src/geometry";
import type { SceneOptions } from "../src/sceneView";

const OPTIONS: SceneOptions = {
  laneHeight: 44,
  calendar: [],
  zoomLimits: { min: HOUR, max: 100 * HOUR },
  snap: false,
  intents: ["move", "lane"],
  now: null,
  route: "curve",
  attach: "centre",
  ends: "dot",
};

let frames: FrameRequestCallback[] = [];
beforeEach(() => {
  frames = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal("cancelAnimationFrame", () => {});
});
afterEach(() => vi.unstubAllGlobals());

function sceneBound() {
  const scene = new ScheduleScene({ domain: [0, 8 * HOUR] });
  scene.registerLane({ id: "press", label: "Press" });
  scene.registerLayer({ kind: "subtasks", data: [{ id: "a-1", task: "a", lane: "press", from: 2 * HOUR, to: 4 * HOUR }], tasks: [{ id: "a", color: "red" }] });
  scene.setOptions(OPTIONS);
  scene.bind(document.createElement("div"), document.createElement("div"), document.createElement("canvas"), document.createElement("canvas"));
  scene.resize(800, 200);
  return scene;
}

const wheel = () => new WheelEvent("wheel", { deltaX: 100, deltaY: 0, clientX: 400, clientY: 20, cancelable: true });

describe("pan events in one frame", () => {
  it("lay the plan out once, and a read in between sees the current view", () => {
    const scene = sceneBound();
    const before = scene.view.boxes[0]!.outerFrom;
    const layout = vi.spyOn(scene.view, "layout");
    scene.wheel(wheel());
    scene.wheel(wheel());
    scene.wheel(wheel());
    expect(scene.view.boxes[0]!.outerFrom).toBeLessThan(before);
    expect(layout).toHaveBeenCalledTimes(1);
    for (const frame of frames.splice(0)) frame(0);
    expect(layout).toHaveBeenCalledTimes(1);
  });

  it("with no read in between, lay it out once in the frame", () => {
    const scene = sceneBound();
    const layout = vi.spyOn(scene.view, "layout");
    scene.wheel(wheel());
    scene.wheel(wheel());
    expect(layout).not.toHaveBeenCalled();
    for (const frame of frames.splice(0)) frame(0);
    expect(layout).toHaveBeenCalledTimes(1);
  });
});

describe("a dependency against the view", () => {
  const path = (x1: number, x2: number, y = 100): DependencyPath =>
    ({ kind: "straight", ends: "dot", x1, y1: y, x2, y2: y, c1x: x1, c2x: x2, points: [x1, y, x2, y] }) as unknown as DependencyPath;

  it("keeps a route that crosses the view with both ends outside it", () => {
    expect(pathInView(path(-500, 1500), 800, 200)).toBe(true);
  });

  it("drops one wholly outside, to the side or below", () => {
    expect(pathInView(path(900, 1500), 800, 200)).toBe(false);
    expect(pathInView(path(-500, -100), 800, 200)).toBe(false);
    expect(pathInView(path(100, 500, 400), 800, 200)).toBe(false);
  });

  it("keeps one that is inside", () => {
    expect(pathInView(path(100, 500), 800, 200)).toBe(true);
  });
});
