/* scrollToLane, scrollToSubtask and focusSubtask through the scene, and
   through the hook before a schedule is mounted: what a host's list reaches
   for. jsdom's plot lies at the origin. */

import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { HOUR } from "@umriss-ui/charts";
import { useSchedule } from "../src";
import { ScheduleScene } from "../src/scene";
import type { SceneOptions } from "../src/sceneView";
import type { Subtask } from "../src/model";

const OPTIONS: SceneOptions = {
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

/* Ten lanes of 44 pixels in a plot 100 pixels high; eight hours over 800. */
const LANES = Array.from({ length: 10 }, (_, i) => `l${i}`);
const WORK: Subtask[] = [
  { id: "near", task: "a", lane: "l0", from: 1 * HOUR, to: 2 * HOUR },
  { id: "far", task: "a", lane: "l8", from: 30 * HOUR, to: 31 * HOUR },
  { id: "folded", task: "a", lane: "g1", from: 1 * HOUR, to: 2 * HOUR },
];

function mounted() {
  const scene = new ScheduleScene({ domain: [0, 8 * HOUR], folded: ["grp"] });
  for (const id of LANES) scene.registerLane({ id, label: id });
  scene.registerGroup({ id: "grp", label: "Group" });
  scene.registerLane({ id: "g1", label: "g1", parent: "grp" });
  scene.registerLayer({ kind: "subtasks", data: WORK, tasks: [{ id: "a", color: "red" }] });
  scene.setOptions(OPTIONS);
  const plot = document.createElement("div");
  plot.tabIndex = 0;
  document.body.append(plot);
  scene.bind(document.createElement("div"), plot, document.createElement("canvas"), document.createElement("canvas"));
  scene.resize(800, 100);
  return { scene, plot };
}

describe("scrollToLane", () => {
  it("scrolls the lanes until the row is in view", () => {
    const { scene } = mounted();
    expect(scene.scrollToLane("l8")).toBe(true);
    const slot = scene.view.rows.slots.get("l8")!;
    expect(slot.top - scene.view.scrollY).toBeGreaterThanOrEqual(0);
    expect(slot.top + slot.height - scene.view.scrollY).toBeLessThanOrEqual(100);
  });

  it("answers false and changes nothing for an unknown lane, a folded one and an unmounted schedule", () => {
    const { scene } = mounted();
    expect(scene.scrollToLane("nope")).toBe(false);
    expect(scene.scrollToLane("g1")).toBe(false);
    expect(scene.view.scrollY).toBe(0);
    expect(new ScheduleScene().scrollToLane("l0")).toBe(false);
  });
});

describe("scrollToSubtask", () => {
  it("moves the span to a subtask outside it, keeps its width, and leaves the focus", () => {
    const { scene, plot } = mounted();
    const width = scene.visibleDomain()[1] - scene.visibleDomain()[0];
    expect(scene.scrollToSubtask("far")).toBe(true);
    const [from, to] = scene.visibleDomain();
    expect(to - from).toBeCloseTo(width);
    expect(from).toBeLessThan(31 * HOUR);
    expect(to).toBeGreaterThan(30 * HOUR);
    expect(scene.view.scrollY).toBeGreaterThan(0);
    expect(document.activeElement).not.toBe(plot);
    expect(scene.gestures.hover.kind).toBe("nothing");
  });

  it("answers false and changes nothing for an unknown or folded subtask and an unmounted schedule", () => {
    const { scene } = mounted();
    const before = scene.visibleDomain();
    expect(scene.scrollToSubtask("nope")).toBe(false);
    expect(scene.scrollToSubtask("folded")).toBe(false);
    expect(scene.visibleDomain()).toEqual(before);
    expect(new ScheduleScene().scrollToSubtask("far")).toBe(false);
  });
});

describe("focusSubtask", () => {
  it("leaves the plot focused with the subtask active", () => {
    const { scene, plot } = mounted();
    expect(scene.focusSubtask("far")).toBe(true);
    expect(document.activeElement).toBe(plot);
    const hover = scene.gestures.hover;
    expect(hover.kind === "subtask" && hover.subtask.id).toBe("far");
  });

  it("answers false and moves no focus for a subtask that is not shown", () => {
    const { scene, plot } = mounted();
    expect(scene.focusSubtask("folded")).toBe(false);
    expect(scene.focusSubtask("nope")).toBe(false);
    expect(document.activeElement).not.toBe(plot);
    expect(new ScheduleScene().focusSubtask("far")).toBe(false);
  });
});

describe("the hook before a schedule is mounted", () => {
  it("answers false", () => {
    const { result } = renderHook(() => useSchedule());
    expect(result.current.scrollToLane("a")).toBe(false);
    expect(result.current.scrollToSubtask("a")).toBe(false);
    expect(result.current.focusSubtask("a")).toBe(false);
  });
});
