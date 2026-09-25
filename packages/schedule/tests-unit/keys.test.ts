/* The keyboard through the scene (schedule-a11y 02, 03, 05): the active subtask
   is the hover the pointer would make, pointer and keys hand it over, the view
   follows it, the brackets follow a transport, and Alt proposes exactly the
   intents a drag of one step would. jsdom's plot lies at the origin, so a
   client point is a plot point. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { HOUR } from "@umriss-ui/charts";
import { ScheduleScene } from "../src/scene";
import type { SceneOptions } from "../src/sceneView";
import type { Intent, Subtask, Transport } from "../src/model";

const OPTIONS: SceneOptions = {
  laneHeight: 44,
  calendar: [],
  zoomLimits: { min: HOUR, max: 100 * HOUR },
  snap: HOUR,
  intents: ["move", "stretch"],
  now: null,
  route: "curve",
  attach: "centre",
  ends: "dot",
};

/* Eight hours over 800 pixels: an hour is 100 pixels. */
const WORK: Subtask[] = [
  { id: "p1", task: "a", lane: "press", from: 1 * HOUR, to: 2 * HOUR, name: "Press 1" },
  { id: "p2", task: "b", lane: "press", from: 4 * HOUR, to: 5 * HOUR },
  { id: "p3", task: "b", lane: "press", from: 20 * HOUR, to: 21 * HOUR },
  { id: "w1", task: "a", lane: "weld", from: 3 * HOUR, to: 4 * HOUR },
];
const TRANSPORTS: Transport[] = [{ id: "t1", from: "p1", to: "w1", duration: HOUR / 2 }];

function sceneWith(options: Partial<SceneOptions> = {}) {
  const scene = new ScheduleScene();
  const intents: Intent[] = [];
  const selected: [string | null, string | null][] = [];
  scene.registerLane({ id: "press", label: "Press" });
  scene.registerLane({ id: "weld", label: "Weld" });
  scene.registerLayer({ kind: "subtasks", data: WORK, tasks: [{ id: "a", color: "red" }, { id: "b", color: "blue" }] });
  scene.registerLayer({ kind: "transports", data: TRANSPORTS });
  scene.setOptions({ ...OPTIONS, ...options }, [0, 8 * HOUR]);
  scene.setHandlers({ onIntent: (i) => intents.push(i), onSelectedTaskChange: (t, s) => selected.push([t, s]) });
  scene.bind(document.createElement("div"), document.createElement("div"), document.createElement("canvas"), document.createElement("canvas"));
  scene.resize(800, 200);
  return { scene, intents, selected };
}

const key = (k: string, init: KeyboardEventInit = {}) => new KeyboardEvent("keydown", { key: k, ...init });
const active = (scene: ScheduleScene) => {
  const hover = scene.gestures.hover;
  return hover.kind === "subtask" ? hover.subtask.id : hover.kind === "transport" ? hover.transport.id : null;
};
const pointer = (type: string, x: number, y: number) => new PointerEvent(type, { pointerId: 1, pointerType: "mouse", clientX: x, clientY: y, button: 0 });

afterEach(() => vi.useRealTimers());

describe("the tab stop and the active subtask", () => {
  it("starts on the first subtask in view when the focus comes by keyboard, and not by a click", () => {
    const { scene } = sceneWith();
    scene.focus(false);
    expect(active(scene)).toBeNull();
    scene.focus(true);
    expect(active(scene)).toBe("p1");
  });

  it("walks along and across the lanes, and shows the tooltip as the pointer's hover would", () => {
    const { scene } = sceneWith();
    scene.focus(true);
    expect(scene.key(key("ArrowRight"))).toBe(true);
    expect(active(scene)).toBe("p2");
    scene.key(key("ArrowDown"));
    expect(active(scene)).toBe("w1");
    expect(scene.getSnapshot().tooltip?.target.kind).toBe("subtask");
  });

  it("brings a subtask out of view into it, and reports the new span", async () => {
    const { scene } = sceneWith();
    const domains: (readonly [number, number])[] = [];
    scene.setHandlers({ onDomainChange: (d) => domains.push(d) });
    scene.focus(true);
    scene.key(key("End"));
    expect(active(scene)).toBe("p3");
    const [from, to] = scene.visibleDomain();
    expect(from).toBeLessThanOrEqual(20 * HOUR);
    expect(to).toBeGreaterThanOrEqual(21 * HOUR);
    expect(to - from).toBeCloseTo(8 * HOUR);
    /* Reported once per frame, as the gestures' pans are. */
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(domains).toHaveLength(1);
  });

  it("selects with Space and Enter as a click does", () => {
    const { scene, selected } = sceneWith();
    scene.focus(true);
    scene.key(key(" "));
    scene.key(key("ArrowRight"));
    scene.key(key("Enter"));
    expect(selected).toEqual([
      ["a", "p1"],
      ["b", "p2"],
    ]);
  });

  it("hands over to the pointer, keeps its own subtask when the pointer leaves, and walks on from the pointer's", () => {
    const { scene } = sceneWith();
    scene.focus(true);
    scene.pointerLeave();
    expect(active(scene)).toBe("p1");
    /* The pointer onto p2 (x 400-500 on the first lane). */
    scene.pointerMove(pointer("pointermove", 450, 20));
    expect(active(scene)).toBe("p2");
    scene.key(key("ArrowLeft"));
    expect(active(scene)).toBe("p1");
  });

  it("lets go on Escape and on blur, and leaves a pointer's hover to the pointer", () => {
    const { scene } = sceneWith();
    scene.focus(true);
    expect(scene.key(key("Escape"))).toBe(true);
    expect(active(scene)).toBeNull();
    scene.focus(true);
    scene.blur();
    expect(active(scene)).toBeNull();
    scene.pointerMove(pointer("pointermove", 450, 20));
    scene.blur();
    expect(active(scene)).toBe("p2");
    expect(scene.key(key("Escape"))).toBe(false);
  });

  it("follows its subtask to its new times when the data changes", () => {
    const { scene } = sceneWith();
    scene.focus(true);
    /* Registered in order: two lanes, then the subtasks as entry 3. */
    const moved = WORK.map((s) => (s.id === "p1" ? { ...s, from: 2 * HOUR, to: 3 * HOUR } : s));
    scene.updateLayer(3, { kind: "subtasks", data: moved, tasks: [] });
    const hover = scene.gestures.hover;
    expect(hover.kind === "subtask" && hover.subtask.from).toBe(2 * HOUR);
  });
});

