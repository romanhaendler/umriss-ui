/* Ripple: the cascade as arithmetic, for the caller to run (ADR-0023).

   Given the data and one intent, the moves that push every successor whose
   transport no longer fits. Expected values worked out by hand, in minutes. */

import { describe, expect, it } from "vitest";
import { ripple } from "../src/ripple";
import type { Subtask, Transport } from "../src/model";

const MIN = 60_000;
const at = (minutes: number) => Date.UTC(2026, 2, 17, 6, 0) + minutes * MIN;

function subtask(id: string, from: number, to: number, extra: Partial<Subtask> = {}): Subtask {
  return { id, task: "t", lane: id, from: at(from), to: at(to), ...extra };
}

const link = (id: string, from: string, to: string, duration: number): Transport => ({
  id,
  from,
  to,
  duration: duration * MIN,
});

describe("ripple", () => {
  it("pushes a successor whose transport no longer fits, by exactly what is missing", () => {
    const data = [subtask("a", 0, 60), subtask("b", 70, 100)];
    const moves = ripple(data, [link("x", "a", "b", 10)], { kind: "move", subtask: "a", from: at(20), to: at(80) });
    // a ends at 80, plus 10 minutes: b must start at 90 - pushed by 20, its length kept.
    expect(moves).toEqual([{ kind: "move", subtask: "b", from: at(90), to: at(120) }]);
  });

  it("leaves a successor alone where the transport still fits", () => {
    const data = [subtask("a", 0, 60), subtask("b", 100, 130)];
    expect(ripple(data, [link("x", "a", "b", 10)], { kind: "move", subtask: "a", from: at(10), to: at(70) })).toEqual([]);
  });

  it("never pulls a successor earlier when the change leaves room", () => {
    const data = [subtask("a", 0, 60), subtask("b", 70, 100)];
    expect(ripple(data, [link("x", "a", "b", 10)], { kind: "move", subtask: "a", from: at(-30), to: at(30) })).toEqual([]);
  });

  it("carries the push down a chain", () => {
    const data = [subtask("a", 0, 60), subtask("b", 60, 90), subtask("c", 90, 120)];
    const transports = [link("x", "a", "b", 0), link("y", "b", "c", 0)];
    const moves = ripple(data, transports, { kind: "stretch", subtask: "a", from: at(0), to: at(75) });
    expect(moves).toEqual([
      { kind: "move", subtask: "b", from: at(75), to: at(105) },
      { kind: "move", subtask: "c", from: at(105), to: at(135) },
    ]);
  });

  it("takes the anchors into account", () => {
    // b's setup of 20 minutes has to be done after the transport arrives.
    const data = [subtask("a", 0, 60, { teardown: 10 * MIN }), subtask("b", 90, 120, { setup: 20 * MIN })];
    const moves = ripple(data, [link("x", "a", "b", 5)], { kind: "teardown", subtask: "a", teardown: 20 * MIN });
    // a leaves at 80, arrives 85; b's setup starts at 70 - pushed by 15.
    expect(moves).toEqual([{ kind: "move", subtask: "b", from: at(105), to: at(135) }]);
  });

  it("pushes a successor with two predecessors as far as the later one needs", () => {
    const data = [subtask("a", 0, 60), subtask("b", 0, 30), subtask("c", 70, 80)];
    const transports = [link("x", "a", "c", 10), link("y", "b", "c", 10)];
    const moves = ripple(data, transports, { kind: "move", subtask: "b", from: at(50), to: at(80) });
    expect(moves).toEqual([{ kind: "move", subtask: "c", from: at(90), to: at(100) }]);
  });

  it("does not move the subtask the intent is about", () => {
    const data = [subtask("a", 0, 60), subtask("b", 60, 90)];
    const transports = [link("x", "a", "b", 0), link("back", "b", "a", 0)];
    const moves = ripple(data, transports, { kind: "move", subtask: "a", from: at(10), to: at(70) });
    expect(moves.map((m) => m.subtask)).toEqual(["b"]);
  });

  it("terminates on a cycle among the successors", () => {
    const data = [subtask("a", 0, 10), subtask("b", 10, 20), subtask("c", 20, 30)];
    const transports = [link("x", "a", "b", 5), link("y", "b", "c", 5), link("z", "c", "b", 5)];
    const moves = ripple(data, transports, { kind: "move", subtask: "a", from: at(5), to: at(15) });
    expect(moves.length).toBeGreaterThan(0);
  });

  it("gives nothing for an intent that does not change time", () => {
    const data = [subtask("a", 0, 60), subtask("b", 60, 90)];
    expect(ripple(data, [link("x", "a", "b", 0)], { kind: "lane", subtask: "a", lane: "elsewhere" })).toEqual([]);
  });
});
