/* German number notation (pure logic seams). The expected values come from
   the notation rule itself - the dot separates thousands, the comma
   separates decimals -, not from the way the implementation computes. */

import { describe, expect, it } from "vitest";
import { clampNumber, filterInput, formatNumber, parseNumber, stepNumber } from "../src/components/NumberInput/number";

describe("parseNumber – German notation", () => {
  const cases: ReadonlyArray<[string, number | null]> = [
    // [input, expected value]
    ["42", 42],
    ["-5", -5],
    ["0,5", 0.5],
    ["1.234,50", 1234.5],
    ["1.234.567,89", 1234567.89],
    ["  42  ", 42],
    ["", null],
    ["-", null],
    ["abc", null],
  ];
  for (const [input, expected] of cases) {
    it(`"${input}" → ${expected}`, () => {
      expect(parseNumber(input)).toBe(expected);
    });
  }
});

describe("clampNumber – constraints and decimal places", () => {
  it("leaves a value inside the constraints unchanged", () => {
    expect(clampNumber(5, { min: 0, max: 10 })).toBe(5);
  });

  it("lifts it up to the minimum", () => {
    expect(clampNumber(-5, { min: 0 })).toBe(0);
  });

  it("lowers it to the maximum", () => {
    expect(clampNumber(15, { max: 10 })).toBe(10);
  });

  it("rounds commercially to the required decimal places", () => {
    expect(clampNumber(1.2345, { decimals: 2 })).toBe(1.23);
    expect(clampNumber(1.235, { decimals: 2 })).toBe(1.24);
    expect(clampNumber(2.5, { decimals: 0 })).toBe(3);
  });

  it("holds negative values with decimal places", () => {
    expect(clampNumber(-2.75, { decimals: 2 })).toBe(-2.75);
  });

  it("leaves everything unchanged where nothing is specified", () => {
    expect(clampNumber(1.23456)).toBe(1.23456);
  });

  /* The order is written down: clamp first, then round. That can lift the
     value half a rounding step beyond the maximum - existing behaviour, held
     down here deliberately rather than changed quietly. */
  it("clamps before rounding", () => {
    expect(clampNumber(10.006, { max: 10.005, decimals: 2 })).toBe(10.01);
  });
});

describe("filterInput – permitted characters per configuration", () => {
  it("removes letters", () => {
    expect(filterInput("12a3", {})).toBe("123");
  });

  it("permits the comma only where there are decimal places", () => {
    expect(filterInput("1,5", { decimals: 2 })).toBe("1,5");
    expect(filterInput("1,5", { decimals: 0 })).toBe("15");
  });

  it("permits the minus only where negative values are possible", () => {
    expect(filterInput("-5", {})).toBe("-5");
    expect(filterInput("-5", { min: -10 })).toBe("-5");
    expect(filterInput("-5", { min: 0 })).toBe("5");
  });

  it("leaves thousands dots standing", () => {
    expect(filterInput("1.234,50", { decimals: 2 })).toBe("1.234,50");
  });
});

describe("formatNumber – output in German notation", () => {
  it("sets the thousands dot and the decimal comma", () => {
    expect(formatNumber(1234.5, 2)).toBe("1.234,50");
    expect(formatNumber(1234567.89, 2)).toBe("1.234.567,89");
  });

  it("rounds to the required places", () => {
    expect(formatNumber(0.5, 0)).toBe("1");
  });

  /* The round trip is the actual assurance: what has been formatted must
     read back unchanged. */
  it("is reversible with parseNumber", () => {
    for (const value of [0, 1234.5, -2.75, 1234567.89]) {
      expect(parseNumber(formatNumber(value, 2))).toBe(value);
    }
  });
});

describe("stepNumber – counting with the arrow keys", () => {
  it("counts up and down by one step size", () => {
    expect(stepNumber(10, 1, 5)).toBe(15);
    expect(stepNumber(10, -1, 5)).toBe(5);
  });

  /* Written down: the factor multiplies the step size, not the result. With
     (base + step) * factor the answer would be 150. */
  it("multiplies the step size with Shift", () => {
    expect(stepNumber(10, 1, 5, 10)).toBe(60);
  });

  it("computes with fractions too", () => {
    expect(stepNumber(0, -1, 0.25)).toBe(-0.25);
  });
});
