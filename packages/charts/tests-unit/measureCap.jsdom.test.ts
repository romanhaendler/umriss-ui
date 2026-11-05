// @vitest-environment jsdom

import { expect, it } from "vitest";
import { TextMeasurer } from "../src/measure";

it("never holds more entries than its cap", () => {
  const m = new TextMeasurer(document.createElement("div"));
  for (let i = 0; i < 12_000; i++) m.measure(`label ${i}`, "x");
  expect((m as unknown as { cache: Map<string, unknown> }).cache.size).toBeLessThanOrEqual(5_000);
});