describe("along a transport", () => {
  it("goes out with ] onto the transport and on to its stop, and back with [", () => {
    const { scene } = sceneWith();
    scene.focus(true);
    scene.key(key("]"));
    expect(active(scene)).toBe("t1");
    expect(scene.getSnapshot().tooltip?.target.kind).toBe("transport");
    scene.key(key("]"));
    expect(active(scene)).toBe("w1");
    scene.key(key("["));
    scene.key(key("["));
    expect(active(scene)).toBe("p1");
  });

  it("takes the brackets as a German keyboard sends them, with AltGr", () => {
    const { scene } = sceneWith();
    scene.focus(true);
    expect(scene.key(key("]", { ctrlKey: true, altKey: true }))).toBe(true);
    expect(active(scene)).toBe("t1");
  });

  it("takes t out and Shift+T back as the brackets' equals, and leaves Ctrl and Alt with t alone", () => {
    const { scene } = sceneWith();
    scene.focus(true);
    expect(scene.key(key("t"))).toBe(true);
    expect(active(scene)).toBe("t1");
    scene.key(key("t"));
    expect(active(scene)).toBe("w1");
    expect(scene.key(key("T", { shiftKey: true }))).toBe(true);
    expect(active(scene)).toBe("t1");
    expect(scene.key(key("t", { ctrlKey: true }))).toBe(false);
    expect(scene.key(key("t", { altKey: true }))).toBe(false);
  });

  it("walks on from a transport's first stop", () => {
    const { scene } = sceneWith();
    scene.focus(true);
    scene.key(key("]"));
    scene.key(key("ArrowRight"));
    expect(active(scene)).toBe("p2");
  });
});

describe("editing by key proposes what the drag would", () => {
  /* p2 runs 04:00-05:00, x 400-500 on the first lane; its right edge is the
     stretch handle. */
  const drag = (scene: ScheduleScene, x0: number, x1: number) => {
    scene.pointerDown(pointer("pointerdown", x0, 20));
    scene.pointerMove(pointer("pointermove", x1, 20));
    scene.pointerUp(pointer("pointerup", x1, 20));
  };
  const onP2 = (scene: ScheduleScene) => {
    scene.focus(true);
    scene.key(key("ArrowRight"));
  };

  it("moves by one step of the raster with Alt+→ and Alt+←", () => {
    const keyed = sceneWith();
    onP2(keyed.scene);
    keyed.scene.key(key("ArrowRight", { altKey: true }));
    keyed.scene.key(key("ArrowLeft", { altKey: true }));
    const dragged = sceneWith();
    drag(dragged.scene, 450, 550);
    drag(dragged.scene, 450, 350);
    expect(keyed.intents).toEqual(dragged.intents);
    expect(keyed.intents[0]).toEqual({ kind: "move", subtask: "p2", from: 5 * HOUR, to: 6 * HOUR });
  });

  it("stretches the end by one step with Alt+Shift+→, never below a step", () => {
    const keyed = sceneWith();
    onP2(keyed.scene);
    keyed.scene.key(key("ArrowRight", { altKey: true, shiftKey: true }));
    const dragged = sceneWith();
    drag(dragged.scene, 499, 599);
    expect(keyed.intents).toEqual(dragged.intents);
    expect(keyed.intents).toEqual([{ kind: "stretch", subtask: "p2", from: 4 * HOUR, to: 6 * HOUR }]);
    /* One hour long, a step of one hour: shorter it cannot get. */
    keyed.scene.key(key("ArrowLeft", { altKey: true, shiftKey: true }));
    expect(keyed.intents).toHaveLength(1);
  });

  it("proposes nothing the caller does not handle", () => {
    const { scene, intents } = sceneWith({ intents: [] });
    onP2(scene);
    /* Taken all the same: Alt+←/→ is the browser's Back and Forward. */
    expect(scene.key(key("ArrowRight", { altKey: true }))).toBe(true);
    expect(scene.key(key("ArrowRight", { altKey: true, shiftKey: true }))).toBe(true);
    expect(intents).toEqual([]);
  });

  it("steps back across a night the calendar removes", () => {
    /* 06:00-22:00 on two days; p2 moved to the first morning's start. */
    const day = (d: number) => ({ from: d * 24 * HOUR + 6 * HOUR, to: d * 24 * HOUR + 22 * HOUR });
    const { scene, intents } = sceneWith({ calendar: [day(0), day(1)] });
    scene.updateLayer(3, {
      kind: "subtasks",
      data: [{ id: "m", task: "a", lane: "press", from: 30 * HOUR, to: 31 * HOUR }],
      tasks: [{ id: "a", color: "red" }],
    });
    scene.focus(true);
    scene.key(key("ArrowLeft", { altKey: true }));
    expect(intents).toEqual([{ kind: "move", subtask: "m", from: 21 * HOUR, to: 22 * HOUR }]);
  });
});
