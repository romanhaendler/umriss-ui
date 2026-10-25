/* Intl's options as a number format: `numberWith` in both sets, the mapping of
   `writeNumber`, and NumberInput without grouping. Expected texts are the
   notation rules (symbol and separators), not the implementation. */

import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { DEFAULT_FORMATS, LanguageProvider, NumberInput, writeNumber } from "../src";
import type { Formats } from "../src";
import { GERMAN_FORMATS } from "../src/lib/language/de";

const nbsp = (s: string) => s.replace(/[  ]/g, " ");

describe("numberWith, English", () => {
  const f = DEFAULT_FORMATS;
  it("writes a currency with its own places", () => {
    expect(f.numberWith(1234.5, { style: "currency", currency: "EUR" })).toBe("€1,234.50");
    expect(f.numberWith(1234.5, { style: "currency", currency: "JPY" })).toBe("JP¥1,235");
  });
  it("writes a year without grouping", () => {
    expect(f.numberWith(2024, { useGrouping: false })).toBe("2024");
  });
  it("writes percent with one decimal", () => {
    expect(f.numberWith(0.256, { style: "percent", maximumFractionDigits: 1 })).toBe("25.6%");
  });
  it("writes scientific notation", () => {
    expect(f.numberWith(6.02e23, { notation: "scientific", maximumFractionDigits: 2 })).toBe("6.02E23");
  });
  it("writes accounting negatives", () => {
    expect(f.numberWith(-1234.5, { style: "currency", currency: "EUR", currencySign: "accounting" })).toBe("(€1,234.50)");
  });
  it("writes no negative zero, in every entry", () => {
    expect(f.number(-0.0004, 1)).toBe("0.0");
    expect(f.numberWith(-0.0004, { maximumFractionDigits: 1 })).toBe("0");
    expect(f.percent(-0.001)).toBe("0%");
    expect(f.count(-0)).toBe("0");
    expect(f.numberWith(-0.0004, { maximumFractionDigits: 1, signDisplay: "auto" })).toBe("-0");
  });
});

describe("numberWith, German", () => {
  const f = GERMAN_FORMATS;
  it("writes a currency where the locale puts it", () => {
    expect(nbsp(f.numberWith(1234.5, { style: "currency", currency: "EUR" }))).toBe("1.234,50 €");
    expect(nbsp(f.numberWith(1234.5, { style: "currency", currency: "JPY" }))).toBe("1.235 ¥");
  });
  it("writes a year without grouping", () => {
    expect(f.numberWith(2024, { useGrouping: false })).toBe("2024");
    expect(f.number(2024, 0)).toBe("2.024");
  });
  it("writes percent with one decimal", () => {
    expect(nbsp(f.numberWith(0.256, { style: "percent", maximumFractionDigits: 1 }))).toBe("25,6 %");
  });
  it("writes scientific notation", () => {
    expect(f.numberWith(6.02e23, { notation: "scientific", maximumFractionDigits: 2 })).toBe("6,02E23");
  });
  it("writes accounting negatives", () => {
    expect(nbsp(f.numberWith(-1234.5, { style: "currency", currency: "EUR", currencySign: "accounting" }))).toBe("-1.234,50 €");
  });
  it("writes no negative zero", () => {
    expect(f.number(-0.0004, 1)).toBe("0,0");
  });
});

describe("writeNumber with options", () => {
  const replaced: Formats = {
    ...DEFAULT_FORMATS,
    number: (n, d) => `number(${n},${d})`,
    numberWith: (n, o) => `with(${n},${JSON.stringify(o)})`,
  };
  it("sends an object with an Intl key to numberWith, expanding decimals beside it", () => {
    expect(writeNumber(replaced, 1, { style: "percent" })).toBe('with(1,{"style":"percent"})');
    expect(writeNumber(replaced, 0.256, { style: "percent", decimals: 1 })).toBe(
      'with(0.256,{"minimumFractionDigits":1,"maximumFractionDigits":1,"style":"percent"})',
    );
  });
  it("lets an Intl digit option beside decimals win", () => {
    expect(writeNumber(DEFAULT_FORMATS, 1.23456, { decimals: 1, maximumFractionDigits: 3, minimumFractionDigits: 0 })).toBe("1.235");
  });
  it("sends decimals alone, and an empty object, to number", () => {
    expect(writeNumber(replaced, 1.5, { decimals: 2 })).toBe("number(1.5,2)");
    expect(writeNumber(replaced, 1.5, {})).toBe("number(1.5,undefined)");
  });
});

describe("NumberInput without grouping", () => {
  function Field({ onValue }: { onValue: (v: number | null) => void }) {
    const [v, setV] = useState<number | null>(2024);
    return (
      <LanguageProvider formats={GERMAN_FORMATS}>
        <NumberInput
          aria-label="Year"
          value={v}
          grouping={false}
          onChange={(n) => {
            setV(n);
            onValue(n);
          }}
        />
      </LanguageProvider>
    );
  }
  it("writes 2024 and reads it back", () => {
    let last: number | null = null;
    render(<Field onValue={(n) => (last = n)} />);
    const input = screen.getByLabelText("Year") as HTMLInputElement;
    expect(input.value).toBe("2024");
    fireEvent.change(input, { target: { value: "1999" } });
    fireEvent.blur(input);
    expect(last).toBe(1999);
    expect(input.value).toBe("1999");
  });
  it("still groups by default", () => {
    render(
      <LanguageProvider formats={GERMAN_FORMATS}>
        <NumberInput aria-label="Year" value={2024} onChange={() => {}} />
      </LanguageProvider>,
    );
    expect((screen.getByLabelText("Year") as HTMLInputElement).value).toBe("2.024");
  });
});
