/* What the shakedown found in the schedule: wrong-typed props that crashed the
   tree, a tooltip without date and duration, a window over the empty middle, a
   drop with a stale id, a dependency without lag read as "0 min", and the lane
   change by keyboard. Driven through the scene, with jsdom's plot at the origin. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { HOUR, DAY } from "@umriss-ui/charts";
import { ScheduleScene } from "../src/scene";
import type { SceneOptions } from "../src/sceneView";
import type { Intent, Subtask } from "../src/model";
import { defaultSpan } from "../src/view";
import { ScheduleReadout, ScheduleTooltipContent } from "../src/ScheduleTooltip";
import type { ScheduleTooltipTarget } from "../src/sceneData";

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

const WORK: Subtask[] = [
  { id: "a-1", task: "a", lane: "press", from: 2 * HOUR, to: 4 * HOUR },
  { id: "b-1", task: "a", lane: "weld", from: 2 * HOUR, to: 4 * HOUR },
];

function sceneWith(work: unknown = WORK, view: object = { domain: [0, 8 * HOUR] }, options: Partial<SceneOptions> = {}) {
  const scene = new ScheduleScene(view);
  const intents: Intent[] = [];
  scene.registerLane({ id: "press", label: "Press" });
  scene.registerLane({ id: "weld", label: "Weld" });
  const layer = scene.registerLayer({ kind: "subtasks", data: work as Subtask[], tasks: [{ id: "a", color: "red" }] });
  scene.setOptions({ ...OPTIONS, ...options });
  scene.setHandlers({ onIntent: (i) => intents.push(i) });
  scene.bind(document.createElement("div"), document.createElement("div"), document.createElement("canvas"), document.createElement("canvas"));
  scene.resize(800, 200);
  return { scene, intents, layer };
}

const pointer = (type: string, x: number, y: number) => new PointerEvent(type, { pointerId: 1, pointerType: "mouse", clientX: x, clientY: y, button: 0 });
const key = (k: string, init: KeyboardEventInit = {}) => new KeyboardEvent("keydown", { key: k, ...init });

afterEach(() => vi.restoreAllMocks());

describe("wrong-typed props", () => {
  it("shows the subtasks instead of a domain of Dates or strings, without crashing", () => {
    expect(() => sceneWith(WORK, { domain: [new Date(0), new Date(HOUR)] })).not.toThrow();
    expect(() => sceneWith(WORK, { domain: ["a", "b"] })).not.toThrow();
  });

  it("draws subtasks that are not an array as none", () => {
    expect(() => sceneWith({ a: 1 })).not.toThrow();
    expect(sceneWith({ a: 1 }).scene.data.subtasks).toEqual([]);
  });
});

describe("the first window", () => {
  const LIMITS = { min: HOUR, max: 10 * HOUR };
  const work = (from: number, to: number): Subtask => ({ id: `${from}`, task: "t", lane: "l", from, to });

  it("starts at the earliest subtask where the work is wider than zoom may reach", () => {
    expect(defaultSpan([work(0, 4 * HOUR), work(16 * HOUR, 20 * HOUR)], LIMITS, (v) => v, "start")).toEqual([0, 10 * HOUR]);
  });

  it("is that window for a scene without a domain, and for fit", () => {
    const far = [{ ...WORK[0]!, from: 0, to: HOUR }, { ...WORK[1]!, from: 90 * DAY, to: 90 * DAY + HOUR }];
    const { scene } = sceneWith(far, {}, { zoomLimits: { min: HOUR, max: 28 * DAY } });
    expect(scene.view.domain).toEqual([0, 28 * DAY]);
    scene.setDomain([HOUR, 2 * HOUR]);
    scene.setDomain(null);
    scene.setOptions({ ...OPTIONS, zoomLimits: { min: HOUR, max: 28 * DAY } });
    expect(scene.view.domain).toEqual([0, 28 * DAY]);
  });
});

describe("a drop", () => {
  it("reports the id the subtask has now, not the one it had when the drag began", () => {
    const { scene, intents, layer } = sceneWith();
    scene.pointerDown(pointer("pointerdown", 300, 20));
    scene.pointerMove(pointer("pointermove", 400, 20));
    scene.pointerMove(pointer("pointermove", 500, 20));
    scene.updateLayer(layer, { kind: "subtasks", data: WORK.map((s) => ({ ...s, id: `${s.id}'` })), tasks: [{ id: "a", color: "red" }] });
    scene.data.rebuild();
    scene.pointerUp(pointer("pointerup", 500, 20));
    expect(intents.map((i) => ("subtask" in i ? i.subtask : null))).toEqual(["a-1'"]);
  });
});

describe("Alt+Up and Alt+Down", () => {
  it("propose the lane below and above as a lane intent, as a drag would", () => {
    const { scene, intents } = sceneWith();
    scene.pointerMove(pointer("pointermove", 300, 20));
    expect(scene.keys.key(key("ArrowDown", { altKey: true }))).toBe(true);
    expect(intents).toEqual([{ kind: "lane", subtask: "a-1", lane: "weld" }]);
    scene.keys.key(key("ArrowUp", { altKey: true }));
    expect(intents).toHaveLength(1);
  });

  it("propose nothing without the lane intent or where canMoveTo refuses, and still take the key", () => {
    const { scene, intents } = sceneWith(WORK, { domain: [0, 8 * HOUR] }, { intents: ["move"] });
    scene.pointerMove(pointer("pointermove", 300, 20));
    expect(scene.keys.key(key("ArrowDown", { altKey: true }))).toBe(true);
    expect(intents).toEqual([]);
  });
});

describe("what a planner reads", () => {
  const subtask: ScheduleTooltipTarget = {
    kind: "subtask",
    subtask: { id: "s", task: "t", lane: "l", from: new Date(2026, 11, 31, 22).getTime(), to: new Date(2027, 0, 1, 3).getTime() },
    task: undefined,
    overlapping: [],
    violatedDependencies: [],
    blocked: [],
  };

  it("gives the dates across a year boundary and the duration in the tooltip", () => {
    const { container } = render(<ScheduleTooltipContent target={subtask} />);
    expect(container.textContent).toMatch(/2026/);
    expect(container.textContent).toMatch(/2027/);
    expect(container.textContent).toMatch(/5 ?h/);
  });

  it("reads a dependency without lag without '0 min'", () => {
    const target: ScheduleTooltipTarget = {
      kind: "dependency",
      dependency: { id: "d", from: "a", to: "b", lag: 0 },
      task: undefined,
      from: undefined,
      to: undefined,
      violated: undefined,
    } as ScheduleTooltipTarget;
    const { container } = render(<ScheduleTooltipContent target={target} />);
    expect(container.textContent).not.toMatch(/0 ?min/);
    const read = render(<ScheduleReadout target={target} lane={null} />);
    expect(read.container.textContent).not.toMatch(/0 ?min/);
  });
});
