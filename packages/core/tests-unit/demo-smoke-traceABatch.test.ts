import { describe, expect, it } from "vitest";
import { batchAt } from "../demo/scenarios/06-trace-a-batch";

const batches = [
  { id: "a", name: "A", product: "", tiles: 1, from: 100, to: 200 },
  { id: "b", name: "B", product: "", tiles: 1, from: 300, to: 400 },
];

describe("the batch that ran at an instant", () => {
  it("is the batch, from its first instant to its last", () => {
    expect(batchAt(batches, 100)?.id).toBe("a");
    expect(batchAt(batches, 150)?.id).toBe("a");
    expect(batchAt(batches, 200)?.id).toBe("a");
    expect(batchAt(batches, 400)?.id).toBe("b");
  });

  it("is none between two batches, before the first or after the last", () => {
    expect(batchAt(batches, 250)).toBeUndefined();
    expect(batchAt(batches, 99)).toBeUndefined();
    expect(batchAt(batches, 401)).toBeUndefined();
  });
});
