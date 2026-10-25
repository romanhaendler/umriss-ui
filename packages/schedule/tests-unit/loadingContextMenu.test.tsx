// @vitest-environment jsdom
/* A loading schedule takes no pointer (ADR-0042): the context menu reports
   nothing, as a press, a hover and a key do not. */

import { describe, expect, it } from "vitest";
import { HOUR } from "@umriss-ui/charts";
import { ScheduleScene } from "../src/scene";
import type { SceneOptions } from "../src/sceneView";
import type { ScheduleInteraction, Subtask } from "../src";

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
  const interactions: ScheduleInteraction[] = [];
  scene.registerLane({ id: "press", label: "Press" });
  scene.registerLayer({ kind: "subtasks", data: [SUBTASK], tasks: [{ id: "a", color: "red" }] });
  scene.setOptions(OPTIONS);
  scene.setHandlers({ onInteraction: (interaction) => interactions.push(interaction) });
  scene.bind(document.createElement("div"), document.createElement("div"), document.createElement("canvas"), document.createElement("canvas"));
  scene.resize(800, 200);
  return { scene, interactions };
}

const menu = () => new MouseEvent("contextmenu", { clientX: 300, clientY: 20, cancelable: true });

describe("the context menu of a loading schedule", () => {
  it("reports at rest and is silent while loading", () => {
    const { scene, interactions } = sceneWith();
    scene.contextMenu(menu());
    expect(interactions.map((i) => i.type)).toEqual(["contextmenu"]);
    scene.setLoading(true);
    const event = menu();
    scene.contextMenu(event);
    expect(interactions).toHaveLength(1);
    expect(event.defaultPrevented).toBe(true);
  });
});
