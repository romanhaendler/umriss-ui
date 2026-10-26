import { describe, expect, it } from "vitest";
import { alarmsIn, within } from "../demo/scenarios/07-mark-a-stretch";

const alarm = (id: string, raised: number) => ({ id, raised, priority: "low" as const, message: "" });
const alarms = [alarm("a", 100), alarm("b", 150), alarm("c", 200), alarm("d", 250)];

describe("the alarms of a stretch", () => {
  it("are those inside it, both ends included", () => {
    expect(alarmsIn(alarms, { from: 100, to: 200 }).map((a) => a.id)).toEqual(["a", "b", "c"]);
    expect(alarmsIn(alarms, { from: 101, to: 199 }).map((a) => a.id)).toEqual(["b"]);
    expect(within(150, { from: 150, to: 150 })).toBe(true);
  });

  it("are all of them when the stretch is cleared", () => {
    expect(alarmsIn(alarms, null)).toEqual(alarms);
  });
});
