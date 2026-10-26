import { describe, expect, it } from "vitest";
import { ownFieldsEqual } from "../src/sceneConfig";
import type { MatrixSeriesConfig } from "../src/types";

describe("a Matrix' labels", () => {
  it("are a change of substance, so switching them redraws", () => {
    const base = { kind: "matrix", coloring: { kind: "levels", levels: 5 } } as unknown as MatrixSeriesConfig;
    expect(ownFieldsEqual(base, { ...base, labels: true })).toBe(false);
    expect(ownFieldsEqual({ ...base, labels: true }, { ...base, labels: true })).toBe(true);
  });
});
