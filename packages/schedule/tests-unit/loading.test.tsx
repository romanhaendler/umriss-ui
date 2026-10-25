// @vitest-environment jsdom
/* A schedule that is loading says so and takes no new intent until the answer
   is in (ADR-0042): the plot is busy and, over a plan, stale; a drag begun
   before the reload finishes and reports; none begins during it, a key moves
   nothing. Over no lanes, placeholder lines stand in the lane column. Driven
   through the scene as `gestures` does, jsdom's plot at the origin. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { HOUR } from "@umriss-ui/charts";
import { ScheduleScene } from "../src/scene";
import type { SceneOptions } from "../src/sceneView";
import { useSchedule } from "../src";
import type { Intent, Subtask } from "../src";

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

function sceneWith() {
  const scene = new ScheduleScene({ domain: [0, 8 * HOUR] });
  const intents: Intent[] = [];
  scene.registerLane({ id: "press", label: "Press" });
  scene.registerLayer({ kind: "subtasks", data: [SUBTASK], tasks: [{ id: "a", color: "red" }] });
  scene.setOptions(OPTIONS);
  scene.setHandlers({ onIntent: (intent) => intents.push(intent) });
  scene.bind(document.createElement("div"), document.createElement("div"), document.createElement("canvas"), document.createElement("canvas"));
  scene.resize(800, 200);
  return { scene, intents };
}

const pointer = (type: string, x: number, y: number) =>
  new PointerEvent(type, { pointerId: 1, pointerType: "mouse", clientX: x, clientY: y, button: 0 });
const down = (scene: ScheduleScene, x: number, y: number) => scene.pointerDown(pointer("pointerdown", x, y));
const move = (scene: ScheduleScene, x: number, y: number) => scene.pointerMove(pointer("pointermove", x, y));
const up = (scene: ScheduleScene, x: number, y: number) => scene.pointerUp(pointer("pointerup", x, y));
const drag = (scene: ScheduleScene) => {
  down(scene, 300, 20);
  move(scene, 400, 20);
  up(scene, 400, 20);
};

describe("a loading scene", () => {
  it("marks its snapshot", () => {
    const { scene } = sceneWith();
    expect(scene.getSnapshot().loading).toBe(false);
    scene.setLoading(true);
    expect(scene.getSnapshot().loading).toBe(true);
  });

  it("lets a drag begun before the reload finish and report", () => {
    const { scene, intents } = sceneWith();
    down(scene, 300, 20);
    move(scene, 350, 20);
    scene.setLoading(true);
    move(scene, 400, 20);
    up(scene, 400, 20);
    expect(intents).toHaveLength(1);
  });

  it("starts no drag during the reload", () => {
    const { scene, intents } = sceneWith();
    scene.setLoading(true);
    drag(scene);
    expect(intents).toEqual([]);
    scene.setLoading(false);
    drag(scene);
    expect(intents).toHaveLength(1);
  });

  it("opens no tooltip and ends the one that is open", () => {
    const { scene } = sceneWith();
    move(scene, 300, 20);
    expect(scene.getSnapshot().tooltip).not.toBeNull();
    scene.setLoading(true);
    expect(scene.getSnapshot().tooltip).toBeNull();
    move(scene, 310, 20);
    expect(scene.getSnapshot().tooltip).toBeNull();
  });

  it("reports no move by key", () => {
    const { scene, intents } = sceneWith();
    const key = (init: KeyboardEventInit) => scene.key(new KeyboardEvent("keydown", init));
    scene.setLoading(true);
    key({ key: "ArrowRight" });
    key({ key: "ArrowRight", altKey: true });
    expect(intents).toEqual([]);
    scene.setLoading(false);
    key({ key: "ArrowRight", altKey: true });
    expect(intents).toHaveLength(1);
  });
});

describe("the loading schedule", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, width: 800, height: 200, right: 800, bottom: 200, toJSON: () => ({}),
    });
  });
  afterEach(() => vi.restoreAllMocks());

  function Plan({ lanes, loading }: { lanes: boolean; loading: boolean }) {
    const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: [0, 8 * HOUR] } });
    return (
      <Schedule aria-label="Plan" loading={loading}>
        {lanes && <Lane id="press" label="Press" />}
        {lanes && <Subtasks data={[SUBTASK]} tasks={[{ id: "a", color: "red" }]} />}
      </Schedule>
    );
  }
  const plot = (host: HTMLElement) => host.querySelector<HTMLElement>("[role='application']")!;

  it("is busy and, over a plan, stale", () => {
    const { container, rerender } = render(<Plan lanes loading={false} />);
    expect(plot(container).hasAttribute("aria-busy")).toBe(false);
    rerender(<Plan lanes loading />);
    expect(plot(container).getAttribute("aria-busy")).toBe("true");
    expect(plot(container).hasAttribute("data-stale")).toBe(true);
  });

  it("holds placeholder lines for the lanes that have not come, and none over lanes", () => {
    const { container, rerender } = render(<Plan lanes={false} loading />);
    const lines = () => container.querySelectorAll("[data-schedule-headers] [aria-hidden='true']").length;
    expect(lines()).toBe(4);
    expect(plot(container).hasAttribute("data-stale")).toBe(false);
    rerender(<Plan lanes loading />);
    expect(lines()).toBe(0);
  });
});
