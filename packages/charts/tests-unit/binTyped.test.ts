/* Bin reads a typed column by index, like a plain array. */

import { expect, it } from "vitest";
import { bin } from "../src/bin";

it("counts a Float64Array and a plain array of the same values to the same bins", () => {
  const plain = [0.5, 1.5, 1.7, 9, Number.NaN, 4];
  expect(bin(new Float64Array(plain), { width: 2 })).toEqual(bin(plain, { width: 2 }));
  expect(bin(new Int32Array([1, 2, 2, 7]), { width: 2 }).reduce((s, b) => s + b.count, 0)).toBe(4);
});
