/* A long press on a bar grabs it: the ghost follows the finger and the lift
   reports what a mouse drag would. Driven through the scene with fake timers;
   the plot sits at the origin, an hour is 100 pixels, the bar runs from x 200
   to 400 and, on the first lane, from y 10 to 33. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HOUR } from "@umriss-ui/charts";
import { ScheduleScene } from "../src/scene";
import type { SceneOptions } from "../src/sceneView";
import type { Intent, Subtask } from "../src/model";
import type { ScheduleInteraction } from "../src/sceneGestureTypes";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

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
const SUBTASK: Subtask = { id: "a-1", task: "a", lane: "press", from: 2 * HOUR, to: 4 * HOUR };

function sceneWith(options: Partial<SceneOptions> = {}) {
  const scene = new ScheduleScene({ domain: [0, 8 * HOUR] });
  const intents: Intent[] = [];
  const interactions: ScheduleInteraction[] = [];
  scene.registerLane({ id: "press", label: "Press" });
  scene.registerLane({ id: "lathe", label: "Lathe" });
  scene.registerLayer({ kind: "subtasks", data: [SUBTASK], tasks: [{ id: "a", color: "red" }] });
  scene.setOptions({ ...OPTIONS, ...options });
  scene.setHandlers({ onIntent: (i) => intents.push(i), onInteraction: (i) => interactions.push(i) });
  const root = document.createElement("div");
  const plot = document.createElement("div");
  scene.bind(root, plot, document.createElement("canvas"), document.createElement("canvas"));
  scene.resize(800, 200);
  return { scene, intents, interactions };
}

const pointer = (type: string, id: number, x: number, y: number, pointerType = "touch") =>
  new PointerEvent(type, { pointerId: id, pointerType, clientX: x, clientY: y, button: 0 });
const down = (s: ScheduleScene, x: number, y: number, id = 1) => s.pointerDown(pointer("pointerdown", id, x, y));
const move = (s: ScheduleScene, x: number, y: number, id = 1) => s.pointerMove(pointer("pointermove", id, x, y));
const up = (s: ScheduleScene, x: number, y: number, id = 1) => s.pointerUp(pointer("pointerup", id, x, y));

describe("a long press on a bar", () => {
  it("grabs it: the ghost follows and the lift reports the move and the lane", () => {
    const { scene, intents } = sceneWith();
    down(scene, 300, 20);
    vi.advanceTimersByTime(500);
    expect(scene.gestures.editing).toBe(true);
    move(scene, 400, 70);
    expect(scene.gestures.ghostSummary()).not.toBeNull();
    up(scene, 400, 70);
    expect(intents.map((i) => i.kind).sort()).toEqual(["lane", "move"]);
    expect(scene.gestures.editing).toBe(false);
  });

  it("reports what a mouse drag of that length reports", () => {
    const touch = sceneWith();
    down(touch.scene, 300, 20);
    vi.advanceTimersByTime(500);
    move(touch.scene, 400, 20);
    up(touch.scene, 400, 20);
    const mouse = sceneWith();
    mouse.scene.pointerDown(pointer("pointerdown", 1, 300, 20, "mouse"));
    mouse.scene.pointerMove(pointer("pointermove", 1, 400, 20, "mouse"));
    mouse.scene.pointerUp(pointer("pointerup", 1, 400, 20, "mouse"));
    expect(touch.intents).toEqual(mouse.intents);
    expect(touch.intents).toHaveLength(1);
  });

  it("pans and grabs nothing when the finger moves before 500 ms", () => {
    const { scene, intents } = sceneWith();
    down(scene, 300, 20);
    move(scene, 340, 20);
    vi.advanceTimersByTime(600);
    expect(scene.gestures.editing).toBe(false);
    move(scene, 360, 20);
    up(scene, 360, 20);
    expect(intents).toEqual([]);
  });

  it("grabs nothing on an empty part of the plot", () => {
    const { scene } = sceneWith();
    down(scene, 600, 150);
    vi.advanceTimersByTime(600);
    expect(scene.gestures.editing).toBe(false);
  });

  it("grabs nothing without move or lane in the intents", () => {
    const { scene } = sceneWith({ intents: ["stretch"] });
    down(scene, 300, 20);
    vi.advanceTimersByTime(600);
    expect(scene.gestures.editing).toBe(false);
  });

  it("is cancelled with no intent by a second finger", () => {
    const { scene, intents } = sceneWith();
    down(scene, 300, 20);
    vi.advanceTimersByTime(500);
    down(scene, 600, 150, 2);
    expect(scene.gestures.editing).toBe(false);
    up(scene, 600, 150, 2);
    up(scene, 300, 20);
    expect(intents).toEqual([]);
  });

  it("reports nothing for a lift outside the plot", () => {
    const { scene, intents } = sceneWith();
    down(scene, 300, 20);
    vi.advanceTimersByTime(500);
    move(scene, 900, 20);
    up(scene, 900, 20);
    expect(intents).toEqual([]);
  });

  it("is followed by no click and no context menu", () => {
    const { scene, interactions } = sceneWith();
    down(scene, 300, 20);
    vi.advanceTimersByTime(500);
    scene.contextMenu(new MouseEvent("contextmenu", { clientX: 300, clientY: 20, cancelable: true }));
    up(scene, 300, 20);
    expect(interactions).toEqual([]);
  });

  it("leaves the context menu of a press on an empty part as it was", () => {
    const { scene, interactions } = sceneWith();
    down(scene, 600, 150);
    vi.advanceTimersByTime(500);
    scene.contextMenu(new MouseEvent("contextmenu", { clientX: 600, clientY: 150, cancelable: true }));
    expect(interactions.map((i) => i.type)).toEqual(["contextmenu"]);
  });
});

describe("the page scroll under a finger", () => {
  const touchMove = () => new Event("touchmove", { cancelable: true });

  it("is cancelled during a grab and not before it", () => {
    const { scene } = sceneWith();
    down(scene, 300, 20);
    const before = touchMove();
    scene.touchMove(before);
    expect(before.defaultPrevented).toBe(false);
    vi.advanceTimersByTime(500);
    const during = touchMove();
    scene.touchMove(during);
    expect(during.defaultPrevented).toBe(true);
    up(scene, 300, 20);
    const after = touchMove();
    scene.touchMove(after);
    expect(after.defaultPrevented).toBe(false);
  });
});
