import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { readCalculation } from "../src/model";
import { costing } from "./costing";
import { oee } from "./oee";
import { STAFF, staff } from "./staff";

/* What a Server Component hands a client view must serialise. Structured clone
   stands in for React's serialiser and fails on a function or a class
   instance; JSX (`aside`) is the one thing React carries that it does not. */
const serialisable = (model: ReturnType<typeof readCalculation>) => ({
  ...model,
  quantities: new Map(
    [...model.quantities].map(([key, quantity]) => [
      key,
      { ...quantity, aside: undefined },
    ]),
  ),
});

describe("the model a reader builds", () => {
  it.each([
    ["costing", () => readCalculation(costing())],
    ["OEE", () => readCalculation(oee())],
    ["a calculation with metrics", () => readCalculation(staff(), STAFF)],
  ])("survives structuredClone: %s", (_, read) => {
    const model = serialisable(read());
    expect(structuredClone(model)).toEqual(model);
  });
});

describe("the reader's modules", () => {
  it.each(["Reader", "elements", "model"])(
    "%s.tsx imports no core at runtime and calls no hook",
    (name) => {
      const file = ["tsx", "ts"]
        .map((ext) => `src/${name}.${ext}`)
        .find((f) => {
          try {
            readFileSync(f);
            return true;
          } catch {
            return false;
          }
        })!;
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/^import (?!type\b).*@umriss-ui\/core/m);
      expect(source).not.toMatch(/\buse[A-Z]\w*\(/);
    },
  );
});
