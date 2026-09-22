/* The gestures where they are not the platform's: a finger's tap, a pinch that
   ends in a pan, a cancelled pan, a drag cut short by an unmount, and a new
   calendar under a view panned past the old one's ends. Driven through the
   scene, with jsdom's plot at the origin - a client point is a plot point. */

import { describe, expect, it } from "vitest";
import { HOUR } from "@umriss-ui/charts";
import { ScheduleScene } from "../src/scene";
import type { SceneOptions } from "../src/sceneView";
import type { Subtask } from "../src/model";

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

/* Eight hours over 800 pixels: an hour is 100 pixels. The bar runs from x 200
   to 400 and, on the first lane, from y 10 to 33. */
const SUBTASK: Subtask = { id: "a-1", task: "a", lane: "press", from: 2 * HOUR, to: 4 * HOUR };

function sceneWith(options: Partial<SceneOptions> = {}) {
  const scene = new ScheduleScene();
  const selected: (string | null)[] = [];
  scene.registerLane({ id: "press", label: "Press" });
  scene.registerLayer({ kind: "subtasks", data: [SUBTASK], tasks: [{ id: "a", color: "red" }] });
  scene.setOptions({ ...OPTIONS, ...options }, [0, 8 * HOUR]);
  scene.setHandlers({ onSelectedTaskChange: (task) => selected.push(task) });
  const root = document.createElement("div");
  const plot = document.createElement("div");
  scene.bind(root, plot, document.createElement("canvas"), document.createElement("canvas"));
  scene.resize(800, 200);
  return { scene, selected };
}

const pointer = (type: string, id: number, x: number, y: number, pointerType = "mouse") =>
  new PointerEvent(type, { pointerId: id, pointerType, clientX: x, clientY: y, button: 0 });

describe("a finger", () => {
  it("selects with a tap that wanders a few pixels", () => {
    const { scene, selected } = sceneWith();
    scene.pointerDown(pointer("pointerdown", 1, 300, 20, "touch"));
    scene.pointerMove(pointer("pointermove", 1, 305, 22, "touch"));
    scene.pointerUp(pointer("pointerup", 1, 305, 22, "touch"));
    expect(selected).toEqual(["a"]);
  });

  it("pans on with the finger that stays when a pinch ends", () => {
    const { scene } = sceneWith();
    scene.pointerDown(pointer("pointerdown", 1, 100, 20, "touch"));
    scene.pointerDown(pointer("pointerdown", 2, 200, 20, "touch"));
    scene.pointerUp(pointer("pointerup", 2, 200, 20, "touch"));
    const before = scene.view.domain[0];
    scene.pointerMove(pointer("pointermove", 1, 50, 20, "touch"));
    expect(scene.view.domain[0]).toBeCloseTo(before + HOUR / 2);
  });

  it("keeps a pinch when a third finger joins", () => {
    const { scene } = sceneWith();
    scene.pointerDown(pointer("pointerdown", 1, 100, 20, "touch"));
    scene.pointerDown(pointer("pointerdown", 2, 200, 20, "touch"));
    scene.pointerDown(pointer("pointerdown", 3, 400, 20, "touch"));
    const span = scene.view.domain[1] - scene.view.domain[0];
    scene.pointerMove(pointer("pointermove", 2, 300, 20, "touch"));
    expect(scene.view.domain[1] - scene.view.domain[0]).toBeCloseTo(span / 2);
  });
});

describe("a gesture cut short", () => {
  it("gives the cursor back when a pan is cancelled", () => {
    const { scene } = sceneWith();
    scene.pointerDown(pointer("pointerdown", 1, 600, 100));
    scene.pointerMove(pointer("pointermove", 1, 550, 100));
    expect(scene.getSnapshot().cursor).toBe("grabbing");
    scene.pointerCancel(pointer("pointercancel", 1, 550, 100));
    expect(scene.getSnapshot().cursor).toBe("default");
  });

  it("ends a drag when the schedule unmounts under it", () => {
    const { scene } = sceneWith();
    scene.pointerDown(pointer("pointerdown", 1, 300, 20));
    scene.pointerMove(pointer("pointermove", 1, 795, 20));
    expect(scene.gestures.editing).toBe(true);
    scene.unbind();
    expect(scene.gestures.idle).toBe(true);
  });
});

describe("a new calendar", () => {
  it("keeps a view panned before the old calendar's start", () => {
    const day = { from: 6 * HOUR, to: 22 * HOUR };
    const { scene } = sceneWith({ calendar: [day] });
    scene.view.pan(-1600, 0);
    const [from, to] = scene.view.domain;
    expect(from).toBeLessThan(0);
    /* The same calendar, as a caller writing it inline hands it over anew. */
    scene.setOptions({ ...OPTIONS, calendar: [{ ...day }] }, null);
    expect(scene.view.domain[0]).toBeCloseTo(from);
    expect(scene.view.domain[1]).toBeCloseTo(to);
  });
});
