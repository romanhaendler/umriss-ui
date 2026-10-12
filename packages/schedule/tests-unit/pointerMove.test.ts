/* A pointer that moves along one subtask changes the tooltip's place and
   nothing else: the snapshot's headers, bars and summary keep their identity
   and the data canvas is not drawn again. Another hit redraws the overlay
   alone. Driven through the scene with canvases whose context counts the
   clears. */

import { describe, expect, it } from "vitest";
import { HOUR } from "@umriss-ui/charts";
import { ScheduleScene } from "../src/scene";
import type { Subtask } from "../src/model";

const A: Subtask = { id: "a-1", task: "a", lane: "press", from: 2 * HOUR, to: 4 * HOUR };
const B: Subtask = { id: "b-1", task: "b", lane: "press", from: 5 * HOUR, to: 7 * HOUR };

function canvasCounting(): { canvas: HTMLCanvasElement; clears: () => number } {
  let clears = 0;
  const ctx = new Proxy(
    {},
    {
      get: (_, name) => (name === "clearRect" ? () => clears++ : name === "measureText" ? () => ({ width: 10 }) : () => undefined),
      set: () => true,
    },
  );
  const canvas = document.createElement("canvas");
  canvas.getContext = (() => ctx) as unknown as HTMLCanvasElement["getContext"];
  return { canvas, clears: () => clears };
}

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const move = (x: number, y: number) => new PointerEvent("pointermove", { pointerId: 1, pointerType: "mouse", clientX: x, clientY: y });

async function setup() {
  const scene = new ScheduleScene({ domain: [0, 8 * HOUR] });
  scene.registerLane({ id: "press", label: "Press" });
  scene.registerLayer({
    kind: "subtasks",
    data: [A, B],
    tasks: [
      { id: "a", color: "red" },
      { id: "b", color: "blue" },
    ],
  });
  scene.setOptions({
    laneHeight: 44,
    calendar: [],
    zoomLimits: { min: HOUR, max: 100 * HOUR },
    snap: false,
    intents: ["move", "lane"],
    now: null,
    route: "curve",
    attach: "centre",
    ends: "dot",
  });
  const data = canvasCounting();
  const overlay = canvasCounting();
  scene.bind(document.createElement("div"), document.createElement("div"), data.canvas, overlay.canvas);
  scene.resize(800, 200);
  await frame();
  return { scene, data, overlay };
}

describe("a pointer move", () => {
  it("along one subtask moves the tooltip and keeps the rest of the snapshot", async () => {
    const { scene, data } = await setup();
    scene.pointerMove(move(250, 20));
    await frame();
    const before = scene.getSnapshot();
    const dataDrawn = data.clears();
    scene.pointerMove(move(300, 22));
    await frame();
    const after = scene.getSnapshot();
    expect(before.tooltip).not.toBeNull();
    expect(after.tooltip?.x).toBe(300);
    expect(after.headers).toBe(before.headers);
    expect(after.bars).toBe(before.bars);
    expect(after.summary).toBe(before.summary);
    expect(data.clears()).toBe(dataDrawn);
  });

  it("on to another subtask redraws the overlay alone", async () => {
    const { scene, data, overlay } = await setup();
    scene.pointerMove(move(250, 20));
    await frame();
    const dataDrawn = data.clears();
    const overlayDrawn = overlay.clears();
    const before = scene.getSnapshot();
    scene.pointerMove(move(550, 20));
    await frame();
    expect(scene.getSnapshot().headers).toBe(before.headers);
    expect(data.clears()).toBe(dataDrawn);
    expect(overlay.clears()).toBeGreaterThan(overlayDrawn);
  });
});
