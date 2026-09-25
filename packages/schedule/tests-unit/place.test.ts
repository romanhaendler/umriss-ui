/* The place intent: what it does to the data, and what it does not
   (schedule-refinement 07). Creating a subtask is the caller's act, with the
   caller's identity - the intent only says what was asked for. */

import { describe, expect, it } from "vitest";
import { applyIntent, subtaskFromPlace } from "../src/model";
import { ripple } from "../src/ripple";
import type { PlaceIntent, Subtask, Dependency } from "../src/model";

const MIN = 60_000;
const at = (minutes: number) => Date.UTC(2026, 2, 17, 6, 0) + minutes * MIN;

const PLACE: PlaceIntent = {
  kind: "place",
  item: "order-77",
  task: "a-2077",
  lane: "press",
  from: at(60),
  to: at(120),
  leadIn: 15 * MIN,
};

const EXISTING: Subtask = { id: "a-1", task: "a", lane: "press", from: at(0), to: at(30) };
const DEPENDENCY: Dependency = { id: "t", from: "a-1", to: "a-2", lag: 5 * MIN };

describe("a place intent", () => {
  it("leaves every existing subtask as it is", () => {
    expect(applyIntent(EXISTING, PLACE)).toBe(EXISTING);
  });

  it("becomes a subtask under an id the caller chooses", () => {
    expect(subtaskFromPlace(PLACE, "a-2077-1")).toEqual({
      id: "a-2077-1",
      task: "a-2077",
      lane: "press",
      from: at(60),
      to: at(120),
      leadIn: 15 * MIN,
    });
  });

  it("carries no lead-out where none was declared", () => {
    expect("leadOut" in subtaskFromPlace(PLACE, "x")).toBe(false);
  });

  it("pushes nothing: the subtask it asks for does not exist yet", () => {
    expect(ripple([EXISTING], [DEPENDENCY], PLACE)).toEqual([]);
  });
});
