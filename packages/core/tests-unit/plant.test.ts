/* The control room's plant (control-room-demo 01): a seed is a shift, and the
   one limit crossing is the alarm, the verdict and the scrap at once - read off
   the same minute, never told separately. */

import { describe, expect, it } from "vitest";
import { assess } from "../src";
import { KILN_LIMITS, SHIFT_MINUTES, alarmsAt, countAt, exitSilence, plant } from "../demo/plant";

const START = Date.UTC(2026, 2, 17, 5);
const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);

describe("the plant", () => {
  it("is the same shift for the same seed, and another for another", () => {
    expect(plant(7)).toEqual(plant(7));
    expect(plant(7).readings).not.toEqual(plant(8).readings);
    expect(plant(7).readings).toHaveLength(SHIFT_MINUTES);
  });

  it.each(SEEDS)("seed %i: the one crossing is the alarm and the verdict", (seed) => {
    const p = plant(seed);
    const above = p.readings.filter((one) => one.kiln > 1230);
    expect(above.length).toBeGreaterThan(0);
    const crossing = above[0]!.minute;

    /* A minute before: no kiln alarm, and no alarm verdict. */
    expect(alarmsAt(p, crossing - 1, START).filter((a) => a.type === "kiln-high")).toEqual([]);
    expect(assess(p.readings[crossing - 1]!.kiln, KILN_LIMITS).verdict).not.toBe("alarm");

    /* At the crossing: the verdict and a standing alarm raised at that minute. */
    expect(assess(p.readings[crossing]!.kiln, KILN_LIMITS).verdict).toBe("alarm");
    const standing = alarmsAt(p, crossing, START).filter((a) => a.type === "kiln-high");
    expect(standing).toEqual([
      { id: `kiln-high-${crossing}`, type: "kiln-high", lifecycle: "standing-unacknowledged", raised: START + crossing * 60_000 },
    ]);

    /* At the end of the shift: exactly one, cleared once the kiln came back
       below the dead band - the fleeting alarm nobody acknowledged. */
    const kiln = alarmsAt(p, SHIFT_MINUTES - 1, START).filter((a) => a.type === "kiln-high");
    expect(kiln).toHaveLength(1);
    expect(kiln[0]!.lifecycle).toBe("cleared-unacknowledged");
    const cleared = (kiln[0]!.cleared! - START) / 60_000;
    expect(p.readings[cleared]!.kiln).toBeLessThanOrEqual(1222);
    expect(p.readings.slice(crossing, cleared).every((one) => one.kiln > 1222)).toBe(true);
  });

  it.each(SEEDS)("seed %i: a tile fired outside the tolerance is scrap in the OEE", (seed) => {
    const p = plant(seed);
    const outside = p.readings.filter((one) => assess(one.kiln, KILN_LIMITS).verdict !== "ok");
    const count = countAt(p, SHIFT_MINUTES - 1);
    expect(count.total - count.good).toBe(outside.reduce((sum, one) => sum + one.fired, 0));
    expect(count.total - count.good).toBeGreaterThan(0);
  });

  it("acknowledges an alarm at the instant the operator did", () => {
    const p = plant(7);
    const crossing = p.readings.find((one) => one.kiln > 1230)!.minute;
    const id = `kiln-high-${crossing}`;
    const at = START + (crossing + 2) * 60_000;
    const [alarm] = alarmsAt(p, crossing + 2, START, new Map([[id, at]])).filter((a) => a.id === id);
    expect(alarm).toMatchObject({ lifecycle: "standing-acknowledged", acknowledgedAt: at });
  });

  it("keeps the hidden alarms in the list, with their availability", () => {
    const p = plant(7);
    const stop = p.readings.find((one) => !one.running)!.minute;
    const types = alarmsAt(p, stop, START).map((a) => [a.type, a.availability]);
    expect(types).toContainEqual(["belt-empty", "suppressed-by-design"]);
    expect(types).toContainEqual(["dryer-fan", "out-of-service"]);
  });

  it("says how long the exit pyrometer has been silent", () => {
    const p = plant(7);
    expect(exitSilence(p, 287)).toBe(0);
    expect(exitSilence(p, 300)).toBe(13);
    expect(exitSilence(p, 338)).toBe(0);
  });
});
